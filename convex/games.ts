import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export const createGame = mutation({
  args: {
    players: v.array(v.string()),
    dealerIndex: v.number(), // 0–3, or -1 to randomize
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    if (args.players.length !== 4) {
      throw new ConvexError("Exactly 4 players required");
    }
    for (const name of args.players) {
      if (!name.trim()) throw new ConvexError("All player names must be non-empty");
    }

    const dealerIndex =
      args.dealerIndex === -1
        ? Math.floor(Math.random() * 4)
        : args.dealerIndex;

    // Generate unique game code
    let gameCode = "";
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateCode();
      const existing = await ctx.db
        .query("games")
        .withIndex("by_gameCode", (q) => q.eq("gameCode", candidate))
        .unique();
      if (!existing) {
        gameCode = candidate;
        break;
      }
    }
    if (!gameCode) throw new ConvexError("Failed to generate unique game code");

    const gameId = await ctx.db.insert("games", {
      gameCode,
      status: "bidding",
      players: args.players,
      currentRound: 1,
      currentDealerIndex: dealerIndex,
      createdBy: identity.tokenIdentifier,
    });

    const roundId = await ctx.db.insert("rounds", {
      gameId,
      roundNumber: 1,
      cardsPerPlayer: 13,
      dealerIndex,
      status: "bidding",
      // no trumpSuit for round 1
    });

    return { gameId, gameCode, roundId };
  },
});

export const setTrumpSuit = mutation({
  args: {
    roundId: v.id("rounds"),
    trumpSuit: v.union(
      v.literal("spades"),
      v.literal("hearts"),
      v.literal("diamonds"),
      v.literal("clubs")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const round = await ctx.db.get(args.roundId);
    if (!round) throw new ConvexError("Round not found");

    const game = await ctx.db.get(round.gameId);
    if (!game) throw new ConvexError("Game not found");
    if (game.createdBy !== identity.tokenIdentifier) {
      throw new ConvexError("Only the scorekeeper can set trump");
    }
    if (round.roundNumber === 1) {
      throw new ConvexError("Round 1 has no trump suit");
    }

    await ctx.db.patch(args.roundId, { trumpSuit: args.trumpSuit });
    return null;
  },
});

export const placeBid = mutation({
  args: {
    roundId: v.id("rounds"),
    playerIndex: v.number(),
    bid: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    if (args.bid < 0) throw new ConvexError("Bid must be non-negative");

    const round = await ctx.db.get(args.roundId);
    if (!round) throw new ConvexError("Round not found");
    if (round.status !== "bidding") throw new ConvexError("Round is not in bidding phase");

    // Validate forbidden dealer bid
    if (args.playerIndex === round.dealerIndex) {
      const otherBids = await ctx.db
        .query("bids")
        .withIndex("by_roundId", (q) => q.eq("roundId", args.roundId))
        .take(4);
      const nonDealerBids = otherBids.filter((b) => b.playerIndex !== round.dealerIndex);

      if (nonDealerBids.length === 3) {
        const otherBidsSum = nonDealerBids.reduce((sum, b) => sum + b.bid, 0);
        const forbiddenBid = round.cardsPerPlayer - otherBidsSum;
        if (forbiddenBid >= 0 && args.bid === forbiddenBid) {
          throw new ConvexError(
            `Dealer may not bid ${forbiddenBid} — that would make the total equal the number of tricks`
          );
        }
      }
    }

    // Upsert bid (update if exists, insert if not)
    const existing = await ctx.db
      .query("bids")
      .withIndex("by_roundId_and_playerIndex", (q) =>
        q.eq("roundId", args.roundId).eq("playerIndex", args.playerIndex)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { bid: args.bid });
    } else {
      await ctx.db.insert("bids", {
        gameId: round.gameId,
        roundId: args.roundId,
        playerIndex: args.playerIndex,
        bid: args.bid,
      });
    }

    // Auto-transition to playing once all 4 bids are in
    const allBids = await ctx.db
      .query("bids")
      .withIndex("by_roundId", (q) => q.eq("roundId", args.roundId))
      .take(4);
    if (allBids.length === 4) {
      await ctx.db.patch(args.roundId, {
        status: "playing",
        trickCounts: [0, 0, 0, 0],
      });
      await ctx.db.patch(round.gameId, { status: "playing" });
    }

    return null;
  },
});

export const adjustTrick = mutation({
  args: {
    roundId: v.id("rounds"),
    playerIndex: v.number(),
    delta: v.union(v.literal(1), v.literal(-1)),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const round = await ctx.db.get(args.roundId);
    if (!round) throw new ConvexError("Round not found");
    if (round.status !== "playing") throw new ConvexError("Round is not in playing phase");

    const counts = round.trickCounts ?? [0, 0, 0, 0];
    const next = counts[args.playerIndex] + args.delta;
    if (next < 0 || next > round.cardsPerPlayer) return null;

    const newCounts = [...counts];
    newCounts[args.playerIndex] = next;
    await ctx.db.patch(args.roundId, { trickCounts: newCounts });
    return null;
  },
});

export const finalizeRound = mutation({
  args: { roundId: v.id("rounds") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const round = await ctx.db.get(args.roundId);
    if (!round) throw new ConvexError("Round not found");

    const game = await ctx.db.get(round.gameId);
    if (!game) throw new ConvexError("Game not found");
    if (game.createdBy !== identity.tokenIdentifier) {
      throw new ConvexError("Only the scorekeeper can finalize a round");
    }

    const bids = await ctx.db
      .query("bids")
      .withIndex("by_roundId", (q) => q.eq("roundId", args.roundId))
      .take(4);

    const trickCounts = round.trickCounts ?? [0, 0, 0, 0];

    for (const bid of bids) {
      const tricks = trickCounts[bid.playerIndex];
      const points = tricks + (tricks === bid.bid ? 10 : 0);
      await ctx.db.insert("results", {
        gameId: round.gameId,
        roundId: args.roundId,
        playerIndex: bid.playerIndex,
        bid: bid.bid,
        tricks,
        points,
      });
    }

    await ctx.db.patch(args.roundId, { status: "completed" });

    const nextRoundNumber = round.roundNumber + 1;
    if (nextRoundNumber <= 13) {
      const nextDealerIndex = (round.dealerIndex + 1) % 4;
      await ctx.db.insert("rounds", {
        gameId: round.gameId,
        roundNumber: nextRoundNumber,
        cardsPerPlayer: 14 - nextRoundNumber,
        dealerIndex: nextDealerIndex,
        status: "bidding",
      });
      await ctx.db.patch(round.gameId, {
        currentRound: nextRoundNumber,
        currentDealerIndex: nextDealerIndex,
        status: "bidding",
      });
    } else {
      await ctx.db.patch(round.gameId, { status: "completed" });
    }

    return null;
  },
});

export const lockBids = mutation({
  args: {
    roundId: v.id("rounds"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const round = await ctx.db.get(args.roundId);
    if (!round) throw new ConvexError("Round not found");

    const game = await ctx.db.get(round.gameId);
    if (!game) throw new ConvexError("Game not found");
    if (game.createdBy !== identity.tokenIdentifier) {
      throw new ConvexError("Only the scorekeeper can lock bids");
    }

    const bids = await ctx.db
      .query("bids")
      .withIndex("by_roundId", (q) => q.eq("roundId", args.roundId))
      .take(4);

    if (bids.length < 4) {
      throw new ConvexError("All 4 players must bid before locking");
    }

    await ctx.db.patch(args.roundId, { status: "playing" });
    await ctx.db.patch(round.gameId, { status: "playing" });

    return null;
  },
});

// ─── Queries ──────────────────────────────────────────────────────────────────

export const getGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.gameId);
  },
});

export const getGameByCode = query({
  args: { gameCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("games")
      .withIndex("by_gameCode", (q) => q.eq("gameCode", args.gameCode))
      .unique();
  },
});

export const getCurrentRound = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return null;

    return await ctx.db
      .query("rounds")
      .withIndex("by_gameId_and_roundNumber", (q) =>
        q.eq("gameId", args.gameId).eq("roundNumber", game.currentRound)
      )
      .unique();
  },
});

export const getBidsForRound = query({
  args: { roundId: v.id("rounds") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bids")
      .withIndex("by_roundId", (q) => q.eq("roundId", args.roundId))
      .take(4);
  },
});

export const getResultsForGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("results")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .take(52); // max 13 rounds × 4 players
  },
});

export const getMyGames = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("games")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", identity.tokenIdentifier))
      .order("desc")
      .take(20);
  },
});

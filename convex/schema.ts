import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  games: defineTable({
    gameCode: v.string(),
    status: v.union(
      v.literal("bidding"),
      v.literal("playing"),
      v.literal("completed")
    ),
    players: v.array(v.string()), // exactly 4, bounded
    currentRound: v.number(),
    currentDealerIndex: v.number(),
    createdBy: v.string(), // tokenIdentifier from Clerk
  })
    .index("by_gameCode", ["gameCode"])
    .index("by_createdBy", ["createdBy"]),

  rounds: defineTable({
    gameId: v.id("games"),
    roundNumber: v.number(),
    cardsPerPlayer: v.number(),
    dealerIndex: v.number(),
    trumpSuit: v.optional(
      v.union(
        v.literal("spades"),
        v.literal("hearts"),
        v.literal("diamonds"),
        v.literal("clubs")
      )
    ),
    status: v.union(
      v.literal("bidding"),
      v.literal("playing"),
      v.literal("completed")
    ),
    trickCounts: v.optional(v.array(v.number())), // [p0, p1, p2, p3], set when playing begins
  })
    .index("by_gameId", ["gameId"])
    .index("by_gameId_and_roundNumber", ["gameId", "roundNumber"]),

  bids: defineTable({
    gameId: v.id("games"),
    roundId: v.id("rounds"),
    playerIndex: v.number(),
    bid: v.number(),
  })
    .index("by_roundId", ["roundId"])
    .index("by_roundId_and_playerIndex", ["roundId", "playerIndex"])
    .index("by_gameId", ["gameId"]),

  results: defineTable({
    gameId: v.id("games"),
    roundId: v.id("rounds"),
    playerIndex: v.number(),
    bid: v.number(),
    tricks: v.number(),
    points: v.number(),
  })
    .index("by_roundId", ["roundId"])
    .index("by_gameId", ["gameId"])
    .index("by_gameId_and_playerIndex", ["gameId", "playerIndex"]),
});

import React, { useState, useMemo, useEffect } from 'react'
import { UserButton } from '@clerk/clerk-react'
import { useQuery, useMutation } from 'convex/react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../convex/_generated/api'

type TrumpSuit = 'spades' | 'hearts' | 'diamonds' | 'clubs'

const SUIT_SYMBOL: Record<TrumpSuit, string> = {
  spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣',
}
const SUIT_LABEL: Record<TrumpSuit, string> = {
  spades: 'Spades', hearts: 'Hearts', diamonds: 'Diamonds', clubs: 'Clubs',
}
const SUITS: TrumpSuit[] = ['spades', 'hearts', 'diamonds', 'clubs']

function isRedSuit(suit: TrumpSuit) {
  return suit === 'hearts' || suit === 'diamonds'
}

function suitColor(suit: TrumpSuit) {
  return isRedSuit(suit) ? 'var(--color-crimson-muted)' : 'var(--color-cream-soft)'
}

function StepBtn({
  label, onClick, disabled,
}: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center flex-shrink-0 transition-all duration-100 active:scale-90 disabled:opacity-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 bg-felt-raised text-lg"
      style={{
        width: '2.75rem',
        height: '2.75rem',
        borderRadius: '50%',
        border: '1px solid oklch(72% 0.13 82 / 30%)',
        color: 'var(--color-cream)',
        lineHeight: 1,
      }}
    >
      {label}
    </button>
  )
}

export default function GameScreen() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()

  const game     = useQuery(api.games.getGameByCode, code ? { gameCode: code } : 'skip')
  const round    = useQuery(api.games.getCurrentRound, game ? { gameId: game._id } : 'skip')
  const bids     = useQuery(api.games.getBidsForRound, round ? { roundId: round._id } : 'skip')
  const results  = useQuery(api.games.getResultsForGame, game ? { gameId: game._id } : 'skip')

  const placeBid      = useMutation(api.games.placeBid)
  const setTrump      = useMutation(api.games.setTrumpSuit)
  const adjustTrick   = useMutation(api.games.adjustTrick)
  const finalizeRound = useMutation(api.games.finalizeRound)

  const [pendingBid, setPendingBid]       = useState(0)
  const [copyFeedback, setCopyFeedback]   = useState(false)
  const [settingTrump, setSettingTrump]   = useState(false)

  const bidOrder = useMemo<number[]>(() => {
    if (!round) return []
    return [1, 2, 3, 0].map((offset) => (round.dealerIndex + offset) % 4)
  }, [round])

  const isPlaying      = round?.status === 'playing'
  const allBidsEntered = bids && bids.length === 4

  const nextBidderIndex = !allBidsEntered && round
    ? bidOrder[bids?.length ?? 0]
    : null

  const forbiddenBid = useMemo<number | null>(() => {
    if (!round || !bids) return null
    const nonDealerBids = bids.filter((b) => b.playerIndex !== round.dealerIndex)
    if (nonDealerBids.length < 3) return null
    const otherBidsSum = nonDealerBids.reduce((sum, b) => sum + b.bid, 0)
    const candidate = round.cardsPerPlayer - otherBidsSum
    return candidate >= 0 ? candidate : null
  }, [round, bids])

  useEffect(() => {
    // If forbidden bid is 0 (dealer must bid at least 1), start at 1
    const startBid = (forbiddenBid === 0) ? 1 : 0
    setPendingBid(startBid)
  }, [nextBidderIndex])

  const scores = useMemo<number[]>(() => {
    const totals = [0, 0, 0, 0]
    for (const r of results ?? []) totals[r.playerIndex] += r.points
    return totals
  }, [results])

  // Per-round results keyed by roundNumber
  const roundResults = useMemo(() => {
    const byRound: Record<string, { playerIndex: number; bid: number; tricks: number; points: number }[]> = {}
    for (const r of results ?? []) {
      const key = r.roundId as unknown as string
      if (!byRound[key]) byRound[key] = []
      byRound[key].push(r)
    }
    return byRound
  }, [results])

  const trickCounts   = round?.trickCounts ?? [0, 0, 0, 0]
  const trickSum      = trickCounts.reduce((s, n) => s + n, 0)
  const roundComplete = isPlaying && round && trickSum === round.cardsPerPlayer

  const maxScore = Math.max(...scores)

  function stepBid(dir: 1 | -1) {
    if (!round) return
    let next = pendingBid + dir
    if (next < 0 || next > round.cardsPerPlayer) return
    if (nextBidderIndex === round.dealerIndex && next === forbiddenBid) {
      next += dir
      if (next < 0 || next > round.cardsPerPlayer) return
    }
    setPendingBid(next)
  }

  async function handleConfirmBid() {
    if (!round || nextBidderIndex === null) return
    try {
      await placeBid({ roundId: round._id, playerIndex: nextBidderIndex, bid: pendingBid })
    } catch { /* server validates */ }
  }

  async function handleTrumpSelect(suit: TrumpSuit) {
    if (!round || settingTrump) return
    setSettingTrump(true)
    try { await setTrump({ roundId: round._id, trumpSuit: suit }) }
    finally { setSettingTrump(false) }
  }

  function handleCopyCode() {
    if (!code) return
    navigator.clipboard.writeText(code).then(() => {
      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 1500)
    })
  }

  if (game === null) {
    return (
      <div className="min-h-screen bg-felt flex flex-col items-center justify-center gap-4">
        <span className="font-serif text-gold text-3xl" style={{ opacity: 0.35 }}>♦</span>
        <p className="font-sans text-cream-dim text-center tracking-[0.15em] text-sm" style={{ opacity: 0.55, maxWidth: '16rem', lineHeight: 1.6 }}>
          Game not found — it may have been deleted.
        </p>
        <button
          onClick={() => navigate('/')}
          className="font-sans text-gold rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 text-sm"
          style={{ opacity: 0.5, letterSpacing: '0.08em' }}
        >
          ← Back to home
        </button>
      </div>
    )
  }

  if (!game || !round) {
    return (
      <div className="min-h-screen bg-felt flex items-center justify-center">
        <div className="flex flex-col items-center gap-4" role="status" aria-label="Loading game">
          <span
            className="font-serif text-gold text-3xl"
            style={{ opacity: 0.2, animation: 'pulse 2s ease-in-out infinite' }}
            aria-hidden="true"
          >
            ♦
          </span>
          <span
            className="font-sans text-cream-dim uppercase tracking-[0.3em] text-sm"
            style={{ opacity: 0.4 }}
            aria-hidden="true"
          >
            Loading
          </span>
        </div>
      </div>
    )
  }

  const showTricks = isPlaying
  const trumpReady = round.roundNumber === 1 || !!round.trumpSuit

  // Bid status text
  const bidsSum   = bids?.reduce((s, b) => s + b.bid, 0) ?? 0
  const remaining = round.cardsPerPlayer - bidsSum
  const bidStatusText = (() => {
    if (allBidsEntered) {
      if (remaining === 0) return `Exactly bid — no room for error`
      return remaining > 0
        ? `Under by ${remaining}`
        : `Overbid by ${Math.abs(remaining)}`
    }
    return remaining >= 0
      ? `${remaining} of ${round.cardsPerPlayer} tricks available`
      : `Overbid by ${Math.abs(remaining)}`
  })()

  return (
    <div className="min-h-screen bg-felt flex flex-col">

      {/* Header */}
      <header
        className="relative z-10 w-full bg-felt-light border-b"
        style={{ borderBottomColor: 'oklch(72% 0.13 82 / 10%)' }}
      >
      <div className="mx-auto w-full max-w-lg flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => navigate('/')}
          aria-label="Back to dashboard"
          className="font-sans text-gold opacity-75 hover:opacity-85 transition-opacity rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 text-sm"
          style={{ letterSpacing: '0.05em' }}
        >
          ← Back
        </button>

        <div className="flex-1 flex items-center justify-center gap-2">
          <span
            className="font-sans text-cream-dim uppercase tracking-[0.3em] text-sm"
            style={{ opacity: 0.7 }}
          >
            Game
          </span>
          <button
            onClick={handleCopyCode}
            aria-label={`Copy game code ${game.gameCode}`}
            className="font-serif text-gold tracking-[0.22em] uppercase transition-opacity rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 text-sm"
            style={{
              paddingLeft: '0.5rem',
              paddingRight: '0.5rem',
              paddingTop: '0.2rem',
              paddingBottom: '0.2rem',
              borderRadius: '0.25rem',
              backgroundColor: 'oklch(72% 0.13 82 / 7%)',
              border: '1px solid oklch(72% 0.13 82 / 18%)',
            }}
          >
            {game.gameCode}
          </button>
          <span
            role="status"
            aria-live="polite"
            className="font-sans text-cream-dim text-sm"
            style={{ opacity: copyFeedback ? 0.55 : 0, letterSpacing: '0.1em' }}
          >
            {copyFeedback ? 'copied' : ''}
          </span>
        </div>

        <UserButton appearance={{ elements: { avatarBox: 'ring-1 ring-gold/30 rounded-full' } }} />
      </div>
      </header>

    <div className="mx-auto w-full max-w-lg flex-1 flex flex-col">
      <main className="flex-1 px-4 py-5 flex flex-col gap-5">

        {/* Scoreboard */}
        <div
          className="rounded bg-felt-deep"
          style={{
            border: '1px solid oklch(72% 0.13 82 / 10%)',
            padding: '0.75rem 0.75rem 0.6rem',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(4, 1fr)`,
              gap: '0.25rem',
            }}
          >
            {game.players.map((name, i) => {
              const isLeader = scores[i] === maxScore && maxScore > 0
              return (
                <div key={i} className="flex flex-col items-center" style={{ gap: '0.2rem' }}>
                  <span
                    className="font-sans truncate w-full text-center text-sm"
                    style={{
                      color: 'var(--color-gold)',
                      opacity: isLeader ? 0.9 : 0.55,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                    title={name}
                  >
                    {name}
                  </span>
                  <span
                    className="font-serif text-2xl"
                    style={{
                      lineHeight: 1,
                      color: isLeader ? 'var(--color-gold)' : 'var(--color-cream-soft)',
                      opacity: isLeader ? 1 : 0.75,
                    }}
                  >
                    {scores[i]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Ornamental divider */}
        <div className="flex items-center gap-3" style={{ marginTop: '-0.25rem', marginBottom: '-0.25rem' }}>
          <div className="h-px flex-1 bg-gold" style={{ opacity: 0.08 }} />
          <span className="text-gold text-sm" style={{ opacity: 0.18 }}>♦</span>
          <div className="h-px flex-1 bg-gold" style={{ opacity: 0.08 }} />
        </div>

        {/* Round info */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2.5 min-w-0">
            <span
              className="font-serif text-gold flex-shrink-0 text-sm"
              style={{ letterSpacing: '0.18em', opacity: 0.7 }}
            >
              RND {round.roundNumber}
            </span>
            <span
              aria-live="polite"
              className="font-sans text-cream truncate text-sm"
              style={{ opacity: 0.75 }}
            >
              {bidStatusText}
            </span>
          </div>
          <span
            className="font-sans flex-shrink-0 text-sm"
            style={{
              color: round.trumpSuit && isRedSuit(round.trumpSuit as TrumpSuit)
                ? 'var(--color-crimson-muted)'
                : 'var(--color-cream-soft)',
              opacity: 0.55,
              letterSpacing: '0.04em',
            }}
          >
            {round.roundNumber === 1
              ? 'no trump'
              : round.trumpSuit
                ? `${SUIT_SYMBOL[round.trumpSuit as TrumpSuit]} ${SUIT_LABEL[round.trumpSuit as TrumpSuit]}`
                : 'select trump'}
          </span>
        </div>

        {/* Trump selector (rounds 2+, not yet set, still bidding) */}
        {round.roundNumber > 1 && !round.trumpSuit && !isPlaying && (
          <div>
            <p
              className="font-sans text-cream-dim uppercase mb-2.5 text-sm"
              style={{ opacity: 0.7, letterSpacing: '0.28em' }}
            >
              Select trump suit
            </p>
            <div className="flex gap-2">
              {SUITS.map((suit) => (
                <button
                  key={suit}
                  onClick={() => handleTrumpSelect(suit)}
                  disabled={settingTrump}
                  className="flex-1 py-3.5 rounded font-serif text-2xl transition-all duration-150 active:scale-[0.94] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                  style={{
                    backgroundColor: isRedSuit(suit)
                      ? 'var(--color-crimson-well)'
                      : 'var(--color-felt)',
                    border: `1px solid ${isRedSuit(suit)
                      ? 'color-mix(in oklch, var(--color-crimson-muted) 22%, transparent)'
                      : 'oklch(72% 0.13 82 / 18%)'}`,
                    color: suitColor(suit),
                  }}
                >
                  {SUIT_SYMBOL[suit]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bids + Tricks — single CSS grid for column alignment */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: showTricks ? 'auto 1fr 1fr' : 'auto 1fr',
          rowGap: '1.1rem',
          alignItems: 'center',
        }}>

          {/* Column headers */}
          <div />
          <div
            className="font-sans text-cream-dim uppercase text-center text-sm"
            style={{ opacity: 0.7, letterSpacing: '0.28em' }}
          >
            Bids
          </div>
          {showTricks && (
            <div
              className="font-sans text-cream-dim uppercase text-center text-sm"
              style={{ opacity: 0.7, letterSpacing: '0.28em' }}
            >
              Tricks
            </div>
          )}

          {/* Data rows */}
          {bidOrder.map((playerIndex, orderIndex) => {
            const isDealer       = playerIndex === round.dealerIndex
            const existingBid    = bids?.find((b) => b.playerIndex === playerIndex)
            const isNextBidder   = !isPlaying && orderIndex === (bids?.length ?? 0)
            const isFutureBidder = !isPlaying && !existingBid && !isNextBidder
            const showForbiddenHint =
              isDealer && !isPlaying &&
              forbiddenBid !== null && forbiddenBid >= 0 && forbiddenBid <= round.cardsPerPlayer

            const trickVal       = trickCounts[playerIndex]
            const canAddTrick    = isPlaying && trickSum < round.cardsPerPlayer
            const canRemoveTrick = isPlaying && trickVal > 0

            return (
              <React.Fragment key={playerIndex}>

                {/* Name cell */}
                <div
                  className="flex items-center gap-1.5 min-w-0"
                  style={{
                    opacity: isFutureBidder ? 0.28 : 1,
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  <span className="font-sans text-cream truncate text-sm">
                    {game.players[playerIndex]}
                  </span>
                  {isDealer && (
                    <span
                      className="flex-shrink-0 flex items-center justify-center font-serif text-gold text-sm"
                      style={{
                        width: '1.1rem',
                        height: '1.1rem',
                        borderRadius: '50%',
                        border: '1.5px solid oklch(72% 0.13 82 / 55%)',
                        letterSpacing: 0,
                        opacity: 0.8,
                      }}
                    >
                      D
                    </span>
                  )}
                </div>

                {/* Bid cell */}
                <div className="flex flex-col items-center gap-0.5">
                  {isNextBidder ? (
                    <div className="flex items-center gap-2">
                      <StepBtn label="−" onClick={() => stepBid(-1)} disabled={!trumpReady || pendingBid === 0} />
                      <span
                        className="font-serif text-cream text-center text-xl"
                        style={{ width: '1.5rem', opacity: trumpReady ? 1 : 0.35 }}
                      >
                        {pendingBid}
                      </span>
                      <StepBtn label="+" onClick={() => stepBid(1)} disabled={!trumpReady || pendingBid === round.cardsPerPlayer} />
                    </div>
                  ) : (
                    <div className="relative flex items-center justify-center" style={{ width: '1.5rem' }}>
                      <span
                        className="font-serif text-center text-xl"
                        style={{
                          color: existingBid !== undefined ? 'var(--color-gold)' : 'var(--color-cream)',
                          opacity: isFutureBidder ? 0.12 : 1,
                        }}
                      >
                        {existingBid !== undefined ? existingBid.bid : '—'}
                      </span>
                      {existingBid !== undefined && showTricks && trickVal === existingBid.bid && (
                        <span
                          className="font-sans absolute text-sm"
                          style={{ color: 'var(--color-success)', lineHeight: 1, left: '100%', top: '20%' }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                  )}
                  {showForbiddenHint && (
                    <span
                      className="font-sans text-cream-dim text-center text-sm"
                      style={{ opacity: 0.45, letterSpacing: '0.02em' }}
                    >
                      anything but {forbiddenBid}
                    </span>
                  )}
                </div>

                {/* Tricks cell */}
                {showTricks && (
                  <div className="flex items-center justify-center gap-2">
                    <StepBtn
                      label="−"
                      onClick={() => adjustTrick({ roundId: round._id, playerIndex, delta: -1 })}
                      disabled={!canRemoveTrick}
                    />
                    <span
                      className="font-serif text-cream text-center text-xl"
                      style={{ width: '1.5rem' }}
                    >
                      {trickVal}
                    </span>
                    <StepBtn
                      label="+"
                      onClick={() => adjustTrick({ roundId: round._id, playerIndex, delta: 1 })}
                      disabled={!canAddTrick}
                    />
                  </div>
                )}

              </React.Fragment>
            )
          })}
        </div>

        {/* Trump required notice */}
        {!isPlaying && nextBidderIndex !== null && !trumpReady && (
          <p
            className="font-sans text-center text-sm"
            style={{ color: 'var(--color-gold)', opacity: 0.55, letterSpacing: '0.06em' }}
          >
            Select a trump suit to continue
          </p>
        )}

        {/* Confirm bid CTA */}
        {!isPlaying && nextBidderIndex !== null && trumpReady && (
          <button
            onClick={handleConfirmBid}
            disabled={nextBidderIndex === round?.dealerIndex && pendingBid === forbiddenBid}
            className="w-full py-5 rounded font-serif text-cream tracking-[0.2em] uppercase bg-crimson hover:bg-crimson-bright transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:opacity-40 disabled:pointer-events-none text-sm"
            style={{ marginTop: '0.25rem' }}
          >
            Confirm {game.players[nextBidderIndex]}'s Bid
          </button>
        )}

        {/* Next round CTA */}
        {roundComplete && (
          <button
            onClick={() => finalizeRound({ roundId: round._id })}
            className="w-full py-5 rounded font-serif text-cream tracking-[0.2em] uppercase bg-crimson hover:bg-crimson-bright transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 text-sm"
            style={{ marginTop: '0.25rem' }}
          >
            {round.roundNumber < 13 ? 'Next Round →' : 'Finish Game →'}
          </button>
        )}

      </main>
    </div>
    </div>
  )
}

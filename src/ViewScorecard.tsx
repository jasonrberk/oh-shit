import { useMemo } from 'react'
import { UserButton } from '@clerk/clerk-react'
import { useQuery } from 'convex/react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../convex/_generated/api'

type TrumpSuit = 'spades' | 'hearts' | 'diamonds' | 'clubs'

const SUIT_SYMBOL: Record<TrumpSuit, string> = {
  spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣',
}

function isRedSuit(suit: TrumpSuit) {
  return suit === 'hearts' || suit === 'diamonds'
}

export default function ViewScorecard() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()

  const game        = useQuery(api.games.getGameByCode, code ? { gameCode: code } : 'skip')
  const allRounds   = useQuery(api.games.getRoundsForGame, game ? { gameId: game._id } : 'skip')
  const results     = useQuery(api.games.getResultsForGame, game ? { gameId: game._id } : 'skip')
  const currentRound = useQuery(api.games.getCurrentRound, game ? { gameId: game._id } : 'skip')
  const liveBids    = useQuery(api.games.getBidsForRound, currentRound ? { roundId: currentRound._id } : 'skip')

  // Build a map: roundId → { playerIndex → result }
  const resultsByRound = useMemo(() => {
    const map = new Map<string, Map<number, { bid: number; tricks: number; points: number }>>()
    for (const r of results ?? []) {
      const key = r.roundId as unknown as string
      if (!map.has(key)) map.set(key, new Map())
      map.get(key)!.set(r.playerIndex, { bid: r.bid, tricks: r.tricks, points: r.points })
    }
    return map
  }, [results])

  // Cumulative scores per player after each completed round (ordered by round number)
  const cumulativeByRound = useMemo(() => {
    const completedRounds = (allRounds ?? []).filter(r => r.status === 'completed')
    const running = [0, 0, 0, 0]
    const cumByRoundId = new Map<string, number[]>()
    for (const r of completedRounds) {
      const key = r._id as unknown as string
      const roundMap = resultsByRound.get(key)
      if (roundMap) {
        for (const [pi, res] of roundMap.entries()) {
          running[pi] += res.points
        }
      }
      cumByRoundId.set(key, [...running])
    }
    return { cumByRoundId, totals: [...running] }
  }, [allRounds, resultsByRound])

  const { cumByRoundId, totals } = cumulativeByRound
  const maxScore = Math.max(...totals)

  if (game === null) {
    return (
      <div className="min-h-screen bg-felt flex flex-col items-center justify-center gap-4">
        <span className="font-serif text-gold" style={{ fontSize: '2rem', opacity: 0.35 }}>♦</span>
        <p className="font-sans text-cream-dim text-center tracking-[0.15em]" style={{ fontSize: '0.7rem', opacity: 0.55, maxWidth: '16rem', lineHeight: 1.6 }}>
          Game not found — the scorekeeper may have removed it, or the code may be incorrect.
        </p>
        <button
          onClick={() => navigate('/')}
          className="font-sans text-gold rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
          style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '0.08em' }}
        >
          ← Back to home
        </button>
      </div>
    )
  }

  if (game === undefined || allRounds === undefined) {
    return (
      <div className="min-h-screen bg-felt flex items-center justify-center">
        <div className="flex flex-col items-center gap-4" role="status" aria-label="Loading scorecard">
          <span className="font-serif text-gold" style={{ fontSize: '2rem', opacity: 0.2, animation: 'pulse 2s ease-in-out infinite' }} aria-hidden="true">♦</span>
          <span className="font-sans text-cream-dim uppercase tracking-[0.3em]" style={{ fontSize: '0.65rem', opacity: 0.4 }} aria-hidden="true">Loading</span>
        </div>
      </div>
    )
  }

  const players = game.players
  const completedRounds = (allRounds ?? []).filter(r => r.status === 'completed')
  const inProgressRound = (allRounds ?? []).find(r => r.status === 'bidding' || r.status === 'playing')
  const isGameComplete = game.status === 'completed'

  // Live bids map for current round
  const liveBidsMap = new Map<number, number>()
  for (const b of liveBids ?? []) liveBidsMap.set(b.playerIndex, b.bid)

  return (
    <div className="min-h-screen bg-felt">
    <div className="mx-auto w-full max-w-lg min-h-screen flex flex-col">

      {/* Header */}
      <header
        className="relative z-10 flex items-center gap-3 px-4 py-3 bg-felt-light border-b"
        style={{ borderBottomColor: 'oklch(72% 0.13 82 / 10%)' }}
      >
        <button
          onClick={() => navigate('/')}
          aria-label="Back to dashboard"
          className="font-sans text-gold opacity-75 hover:opacity-85 transition-opacity rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
          style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}
        >
          ← Back
        </button>

        <div className="flex-1 flex items-center justify-center gap-2">
          <span className="font-sans text-cream-dim uppercase tracking-[0.3em]" style={{ fontSize: '0.55rem', opacity: 0.7 }}>Game</span>
          <span
            className="font-serif text-gold tracking-[0.22em] uppercase"
            style={{
              fontSize: '0.9rem',
              paddingLeft: '0.5rem', paddingRight: '0.5rem',
              paddingTop: '0.2rem', paddingBottom: '0.2rem',
              borderRadius: '0.25rem',
              backgroundColor: 'oklch(72% 0.13 82 / 7%)',
              border: '1px solid oklch(72% 0.13 82 / 18%)',
            }}
          >
            {game.gameCode}
          </span>
          <span
            className="font-sans uppercase tracking-[0.2em]"
            style={{
              fontSize: '0.5rem',
              color: isGameComplete ? 'var(--color-status-complete)' : 'var(--color-gold)',
              opacity: 0.65,
              border: `1px solid ${isGameComplete ? 'color-mix(in oklch, var(--color-status-complete) 40%, transparent)' : 'oklch(72% 0.13 82 / 25%)'}`,
              borderRadius: '0.2rem',
              padding: '0.1rem 0.35rem',
            }}
          >
            {isGameComplete ? 'Complete' : 'Live'}
          </span>
        </div>

        <UserButton appearance={{ elements: { avatarBox: 'ring-1 ring-gold/30 rounded-full' } }} />
      </header>

      <main className="flex-1 overflow-x-auto">
        <table
          className="w-full border-collapse"
          style={{ minWidth: `${100 + players.length * 80}px` }}
        >
          {/* Sticky column header */}
          <thead>
            <tr className="bg-felt-deep" style={{ borderBottom: '1px solid oklch(72% 0.13 82 / 15%)' }}>
              <th className="font-sans text-cream-dim uppercase text-center px-2 py-3" style={{ fontSize: '0.58rem', letterSpacing: '0.25em', opacity: 0.6, width: '3rem' }}>Rnd</th>
              <th className="font-sans text-cream-dim uppercase text-center px-2 py-3" style={{ fontSize: '0.58rem', letterSpacing: '0.25em', opacity: 0.6, width: '2.5rem' }}>Trump</th>
              {players.map((name, i) => (
                <th key={i} className="font-sans text-gold uppercase text-center px-2 py-3" style={{ fontSize: '0.62rem', letterSpacing: '0.15em', opacity: 0.8 }}>
                  <span className="block truncate" style={{ maxWidth: '5rem' }} title={name}>{name}</span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Completed rounds */}
            {completedRounds.map((round) => {
              const roundKey = round._id as unknown as string
              const roundMap = resultsByRound.get(roundKey)
              const cum = cumByRoundId.get(roundKey) ?? [0, 0, 0, 0]

              return (
                <tr
                  key={round._id as unknown as string}
                  style={{ borderBottom: '1px solid oklch(72% 0.13 82 / 6%)' }}
                >
                  {/* Round number */}
                  <td className="text-center px-2 py-2.5">
                    <span className="font-serif text-gold" style={{ fontSize: '0.75rem', opacity: 0.7 }}>{round.roundNumber}</span>
                  </td>

                  {/* Trump suit */}
                  <td className="text-center px-2 py-2.5">
                    {round.roundNumber === 1 || !round.trumpSuit ? (
                      <span className="font-sans text-cream-dim" style={{ fontSize: '0.7rem', opacity: 0.25 }}>—</span>
                    ) : (
                      <span
                        className="font-serif"
                        style={{
                          fontSize: '1rem',
                          color: isRedSuit(round.trumpSuit as TrumpSuit) ? 'var(--color-crimson-muted)' : 'var(--color-cream-soft)',
                          opacity: 0.75,
                        }}
                      >
                        {SUIT_SYMBOL[round.trumpSuit as TrumpSuit]}
                      </span>
                    )}
                  </td>

                  {/* Per-player cells */}
                  {players.map((_, i) => {
                    const res = roundMap?.get(i)
                    const perfect = res && res.bid === res.tricks
                    return (
                      <td key={i} className="text-center px-2 py-2" style={{ verticalAlign: 'middle' }}>
                        {res ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="flex items-center gap-0.5">
                              <span className="font-serif text-cream" style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                                {res.bid}/{res.tricks}
                              </span>
                              {perfect && <span style={{ fontSize: '0.75rem', lineHeight: 1 }}>🔥</span>}
                            </div>
                            <span className="font-sans" style={{ fontSize: '0.6rem', color: 'oklch(72% 0.13 82)', opacity: 0.55 }}>
                              +{res.points}
                            </span>
                            <span className="font-serif text-cream" style={{ fontSize: '0.75rem', opacity: 0.55 }}>
                              {cum[i]}
                            </span>
                          </div>
                        ) : (
                          <span className="font-sans text-cream-dim" style={{ fontSize: '0.7rem', opacity: 0.2 }}>—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}

            {/* In-progress round row */}
            {inProgressRound && (
              <tr className="bg-felt-inset" style={{ borderBottom: '1px solid oklch(72% 0.13 82 / 8%)' }}>
                {/* Round number */}
                <td className="text-center px-2 py-2.5">
                  <span className="font-serif text-gold" style={{ fontSize: '0.75rem', opacity: 0.55 }}>{inProgressRound.roundNumber}</span>
                </td>

                {/* Trump suit */}
                <td className="text-center px-2 py-2.5">
                  {inProgressRound.roundNumber === 1 || !inProgressRound.trumpSuit ? (
                    <span className="font-sans text-cream-dim" style={{ fontSize: '0.7rem', opacity: 0.2 }}>—</span>
                  ) : (
                    <span
                      className="font-serif"
                      style={{
                        fontSize: '1rem',
                        color: isRedSuit(inProgressRound.trumpSuit as TrumpSuit) ? 'var(--color-crimson-muted)' : 'var(--color-cream-soft)',
                        opacity: 0.6,
                      }}
                    >
                      {SUIT_SYMBOL[inProgressRound.trumpSuit as TrumpSuit]}
                    </span>
                  )}
                </td>

                {/* Per-player live cells */}
                {players.map((_, i) => {
                  const bid = liveBidsMap.get(i)
                  const tricks = inProgressRound.trickCounts?.[i]
                  const isPlaying = inProgressRound.status === 'playing'
                  const perfect = isPlaying && bid !== undefined && tricks !== undefined && bid === tricks

                  return (
                    <td key={i} className="text-center px-2 py-2" style={{ verticalAlign: 'middle' }}>
                      <div className="flex flex-col items-center gap-0.5">
                        {/* bid / tricks display */}
                        <div className="flex items-center gap-0.5">
                          <span className="font-serif" style={{ fontSize: '0.85rem', color: 'oklch(88% 0.02 85)', opacity: 0.5 }}>
                            {bid !== undefined
                              ? isPlaying && tricks !== undefined
                                ? `${bid}/${tricks}`
                                : `${bid}`
                              : '—'}
                          </span>
                          {perfect && <span style={{ fontSize: '0.75rem', lineHeight: 1 }}>🔥</span>}
                        </div>
                        {/* "in progress" hint */}
                        <span className="font-sans" style={{ fontSize: '0.52rem', color: 'oklch(72% 0.13 82)', opacity: 0.3, letterSpacing: '0.1em' }}>
                          {isPlaying ? 'playing' : bid !== undefined ? 'bid' : ''}
                        </span>
                      </div>
                    </td>
                  )
                })}
              </tr>
            )}
          </tbody>

          {/* Totals footer */}
          <tfoot>
            <tr className="bg-felt-deeper" style={{ borderTop: '1px solid oklch(72% 0.13 82 / 20%)' }}>
              <td colSpan={2} className="px-2 py-3">
                <span className="font-sans text-cream-dim uppercase tracking-[0.25em]" style={{ fontSize: '0.55rem', opacity: 0.55 }}>Total</span>
              </td>
              {players.map((_, i) => {
                const isLeader = totals[i] === maxScore && maxScore > 0
                return (
                  <td key={i} className="text-center px-2 py-3">
                    <span
                      className="font-serif"
                      style={{
                        fontSize: '1.1rem',
                        color: isLeader ? 'var(--color-gold)' : 'var(--color-cream-soft)',
                        fontWeight: isLeader ? 700 : 400,
                        opacity: isLeader ? 1 : 0.7,
                      }}
                    >
                      {totals[i]}
                    </span>
                  </td>
                )
              })}
            </tr>
          </tfoot>
        </table>
      </main>

    </div>
    </div>
  )
}

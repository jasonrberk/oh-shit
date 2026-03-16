import { useState } from 'react'
import { UserButton, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import type { Id } from '../convex/_generated/dataModel'

function Dashboard() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<Id<'games'> | null>(null)

  const myGames = useQuery(api.games.getMyGames)
  const deleteGame = useMutation(api.games.deleteGame)

  return (
    <div className="min-h-screen bg-felt relative overflow-hidden">
    <div className="mx-auto w-full max-w-lg min-h-screen flex flex-col">

      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between px-6 py-4 bg-felt-light border-b"
        style={{ borderBottomColor: 'oklch(72% 0.13 82 / 10%)' }}
      >
        <h1
          className="font-serif text-gold tracking-[0.28em] uppercase"
          style={{ fontSize: '1.05rem', fontWeight: 700 }}
        >
          Oh Shit!
        </h1>
        <UserButton
          appearance={{
            elements: { avatarBox: 'ring-1 ring-gold/30 rounded-full' },
          }}
        />
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-col flex-1 px-6 pt-10 pb-10">

        {/* Player welcome */}
        <div className="mb-9">
          <p
            className="font-sans text-cream-dim uppercase tracking-[0.45em] mb-2"
            style={{ fontSize: '0.58rem', opacity: 0.5 }}
          >
            Welcome back
          </p>
          <h2 className="font-serif text-cream tracking-wide" style={{ fontSize: '1.6rem' }}>
            {user?.firstName ?? 'Player'}
          </h2>
        </div>

        {/* Ornamental divider */}
        <div className="flex items-center gap-3 mb-9">
          <div className="h-px flex-1 bg-gold" style={{ opacity: 0.1 }} />
          <span className="text-gold" style={{ fontSize: '0.6rem', opacity: 0.22 }}>♦</span>
          <div className="h-px flex-1 bg-gold" style={{ opacity: 0.1 }} />
        </div>

        {/* Action list */}
        <div className="flex flex-col gap-3">

          {/* Start a Scorecard — primary */}
          <button
            onClick={() => navigate('/scorecard/new')}
            className="group relative flex items-center gap-4 px-5 py-5 bg-crimson hover:bg-crimson-bright rounded text-cream transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
          >
            <span className="text-xl leading-none" style={{ opacity: 0.7 }}>♦</span>
            <span
              className="font-serif flex-1 text-left tracking-[0.22em] uppercase"
              style={{ fontSize: '0.88rem' }}
            >
              Start a Scorecard
            </span>
            <span
              className="text-sm transition-transform duration-150 group-hover:translate-x-0.5"
              style={{ opacity: 0.45 }}
            >
              →
            </span>
          </button>

          {/* View a Scorecard — secondary */}
          {!showCodeInput ? (
            <button
              onClick={() => setShowCodeInput(true)}
              className="group flex items-center gap-4 px-5 py-5 bg-felt-light rounded text-cream transition-all duration-150 active:scale-[0.98] border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              style={{ borderColor: 'oklch(72% 0.13 82 / 16%)' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'oklch(72% 0.13 82 / 40%)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'oklch(72% 0.13 82 / 16%)')}
            >
              <span className="text-gold text-xl leading-none" style={{ opacity: 0.6 }}>♣</span>
              <span
                className="font-serif flex-1 text-left text-gold tracking-[0.22em] uppercase"
                style={{ fontSize: '0.88rem', opacity: 0.72 }}
              >
                View a Scorecard
              </span>
              <span
                className="text-gold text-sm transition-transform duration-150 group-hover:translate-x-0.5"
                style={{ opacity: 0.28 }}
              >
                →
              </span>
            </button>
          ) : (
            <div
              className="flex flex-col gap-3 px-5 py-4 bg-felt-light rounded border"
              style={{ borderColor: 'oklch(72% 0.13 82 / 30%)' }}
            >
              <p
                className="font-sans text-gold uppercase tracking-[0.3em]"
                style={{ fontSize: '0.58rem', opacity: 0.7 }}
              >
                Enter game code
              </p>
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  aria-label="Game code"
                  value={codeInput}
                  maxLength={6}
                  placeholder="XXXXXX"
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && codeInput.length === 6) navigate(`/view/${codeInput}`)
                    if (e.key === 'Escape') { setShowCodeInput(false); setCodeInput('') }
                  }}
                  className="flex-1 font-serif text-cream text-center tracking-[0.4em] uppercase rounded px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                  style={{
                    fontSize: '1.1rem',
                    backgroundColor: 'var(--color-felt-deeper)',
                    border: '1px solid oklch(72% 0.13 82 / 25%)',
                    caretColor: 'oklch(72% 0.13 82)',
                  }}
                />
                <button
                  onClick={() => { if (codeInput.length === 6) navigate(`/view/${codeInput}`) }}
                  disabled={codeInput.length !== 6}
                  className="px-4 py-2 rounded font-serif text-cream tracking-[0.15em] uppercase bg-crimson hover:bg-crimson-bright transition-all duration-150 active:scale-[0.96] disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                  style={{ fontSize: '0.78rem' }}
                >
                  Go
                </button>
              </div>
              <button
                onClick={() => { setShowCodeInput(false); setCodeInput('') }}
                className="font-sans text-gold self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 rounded px-1"
                style={{ fontSize: '0.6rem', opacity: 0.4, letterSpacing: '0.1em' }}
              >
                cancel
              </button>
            </div>
          )}

          {/* Play Online — disabled / coming soon */}
          <button
            disabled
            className="flex items-center gap-4 px-5 py-5 rounded cursor-not-allowed border bg-felt-deep"
            style={{ borderColor: 'oklch(94% 0.02 85 / 5%)' }}
          >
            <span
              className="text-xl leading-none"
              style={{ color: 'oklch(94% 0.02 85)', opacity: 0.12 }}
            >
              ♠
            </span>
            <div className="flex-1 text-left">
              <p
                className="font-serif tracking-[0.22em] uppercase"
                style={{ fontSize: '0.88rem', color: 'oklch(94% 0.02 85)', opacity: 0.18 }}
              >
                Play Online
              </p>
              <p
                className="font-sans tracking-[0.35em] uppercase mt-1"
                style={{ fontSize: '0.52rem', color: 'oklch(94% 0.02 85)', opacity: 0.18 }}
              >
                Coming Soon
              </p>
            </div>
          </button>

        </div>

        {/* My Games */}
        <div className="mt-10">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gold" style={{ opacity: 0.08 }} />
            <h2
              className="font-sans text-gold uppercase tracking-[0.38em]"
              style={{ fontSize: '0.56rem', opacity: 0.45 }}
            >
              My Games
            </h2>
            <div className="h-px flex-1 bg-gold" style={{ opacity: 0.08 }} />
          </div>

          {myGames === undefined ? (
            <div className="flex flex-col gap-2" role="status" aria-label="Loading your games">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 rounded border animate-pulse"
                  style={{
                    backgroundColor: 'var(--color-felt-deep)',
                    borderColor: 'oklch(72% 0.13 82 / 12%)',
                  }}
                >
                  <div className="h-4 rounded shrink-0" style={{ width: '4rem', backgroundColor: 'oklch(72% 0.13 82 / 10%)' }} />
                  <div className="h-3 rounded flex-1" style={{ backgroundColor: 'oklch(72% 0.13 82 / 8%)' }} />
                  <div className="h-3 rounded shrink-0" style={{ width: '3rem', backgroundColor: 'oklch(72% 0.13 82 / 8%)' }} />
                </div>
              ))}
            </div>
          ) : myGames.length === 0 ? (
            <p
              className="font-sans text-cream-dim text-center uppercase tracking-[0.3em]"
              style={{ fontSize: '0.58rem', opacity: 0.28 }}
            >
              No games yet
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {myGames.map((game) => {
                const isArmed = confirmDeleteId === game._id
                const statusLabel =
                  game.status === 'completed' ? 'Done'
                  : game.status === 'playing' ? 'Playing'
                  : 'Bidding'
                const statusColor =
                  game.status === 'completed' ? 'var(--color-status-complete)'
                  : game.status === 'playing' ? 'var(--color-status-playing)'
                  : 'var(--color-cream-soft)'
                const statusOpacity =
                  game.status === 'completed' ? 0.7
                  : game.status === 'playing' ? 0.85
                  : 0.38

                return (
                  <div
                    key={game._id as unknown as string}
                    className="flex items-center gap-3 px-4 py-3 rounded border"
                    style={{
                      backgroundColor: 'var(--color-felt-deep)',
                      borderColor: 'oklch(72% 0.13 82 / 12%)',
                    }}
                  >
                    {/* Clickable row content */}
                    <button
                      className="flex items-center gap-3 flex-1 min-w-0 text-left rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                      onClick={() => {
                        setConfirmDeleteId(null)
                        navigate(`/scorecard/${game.gameCode}`)
                      }}
                    >
                      {/* Game code */}
                      <span
                        className="font-serif text-gold tracking-[0.18em] shrink-0"
                        style={{
                          fontSize: '0.78rem',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '0.2rem',
                          backgroundColor: 'oklch(72% 0.13 82 / 7%)',
                          border: '1px solid oklch(72% 0.13 82 / 18%)',
                        }}
                      >
                        {game.gameCode}
                      </span>

                      {/* Players */}
                      <span
                        className="font-sans text-cream truncate flex-1"
                        style={{ fontSize: '0.68rem', opacity: 0.55 }}
                      >
                        {game.players.join(', ')}
                      </span>

                      {/* Status + round */}
                      <span className="flex items-center gap-1.5 shrink-0">
                        <span
                          className="font-sans uppercase tracking-[0.18em]"
                          style={{ fontSize: '0.5rem', color: statusColor, opacity: statusOpacity }}
                        >
                          {statusLabel}
                        </span>
                        <span
                          className="font-sans text-cream-dim uppercase tracking-[0.12em]"
                          style={{ fontSize: '0.5rem', opacity: 0.3 }}
                        >
                          Rnd {game.currentRound}/13
                        </span>
                      </span>
                    </button>

                    {/* Delete affordance */}
                    <button
                      aria-label={isArmed ? `Confirm delete game ${game.gameCode}` : `Delete game ${game.gameCode}`}
                      className="shrink-0 flex items-center gap-1 px-2 py-1 rounded transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                      style={{
                        fontSize: '0.6rem',
                        color: isArmed ? 'var(--color-danger)' : 'var(--color-cream-soft)',
                        opacity: isArmed ? 1 : 0.25,
                        border: `1px solid ${isArmed ? 'color-mix(in oklch, var(--color-danger) 50%, transparent)' : 'transparent'}`,
                        backgroundColor: isArmed ? 'color-mix(in oklch, var(--color-danger) 8%, transparent)' : 'transparent',
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isArmed) {
                          deleteGame({ gameId: game._id }).catch(() => {})
                          setConfirmDeleteId(null)
                        } else {
                          setConfirmDeleteId(game._id)
                        }
                      }}
                      onBlur={() => {
                        if (isArmed) setConfirmDeleteId(null)
                      }}
                    >
                      {isArmed ? (
                        <span className="font-sans uppercase tracking-[0.12em]">confirm?</span>
                      ) : (
                        <span aria-hidden="true">✕</span>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </main>

    </div>
    </div>
  )
}

export default Dashboard

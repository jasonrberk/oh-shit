import { useState } from 'react'
import { useUser, UserButton } from '@clerk/clerk-react'
import { useMutation } from 'convex/react'
import { useNavigate } from 'react-router-dom'
import { api } from '../convex/_generated/api'

const PLAYER_LABELS = [
  'You',
  'Player to your left',
  'Player across from you',
  'Player to your right',
]

export default function NewScorecard() {
  const { user } = useUser()
  const navigate = useNavigate()
  const createGame = useMutation(api.games.createGame)

  const [names, setNames] = useState<[string, string, string, string]>([
    user?.firstName ?? '',
    '',
    '',
    '',
  ])
  const [dealerIndex, setDealerIndex] = useState<0 | 1 | 2 | 3 | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleNameChange(index: number, value: string) {
    const next: [string, string, string, string] = [...names] as [string, string, string, string]
    next[index] = value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value
    setNames(next)
  }

  function toggleDealer(index: 0 | 1 | 2 | 3) {
    setDealerIndex(dealerIndex === index ? null : index)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (names.some((n) => !n.trim())) {
      setError('All four player names are required.')
      return
    }
    const trimmed = names.map((n) => n.trim())
    if (trimmed.some((n) => n.length < 2 || n.length > 10)) {
      setError('Each name must be between 2 and 10 characters.')
      return
    }
    const lower = trimmed.map((n) => n.toLowerCase())
    if (new Set(lower).size !== lower.length) {
      setError('Player names must be unique.')
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await createGame({
        players: names.map((n) => n.trim()) as [string, string, string, string],
        dealerIndex: dealerIndex ?? -1,
      })
      navigate(`/scorecard/${result.gameCode}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create scorecard.')
      setIsSubmitting(false)
    }
  }

  const trimmedNames = names.map((n) => n.trim())
  const duplicateIndices = new Set<number>()
  trimmedNames.forEach((name, i) => {
    if (!name) return
    trimmedNames.forEach((other, j) => {
      if (i !== j && name.toLowerCase() === other.toLowerCase()) duplicateIndices.add(i)
    })
  })

  const allNamesEntered = names.every((n) => n.trim() !== '')
  const isFormValid =
    allNamesEntered &&
    trimmedNames.every((n) => n.length >= 2 && n.length <= 10) &&
    duplicateIndices.size === 0
  const dealerName = dealerIndex !== null ? names[dealerIndex]?.trim() : null

  return (
    <div className="min-h-screen bg-felt">
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

      {/* Main */}
      <main className="flex-1 px-6 pt-8 pb-10">

        <h2 className="font-serif text-cream tracking-wide mb-8" style={{ fontSize: '1.4rem' }}>
          New Scorecard
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-0">

          {/* Dealer column header */}
          <div className="flex items-center mb-2">
            <div className="flex-1" />
            <span
              className="font-sans text-cream-dim uppercase"
              style={{
                fontSize: '0.58rem',
                opacity: 0.45,
                letterSpacing: '0.3em',
                width: '2.25rem',
                textAlign: 'center',
              }}
            >
              D
            </span>
          </div>

          {/* Player rows */}
          <div className="flex flex-col gap-3.5">
            {PLAYER_LABELS.map((label, i) => {
              const isDuplicate = duplicateIndices.has(i)
              const idleBorder = isDuplicate ? 'color-mix(in oklch, var(--color-crimson-muted) 70%, transparent)' : 'oklch(72% 0.13 82 / 16%)'
              const focusBorder = isDuplicate ? 'var(--color-crimson-muted)' : 'oklch(72% 0.13 82 / 42%)'
              return (
              <div key={i} className="flex items-center gap-3">
                <input
                  type="text"
                  aria-label={label}
                  value={names[i]}
                  onChange={(e) => handleNameChange(i, e.target.value)}
                  placeholder={label}
                  maxLength={10}
                  className="flex-1 bg-felt-light rounded px-4 py-3 font-sans text-cream text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                  style={{
                    border: `1px solid ${idleBorder}`,
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = focusBorder)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = idleBorder)}
                />
                {/* Dealer toggle */}
                <button
                  type="button"
                  onClick={() => toggleDealer(i as 0 | 1 | 2 | 3)}
                  disabled={!allNamesEntered}
                  className="flex-shrink-0 transition-all duration-150 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                  style={{
                    width: '2.25rem',
                    height: '2.25rem',
                    borderRadius: '50%',
                    border: dealerIndex === i
                      ? '2px solid oklch(72% 0.13 82)'
                      : '2px solid oklch(72% 0.13 82 / 22%)',
                    backgroundColor: dealerIndex === i
                      ? 'oklch(72% 0.13 82 / 12%)'
                      : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: allNamesEntered ? 1 : 0.28,
                  }}
                  aria-label={`Set ${names[i] || label} as dealer`}
                >
                  <span
                    className="font-serif"
                    style={{
                      fontSize: '0.72rem',
                      color: dealerIndex === i ? 'oklch(72% 0.13 82)' : 'oklch(72% 0.13 82 / 50%)',
                    }}
                  >
                    D
                  </span>
                </button>
              </div>
              )
            })}
          </div>

          {/* Dealer status line */}
          <p
            className="font-sans text-cream-dim mt-5"
            style={{ fontSize: '0.78rem', opacity: 0.6, letterSpacing: '0.02em' }}
          >
            {dealerName
              ? `${dealerName} will be the dealer`
              : 'The dealer will be selected randomly'}
          </p>

          {error && (
            <p
              role="alert"
              className="font-sans mt-3"
              style={{ fontSize: '0.78rem', color: 'var(--color-crimson-muted)' }}
            >
              {error}
            </p>
          )}

          {/* Ornamental divider */}
          <div className="flex items-center gap-3 my-8">
            <div className="h-px flex-1 bg-gold" style={{ opacity: 0.1 }} />
            <span className="text-gold" style={{ fontSize: '0.6rem', opacity: 0.22 }}>♦</span>
            <div className="h-px flex-1 bg-gold" style={{ opacity: 0.1 }} />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 px-4 py-4 bg-felt-light rounded font-serif text-gold tracking-[0.22em] uppercase transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              style={{
                fontSize: '0.72rem',
                border: '1px solid oklch(72% 0.13 82 / 16%)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'oklch(72% 0.13 82 / 38%)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'oklch(72% 0.13 82 / 16%)')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="flex-[2] px-4 py-4 bg-crimson hover:bg-crimson-bright rounded font-serif text-cream tracking-[0.18em] uppercase transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              style={{ fontSize: '0.72rem' }}
            >
              {isSubmitting ? 'Creating…' : 'Create Scorecard'}
            </button>
          </div>

        </form>
      </main>
    </div>
    </div>
  )
}

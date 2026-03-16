import { useState } from 'react'
import { UserButton, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [codeInput, setCodeInput] = useState('')

  return (
    <div className="min-h-screen bg-felt flex flex-col relative overflow-hidden">

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
          <p className="font-serif text-cream tracking-wide" style={{ fontSize: '1.6rem' }}>
            {user?.firstName ?? 'Player'}
          </p>
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
            className="group relative flex items-center gap-4 px-5 py-5 bg-crimson rounded text-cream transition-all duration-150 active:scale-[0.98]"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'oklch(52% 0.21 25)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
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
              className="group flex items-center gap-4 px-5 py-5 bg-felt-light rounded text-cream transition-all duration-150 active:scale-[0.98] border"
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
                  value={codeInput}
                  maxLength={6}
                  placeholder="XXXXXX"
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && codeInput.length === 6) navigate(`/view/${codeInput}`)
                    if (e.key === 'Escape') { setShowCodeInput(false); setCodeInput('') }
                  }}
                  className="flex-1 font-serif text-cream text-center tracking-[0.4em] uppercase rounded px-3 py-2 outline-none"
                  style={{
                    fontSize: '1.1rem',
                    backgroundColor: 'oklch(20% 0.06 158)',
                    border: '1px solid oklch(72% 0.13 82 / 25%)',
                    caretColor: 'oklch(72% 0.13 82)',
                  }}
                />
                <button
                  onClick={() => { if (codeInput.length === 6) navigate(`/view/${codeInput}`) }}
                  disabled={codeInput.length !== 6}
                  className="px-4 py-2 rounded font-serif text-cream tracking-[0.15em] uppercase transition-all duration-150 active:scale-[0.96] disabled:opacity-30"
                  style={{ fontSize: '0.78rem', backgroundColor: 'oklch(46% 0.18 25)' }}
                >
                  Go
                </button>
              </div>
              <button
                onClick={() => { setShowCodeInput(false); setCodeInput('') }}
                className="font-sans text-gold self-start"
                style={{ fontSize: '0.6rem', opacity: 0.4, letterSpacing: '0.1em' }}
              >
                cancel
              </button>
            </div>
          )}

          {/* Play Online — disabled / coming soon */}
          <button
            disabled
            className="flex items-center gap-4 px-5 py-5 rounded cursor-not-allowed border"
            style={{
              backgroundColor: 'oklch(21% 0.05 158)',
              borderColor: 'oklch(94% 0.02 85 / 5%)',
            }}
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
      </main>

    </div>
  )
}

export default Dashboard

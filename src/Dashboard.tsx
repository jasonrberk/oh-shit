import { UserButton, useUser } from '@clerk/clerk-react'

function Dashboard() {
  const { user } = useUser()

  return (
    <div className="min-h-screen bg-felt flex flex-col relative overflow-hidden">

{/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 bg-felt-light border-b border-gold" style={{ borderBottomColor: 'oklch(72% 0.13 82 / 12%)' }}>
        <h1 className="font-serif text-gold tracking-[0.28em] text-xl uppercase" style={{ fontWeight: 700 }}>
          Oh Shit!
        </h1>
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'ring-1 ring-gold/30 rounded-full',
            }
          }}
        />
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-col flex-1 px-6 pt-10 pb-10 gap-0">

        {/* Player welcome */}
        <div className="mb-8">
          <p
            className="font-sans text-cream-dim uppercase tracking-[0.45em] mb-2"
            style={{ fontSize: '0.6rem', opacity: 0.55 }}
          >
            Welcome back
          </p>
          <p className="font-serif text-cream text-2xl tracking-wide">
            {user?.firstName ?? 'Player'}
          </p>
        </div>

        {/* Ornamental divider */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-gold" style={{ opacity: 0.12 }} />
          <span className="text-gold text-xs" style={{ opacity: 0.25 }}>♦</span>
          <div className="h-px flex-1 bg-gold" style={{ opacity: 0.12 }} />
        </div>

        {/* Action list */}
        <div className="flex flex-col gap-3">

          {/* Start a Scorecard — primary */}
          <button className="group relative flex items-center gap-4 px-5 py-5 bg-crimson rounded text-cream transition-all duration-150 active:scale-[0.98]" style={{ '--hover-bg': 'oklch(52% 0.21 25)' } as React.CSSProperties}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'oklch(52% 0.21 25)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
          >
            <span className="text-xl leading-none" style={{ opacity: 0.75 }}>♦</span>
            <span className="font-serif flex-1 text-left tracking-[0.22em] uppercase" style={{ fontSize: '0.8rem' }}>
              Start a Scorecard
            </span>
            <span
              className="text-sm transition-all duration-150 group-hover:translate-x-0.5"
              style={{ opacity: 0.5 }}
            >
              →
            </span>
          </button>

          {/* View a Scorecard — secondary */}
          <button
            className="group flex items-center gap-4 px-5 py-5 bg-felt-light rounded text-cream transition-all duration-150 active:scale-[0.98] border"
            style={{ borderColor: 'oklch(72% 0.13 82 / 18%)' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'oklch(72% 0.13 82 / 45%)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'oklch(72% 0.13 82 / 18%)')}
          >
            <span className="text-gold text-xl leading-none" style={{ opacity: 0.65 }}>♣</span>
            <span className="font-serif flex-1 text-left text-gold tracking-[0.22em] uppercase" style={{ fontSize: '0.8rem', opacity: 0.75 }}>
              View a Scorecard
            </span>
            <span
              className="text-gold text-sm transition-all duration-150 group-hover:translate-x-0.5"
              style={{ opacity: 0.3 }}
            >
              →
            </span>
          </button>

          {/* Play Online — disabled / coming soon */}
          <button
            disabled
            className="flex items-center gap-4 px-5 py-5 rounded cursor-not-allowed border"
            style={{
              backgroundColor: 'oklch(22% 0.05 158)',
              borderColor: 'oklch(94% 0.02 85 / 5%)',
            }}
          >
            <span className="text-xl leading-none" style={{ color: 'oklch(94% 0.02 85)', opacity: 0.15 }}>♠</span>
            <div className="flex-1 text-left">
              <p
                className="font-serif tracking-[0.22em] uppercase"
                style={{ fontSize: '0.8rem', color: 'oklch(94% 0.02 85)', opacity: 0.2 }}
              >
                Play Online
              </p>
              <p
                className="font-sans tracking-[0.35em] uppercase mt-1"
                style={{ fontSize: '0.55rem', color: 'oklch(94% 0.02 85)', opacity: 0.2 }}
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

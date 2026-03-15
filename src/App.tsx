import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react'
import Dashboard from './Dashboard'

function App() {
  return (
    <div className="min-h-screen bg-felt relative overflow-hidden">

<SignedOut>
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm flex flex-col items-center gap-10">

            {/* Brand lockup */}
            <div className="text-center">
              <h1
                className="font-serif text-crimson leading-none"
                style={{
                  fontSize: 'clamp(3.25rem, 14vw, 5rem)',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  textShadow: '0 4px 24px rgba(0,0,0,0.7)',
                }}
              >
                Oh Shit!
              </h1>
              <p
                className="font-serif text-gold tracking-[0.4em] uppercase mt-3 inline-block px-4 py-1.5 rounded-full border border-gold"
                style={{ fontSize: '0.65rem', opacity: 0.9, borderColor: 'oklch(72% 0.13 82 / 35%)', backgroundColor: 'oklch(72% 0.13 82 / 10%)' }}
              >
                Card Game Companion
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="h-px flex-1 bg-gold" style={{ opacity: 0.2 }} />
                <span className="text-gold text-xs" style={{ opacity: 0.35 }}>♦</span>
                <div className="h-px flex-1 bg-gold" style={{ opacity: 0.2 }} />
              </div>
              <p className="text-cream-dim mt-4 text-base tracking-wide" style={{ opacity: 0.6 }}>
                Keep track of every bid, trick and score in one place!
              </p>
            </div>

            {/* Clerk sign-in */}
            <div className="w-full">
              <SignIn routing="hash" />
            </div>

          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <Dashboard />
      </SignedIn>

    </div>
  )
}

export default App

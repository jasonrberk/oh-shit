import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react'
import Dashboard from './Dashboard'

function App() {
  return (
    <div className="min-h-screen bg-felt relative overflow-hidden">

      {/* Giant background spade — the room's focal anchor */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
      >
        <span
          className="text-cream leading-none"
          style={{ fontSize: 'clamp(16rem, 70vw, 38rem)', opacity: 0.035 }}
        >
          ♠
        </span>
      </div>

      {/* Corner suit markers — like a playing card back */}
      <div aria-hidden="true" className="absolute top-5 left-5 text-gold text-lg select-none pointer-events-none" style={{ opacity: 0.18 }}>♣</div>
      <div aria-hidden="true" className="absolute top-5 right-5 text-crimson text-lg select-none pointer-events-none" style={{ opacity: 0.18 }}>♥</div>
      <div aria-hidden="true" className="absolute bottom-5 left-5 text-crimson text-lg select-none pointer-events-none" style={{ opacity: 0.18 }}>♥</div>
      <div aria-hidden="true" className="absolute bottom-5 right-5 text-gold text-lg select-none pointer-events-none" style={{ opacity: 0.18 }}>♣</div>

      <SignedOut>
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm flex flex-col items-center gap-10">

            {/* Brand lockup */}
            <div className="text-center">
              <p
                className="font-serif text-gold tracking-[0.55em] uppercase mb-4"
                style={{ fontSize: '0.65rem', opacity: 0.7 }}
              >
                Card Game
              </p>
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
              <div className="flex items-center gap-3 mt-5">
                <div className="h-px flex-1 bg-gold" style={{ opacity: 0.2 }} />
                <span className="text-gold text-xs" style={{ opacity: 0.35 }}>♦</span>
                <div className="h-px flex-1 bg-gold" style={{ opacity: 0.2 }} />
              </div>
              <p className="text-cream-dim mt-4 text-xs tracking-widest" style={{ opacity: 0.6 }}>
                Sign in to manage your scorecard
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

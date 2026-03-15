import { SignedIn, SignedOut, SignIn, UserButton } from '@clerk/clerk-react'

function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <SignedOut>
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">Oh Shit!</h1>
          <p className="text-slate-400 text-sm">Sign in to manage your scorecard</p>
          <SignIn routing="hash" />
        </div>
      </SignedOut>

      <SignedIn>
        <p className="text-white">Dashboard coming next...</p>
      </SignedIn>
    </div>
  )
}

export default App
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react'

function App() {
  const { user } = useUser()

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <SignedOut>
        <SignInButton mode="modal">
          <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl">
            Sign In
          </button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold text-white">
            Hey, {user?.firstName}!
          </h1>
          <UserButton />
        </div>
      </SignedIn>
    </div>
  )
}

export default App
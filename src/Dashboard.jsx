import { UserButton, useUser } from '@clerk/clerk-react'

function Dashboard() {
  const { user } = useUser()

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">Oh Shit!</h1>
        <UserButton />
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center px-6 pt-16 gap-4">
        <p className="text-slate-400 text-sm mb-2">Welcome back, {user?.firstName}</p>

        <button className="w-full max-w-sm p-5 bg-blue-600 hover:bg-blue-500 text-white text-lg font-semibold rounded-2xl transition-colors active:scale-95">
          Start a Scorecard
        </button>

        <button className="w-full max-w-sm p-5 bg-slate-700 hover:bg-slate-600 text-white text-lg font-semibold rounded-2xl transition-colors active:scale-95">
          View a Scorecard
        </button>

        <button className="w-full max-w-sm p-5 bg-slate-800 text-slate-500 text-lg font-semibold rounded-2xl cursor-not-allowed" disabled>
          Play Online
        </button>
      </main>

    </div>
  )
}

export default Dashboard
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { dark } from '@clerk/themes'
import './index.css'
import App from './App'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)

const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorBackground: '#1a3327',   // felt-light
    colorPrimary: '#c4961e',      // antique gold
    colorText: '#f0ebe0',         // warm cream
    colorTextSecondary: '#a89e90',
    colorNeutral: '#f0ebe0',
    colorShimmer: '#243f31',
    borderRadius: '0.375rem',
  },
  elements: {
    socialButtonsIconButton__apple: { backgroundColor: '#243f31', border: '1px solid rgba(196,150,30,0.2)' },
    socialButtonsIconButton__facebook: { backgroundColor: '#243f31', border: '1px solid rgba(196,150,30,0.2)' },
    socialButtonsIconButton__google: { backgroundColor: '#243f31', border: '1px solid rgba(196,150,30,0.2)' },
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        appearance={clerkAppearance}
        localization={{
          signIn: {
            start: {
              title: 'Sign in to get playing!',
              subtitle: '',
            },
          },
        }}
      >
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </ClerkProvider>
  </StrictMode>,
)

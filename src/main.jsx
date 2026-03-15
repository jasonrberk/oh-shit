import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { dark } from '@clerk/themes'
import './index.css'
import App from './App.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)

const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorBackground: '#1e293b',
    colorPrimary: '#3b82f6',
    colorText: '#f1f5f9',
    colorTextSecondary: '#94a3b8',
    colorNeutral: '#ffffff',
    colorShimmer: '#475569',
    borderRadius: '0.75rem',
  },
  elements: {
    socialButtonsIconButton__apple: { backgroundColor: '#475569', border: '1px solid #64748b' },
    socialButtonsIconButton__facebook: { backgroundColor: '#475569', border: '1px solid #64748b' },
    socialButtonsIconButton__google: { backgroundColor: '#475569', border: '1px solid #64748b' },
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} appearance={clerkAppearance}>
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </ClerkProvider>
  </StrictMode>,
)
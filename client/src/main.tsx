import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './lib/toast.tsx'
import { SessionTimeoutModal } from './components/SessionTimeoutModal.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <SessionTimeoutModal />
      <App />
    </ToastProvider>
  </StrictMode>,
)

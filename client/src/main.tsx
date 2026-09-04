import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './lib/toast.tsx'
import { SessionExpiredModal } from './components/SessionExpiredModal.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <SessionExpiredModal />
      <App />
    </ToastProvider>
  </StrictMode>,
)

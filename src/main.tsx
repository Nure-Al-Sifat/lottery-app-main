import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Web3ModalProvider } from './context/Web3Modal.tsx'
import AuthProvider from './context/AuthProvider'
import { Toaster } from './components/ui/toaster'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Web3ModalProvider>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </Web3ModalProvider>
  </StrictMode>,
)

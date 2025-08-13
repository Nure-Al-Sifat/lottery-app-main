import { createWeb3Modal } from '@web3modal/wagmi/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { State, WagmiProvider } from 'wagmi'
import { ReactNode } from 'react'

import { config, projectId } from '../config/wagmi'

// Setup queryClient
const queryClient = new QueryClient()

// Create modal immediately when module loads
if (projectId) {
  try {
    createWeb3Modal({
      wagmiConfig: config,
      projectId,
      enableAnalytics: false,
      enableOnramp: false,
      enableEIP6963: true,
      siweConfig: undefined,
      themeMode: 'dark',
      themeVariables: {
        '--w3m-color-mix': '#6366f1',
        '--w3m-color-mix-strength': 20
      }
    })
    console.log('Web3Modal initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Web3Modal:', error)
  }
}

export function Web3ModalProvider({ 
  children, 
  initialState 
}: { 
  children: ReactNode
  initialState?: State 
}) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
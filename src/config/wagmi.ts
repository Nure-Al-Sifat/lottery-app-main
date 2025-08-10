import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { cookieStorage, createStorage } from 'wagmi'
import { sepolia } from 'wagmi/chains'

// Get your own project ID from https://cloud.walletconnect.com
export const projectId = 'e10b2b39a8a1ba0d6e2d8e2f8e9f2f8e'

const metadata = {
  name: 'ChainLottery',
  description: 'Decentralized Blockchain Lottery',
  url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Create wagmiConfig
const chains = [sepolia] as const
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: false,
  storage: createStorage({
    storage: cookieStorage
  }),
})
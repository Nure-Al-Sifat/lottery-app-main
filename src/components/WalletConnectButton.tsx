import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'
import { sepolia } from 'wagmi/chains'
import { useState } from 'react'
import { toast } from 'sonner'

export const WalletConnectButton = () => {
  const { open } = useWeb3Modal()
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [isLoading, setIsLoading] = useState(false)
  
  const isCorrectNetwork = chainId === sepolia.id

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleClick = async () => {
    if (!isConnected) {
      setIsLoading(true)
      try {
        await open()
        toast.success('Wallet connected successfully!')
      } catch (error) {
        console.error('Failed to open Web3Modal:', error)
        toast.error('Failed to connect wallet')
      } finally {
        setIsLoading(false)
      }
    } else if (!isCorrectNetwork) {
      // Switch to correct network
      setIsLoading(true)
      try {
        await switchChain({ chainId: sepolia.id })
        toast.success('Switched to Sepolia network')
      } catch (error) {
        console.error('Failed to switch network:', error)
        toast.error('Failed to switch network')
      } finally {
        setIsLoading(false)
      }
    } else {
      // Open wallet modal for account actions
      try {
        await open()
      } catch (error) {
        console.error('Failed to open Web3Modal:', error)
        toast.error('Failed to open wallet modal')
      }
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant={isConnected ? (isCorrectNetwork ? "glass" : "warning") : "lottery"}
      size="default"
    >
      <Wallet className="w-4 h-4 mr-2" />
      {isLoading
        ? "Connecting..."
        : isConnected
        ? isCorrectNetwork
          ? formatAddress(address!)
          : "Wrong Network"
        : "Connect Wallet"
      }
    </Button>
  )
}
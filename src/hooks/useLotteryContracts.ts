import { useMemo } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { 
  CONTRACTS, 
  MOCK_USDT_ABI, 
  LOTTERY_MANAGER_ABI, 
  LOTTERY_NFT_ABI 
} from '@/lib/contracts'

export const useLotteryContracts = () => {
  const { isConnected, address } = useAccount()
  const { writeContract } = useWriteContract()

  return {
    isReady: isConnected,
    writeContract,
    contracts: {
      MOCK_USDT: CONTRACTS.MOCK_USDT,
      LOTTERY_MANAGER: CONTRACTS.LOTTERY_MANAGER,
      LOTTERY_NFT: CONTRACTS.LOTTERY_NFT
    },
    abis: {
      MOCK_USDT_ABI,
      LOTTERY_MANAGER_ABI,
      LOTTERY_NFT_ABI
    }
  }
}
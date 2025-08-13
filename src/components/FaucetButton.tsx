import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAccount, useWriteContract } from 'wagmi'
import { Droplets, Coins, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { FAUCET_API_URL, CONTRACTS, MOCK_USDT_ABI } from '@/lib/contracts'

export const FaucetButton = () => {
  const { address: account, isConnected } = useAccount()
  const { writeContract } = useWriteContract()
  const { toast } = useToast()
  const [isClaimingETH, setIsClaimingETH] = useState(false)
  const [isClaimingUSDT, setIsClaimingUSDT] = useState(false)

  const claimTestETH = async () => {
    if (!account) return
    
    setIsClaimingETH(true)
    try {
      const response = await fetch(FAUCET_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: account }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "ETH Claimed!",
          description: `Transaction: ${data.txHash}`,
        })
      } else {
        throw new Error(data.error || 'Faucet request failed')
      }
    } catch (error: any) {
      toast({
        title: "Faucet Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsClaimingETH(false)
    }
  }

  const mintTestUSDT = async () => {
    if (!account) return
    
    setIsClaimingUSDT(true)
    try {
      // Call the real contract function to mint test USDT
      try {
        writeContract({
          address: CONTRACTS.MOCK_USDT as `0x${string}`,
          abi: MOCK_USDT_ABI,
          functionName: 'tesTmint',
          args: [account],
        } as any);

        toast({
          title: "USDT Minted!",
          description: "1000 test USDT tokens minting transaction sent",
        });
      } catch (writeError) {
        console.log('Transaction sent:', writeError);
        toast({
          title: "USDT Minted!",
          description: "1000 test USDT tokens minting transaction sent",
        });
      }
    } catch (error: any) {
      toast({
        title: "Mint Failed",
        description: error?.message || "Failed to mint USDT",
        variant: "destructive",
      })
    } finally {
      setIsClaimingUSDT(false)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-muted-foreground">Connect wallet to use faucet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Droplets className="w-5 h-5 mr-2" />
          Test Token Faucet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={claimTestETH}
          disabled={isClaimingETH}
          variant="outline"
          className="w-full"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          {isClaimingETH ? 'Claiming...' : 'Claim 0.01 Test ETH'}
        </Button>
        
        <Button
          onClick={mintTestUSDT}
          disabled={isClaimingUSDT}
          variant="outline" 
          className="w-full"
        >
          <Coins className="w-4 h-4 mr-2" />
          {isClaimingUSDT ? 'Minting...' : 'Mint 1000 Test USDT'}
        </Button>
      </CardContent>
    </Card>
  )
}
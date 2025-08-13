import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TicketTypeBadge } from '@/components/TicketTypeBadge'
import { FaucetButton } from '@/components/FaucetButton'
import { useLottery } from '@/context/LotteryContext'
import { useAccount } from 'wagmi'
import { useToast } from '@/hooks/use-toast'
import { ShoppingCart, Wallet, AlertCircle } from 'lucide-react'
import { TicketType } from '@/types/lottery'
import { formatEther } from 'viem'

interface TicketPurchaseFormProps {
  roundId: bigint
  onPurchaseComplete?: () => void
}

export const TicketPurchaseForm = ({ roundId, onPurchaseComplete }: TicketPurchaseFormProps) => {
  const { address: account, isConnected } = useAccount()
  const { ticketPrices, mintTicket } = useLottery()
  const { toast } = useToast()
  
  const [selectedType, setSelectedType] = useState<TicketType>(TicketType.FULL)
  const [loading, setLoading] = useState(false)

  const getCurrentPrice = () => {
    switch (selectedType) {
      case TicketType.FULL:
        return ticketPrices.full
      case TicketType.HALF:
        return ticketPrices.half
      case TicketType.QUARTER:
        return ticketPrices.quarter
      default:
        return ticketPrices.full
    }
  }

  const purchaseTicket = async () => {
    try {
      setLoading(true)
      await mintTicket(roundId, selectedType)
      onPurchaseComplete?.()
    } catch (error) {
      // Error handled in mintTicket
    } finally {
      setLoading(false)
    }
  }

  const formatUSDT = (amount: bigint) => {
    return formatEther(amount)
  }

  if (!isConnected) {
    return (
      <Card className="lottery-card">
        <CardContent className="pt-6">
          <div className="text-center">
            <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Connect your wallet to purchase tickets</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!ticketPrices.full) {
    return (
      <Card className="lottery-card">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-8 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="lottery-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Purchase Ticket
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ticket Type Selection */}
        <div className="space-y-3">
          <Label htmlFor="ticket-type">Ticket Type</Label>
          <Select
            value={selectedType.toString()}
            onValueChange={(value) => setSelectedType(Number(value) as TicketType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TicketType.FULL.toString()}>
                <div className="flex items-center space-x-2">
                  <TicketTypeBadge type={TicketType.FULL} />
                  <span>Full Ticket - {formatUSDT(ticketPrices.full)} USDT</span>
                </div>
              </SelectItem>
              <SelectItem value={TicketType.HALF.toString()}>
                <div className="flex items-center space-x-2">
                  <TicketTypeBadge type={TicketType.HALF} />
                  <span>Half Ticket - {formatUSDT(ticketPrices.half)} USDT</span>
                </div>
              </SelectItem>
              <SelectItem value={TicketType.QUARTER.toString()}>
                <div className="flex items-center space-x-2">
                  <TicketTypeBadge type={TicketType.QUARTER} />
                  <span>Quarter Ticket - {formatUSDT(ticketPrices.quarter)} USDT</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Display */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Cost</span>
            <div className="text-xl font-bold">{formatUSDT(getCurrentPrice())} USDT</div>
          </div>
        </div>

        {/* Faucet Buttons */}
        <div className="mb-4">
          <FaucetButton />
        </div>

        {/* Purchase Button */}
        <Button
          onClick={purchaseTicket}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Purchasing...' : 'Buy Ticket'}
        </Button>

        {/* Ticket Type Info */}
        <div className="text-xs text-muted-foreground text-center">
          Ticket numbers will be randomly generated. NFT metadata available at purchase.
        </div>
      </CardContent>
    </Card>
  )
}
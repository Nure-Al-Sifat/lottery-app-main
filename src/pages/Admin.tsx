import { useState } from 'react'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useLotteryData } from '@/hooks/useLotteryData'
import { useAccount } from 'wagmi'
import { useLotteryContracts } from '@/hooks/useLotteryContracts'
import { Settings, Plus, DollarSign, Download, Shield, AlertTriangle } from 'lucide-react'
import { ethers } from 'ethers'
import { useToast } from '@/hooks/use-toast'
import { PrizeDisplay } from '@/components/PrizeDisplay'

const Admin = () => {
  const { isConnected, address: account } = useAccount()
  const { contracts } = useLotteryContracts()
  const { isOwner, ticketPrices, createRound, closeAndDraw, withdrawUSDT, setPrices } = useLotteryData()
  const { toast } = useToast()

  const [createRoundForm, setCreateRoundForm] = useState({
    maxTickets: '',
    drawTime: ''
  })

  const [pricesForm, setPricesForm] = useState({
    full: '',
    half: '',
    quarter: ''
  })

  const [withdrawing, setWithdrawing] = useState(false)
  const [contractBalance, setContractBalance] = useState<bigint>(BigInt(0))

  // Load contract balance
  const loadContractBalance = async () => {
    if (!contracts) return
    try {
      const balance = await contracts.mockUSDT.balanceOf(contracts.lotteryManager.target)
      setContractBalance(balance)
    } catch (error) {
      console.error('Error loading contract balance:', error)
    }
  }

  const handleCreateRound = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createRoundForm.maxTickets || !createRoundForm.drawTime) return

    try {
      const drawTimeTimestamp = Math.floor(new Date(createRoundForm.drawTime).getTime() / 1000)
      await createRound(BigInt(createRoundForm.maxTickets), BigInt(drawTimeTimestamp))
      setCreateRoundForm({ maxTickets: '', drawTime: '' })
    } catch (error) {
      console.error('Error creating round:', error)
    }
  }

  const handleUpdatePrices = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pricesForm.full || !pricesForm.half || !pricesForm.quarter) return

    try {
      const fullPrice = ethers.parseUnits(pricesForm.full, 6) // USDT has 6 decimals
      const halfPrice = ethers.parseUnits(pricesForm.half, 6)
      const quarterPrice = ethers.parseUnits(pricesForm.quarter, 6)
      
      await setPrices(fullPrice, halfPrice, quarterPrice)
      setPricesForm({ full: '', half: '', quarter: '' })
    } catch (error) {
      console.error('Error updating prices:', error)
    }
  }

  const handleWithdraw = async () => {
    try {
      setWithdrawing(true)
      await withdrawUSDT()
      await loadContractBalance()
    } catch (error) {
      console.error('Error withdrawing:', error)
    } finally {
      setWithdrawing(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Wallet Not Connected</h2>
              <p className="text-muted-foreground">Please connect your wallet to access the admin panel.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">You are not authorized to access the admin panel.</p>
              <p className="text-sm text-muted-foreground mt-2">Only the contract owner can access this page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Settings className="w-8 h-8 text-primary mr-3" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage lottery settings and operations</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create Round */}
          <Card className="lottery-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Create New Round
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRound} className="space-y-4">
                <div>
                  <Label htmlFor="maxTickets">Max Tickets</Label>
                  <Input
                    id="maxTickets"
                    type="number"
                    placeholder="e.g., 1000"
                    value={createRoundForm.maxTickets}
                    onChange={(e) => setCreateRoundForm({ ...createRoundForm, maxTickets: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="drawTime">Draw Time</Label>
                  <Input
                    id="drawTime"
                    type="datetime-local"
                    value={createRoundForm.drawTime}
                    onChange={(e) => setCreateRoundForm({ ...createRoundForm, drawTime: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Round
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Update Prices */}
          <Card className="lottery-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Update Ticket Prices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Full Price:</span>
                  <PrizeDisplay amount={ticketPrices.full} size="sm" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Half Price:</span>
                  <PrizeDisplay amount={ticketPrices.half} size="sm" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Quarter Price:</span>
                  <PrizeDisplay amount={ticketPrices.quarter} size="sm" />
                </div>
              </div>

              <Separator className="my-4" />

              <form onSubmit={handleUpdatePrices} className="space-y-4">
                <div>
                  <Label htmlFor="fullPrice">Full Ticket Price (USDT)</Label>
                  <Input
                    id="fullPrice"
                    type="number"
                    step="0.000001"
                    placeholder="e.g., 10.000000"
                    value={pricesForm.full}
                    onChange={(e) => setPricesForm({ ...pricesForm, full: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="halfPrice">Half Ticket Price (USDT)</Label>
                  <Input
                    id="halfPrice"
                    type="number"
                    step="0.000001"
                    placeholder="e.g., 5.000000"
                    value={pricesForm.half}
                    onChange={(e) => setPricesForm({ ...pricesForm, half: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="quarterPrice">Quarter Ticket Price (USDT)</Label>
                  <Input
                    id="quarterPrice"
                    type="number"
                    step="0.000001"
                    placeholder="e.g., 2.500000"
                    value={pricesForm.quarter}
                    onChange={(e) => setPricesForm({ ...pricesForm, quarter: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Update Prices
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contract Balance & Withdrawal */}
          <Card className="lottery-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Contract Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Contract USDT Balance</p>
                <PrizeDisplay amount={contractBalance} size="lg" />
              </div>

              <Button 
                onClick={loadContractBalance}
                variant="outline"
                className="w-full"
              >
                Refresh Balance
              </Button>

              <Button 
                onClick={handleWithdraw}
                disabled={withdrawing || contractBalance === BigInt(0)}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                {withdrawing ? 'Withdrawing...' : 'Withdraw All USDT'}
              </Button>
            </CardContent>
          </Card>

          {/* Contract Info */}
          <Card className="lottery-card">
            <CardHeader>
              <CardTitle>Contract Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Your Address:</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Role:</span>
                <Badge variant="default">Contract Owner</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Network:</span>
                <Badge variant="secondary">Sepolia Testnet</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Admin
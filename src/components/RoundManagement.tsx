import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Clock, Users, DollarSign, Zap, AlertCircle } from 'lucide-react'
import { Round } from '@/types/lottery'
import { useLotteryData } from '@/hooks/useLotteryData'
import { formatEther } from 'viem'

interface RoundManagementProps {
  rounds: Round[]
  isOwner: boolean
}

export const RoundManagement = ({ rounds, isOwner }: RoundManagementProps) => {
  const { closeAndDraw } = useLotteryData()
  const [processingRounds, setProcessingRounds] = useState<Set<bigint>>(new Set())

  const handleCloseDraw = async (roundId: bigint) => {
    setProcessingRounds(prev => new Set(prev).add(roundId))
    try {
      await closeAndDraw(roundId)
    } catch (error) {
      console.error('Error closing round:', error)
    } finally {
      setProcessingRounds(prev => {
        const newSet = new Set(prev)
        newSet.delete(roundId)
        return newSet
      })
    }
  }

  const getRoundStatus = (round: Round) => {
    const now = Date.now() / 1000
    const drawTime = Number(round.drawTime)
    
    if (round.drawCompleted) return 'Completed'
    if (!round.isActive) return 'Closed'
    if (drawTime <= now) return 'Ready for Draw'
    return 'Active'
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active': return 'default'
      case 'Ready for Draw': return 'destructive'
      case 'Closed': return 'secondary'
      case 'Completed': return 'outline'
      default: return 'default'
    }
  }

  const canCloseDraw = (round: Round) => {
    const now = Date.now() / 1000
    const drawTime = Number(round.drawTime)
    return round.isActive && !round.drawCompleted && drawTime <= now
  }

  const formatProgress = (round: Round) => {
    return (Number(round.totalSold) / Number(round.maxTickets)) * 100
  }

  if (!isOwner) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Admin access required to manage rounds</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Round Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {rounds.map((round) => {
              const status = getRoundStatus(round)
              const progress = formatProgress(round)
              const isProcessing = processingRounds.has(round.id)
              
              return (
                <Card key={round.id.toString()} className="border-l-4 border-l-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">Round #{round.id.toString()}</h3>
                        <Badge variant={getStatusVariant(status)}>{status}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {canCloseDraw(round) && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                disabled={isProcessing}
                              >
                                {isProcessing ? 'Processing...' : 'Close & Draw'}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Close Round & Initiate Draw</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to close Round #{round.id.toString()} and initiate the random draw? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCloseDraw(round.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Close & Draw
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {round.totalSold.toString()}/{round.maxTickets.toString()} tickets
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          Pool: {formatEther(round.totalPool)} USDT
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          Draw: {new Date(Number(round.drawTime) * 1000).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Ticket Sales Progress</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {rounds.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No rounds available to manage
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
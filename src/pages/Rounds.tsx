import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PrizeDisplay } from '@/components/PrizeDisplay'
import { CountdownTimer } from '@/components/CountdownTimer'
import { TicketPurchaseForm } from '@/components/TicketPurchaseForm'
import { useLottery } from '@/context/LotteryContext'
import { useAccount } from 'wagmi'
import { Trophy, Users, Clock, Target, Filter, ArrowLeft, Ticket } from 'lucide-react'
import { Round } from '@/types/lottery'
import { useToast } from '@/hooks/use-toast'

const Rounds = () => {
  const { isConnected } = useAccount()
  const { toast } = useToast()
  const { roundId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all')

  const { rounds, isOwner } = useLottery()
  
  // If we have a roundId, show individual round view
  const selectedRound = roundId ? rounds.find(r => r.id.toString() === roundId) : null


  const filteredRounds = rounds.filter(round => {
    if (filter === 'active') return round.isActive
    if (filter === 'closed') return !round.isActive
    return true
  })

  const formatProgress = (sold: bigint, max: bigint) => {
    return (Number(sold) / Number(max)) * 100
  }

  const getRoundStatus = (round: Round) => {
    if (round.drawCompleted) return 'Completed'
    if (round.isActive) return 'Active'
    return 'Closed'
  }

  const getStatusBadge = (round: Round) => {
    const status = getRoundStatus(round)
    const variant = status === 'Active' ? 'default' : status === 'Completed' ? 'secondary' : 'outline'
    return <Badge variant={variant}>{status}</Badge>
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-8">
              Please connect your wallet to view lottery rounds
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Individual Round View
  if (roundId && selectedRound) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/rounds')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Rounds
          </Button>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Round Details */}
            <div className="space-y-6">
              <Card className="lottery-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-2xl">
                      <Trophy className="w-6 h-6 text-primary mr-3" />
                      Round #{selectedRound.id.toString()}
                    </CardTitle>
                    {getStatusBadge(selectedRound)}
                  </div>
                  <div className="text-center py-4">
                    <PrizeDisplay amount={selectedRound.totalPool} size="lg" />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Round Statistics */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{selectedRound.totalSold.toString()}</div>
                      <div className="text-sm text-muted-foreground">Tickets Sold</div>
                    </div>
                    
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Target className="w-6 h-6 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{selectedRound.maxTickets.toString()}</div>
                      <div className="text-sm text-muted-foreground">Max Tickets</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Round Progress</span>
                      <span className="text-sm font-medium">
                        {formatProgress(selectedRound.totalSold, selectedRound.maxTickets).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-primary to-primary-glow h-3 rounded-full transition-all duration-300"
                        style={{ width: `${formatProgress(selectedRound.totalSold, selectedRound.maxTickets)}%` }}
                      />
                    </div>
                  </div>

                  {/* Countdown or Status */}
                  {selectedRound.isActive ? (
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                      <div className="text-sm text-muted-foreground mb-2">Draw Time</div>
                      <CountdownTimer 
                        targetTime={selectedRound.drawTime} 
                        className="justify-center"
                      />
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Clock className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                      <div className="text-sm text-muted-foreground">
                        Draw {selectedRound.drawCompleted ? 'Completed' : 'Pending'}
                      </div>
                    </div>
                  )}

                  {/* Winning Numbers (if available) */}
                  {selectedRound.winningNumbers && selectedRound.winningNumbers.length > 0 && (
                    <div className="text-center p-4 bg-success/10 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">Winning Numbers</div>
                      <div className="flex justify-center gap-2">
                        {selectedRound.winningNumbers.map((num, index) => (
                          <div key={index} className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                            {num}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Ticket Purchase Form */}
            <div>
              {selectedRound.isActive ? (
                <TicketPurchaseForm 
                  roundId={selectedRound.id}
                  onPurchaseComplete={() => {
                    toast({
                      title: "Ticket Purchased!",
                      description: "Your ticket has been successfully purchased.",
                    })
                  }}
                />
              ) : (
                <Card className="lottery-card">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Round Closed</h3>
                      <p className="text-muted-foreground">
                        This round is no longer accepting ticket purchases.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Round not found
  if (roundId && !selectedRound) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Round Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The requested lottery round could not be found.
            </p>
            <Button onClick={() => navigate('/rounds')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Rounds
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* <Header /> */}
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Lottery Rounds</h1>
            <p className="text-muted-foreground">
              Browse active and past lottery rounds
            </p>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              <Filter className="w-4 h-4 mr-2" />
              All
            </Button>
            <Button
              variant={filter === 'active' ? 'lottery' : 'outline'}
              size="sm"
              onClick={() => setFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={filter === 'closed' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setFilter('closed')}
            >
              Closed
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="lottery-card">
                <CardHeader>
                  <div className="animate-pulse">
                    <div className="h-6 bg-muted rounded w-1/2 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/3" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-8 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRounds.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No rounds found</h2>
            <p className="text-muted-foreground">
              {filter === 'active' ? 'No active rounds at the moment' : 'No rounds match your filter'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRounds.map((round) => (
              <Card key={round.id.toString()} className="lottery-card hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Trophy className="w-5 h-5 text-primary mr-2" />
                      Round #{round.id.toString()}
                    </CardTitle>
                    {getStatusBadge(round)}
                  </div>
                  <div className="text-center">
                    <PrizeDisplay amount={round.totalPool} size="md" />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-muted-foreground mr-2" />
                      <div>
                        <div className="font-medium">{round.totalSold.toString()}</div>
                        <div className="text-muted-foreground">Tickets Sold</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Target className="w-4 h-4 text-muted-foreground mr-2" />
                      <div>
                        <div className="font-medium">{round.maxTickets.toString()}</div>
                        <div className="text-muted-foreground">Max Tickets</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {formatProgress(round.totalSold, round.maxTickets).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all duration-300"
                        style={{ width: `${formatProgress(round.totalSold, round.maxTickets)}%` }}
                      />
                    </div>
                  </div>

                  {/* Countdown or Status */}
                  {round.isActive ? (
                    <CountdownTimer 
                      targetTime={round.drawTime} 
                      className="justify-center text-sm"
                    />
                  ) : (
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      Draw {round.drawCompleted ? 'Completed' : 'Pending'}
                    </div>
                  )}

                  {/* Action Button */}
                  <Link to={`/rounds/${round.id}`}>
                    <Button 
                      variant={round.isActive ? 'lottery' : 'outline'} 
                      className="w-full"
                    >
                      {round.isActive ? 'Buy Tickets' : 'View Details'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Rounds
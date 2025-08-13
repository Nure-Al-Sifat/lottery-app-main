import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PrizeDisplay } from '@/components/PrizeDisplay'
import { CountdownTimer } from '@/components/CountdownTimer'
import { useLottery } from '@/context/LotteryContext'
import { useAccount } from 'wagmi'
import { Trophy, Users, Clock, Target, Filter } from 'lucide-react'
import { Round } from '@/types/lottery'
import { useToast } from '@/hooks/use-toast'

const Rounds = () => {
  const { isConnected } = useAccount()
  const { toast } = useToast()
  // const [rounds, setRounds] = useState<Round[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all')

  const { rounds, isOwner } = useLottery()
  console.log(rounds)


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
        {/* <Header /> */}
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
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PrizeDisplay } from '@/components/PrizeDisplay'
import { CountdownTimer } from '@/components/CountdownTimer'
import { FaucetButton } from '@/components/FaucetButton'
import { RecentlyMintedNFTs } from '@/components/RecentlyMintedNFTs'
import {useLottery} from '@/context/LotteryContext'   
import { useAccount } from 'wagmi'
import { Trophy, Users, Coins, Zap, ArrowRight, Star } from 'lucide-react'
import { Round } from '@/types/lottery'
import { ethers } from 'ethers'
import { useToast } from '@/hooks/use-toast'
import heroImage from '@/assets/lottery-hero.jpg'

const Index = () => {
  const { isConnected } = useAccount()
  const { toast } = useToast()
  const [activeRounds, setActiveRounds] = useState<Round[]>([])
  const [totalPrizePool, setTotalPrizePool] = useState<bigint>(BigInt(0))
  const [loading, setLoading] = useState(true)

  const { rounds } = useLottery()

  // console.log(rounds)
  // console.log(userTickets)
  // console.log(ticketPrices)

  useEffect(() => {

      // loadActiveRounds()
      setActiveRounds(rounds)

  }, [rounds, isConnected])


  const formatProgress = (sold: bigint, max: bigint) => {
    return (Number(sold) / Number(max)) * 100
  }

  return (
    <div className="min-h-screen bg-background">
      {/* <Header /> */}
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage}
            alt="Lottery Hero Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background/50 to-accent/30" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center pulse-glow">
                <Trophy className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Decentralized Lottery
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the future of fair and transparent lottery gaming on the blockchain. 
              Buy tickets, win big, and enjoy provably fair draws powered by Chainlink VRF.
            </p>

            {/* Total Prize Pool */}
            <div className="lottery-card-glow lottery-card p-8 mb-8 max-w-md mx-auto">
              <h2 className="text-lg font-semibold text-muted-foreground mb-2">Total Prize Pool</h2>
              <PrizeDisplay amount={totalPrizePool} size="lg" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isConnected ? (
                <Link to="/rounds">
                  <Button variant="hero" size="xl">
                    <Trophy className="w-6 h-6 mr-2" />
                    View Active Rounds
                    <ArrowRight className="w-6 h-6 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Button variant="hero" size="xl" disabled>
                  Connect Wallet to Play
                </Button>
              )}
              
              <Link to="/tickets">
                <Button variant="glass" size="xl">
                  My Tickets
                </Button>
              </Link>
            </div>
            
            {/* Faucet Section */}
            {isConnected && (
              <div className="mt-8 flex justify-center">
                <FaucetButton />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Active Rounds Preview */}
      {isConnected && activeRounds.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Active Rounds</h2>
              <Link to="/rounds">
                <Button variant="outline">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRounds.slice(0, 3).map((round) => (
                <Card key={round.id.toString()} className="lottery-card hover:scale-105 transition-transform">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Star className="w-5 h-5 text-accent mr-2" />
                        Round #{round.id.toString()}
                      </CardTitle>
                      <div className="text-right">
                        <PrizeDisplay amount={round.totalPool} size="sm" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tickets Sold</span>
                      <span className="font-medium">
                        {round.totalSold.toString()} / {round.maxTickets.toString()}
                      </span>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all duration-300"
                        style={{ width: `${formatProgress(round.totalSold, round.maxTickets)}%` }}
                      />
                    </div>

                    <CountdownTimer targetTime={round.drawTime} className="justify-center" />

                    <Link to={`/rounds/${round.id}`}>
                      <Button variant="lottery" className="w-full">
                        Buy Tickets
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently Minted NFTs Section */}
      {isConnected && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-10xl mx-auto">
              <RecentlyMintedNFTs />
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Lottery?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="lottery-card text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Provably Fair</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Powered by Chainlink VRF for verifiable randomness. Every draw is transparent and tamper-proof.
                </p>
              </CardContent>
            </Card>

            <Card className="lottery-card text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Multiple Ticket Types</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Choose from Full, Half, or Quarter tickets with different price points and reward multipliers.
                </p>
              </CardContent>
            </Card>

            <Card className="lottery-card text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-success" />
                </div>
                <CardTitle>NFT Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your tickets are NFTs that you truly own. Trade them or hold them as collectibles.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Powered by We3d
          </p>
        </div>
      </footer>
    </div>
  )
};

export default Index;

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PrizeDisplay } from '@/components/PrizeDisplay';
import { TicketTypeBadge } from '@/components/TicketTypeBadge';
import { useLottery } from '@/context/LotteryContext';
import { useAccount } from 'wagmi';
import { Ticket, Trophy, Gift, ExternalLink } from 'lucide-react';
import { Ticket as TicketType, TicketType as TicketTypeEnum } from '@/types/lottery';
import { useToast } from '@/hooks/use-toast';

// Fallback image URL
const FALLBACK_IMAGE = 'https://placehold.co/600x400?text=Ticket+Image';

interface TicketWithImage extends TicketType {
  image?: string;
  imageLoading?: boolean;
  imageError?: string;
}

const Tickets = () => {
  const { isConnected, address: account } = useAccount();
  const { userTickets, claimReward, rounds, loading } = useLottery();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<TicketWithImage[]>([]);
  const [claimingTicket, setClaimingTicket] = useState<string | null>(null);

  // Fetch NFT metadata for a given tokenId
  const fetchTicketMetadata = useCallback(async (tokenId: bigint): Promise<{ image?: string; error?: string }> => {
    try {
      const response = await fetch(`https://api.chainlottery.space/data/${Number(tokenId)}.json`);

      if (!response.ok) {
        throw new Error(`Failed to fetch metadata for token ${tokenId}: ${response.statusText}`);
      }
      const metadata = await response.json();
      console.log(`Metadata for token ${tokenId}:`, metadata);
      return { image: metadata.image || FALLBACK_IMAGE };
    } catch (error: any) {
      console.error(`Error fetching metadata for token ${tokenId}:`, error);
      return { image: FALLBACK_IMAGE, error: error.message };
    }
  }, []);

  // Load tickets and their metadata
  useEffect(() => {
    if (isConnected && account) {
      const loadTicketsWithImages = async () => {
        // setLoading(true);
        try {
          console.log('Rounds:', rounds);
          // userTickets will be loaded by context
          console.log('userTickets:', userTickets);

          // Fetch metadata for each ticket
          const ticketsWithImages: TicketWithImage[] = await Promise.all(
            userTickets.reverse().map(async (ticket) => {
              const { image, error } = await fetchTicketMetadata(ticket.tokenId);
              return { ...ticket, image, imageLoading: !image && !error, imageError: error };
            })
          );

          console.log('Tickets with images:', ticketsWithImages);
          setTickets(ticketsWithImages);
        } catch (error) {
          console.error('Error loading tickets:', error);
          toast({
            title: 'Error Loading Tickets',
            description: 'Failed to load your lottery tickets',
            variant: 'destructive',
          });
        } finally {
          // setLoading(false);
        }
      };

      loadTicketsWithImages();
    } else {
      console.log('Resetting tickets: not connected or missing contracts');
      setTickets([]);
    }
  }, [userTickets, rounds, isConnected, account, fetchTicketMetadata]);

  const handleClaimReward = async (tokenId: bigint) => {
    try {
      setClaimingTicket(tokenId.toString());
      await claimReward(tokenId);
      toast({
        title: 'Reward Claimed!',
        description: `Successfully claimed reward for ticket #${tokenId}`,
      });
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      toast({
        title: 'Claim Failed',
        description: error.message || 'Failed to claim reward',
        variant: 'destructive',
      });
    } finally {
      setClaimingTicket(null);
    }
  };

  const formatNumbers = (numbers: number[]) => {
    return numbers.join(' - ');
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        {/* <Header /> */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-8">
              Please connect your wallet to view your tickets
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* <Header /> */}
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Tickets</h1>
          <p className="text-muted-foreground">
            View and manage your lottery tickets
          </p>
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
                    <div className="h-40 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-8 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16">
            <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No tickets found</h2>
            <p className="text-muted-foreground mb-8">
              You haven't purchased any lottery tickets yet
            </p>
            <Link to="/rounds">
              <Button variant="lottery" size="lg">
                <Trophy className="w-5 h-5 mr-2" />
                Browse Active Rounds
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <Card
                key={ticket.tokenId.toString()}
                className={`lottery-card hover:scale-105 transition-all duration-300 ${ticket.isWinning ? 'ring-2 ring-success' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Ticket className="w-5 h-5 text-primary mr-2" />
                      Ticket #{ticket.tokenId.toString()}
                    </CardTitle>
                    <div className="flex gap-2">
                      <TicketTypeBadge type={ticket.ticketType} />
                      {ticket.isWinning && (
                        <Badge className="bg-success text-success-foreground">
                          <Gift className="w-3 h-3 mr-1" />
                          Winner!
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Round #{ticket.roundId.toString()}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Ticket Image */}
                  {ticket.imageLoading ? (
                    <div className="animate-pulse h-40 bg-muted rounded" />
                  ) : ticket.imageError ? (
                    <div className="h-40 flex items-center justify-center text-muted-foreground">
                      Failed to load image
                    </div>
                  ) : (
                    <img
                      src={ticket.image || FALLBACK_IMAGE}
                      alt={`Ticket #${ticket.tokenId}`}
                      className="h-full w-full  object-cover rounded"
                      onError={(e) => {
                        console.error(`Image load failed for token ${ticket.tokenId}`);
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                  )}

                  {/* Ticket Numbers */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Numbers</div>
                    <div className="flex flex-wrap gap-2">
                      {ticket.numbers.map((number, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold"
                        >
                          {number}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reward Section */}
                  {ticket.isWinning && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-success">Reward</div>
                      <PrizeDisplay amount={ticket.reward} size="sm" />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link to={`/tickets/${ticket.tokenId}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    
                    {ticket.isWinning && (
                      <Button
                        variant="ticket"
                        size="sm"
                        onClick={() => handleClaimReward(ticket.tokenId)}
                        disabled={claimingTicket === ticket.tokenId.toString()}
                        className="flex-1"
                      >
                        {claimingTicket === ticket.tokenId.toString() ? (
                          'Claiming...'
                        ) : (
                          <>
                            <Gift className="w-4 h-4 mr-2" />
                            Claim
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {tickets.length > 0 && (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="lottery-card text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{tickets.length}</div>
                <div className="text-sm text-muted-foreground">Total Tickets</div>
              </CardContent>
            </Card>
            
            <Card className="lottery-card text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-success">
                  {tickets.filter(t => t.isWinning).length}
                </div>
                <div className="text-sm text-muted-foreground">Winning Tickets</div>
              </CardContent>
            </Card>
            
            <Card className="lottery-card text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-accent">
                  {new Set(tickets.map(t => t.roundId.toString())).size}
                </div>
                <div className="text-sm text-muted-foreground">Rounds Played</div>
              </CardContent>
            </Card>
            
            <Card className="lottery-card text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-lottery-gold">
                  {tickets.filter(t => t.isWinning).reduce((sum, t) => sum + Number(t.reward), 0).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Total Rewards</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets;
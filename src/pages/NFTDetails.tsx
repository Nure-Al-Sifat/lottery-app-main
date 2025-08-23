import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NFTMetadata } from '@/components/NFTMetadata';
import { PrizeDisplay } from '@/components/PrizeDisplay';
import { TicketTypeBadge } from '@/components/TicketTypeBadge';
import { useLottery } from '@/context/LotteryContext';
import { useAccount } from 'wagmi';
import { ArrowLeft, ExternalLink, Gift, Ticket, Calendar, Hash, Award } from 'lucide-react';
import { Ticket as TicketType } from '@/types/lottery';
import { useToast } from '@/hooks/use-toast';

const NFTDetails = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { userTickets, claimReward, rounds, loading } = useLottery();
  const { toast } = useToast();
  const [ticket, setTicket] = useState<TicketType | null>(null);
  const [claimingReward, setClaimingReward] = useState(false);

  useEffect(() => {
    if (!tokenId || !userTickets.length) return;

    const foundTicket = userTickets.find(t => t.tokenId.toString() === tokenId);
    setTicket(foundTicket || null);
  }, [tokenId, userTickets]);

  const handleClaimReward = async () => {
    if (!ticket) return;
    
    try {
      setClaimingReward(true);
      await claimReward(ticket.tokenId);
      toast({
        title: 'Reward Claimed!',
        description: `Successfully claimed reward for ticket #${ticket.tokenId}`,
      });
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      toast({
        title: 'Claim Failed',
        description: error.message || 'Failed to claim reward',
        variant: 'destructive',
      });
    } finally {
      setClaimingReward(false);
    }
  };

  const getRoundDetails = (roundId: bigint) => {
    return rounds.find(r => r.id === roundId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="h-96 bg-muted rounded" />
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-8">
              Please connect your wallet to view NFT details
            </p>
            <Link to="/">
            <Button size="lg">
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">NFT Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The requested NFT could not be found in your collection
            </p>
            <Link to="/tickets">
              <Button size="lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to My Tickets
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const roundDetails = getRoundDetails(ticket.roundId);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold">
              Ticket #{ticket.tokenId.toString()}
            </h1>
            <p className="text-muted-foreground">
              NFT Details and Metadata
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <TicketTypeBadge type={ticket.ticketType} />
            {ticket.isWinning && (
              <Badge className="bg-success text-success-foreground">
                <Award className="w-3 h-3 mr-1" />
                Winner!
              </Badge>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* NFT Metadata Card */}
          <div className="space-y-6">
            <NFTMetadata 
              tokenId={ticket.tokenId}
              className="lottery-card"
            />
          </div>

          {/* Ticket Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card className="lottery-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Hash className="w-5 h-5 mr-2" />
                  Ticket Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Token ID</div>
                    <div className="font-mono text-lg">{ticket.tokenId.toString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Round ID</div>
                    <div className="font-mono text-lg">{ticket.roundId.toString()}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">Selected Numbers</div>
                  <div className="flex flex-wrap gap-2">
                    {ticket.numbers.map((number, index) => (
                      <div
                        key={index}
                        className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold border-2 border-primary/40"
                      >
                        {number}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Ticket Type</div>
                  <TicketTypeBadge type={ticket.ticketType} className="mt-1" />
                </div>
              </CardContent>
            </Card>

            {/* Round Details */}
            {roundDetails && (
              <Card className="lottery-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Round Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Prize</div>
                      <PrizeDisplay amount={roundDetails.totalPool} size="sm" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Status</div>
                      <Badge variant={roundDetails.isActive ? "default" : "secondary"}>
                        {roundDetails.isActive ? "Active" : "Completed"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Tickets Sold</div>
                      <div className="text-lg font-semibold">
                        {roundDetails.totalSold.toString()} / {roundDetails.maxTickets.toString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Draw Time</div>
                      <div className="text-sm">
                        {new Date(Number(roundDetails.drawTime) * 1000).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {roundDetails.winningNumbers && roundDetails.winningNumbers.length > 0 && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Winning Numbers</div>
                      <div className="flex flex-wrap gap-2">
                        {roundDetails.winningNumbers.map((number, index) => (
                          <div
                            key={index}
                            className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center text-sm font-bold border-2 border-success"
                          >
                            {number}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link to={`/rounds/${ticket.roundId}`}>
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Round Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Reward Section */}
            {ticket.isWinning && (
              <Card className="lottery-card border-success/50">
                <CardHeader>
                  <CardTitle className="flex items-center text-success">
                    <Gift className="w-5 h-5 mr-2" />
                    Prize Reward
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">Your Reward</div>
                    <PrizeDisplay amount={ticket.reward} size="lg" />
                  </div>

                  <Button
                    onClick={handleClaimReward}
                    disabled={claimingReward}
                    className="w-full"
                    size="lg"
                  >
                    {claimingReward ? (
                      'Claiming Reward...'
                    ) : (
                      <>
                        <Gift className="w-5 h-5 mr-2" />
                        Claim Reward
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Link to="/tickets" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to My Tickets
                </Button>
              </Link>
              <Link to="/rounds" className="flex-1">
              <Button className="w-full">
                <Ticket className="w-4 h-4 mr-2" />
                Browse Rounds
              </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDetails;
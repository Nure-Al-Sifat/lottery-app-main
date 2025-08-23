import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TicketTypeBadge } from '@/components/TicketTypeBadge';
import { useLottery } from '@/context/LotteryContext';
import { Sparkles, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Fallback image URL
const FALLBACK_IMAGE = 'https://placehold.co/300x200?text=Ticket+NFT';

interface RecentTicket {
  tokenId: bigint;
  roundId: bigint;
  ticketType: number;
  image?: string;
  numbers: number[];
  timestamp: number;
}

export const RecentlyMintedNFTs = () => {
  const { userTickets, rounds } = useLottery();
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);

  useEffect(() => {
    const loadRecentTickets = async () => {
      const recent: RecentTicket[] = [];

      for (const ticket of userTickets.slice(0, 2)) {
        const tokenIdStr = ticket.tokenId.toString();
        try {
          const response = await fetch(`https://api.chainlottery.space/data/${tokenIdStr}.json?v=${Date.now()}`);
          let image = FALLBACK_IMAGE;

          if (response.ok) {
            const metadata = await response.json();
            image = metadata.image ? `${metadata.image}?v=${Date.now()}` : FALLBACK_IMAGE;
          }

          recent.push({
            tokenId: ticket.tokenId,
            roundId: ticket.roundId,
            ticketType: ticket.ticketType,
            image,
            numbers: ticket.numbers,
            timestamp: Date.now() - recent.length * 5 * 60 * 1000,
          });
        } catch {
          recent.push({
            tokenId: ticket.tokenId,
            roundId: ticket.roundId,
            ticketType: ticket.ticketType,
            image: FALLBACK_IMAGE,
            numbers: ticket.numbers,
            timestamp: Date.now() - recent.length * 5 * 60 * 1000,
          });
        }
      }

      for (let i = 1; i <= 3; i++) {
        try {
          const response = await fetch(`https://api.chainlottery.space/data/${i}.json?v=${Date.now()}`);
          let image = FALLBACK_IMAGE;
          let numbers = Array.from({ length: 6 }, () => Math.floor(Math.random() * 49) + 1);

          if (response.ok) {
            const metadata = await response.json();
            image = metadata.image ? `${metadata.image}?v=${Date.now()}` : FALLBACK_IMAGE;

            const numberAttributes = metadata.attributes?.filter((attr: any) =>
              attr.trait_type?.startsWith('Number ')
            );

            if (numberAttributes?.length) {
              numbers = numberAttributes
                .sort((a: any, b: any) =>
                  parseInt(a.trait_type.split(' ')[1]) - parseInt(b.trait_type.split(' ')[1])
                )
                .map((attr: any) => parseInt(attr.value));
            }
          }

          recent.push({
            tokenId: BigInt(i),
            roundId: rounds[0]?.id || BigInt(0),
            ticketType: Math.floor(Math.random() * 3),
            image,
            numbers: numbers.slice(0, 6),
            timestamp: Date.now() - (recent.length + i) * 3 * 60 * 1000,
          });
        } catch {
          // Skip if fetch fails
        }
      }

      const sorted = recent.sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);
      setRecentTickets(sorted);
    };

    loadRecentTickets();
  }, [userTickets, rounds]);


  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (recentTickets.length === 0) {
    return null;
  }

  return (
    <Card className="lottery-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Sparkles className="w-6 h-6 mr-3 text-accent" />
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Recently Minted NFTs
            </span>
          </div>
          <div className="text-sm text-muted-foreground font-normal">
            {recentTickets.length} tickets
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {recentTickets.map((ticket, index) => (
            <div
              key={`${ticket.tokenId.toString()}-${index}`}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-card via-muted/30 to-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              {/* Background Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* NFT Image Container */}
              {/* NFT Image Container */}
              <div className="relative aspect-square overflow-hidden bg-black/5">
                <img
                  src={ticket.image || FALLBACK_IMAGE}
                  alt={`Ticket #${ticket.tokenId}`}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Ticket Type Badge */}
                <div className="absolute top-3 right-3">
                  <TicketTypeBadge type={ticket.ticketType} className="shadow-lg" />
                </div>

                {/* Time Badge */}
                <div className="absolute top-3 left-3">
                  <div className="px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm text-xs text-white font-medium">
                    {formatTimeAgo(ticket.timestamp)}
                  </div>
                </div>
              </div>


              {/* Content Section */}
              <div className="relative p-4">
                {/* Ticket Title */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg truncate">
                    Ticket #{ticket.tokenId.toString()}
                  </h3>
                  <Link to={`/nft/${ticket.tokenId}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary/20"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                {/* Round Info */}
                <div className="text-sm text-muted-foreground mb-3">
                  Round #{ticket.roundId.toString()}
                </div>

                {/* Numbers Display */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Lucky Numbers
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ticket.numbers.slice(0, 6).map((number, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white text-sm font-bold shadow-md"
                      >
                        {number}
                      </div>
                    ))}
                    {ticket.numbers.length > 6 && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-muted to-muted/70 flex items-center justify-center text-xs font-bold text-muted-foreground">
                        +{ticket.numbers.length - 6}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        {recentTickets.length > 0 && (
          <div className="flex justify-center">
            <Link to="/tickets">
              <Button
                variant="outline"
                className="group px-8 py-3 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300"
              >
                <span className="mr-2">View All My Tickets</span>
                <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
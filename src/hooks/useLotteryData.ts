import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLotteryContracts } from './useLotteryContracts';
import { useAccount, useReadContract, useReadContracts, useWriteContract } from 'wagmi';
import { Round, Ticket } from '@/types/lottery';
import { useToast } from '@/hooks/use-toast';
import { CONTRACTS } from '@/lib/contracts';

export const useLotteryData = () => {
  const { isConnected, address: account } = useAccount();
  const { contracts, abis, writeContract } = useLotteryContracts();
  const { toast } = useToast();

  const [rounds, setRounds] = useState<Round[]>([]);
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [ticketPrices, setTicketPrices] = useState({
    full: BigInt(0),
    half: BigInt(0),
    quarter: BigInt(0),
  });
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Single-value contract reads
  const { data: fullPrice } = useReadContract({
    address: contracts.LOTTERY_MANAGER,
    abi: abis.LOTTERY_MANAGER_ABI,
    functionName: 'fullPrice',
  });

  const { data: halfPrice } = useReadContract({
    address: contracts.LOTTERY_MANAGER,
    abi: abis.LOTTERY_MANAGER_ABI,
    functionName: 'halfPrice',
  });

  const { data: quarterPrice } = useReadContract({
    address: contracts.LOTTERY_MANAGER,
    abi: abis.LOTTERY_MANAGER_ABI,
    functionName: 'quarterPrice',
  });

  const { data: nextRoundId } = useReadContract({
    address: contracts.LOTTERY_MANAGER,
    abi: abis.LOTTERY_MANAGER_ABI,
    functionName: 'nextRoundId',
  });

  const { data: owner } = useReadContract({
    address: contracts.LOTTERY_MANAGER,
    abi: abis.LOTTERY_MANAGER_ABI,
    functionName: 'owner',
  });

  // Log contract read results
  console.log('Contract read results:', {
    nextRoundId,
    owner,
    fullPrice,
    halfPrice,
    quarterPrice,
  });

  // Rounds data
  const roundCalls = useMemo(
    () =>
      nextRoundId
        ? Array.from({ length: Number(nextRoundId) }, (_, i) => ({
            address: contracts.LOTTERY_MANAGER,
            abi: abis.LOTTERY_MANAGER_ABI,
            functionName: 'rounds',
            args: [BigInt(i)],
          }))
        : [],
    [nextRoundId, contracts, abis]
  );

  const { data: roundsData } = useReadContracts({
    contracts: roundCalls,
    query: { enabled: !!nextRoundId },
  });

  // Round tickets data - batch calls for each roundTickets(roundId, index)
  const roundTicketCalls = useMemo(
    () => {
      const calls: any[] = [];
      rounds.forEach((round) => {
        for (let i = 0; i < Number(round.totalSold); i++) {
          calls.push({
            address: contracts.LOTTERY_MANAGER,
            abi: abis.LOTTERY_MANAGER_ABI,
            functionName: 'roundTickets',
            args: [round.id, BigInt(i)],
          });
        }
      });
      return calls;
    },
    [rounds, contracts, abis]
  );

  const { data: roundTicketsData } = useReadContracts({
    contracts: roundTicketCalls,
    query: { enabled: rounds.length > 0 && !!account },
  });

  // Compute ticket IDs and round IDs from roundTicketsData
  const { ticketIds, roundIds } = useMemo(() => {
    const ticketIds: bigint[] = [];
    const roundIds: bigint[] = [];
    if (roundTicketsData) {
      let index = 0;
      rounds.forEach((round) => {
        for (let i = 0; i < Number(round.totalSold); i++) {
          const result = roundTicketsData[index];
          console.log(`Round ${round.id} index ${i} ticket data:`, {
            status: result?.status,
            result: result?.result,
            error: result?.error?.message,
          });
          if (result?.status === 'success' && result.result) {
            ticketIds.push(result.result as bigint);
            roundIds.push(round.id);
          }
          index++;
        }
      });
    }
    console.log('Computed ticket IDs:', ticketIds.map(String));
    console.log('Computed round IDs:', roundIds.map(String));
    return { ticketIds, roundIds };
  }, [roundTicketsData, rounds]);

  // Ticket detail calls
  const ticketDetailCalls = useMemo(
    () =>
      ticketIds.length > 0
        ? ticketIds.flatMap((tokenId) => [
            {
              address: contracts.LOTTERY_NFT,
              abi: abis.LOTTERY_NFT_ABI,
              functionName: 'ownerOf',
              args: [tokenId],
            },
            {
              address: contracts.LOTTERY_MANAGER,
              abi: abis.LOTTERY_MANAGER_ABI,
              functionName: 'ticketType',
              args: [tokenId],
            },
            {
              address: contracts.LOTTERY_MANAGER,
              abi: abis.LOTTERY_MANAGER_ABI,
              functionName: 'isWinningTicket',
              args: [tokenId],
            },
            {
              address: contracts.LOTTERY_MANAGER,
              abi: abis.LOTTERY_MANAGER_ABI,
              functionName: 'ticketReward',
              args: [tokenId],
            },
            {
              address: contracts.LOTTERY_NFT,
              abi: abis.LOTTERY_NFT_ABI,
              functionName: 'getTokenNumbers',
              args: [tokenId],
            },
          ])
        : [],
    [ticketIds, contracts, abis]
  );

  const { data: ticketDetails } = useReadContracts({
    contracts: ticketDetailCalls,
    query: { enabled: ticketIds.length > 0 && !!account },
  });

  // Log ticket details
  console.log('Ticket detail calls:', ticketDetailCalls);
  console.log('Ticket details data:', ticketDetails);

  const loadTicketPrices = useCallback(() => {
    if (fullPrice && halfPrice && quarterPrice) {
      setTicketPrices({
        full: fullPrice,
        half: halfPrice,
        quarter: quarterPrice,
      });
      console.log('Loaded ticket prices:', {
        full: fullPrice.toString(),
        half: halfPrice.toString(),
        quarter: quarterPrice.toString(),
      });
    } else {
      console.log('Skipping loadTicketPrices: missing price data', { fullPrice, halfPrice, quarterPrice });
    }
  }, [fullPrice, halfPrice, quarterPrice]);

  const loadRounds = useCallback(() => {
    if (!nextRoundId) {
      console.log('Skipping loadRounds: missing nextRoundId');
      setRounds([]);
      return;
    }
    if (!roundsData) {
      console.log('Skipping loadRounds: missing roundsData');
      setRounds([]);
      return;
    }

    try {
      setLoading(true);
      const roundsArray: Round[] = [];

      roundsData.forEach((result, index) => {
        console.log(`Round ${index} data:`, {
          status: result.status,
          result: result.result,
          error: result.error?.message,
        });
        if (result.status === 'success' && result.result) {
          const roundData = result.result as any;
          const round: Round = {
            id: roundData[0],
            maxTickets: roundData[2],
            totalSold: roundData[3],
            isActive: roundData[4],
            drawTime: roundData[5],
            drawCompleted: roundData[6],
            totalPool: roundData[7],
          };
          if (round.drawCompleted) {
            // Note: According to ABI, there is no winningNumbers, so skipping or need separate call if available
            round.winningNumbers = []; // Placeholder, as per ABI no winningNumbers
          }
          roundsArray.push(round);
        }
      });

      setRounds(roundsArray);
      console.log('Loaded rounds:', roundsArray);
      if (roundsArray.length === 0) {
        toast({
          title: 'No Rounds Available',
          description: 'No lottery rounds have been created yet.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error loading rounds:', error);
      toast({
        title: 'Error Loading Rounds',
        description: 'Failed to load lottery rounds',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [roundsData, nextRoundId, toast]);

  const loadUserTickets = useCallback(() => {
    if (!account) {
      console.log('Skipping loadUserTickets: missing account');
      setUserTickets([]);
      return;
    }
    if (!ticketIds.length) {
      console.log('Skipping loadUserTickets: no ticket IDs');
      setUserTickets([]);
      toast({
        title: 'No Tickets Owned',
        description: 'You have not purchased any tickets yet.',
        variant: 'default',
      });
      return;
    }
    if (!ticketDetails) {
      console.log('Skipping loadUserTickets: missing ticketDetails');
      setUserTickets([]);
      return;
    }

    try {
      setLoading(true);
      const tickets: Ticket[] = [];

      ticketIds.forEach((tokenId, index) => {
        const ownerResult = ticketDetails[index * 5];
        const ticketTypeResult = ticketDetails[index * 5 + 1];
        const isWinningResult = ticketDetails[index * 5 + 2];
        const rewardResult = ticketDetails[index * 5 + 3];
        const numbersResult = ticketDetails[index * 5 + 4];

        console.log(`Ticket ${tokenId.toString()} details:`, {
          owner: ownerResult?.result,
          ticketType: ticketTypeResult?.result,
          isWinning: isWinningResult?.result,
          reward: rewardResult?.result,
          numbers: numbersResult?.result,
        });

        if (
          ownerResult?.status === 'success' &&
          ownerResult.result &&
          ticketTypeResult?.status === 'success' &&
          isWinningResult?.status === 'success' &&
          rewardResult?.status === 'success' &&
          numbersResult?.status === 'success'
        ) {
          const owner = ownerResult.result as string;
          if (owner.toLowerCase() === account.toLowerCase()) {
            tickets.push({
              tokenId,
              roundId: roundIds[index],
              ticketType: Number(ticketTypeResult.result),
              isWinning: isWinningResult.result as boolean,
              reward: rewardResult.result as bigint,
              numbers: (numbersResult.result as bigint[]).map((num) => Number(num)),
            });
          }
        }
      });

      setUserTickets(tickets);
      console.log('Loaded user tickets:', tickets);
      if (tickets.length === 0) {
        toast({
          title: 'No Tickets Owned',
          description: 'You have not purchased any tickets yet.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error loading user tickets:', error);
      toast({
        title: 'Error Loading Tickets',
        description: 'Failed to load user tickets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [account, ticketDetails, ticketIds, roundIds, toast]);

  const checkOwnership = useCallback(() => {
    if (!owner) {
      console.log('Skipping checkOwnership: missing owner');
      setIsOwner(false);
      return;
    }
    if (!account) {
      console.log('Skipping checkOwnership: missing account');
      setIsOwner(false);
      return;
    }
    setIsOwner(owner.toLowerCase() === account.toLowerCase());
    console.log('Checked ownership:', { isOwner: owner.toLowerCase() === account.toLowerCase() });
  }, [owner, account]);

  const mintTicket = useCallback(
    async (roundId: bigint, ticketType: number) => {
      if (!account) throw new Error('Wallet not connected');

      try {
        const price =
          ticketType === 0 ? ticketPrices.full : ticketType === 1 ? ticketPrices.half : ticketPrices.quarter;

        await writeContract({
          address: contracts.MOCK_USDT,
          abi: abis.MOCK_USDT_ABI,
          functionName: 'approve',
          args: [contracts.LOTTERY_MANAGER, price],
        });

        await writeContract({
          address: contracts.LOTTERY_MANAGER,
          abi: abis.LOTTERY_MANAGER_ABI,
          functionName: 'mintTicket',
          args: [roundId, ticketType],
        });

        toast({
          title: 'Ticket Purchased!',
          description: `Successfully bought a ${['Full', 'Half', 'Quarter'][ticketType]} ticket`,
        });

        await Promise.all([loadRounds(), loadUserTickets()]);
      } catch (error: any) {
        console.error('Error minting ticket:', error);
        toast({
          title: 'Purchase Failed',
          description: error?.message || 'Failed to purchase ticket',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [contracts, abis, writeContract, account, ticketPrices, toast, loadRounds, loadUserTickets]
  );

  const claimReward = useCallback(
    async (tokenId: bigint) => {
      try {
        await writeContract({
          address: contracts.LOTTERY_MANAGER,
          abi: abis.LOTTERY_MANAGER_ABI,
          functionName: 'claimReward',
          args: [tokenId],
        });

        toast({
          title: 'Reward Claimed!',
          description: 'Successfully claimed your reward',
        });

        await loadUserTickets();
      } catch (error: any) {
        console.error('Error claiming reward:', error);
        toast({
          title: 'Claim Failed',
          description: error?.message || 'Failed to claim reward',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [contracts, abis, writeContract, toast, loadUserTickets]
  );

  const createRound = useCallback(
    async (maxTickets: bigint, drawTime: bigint) => {
      if (!isOwner) throw new Error('Not authorized');

      try {
        await writeContract({
          address: contracts.LOTTERY_MANAGER,
          abi: abis.LOTTERY_MANAGER_ABI,
          functionName: 'createRound',
          args: [maxTickets, drawTime],
        });

        toast({
          title: 'Round Created!',
          description: 'New lottery round created successfully',
        });

        await loadRounds();
      } catch (error: any) {
        console.error('Error creating round:', error);
        toast({
          title: 'Creation Failed',
          description: error?.message || 'Failed to create round',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [contracts, abis, writeContract, isOwner, toast, loadRounds]
  );

  const closeAndDraw = useCallback(
    async (roundId: bigint) => {
      if (!isOwner) throw new Error('Not authorized');

      try {
        await writeContract({
          address: contracts.LOTTERY_MANAGER,
          abi: abis.LOTTERY_MANAGER_ABI,
          functionName: 'closeRoundAndDraw',
          args: [roundId],
        });

        toast({
          title: 'Draw Initiated!',
          description: 'Round closed and draw requested',
        });

        await loadRounds();
      } catch (error: any) {
        console.error('Error closing round:', error);
        toast({
          title: 'Draw Failed',
          description: error?.message || 'Failed to initiate draw',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [contracts, abis, writeContract, isOwner, toast, loadRounds]
  );

  const withdrawUSDT = useCallback(
    async () => {
      if (!isOwner) throw new Error('Not authorized');

      try {
        await writeContract({
          address: contracts.LOTTERY_MANAGER,
          abi: abis.LOTTERY_MANAGER_ABI,
          functionName: 'withdrawUSDT',
          args: [],
        });

        toast({
          title: 'Withdrawal Successful!',
          description: 'USDT withdrawn successfully',
        });
      } catch (error: any) {
        console.error('Error withdrawing USDT:', error);
        toast({
          title: 'Withdrawal Failed',
          description: error?.message || 'Failed to withdraw USDT',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [contracts, abis, writeContract, isOwner, toast]
  );

  const setPrices = useCallback(
    async (full: bigint, half: bigint, quarter: bigint) => {
      if (!isOwner) throw new Error('Not authorized');

      try {
        await writeContract({
          address: contracts.LOTTERY_MANAGER,
          abi: abis.LOTTERY_MANAGER_ABI,
          functionName: 'setPrices',
          args: [full, half, quarter],
        });

        toast({
          title: 'Prices Updated!',
          description: 'Ticket prices updated successfully',
        });

        await loadTicketPrices();
      } catch (error: any) {
        console.error('Error setting prices:', error);
        toast({
          title: 'Update Failed',
          description: error?.message || 'Failed to update prices',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [contracts, abis, writeContract, isOwner, toast, loadTicketPrices]
  );

  // Load data when connected
  useEffect(() => {
    if (isConnected) {
      loadTicketPrices();
      loadRounds();
      checkOwnership();
      loadUserTickets();
    } else {
      console.log('Wallet not connected, resetting state');
      setRounds([]);
      setUserTickets([]);
      setIsOwner(false);
    }
  }, [isConnected, loadTicketPrices, loadRounds, checkOwnership, loadUserTickets]);

  return {
    rounds,
    userTickets,
    ticketPrices,
    loading,
    isOwner,
    mintTicket,
    claimReward,
    createRound,
    closeAndDraw,
    withdrawUSDT,
    setPrices,
    loadRounds,
    loadUserTickets,
    loadTicketPrices,
  };
};
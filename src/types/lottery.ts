export interface Round {
  id: bigint
  ticketPrice: bigint
  maxTickets: bigint
  totalSold: bigint
  isActive: boolean
  drawTime: bigint
  drawCompleted: boolean
  totalPool: bigint
}

export interface Ticket {
  tokenId: bigint
  roundId: bigint
  numbers: number[]
  ticketType: TicketType
  owner: string
  hasWon: boolean
  reward: bigint
}

export enum TicketType {
  FULL = 0,
  HALF = 1,
  QUARTER = 2
}

export interface RoundEvent {
  roundId: bigint
  winningNumbers?: number[]
}

export interface TicketSoldEvent {
  roundId: bigint
  tokenId: bigint
  buyer: string
  ticketType: TicketType
}

export interface TicketPrices {
  full: bigint
  half: bigint
  quarter: bigint
}
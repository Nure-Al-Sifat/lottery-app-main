import { ethers } from 'ethers'

interface PrizeDisplayProps {
  amount: bigint
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const PrizeDisplay = ({ amount, className = '', size = 'md' }: PrizeDisplayProps) => {
  const formatAmount = (amount: bigint) => {
    const formatted = ethers.formatUnits(amount, 18)
    const num = parseFloat(formatted)
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    } else {
      return num.toFixed(2)
    }
  }

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl'
  }

  return (
    <div className={`prize-display ${sizeClasses[size]} ${className}`}>
      {formatAmount(amount)} USDT
    </div>
  )
}
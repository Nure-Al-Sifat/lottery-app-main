import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface CountdownTimerProps {
  targetTime: bigint
  onExpired?: () => void
  className?: string
}

export const CountdownTimer = ({ targetTime, onExpired, className = '' }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    isExpired: boolean
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false })

  useEffect(() => {
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000)
      const target = Number(targetTime)
      const difference = target - now

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true })
        onExpired?.()
        return
      }

      const days = Math.floor(difference / (24 * 60 * 60))
      const hours = Math.floor((difference % (24 * 60 * 60)) / (60 * 60))
      const minutes = Math.floor((difference % (60 * 60)) / 60)
      const seconds = difference % 60

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [targetTime, onExpired])

  if (timeLeft.isExpired) {
    return (
      <div className={`flex items-center space-x-2 text-destructive ${className}`}>
        <Clock className="w-4 h-4" />
        <span className="font-medium">Draw Time Reached</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Clock className="w-4 h-4 text-primary" />
      <div className="flex items-center space-x-1 text-sm font-mono">
        {timeLeft.days > 0 && (
          <>
            <span className="bg-primary/20 px-2 py-1 rounded">{timeLeft.days}d</span>
          </>
        )}
        <span className="bg-primary/20 px-2 py-1 rounded">{timeLeft.hours.toString().padStart(2, '0')}h</span>
        <span className="bg-primary/20 px-2 py-1 rounded">{timeLeft.minutes.toString().padStart(2, '0')}m</span>
        <span className="bg-primary/20 px-2 py-1 rounded">{timeLeft.seconds.toString().padStart(2, '0')}s</span>
      </div>
    </div>
  )
}
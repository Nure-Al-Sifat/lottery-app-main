import { TicketType } from '@/types/lottery'
import { Badge } from '@/components/ui/badge'

interface TicketTypeBadgeProps {
  type: TicketType
  className?: string
}

export const TicketTypeBadge = ({ type, className = '' }: TicketTypeBadgeProps) => {
  const getTicketTypeInfo = (type: TicketType) => {
    switch (type) {
      case TicketType.FULL:
        return { label: 'Full', className: 'ticket-full' }
      case TicketType.HALF:
        return { label: 'Half', className: 'ticket-half' }
      case TicketType.QUARTER:
        return { label: 'Quarter', className: 'ticket-quarter' }
      default:
        return { label: 'Unknown', className: 'bg-muted' }
    }
  }

  const { label, className: typeClassName } = getTicketTypeInfo(type)

  return (
    <Badge className={`${typeClassName} ${className}`}>
      {label}
    </Badge>
  )
}
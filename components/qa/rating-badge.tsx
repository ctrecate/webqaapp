"use client"

import { Badge } from "@/components/ui/badge"
import { getRatingColor } from "@/lib/utils/rating-calculator"

interface RatingBadgeProps {
  rating: 'excellent' | 'good' | 'fair' | 'poor'
}

export function RatingBadge({ rating }: RatingBadgeProps) {
  const colorClass = getRatingColor(rating)
  const displayText = rating.charAt(0).toUpperCase() + rating.slice(1)

  return (
    <Badge className={`${colorClass} border`}>
      {displayText}
    </Badge>
  )
}


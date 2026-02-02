"use client"

import { Progress } from "@/components/ui/progress"
import { calculateProgress } from "@/lib/utils/rating-calculator"
import { ChecklistCategory } from "@/types"

interface ProgressBarProps {
  checklistData: ChecklistCategory[]
}

export function ProgressBar({ checklistData }: ProgressBarProps) {
  const progress = calculateProgress(checklistData)

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Progress</span>
        <span className="text-muted-foreground">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}


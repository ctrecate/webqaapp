"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { PrioritySummary as PrioritySummaryType } from "@/types"
import { AlertCircle, AlertTriangle, Info, HelpCircle } from "lucide-react"

interface PrioritySummaryProps {
  prioritySummary: PrioritySummaryType
  onPrioritySummaryChange: (summary: PrioritySummaryType) => void
}

export function PrioritySummary({ prioritySummary, onPrioritySummaryChange }: PrioritySummaryProps) {
  const updatePriority = (level: keyof PrioritySummaryType, index: number, value: string) => {
    const updated = { ...prioritySummary }
    updated[level][index] = value
    onPrioritySummaryChange(updated)
  }

  const addPriority = (level: keyof PrioritySummaryType) => {
    const updated = { ...prioritySummary }
    updated[level].push("")
    onPrioritySummaryChange(updated)
  }

  const removePriority = (level: keyof PrioritySummaryType, index: number) => {
    const updated = { ...prioritySummary }
    updated[level].splice(index, 1)
    onPrioritySummaryChange(updated)
  }

  const renderPrioritySection = (
    level: keyof PrioritySummaryType,
    title: string,
    icon: React.ReactNode,
    color: string
  ) => {
    const items = prioritySummary[level]
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {icon}
          <Label className="font-semibold">{title}</Label>
          <Badge variant="outline" className={color}>
            {items.length}
          </Badge>
        </div>
        <div className="space-y-2 pl-6">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={item}
                onChange={(e) => updatePriority(level, index, e.target.value)}
                placeholder={`Enter ${title.toLowerCase()} issue...`}
                className="flex-1"
                rows={2}
              />
              <button
                onClick={() => removePriority(level, index)}
                className="text-destructive hover:text-destructive/80"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => addPriority(level)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            + Add {title.toLowerCase()} issue
          </button>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Priority Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderPrioritySection(
          "critical",
          "Critical Issues",
          <AlertCircle className="h-4 w-4 text-red-600" />,
          "border-red-300 text-red-800"
        )}
        {renderPrioritySection(
          "high",
          "High Priority",
          <AlertTriangle className="h-4 w-4 text-orange-600" />,
          "border-orange-300 text-orange-800"
        )}
        {renderPrioritySection(
          "medium",
          "Medium Priority",
          <Info className="h-4 w-4 text-yellow-600" />,
          "border-yellow-300 text-yellow-800"
        )}
        {renderPrioritySection(
          "low",
          "Low Priority",
          <HelpCircle className="h-4 w-4 text-blue-600" />,
          "border-blue-300 text-blue-800"
        )}
      </CardContent>
    </Card>
  )
}


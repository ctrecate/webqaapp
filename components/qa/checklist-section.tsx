"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IssueInput } from "./issue-input"
import { ChecklistSection as ChecklistSectionType, IssuesFound } from "@/types"
import { CheckCircle2, Circle } from "lucide-react"

interface ChecklistSectionProps {
  section: ChecklistSectionType
  onSectionChange: (section: ChecklistSectionType) => void
}

export function ChecklistSection({ section, onSectionChange }: ChecklistSectionProps) {
  const handleItemToggle = (itemId: string) => {
    const updatedItems = section.items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    )
    const allChecked = updatedItems.every(item => item.checked)
    onSectionChange({
      ...section,
      items: updatedItems,
      completed: allChecked,
    })
  }

  const handleIssuesChange = (issues: IssuesFound) => {
    onSectionChange({
      ...section,
      issuesFound: issues,
    })
  }

  const checkedCount = section.items.filter(item => item.checked).length
  const totalCount = section.items.length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{section.sectionTitle}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {section.completed ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
            <span>{checkedCount}/{totalCount}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {section.items.map((item) => (
            <div key={item.id} className="flex items-start space-x-3">
              <Checkbox
                id={item.id}
                checked={item.checked}
                onCheckedChange={() => handleItemToggle(item.id)}
                className="mt-1"
              />
              <label
                htmlFor={item.id}
                className={`text-sm leading-relaxed cursor-pointer flex-1 ${
                  item.checked ? "text-muted-foreground line-through" : ""
                }`}
              >
                {item.text}
              </label>
            </div>
          ))}
        </div>
        <IssueInput
          issuesFound={section.issuesFound}
          onIssuesChange={handleIssuesChange}
          sectionId={section.sectionId}
        />
      </CardContent>
    </Card>
  )
}


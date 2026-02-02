"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { PrioritySummary } from "@/components/qa/priority-summary"
import { RatingBadge } from "@/components/qa/rating-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QAReport } from "@/types"
import { calculateOverallRating, getRatingExplanation, countUncheckedItems } from "@/lib/utils/rating-calculator"
import { generateNextSteps } from "@/lib/utils/next-steps-generator"
import { CheckCircle2, ArrowLeft, ArrowRight, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function SummaryPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params.id as string
  const supabase = createClient()

  const [report, setReport] = useState<QAReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadReport()
  }, [reportId])

  const loadReport = async () => {
    try {
      const { data, error } = await supabase
        .from('qa_reports')
        .select('*')
        .eq('id', reportId)
        .single()

      if (error) throw error
      setReport(data as QAReport)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePrioritySummaryChange = (prioritySummary: any) => {
    if (!report) return

    const rating = calculateOverallRating(report.checklist_data, prioritySummary)
    const nextSteps = generateNextSteps(rating, prioritySummary)

    setReport({
      ...report,
      priority_summary: prioritySummary,
      overall_rating: rating,
      next_steps: nextSteps,
    })
  }

  const handleSave = async () => {
    if (!report) return

    try {
      setSaving(true)
      const rating = calculateOverallRating(report.checklist_data, report.priority_summary)
      const nextSteps = generateNextSteps(rating, report.priority_summary)

      const { error } = await supabase
        .from('qa_reports')
        .update({
          priority_summary: report.priority_summary,
          overall_rating: rating,
          next_steps: nextSteps,
          status: 'completed',
        })
        .eq('id', reportId)

      if (error) throw error

      toast({
        title: "Saved",
        description: "Your summary has been saved and report marked as completed",
      })

      router.push(`/qa/${reportId}/report`)
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading summary...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Report not found</p>
        </div>
      </div>
    )
  }

  const rating = calculateOverallRating(report.checklist_data, report.priority_summary)
  const uncheckedCount = countUncheckedItems(report.checklist_data)
  const criticalCount = report.priority_summary.critical.length
  const explanation = getRatingExplanation(rating, uncheckedCount, criticalCount)
  const nextSteps = generateNextSteps(rating, report.priority_summary)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{report.website_name}</h1>
            <p className="text-muted-foreground">{report.url}</p>
          </div>
          <div className="flex items-center gap-2">
            {saving && (
              <span className="text-sm text-muted-foreground">Saving...</span>
            )}
            <Button onClick={handleSave} size="sm">
              <Save className="mr-2 h-4 w-4" />
              Save & Complete
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Overall Rating</CardTitle>
              <RatingBadge rating={rating} />
            </div>
            <CardDescription className="mt-2">{explanation}</CardDescription>
          </CardHeader>
        </Card>

        <PrioritySummary
          prioritySummary={report.priority_summary}
          onPrioritySummaryChange={handlePrioritySummaryChange}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            onClick={() => router.push(`/qa/${reportId}/checklist`)}
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Checklist
          </Button>
          <Button onClick={handleSave}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Complete Report
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}


"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { PrioritySummary } from "@/components/qa/priority-summary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { QAReport } from "@/types"
import { calculateOverallRating } from "@/lib/utils/rating-calculator"
import { generateNextSteps } from "@/lib/utils/next-steps-generator"
import { Save, ArrowLeft } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function EditPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params.id as string
  const supabase = createClient()

  const [report, setReport] = useState<QAReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [revisionNote, setRevisionNote] = useState("")

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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const rating = calculateOverallRating(report.checklist_data, report.priority_summary)
      const nextSteps = generateNextSteps(rating, report.priority_summary)

      // Save report
      const { error: reportError } = await supabase
        .from('qa_reports')
        .update({
          priority_summary: report.priority_summary,
          overall_rating: rating,
          next_steps: nextSteps,
        })
        .eq('id', reportId)

      if (reportError) throw reportError

      // Create revision record
      if (revisionNote.trim()) {
        const { error: revisionError } = await supabase
          .from('qa_report_revisions')
          .insert({
            qa_report_id: reportId,
            revised_by: user.id,
            changes: {
              priority_summary: report.priority_summary,
              overall_rating: rating,
              next_steps: nextSteps,
            },
            revision_note: revisionNote,
          })

        if (revisionError) throw revisionError
      }

      toast({
        title: "Saved",
        description: "Your changes have been saved",
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
          <p className="mt-4 text-muted-foreground">Loading report...</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Edit Report</h1>
            <p className="text-muted-foreground">{report.website_name}</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <PrioritySummary
          prioritySummary={report.priority_summary}
          onPrioritySummaryChange={handlePrioritySummaryChange}
        />

        <Card>
          <CardHeader>
            <CardTitle>Revision Note</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="revision-note">What changed in this revision?</Label>
            <Textarea
              id="revision-note"
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              placeholder="Describe the changes made in this revision..."
              className="mt-2"
              rows={4}
            />
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            onClick={() => router.push(`/qa/${reportId}/report`)}
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}


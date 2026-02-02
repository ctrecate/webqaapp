"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ChecklistSection } from "@/components/qa/checklist-section"
import { ProgressBar } from "@/components/qa/progress-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QAReport, ChecklistCategory } from "@/types"
import { ArrowLeft, ArrowRight, Save, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce"

export default function ChecklistPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params.id as string
  const supabase = createClient()

  const [report, setReport] = useState<QAReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)

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

  const saveData = useCallback(async (checklistData: ChecklistCategory[]) => {
    if (!report) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from('qa_reports')
        .update({ checklist_data: checklistData })
        .eq('id', reportId)

      if (error) throw error
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }, [report, reportId, supabase])

  const debouncedSave = useDebounce(saveData, 1000)

  const handleSectionChange = useCallback((categoryIndex: number, sectionIndex: number, updatedSection: any) => {
    if (!report) return

    const updatedData = [...report.checklist_data]
    updatedData[categoryIndex].sections[sectionIndex] = updatedSection

    setReport({
      ...report,
      checklist_data: updatedData,
    })

    debouncedSave(updatedData)
  }, [report, debouncedSave])

  const handleSave = async () => {
    if (!report) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from('qa_reports')
        .update({ checklist_data: report.checklist_data })
        .eq('id', reportId)

      if (error) throw error

      toast({
        title: "Saved",
        description: "Your progress has been saved",
      })
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

  const handleNext = () => {
    if (!report) return

    const currentCategory = report.checklist_data[currentCategoryIndex]
    if (currentSectionIndex < currentCategory.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
    } else if (currentCategoryIndex < report.checklist_data.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1)
      setCurrentSectionIndex(0)
    } else {
      router.push(`/qa/${reportId}/summary`)
    }
  }

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
    } else if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1)
      const prevCategory = report?.checklist_data[currentCategoryIndex - 1]
      setCurrentSectionIndex(prevCategory ? prevCategory.sections.length - 1 : 0)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading checklist...</p>
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

  const currentCategory = report.checklist_data[currentCategoryIndex]
  const currentSection = currentCategory.sections[currentSectionIndex]
  const totalSections = report.checklist_data.reduce((acc, cat) => acc + cat.sections.length, 0)
  const currentSectionNumber = report.checklist_data
    .slice(0, currentCategoryIndex)
    .reduce((acc, cat) => acc + cat.sections.length, 0) + currentSectionIndex + 1

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
            <Button onClick={handleSave} variant="outline" size="sm">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{currentCategory.category}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Section {currentSectionNumber} of {totalSections}
                </p>
              </div>
              <ProgressBar checklistData={report.checklist_data} />
            </div>
          </CardHeader>
          <CardContent>
            <ChecklistSection
              section={currentSection}
              onSectionChange={(updatedSection) =>
                handleSectionChange(currentCategoryIndex, currentSectionIndex, updatedSection)
              }
            />
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentCategoryIndex === 0 && currentSectionIndex === 0}
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={handleNext}>
            {currentSectionNumber === totalSections ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Review Summary
              </>
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}


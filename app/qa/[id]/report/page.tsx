"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { RatingBadge } from "@/components/qa/rating-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QAReport } from "@/types"
import { format } from "date-fns"
import { Share2, Download, Edit, ArrowLeft, Copy, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params.id as string
  const supabase = createClient()

  const [report, setReport] = useState<QAReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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

  const handleShare = async () => {
    try {
      // Generate a share token (in production, store this in database)
      const token = btoa(`${reportId}-${Date.now()}`).replace(/[^a-zA-Z0-9]/g, '')
      setShareToken(token)
      
      const shareUrl = `${window.location.origin}/qa/share/${token}`
      await navigator.clipboard.writeText(shareUrl)
      
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      
      toast({
        title: "Link copied",
        description: "Share link has been copied to clipboard",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDownload = () => {
    if (!report) return

    const reportContent = generateReportText(report)
    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.website_name}-QA-Report-${format(new Date(report.date_reviewed), 'yyyy-MM-dd')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateReportText = (report: QAReport): string => {
    let text = `QA REPORT\n`
    text += `==========\n\n`
    text += `Website Name: ${report.website_name}\n`
    text += `URL: ${report.url}\n`
    text += `Date Reviewed: ${format(new Date(report.date_reviewed), 'PP')}\n`
    text += `Reviewer: ${report.reviewer_name}\n`
    text += `Priority Level: ${report.priority_level.toUpperCase()}\n`
    if (report.overall_rating) {
      text += `Overall Rating: ${report.overall_rating.toUpperCase()}\n`
    }
    text += `\n`

    report.checklist_data.forEach((category) => {
      text += `${category.category}\n`
      text += `${'='.repeat(category.category.length)}\n\n`
      
      category.sections.forEach((section) => {
        text += `${section.sectionTitle}\n`
        text += `${'-'.repeat(section.sectionTitle.length)}\n\n`
        
        section.items.forEach((item) => {
          text += `${item.checked ? '✓' : '✗'} ${item.text}\n`
        })
        
        if (section.issuesFound.text || section.issuesFound.images.length > 0) {
          text += `\nIssues Found:\n`
          if (section.issuesFound.text) {
            text += `${section.issuesFound.text}\n`
          }
          if (section.issuesFound.images.length > 0) {
            text += `Images: ${section.issuesFound.images.length} image(s)\n`
          }
        }
        text += `\n`
      })
    })

    if (report.priority_summary) {
      text += `PRIORITY SUMMARY\n`
      text += `${'='.repeat(15)}\n\n`
      if (report.priority_summary.critical.length > 0) {
        text += `Critical Issues:\n`
        report.priority_summary.critical.forEach((issue) => {
          text += `  • ${issue}\n`
        })
        text += `\n`
      }
      if (report.priority_summary.high.length > 0) {
        text += `High Priority:\n`
        report.priority_summary.high.forEach((issue) => {
          text += `  • ${issue}\n`
        })
        text += `\n`
      }
      if (report.priority_summary.medium.length > 0) {
        text += `Medium Priority:\n`
        report.priority_summary.medium.forEach((issue) => {
          text += `  • ${issue}\n`
        })
        text += `\n`
      }
      if (report.priority_summary.low.length > 0) {
        text += `Low Priority:\n`
        report.priority_summary.low.forEach((issue) => {
          text += `  • ${issue}\n`
        })
        text += `\n`
      }
    }

    if (report.next_steps && report.next_steps.length > 0) {
      text += `NEXT STEPS\n`
      text += `${'='.repeat(10)}\n\n`
      report.next_steps.forEach((step) => {
        text += `  • ${step}\n`
      })
    }

    return text
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
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">{report.website_name}</h1>
            <p className="text-muted-foreground">{report.url}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleShare} variant="outline" size="sm">
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </>
              )}
            </Button>
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              onClick={() => router.push(`/qa/${reportId}/edit`)}
              variant="outline"
              size="sm"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Date Reviewed</p>
              <p className="font-medium">{format(new Date(report.date_reviewed), 'PP')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reviewer</p>
              <p className="font-medium">{report.reviewer_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Priority</p>
              <Badge>{report.priority_level}</Badge>
            </div>
            {report.overall_rating && (
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <RatingBadge rating={report.overall_rating} />
              </div>
            )}
          </CardContent>
        </Card>

        {report.checklist_data.map((category) => (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle>{category.category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {category.sections.map((section) => (
                <div key={section.sectionId} className="border-l-4 border-primary pl-4 space-y-3">
                  <h3 className="font-semibold text-lg">{section.sectionTitle}</h3>
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <div key={item.id} className="flex items-start gap-2">
                        <span className={item.checked ? "text-green-600" : "text-red-600"}>
                          {item.checked ? "✓" : "✗"}
                        </span>
                        <span className={item.checked ? "text-muted-foreground line-through" : ""}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  {(section.issuesFound.text || section.issuesFound.images.length > 0) && (
                    <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                      <p className="font-semibold">Issues Found:</p>
                      {section.issuesFound.text && (
                        <p className="text-sm">{section.issuesFound.text}</p>
                      )}
                      {section.issuesFound.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                          {section.issuesFound.images.map((imageUrl, index) => (
                            <div key={index} className="relative aspect-square rounded overflow-hidden border">
                              <Image
                                src={imageUrl}
                                alt={`Issue ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {report.priority_summary && (
          <Card>
            <CardHeader>
              <CardTitle>Priority Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.priority_summary.critical.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">Critical Issues</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {report.priority_summary.critical.map((issue, index) => (
                      <li key={index} className="text-sm">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              {report.priority_summary.high.length > 0 && (
                <div>
                  <h4 className="font-semibold text-orange-600 mb-2">High Priority</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {report.priority_summary.high.map((issue, index) => (
                      <li key={index} className="text-sm">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              {report.priority_summary.medium.length > 0 && (
                <div>
                  <h4 className="font-semibold text-yellow-600 mb-2">Medium Priority</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {report.priority_summary.medium.map((issue, index) => (
                      <li key={index} className="text-sm">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              {report.priority_summary.low.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">Low Priority</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {report.priority_summary.low.map((issue, index) => (
                      <li key={index} className="text-sm">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {report.next_steps && report.next_steps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.next_steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span>•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}


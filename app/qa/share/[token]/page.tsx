"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { RatingBadge } from "@/components/qa/rating-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QAReport } from "@/types"
import { format } from "date-fns"
import Image from "next/image"

export default function SharePage() {
  const params = useParams()
  const token = params.token as string
  const supabase = createClient()

  const [report, setReport] = useState<QAReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Decode token to get report ID (in production, verify token from database)
    try {
      const decoded = atob(token)
      const reportId = decoded.split('-')[0]
      loadReport(reportId)
    } catch (error) {
      setLoading(false)
    }
  }, [token])

  const loadReport = async (reportId: string) => {
    try {
      const { data, error } = await supabase
        .from('qa_reports')
        .select('*')
        .eq('id', reportId)
        .single()

      if (error) throw error
      setReport(data as QAReport)
    } catch (error: any) {
      console.error('Error loading report:', error)
    } finally {
      setLoading(false)
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
          <p className="text-destructive">Report not found or link is invalid</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{report.website_name}</h1>
          <p className="text-muted-foreground">{report.url}</p>
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
      </div>
    </div>
  )
}


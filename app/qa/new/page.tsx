"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { INITIAL_CHECKLIST_DATA } from "@/lib/utils/checklist-data"
import { toast } from "@/hooks/use-toast"

const formSchema = z.object({
  website_name: z.string().min(1, "Website name is required"),
  url: z.string().url("Valid URL is required"),
  date_reviewed: z.string().min(1, "Date is required"),
  reviewer_name: z.string().min(1, "Reviewer name is required"),
  priority_level: z.enum(["low", "medium", "high"]),
})

type FormData = z.infer<typeof formSchema>

export default function NewQAReportPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date_reviewed: new Date().toISOString().split('T')[0],
      priority_level: "medium",
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data: report, error } = await supabase
        .from('qa_reports')
        .insert({
          created_by: user.id,
          website_name: data.website_name,
          url: data.url,
          date_reviewed: data.date_reviewed,
          reviewer_name: data.reviewer_name,
          priority_level: data.priority_level,
          checklist_data: INITIAL_CHECKLIST_DATA,
          priority_summary: {
            critical: [],
            high: [],
            medium: [],
            low: [],
          },
          next_steps: [],
          status: 'draft',
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Report created",
        description: "Your QA report has been created successfully",
      })

      router.push(`/qa/${report.id}/checklist`)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New QA Report</CardTitle>
            <CardDescription>
              Fill in the details to start a new QA checklist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="website_name">Website Name *</Label>
                <Input
                  id="website_name"
                  {...register("website_name")}
                  placeholder="Example Website"
                />
                {errors.website_name && (
                  <p className="text-sm text-destructive">{errors.website_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  type="url"
                  {...register("url")}
                  placeholder="https://example.com"
                />
                {errors.url && (
                  <p className="text-sm text-destructive">{errors.url.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_reviewed">Date Reviewed *</Label>
                <Input
                  id="date_reviewed"
                  type="date"
                  {...register("date_reviewed")}
                />
                {errors.date_reviewed && (
                  <p className="text-sm text-destructive">{errors.date_reviewed.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewer_name">Reviewer Name *</Label>
                <Input
                  id="reviewer_name"
                  {...register("reviewer_name")}
                  placeholder="John Doe"
                />
                {errors.reviewer_name && (
                  <p className="text-sm text-destructive">{errors.reviewer_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority_level">Priority Level *</Label>
                <Select
                  value={watch("priority_level")}
                  onValueChange={(value) => setValue("priority_level", value as "low" | "medium" | "high")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority_level && (
                  <p className="text-sm text-destructive">{errors.priority_level.message}</p>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create Report"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


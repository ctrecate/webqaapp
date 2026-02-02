import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, FileText, Calendar, User } from "lucide-react"
import { format } from "date-fns"
import { getRatingColor } from "@/lib/utils/rating-calculator"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Ensure profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || null,
    })
  }

  // Fetch reports
  const { data: reports } = await supabase
    .from('qa_reports')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">QA Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your website QA reports
            </p>
          </div>
          <Link href="/qa/new">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              New QA Report
            </Button>
          </Link>
        </div>

        {!reports || reports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No reports yet</h3>
              <p className="text-muted-foreground mb-6 text-center">
                Create your first QA report to get started
              </p>
              <Link href="/qa/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Report
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{report.website_name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(report.date_reviewed), "MMM d, yyyy")}
                      </CardDescription>
                    </div>
                    {report.overall_rating && (
                      <Badge className={getRatingColor(report.overall_rating)}>
                        {report.overall_rating}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      {report.reviewer_name}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {report.url}
                    </div>
                    <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                      {report.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/qa/${report.id}/checklist`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        {report.status === 'draft' ? 'Continue' : 'View'}
                      </Button>
                    </Link>
                    <Link href={`/qa/${report.id}/report`} className="flex-1">
                      <Button className="w-full" size="sm">
                        Report
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


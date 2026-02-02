import { GoogleAuthButton } from "@/components/auth/google-auth-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">QA Checklist</CardTitle>
          <CardDescription>
            Sign in to access your QA reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoogleAuthButton />
        </CardContent>
      </Card>
    </div>
  )
}


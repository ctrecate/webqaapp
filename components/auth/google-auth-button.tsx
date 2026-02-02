"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function GoogleAuthButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      console.error('Error signing in:', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSignIn}
      disabled={loading}
      className="w-full"
      size="lg"
    >
      {loading ? "Signing in..." : "Sign in with Google"}
    </Button>
  )
}


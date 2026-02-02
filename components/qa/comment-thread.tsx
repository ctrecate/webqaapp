"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Comment } from "@/types"
import { format } from "date-fns"
import { MessageSquare, Send } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface CommentThreadProps {
  comments: Comment[]
  sectionKey: string
  reportId: string
  onCommentAdded: () => void
}

export function CommentThread({ comments, sectionKey, reportId, onCommentAdded }: CommentThreadProps) {
  const [newComment, setNewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    try {
      setSubmitting(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from('qa_report_comments')
        .insert({
          qa_report_id: reportId,
          user_id: user.id,
          section_key: sectionKey,
          comment_text: newComment,
        })

      if (error) throw error

      setNewComment("")
      onCommentAdded()
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {comments.length > 0 && (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-l-2 pl-4 py-2">
                <p className="text-sm text-muted-foreground">
                  {format(new Date(comment.created_at), "PPp")}
                </p>
                <p className="mt-1">{comment.comment_text}</p>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button onClick={handleSubmit} disabled={submitting || !newComment.trim()}>
            <Send className="mr-2 h-4 w-4" />
            {submitting ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


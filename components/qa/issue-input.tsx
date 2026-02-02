"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "./image-upload"
import { IssuesFound } from "@/types"

interface IssueInputProps {
  issuesFound: IssuesFound
  onIssuesChange: (issues: IssuesFound) => void
  sectionId: string
}

export function IssueInput({ issuesFound, onIssuesChange, sectionId }: IssueInputProps) {
  return (
    <div className="space-y-4 mt-4 p-4 border rounded-lg bg-muted/50">
      <div>
        <Label htmlFor={`issues-${sectionId}`}>Issues Found</Label>
        <Textarea
          id={`issues-${sectionId}`}
          placeholder="Describe any issues found in this section..."
          value={issuesFound.text}
          onChange={(e) => onIssuesChange({ ...issuesFound, text: e.target.value })}
          className="mt-2"
          rows={4}
        />
      </div>
      <div>
        <Label>Supporting Images</Label>
        <ImageUpload
          images={issuesFound.images}
          onImagesChange={(images) => onIssuesChange({ ...issuesFound, images })}
          sectionId={sectionId}
        />
      </div>
    </div>
  )
}


"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { X, Upload } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  sectionId: string
}

export function ImageUpload({ images, onImagesChange, sectionId }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${sectionId}/${Date.now()}.${fileExt}`
      const filePath = `qa-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('qa-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('qa-images')
        .getPublicUrl(filePath)

      onImagesChange([...images, data.publicUrl])
      toast({
        title: "Image uploaded",
        description: "Image has been successfully uploaded",
      })
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative group">
            <div className="relative w-32 h-32 rounded-md overflow-hidden border">
              <Image
                src={url}
                alt={`Issue ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
          id={`image-upload-${sectionId}`}
        />
        <label htmlFor={`image-upload-${sectionId}`}>
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            className="w-full"
            asChild
          >
            <span>
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Image"}
            </span>
          </Button>
        </label>
      </div>
    </div>
  )
}


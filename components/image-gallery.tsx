"use client"

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { X } from "lucide-react"
import Image from "next/image"

interface ImageGalleryProps {
  setShowGallery: () => void
}

export function ImageGallery({ setShowGallery }: ImageGalleryProps) {
  const images = Array.from({ length: 10 }, (_, i) => `/image-${i + 1}.jpg`) // Replace with your actual image URLs

  return (
    <Dialog open={true} onOpenChange={setShowGallery}>
      <DialogContent className="max-w-5xl bg-[#1A1B1C] border-[#3F3F46] p-6">
        <DialogHeader>
          <div className="flex justify-end">
            <button onClick={setShowGallery} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square">
              <Image src={image || "/placeholder.svg"} alt={`Imagen ${index + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}


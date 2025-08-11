import { supabase } from "@/lib/supabase"

export async function uploadImage(
  bucket: "documents" | "faces",
  file: Blob | File,
  path: string,
): Promise<string | null> {
  try {
    // Add crossOrigin handling for blobs
    if (file instanceof Blob) {
      const response = await fetch(URL.createObjectURL(file))
      const blob = await response.blob()
      const imageFile = new File([blob], path, { type: file.type })

      const { data, error } = await supabase.storage.from(bucket).upload(path, imageFile, {
        cacheControl: "3600",
        upsert: true,
      })

      if (error) {
        console.error(`Error uploading to ${bucket}:`, error.message)
        throw new Error(`Error uploading to ${bucket}: ${error.message}`)
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(data.path)

      return publicUrl
    }

    // Handle regular File uploads
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error(`Error uploading to ${bucket}:`, error.message)
      throw new Error(`Error uploading to ${bucket}: ${error.message}`)
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error(`Error in uploadImage to ${bucket}:`, error)
    throw new Error(`Failed to upload image to ${bucket}: ${error.message}`)
  }
}

export async function deleteImage(bucket: "documents" | "faces", path: string): Promise<void> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      console.error(`Error deleting from ${bucket}:`, error)
      throw error
    }
  } catch (error) {
    console.error(`Error in deleteImage from ${bucket}:`, error)
  }
}


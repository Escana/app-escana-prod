"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, User, Hash, AlertTriangle, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Document {
  id: string
  document_type: string
  document_number: string
  name: string
  date_of_birth: string
  expiration_date: string
  image_url: string
  created_at: string
}

export default function DocumentDetailsPage() {
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const params = useParams()
  const documentId = params.documentId as string
  const clientId = params.id as string
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const { data, error } = await supabase.from("documents").select("*").eq("id", documentId).single()

        if (error) throw error

        setDocument(data)
      } catch (error) {
        console.error("Error fetching document:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load document details. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocument()
  }, [documentId, supabase, toast])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "dd/MM/yyyy")
    } catch (error) {
      return "Invalid date"
    }
  }

  const deleteDocument = async () => {
    try {
      const { error } = await supabase.from("documents").delete().eq("id", documentId)

      if (error) throw error

      toast({
        title: "Document Deleted",
        description: "The document has been successfully deleted.",
      })

      router.push(`/clients/${clientId}/documents`)
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete document. Please try again.",
      })
    }
  }

  const goBack = () => {
    router.push(`/clients/${clientId}/documents`)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Document Not Found</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              The document you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Documents
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Documents
      </Button>

      <Card>
        <div className="relative">
          <img
            src={document.image_url || "/placeholder.svg?height=400&width=800"}
            alt={`Document ${document.document_type}`}
            className="w-full h-auto max-h-96 object-contain bg-gray-100"
          />
        </div>

        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{document.document_type}</CardTitle>
              <CardDescription>Added on {formatDate(document.created_at)}</CardDescription>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Name</h4>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{document.name || "Not detected"}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Document Number</h4>
                <div className="flex items-center">
                  <Hash className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{document.document_number || "Not detected"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Date of Birth</h4>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{formatDate(document.date_of_birth)}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Expiration Date</h4>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{formatDate(document.expiration_date)}</span>

                  {document.expiration_date && new Date(document.expiration_date) < new Date() && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Expired
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteDocument}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


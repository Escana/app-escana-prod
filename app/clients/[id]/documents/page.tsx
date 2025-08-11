"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Plus, Calendar, User, Hash, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

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

export default function ClientDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const clientId = params.id as string
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .eq("client_id", clientId)
          .order("created_at", { ascending: false })

        if (error) throw error

        setDocuments(data || [])
      } catch (error) {
        console.error("Error fetching documents:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load documents. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [clientId, supabase, toast])

  const navigateToScan = () => {
    router.push("/scan/document")
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "dd/MM/yyyy")
    } catch (error) {
      return "Invalid date"
    }
  }

  const deleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase.from("documents").delete().eq("id", documentId)

      if (error) throw error

      setDocuments(documents.filter((doc) => doc.id !== documentId))

      toast({
        title: "Document Deleted",
        description: "The document has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete document. Please try again.",
      })
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Client Documents</h1>
        <Button onClick={navigateToScan}>
          <Plus className="mr-2 h-4 w-4" />
          Scan New Document
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Documents Found</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              This client doesn't have any documents yet. Scan a document to add it.
            </p>
            <Button onClick={navigateToScan}>
              <Plus className="mr-2 h-4 w-4" />
              Scan Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((document) => (
            <Card key={document.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={document.image_url || "/placeholder.svg?height=200&width=400"}
                  alt={`Document ${document.document_type}`}
                  className="w-full h-full object-cover"
                />
              </div>

              <CardHeader>
                <CardTitle>{document.document_type}</CardTitle>
                <CardDescription>Added on {formatDate(document.created_at)}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">{document.name || "Name not detected"}</span>
                  </div>

                  <div className="flex items-center">
                    <Hash className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">{document.document_number || "Number not detected"}</span>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">Born: {formatDate(document.date_of_birth)}</span>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">Expires: {formatDate(document.expiration_date)}</span>
                  </div>

                  {document.expiration_date && new Date(document.expiration_date) < new Date() && (
                    <div className="flex items-center text-red-500">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span className="text-sm">Expired document</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/clients/${clientId}/documents/${document.id}`)}
                >
                  View Details
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteDocument(document.id)}>
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


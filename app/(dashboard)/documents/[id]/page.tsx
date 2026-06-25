"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, FileText, CheckCircle, AlertTriangle, XCircle, Eye } from "lucide-react"

interface DocumentField {
  id: string
  fieldName: string
  fieldValue: string | null
  confidence: number | null
  source: string | null
}

interface Document {
  id: string
  fileName: string
  type: string
  status: string
  fileUrl: string
  confidence: number | null
  extractedData: any
  fields: DocumentField[]
}

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params.id as string

  const [document, setDocument] = useState<Document | null>(null)
  const [editedFields, setEditedFields] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showDocument, setShowDocument] = useState(true)

  useEffect(() => {
    fetchDocument()
  }, [documentId])

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}`)
      if (response.ok) {
        const data = await response.json()
        setDocument(data.document)
      }
    } catch (error) {
      console.error("Error fetching document:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFieldChange = (fieldId: string, value: string) => {
    setEditedFields((prev: Record<string, string>) => ({ ...prev, [fieldId]: value }))
  }

  const handleSave = async () => {
    // Save field edits
    console.log("Saving changes:", editedFields)
    // In production, call API to update fields
    router.push("/dashboard/documents")
  }

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      const response = await fetch(`/api/documents/${documentId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Document approved:", result)
        router.push("/dashboard/documents")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to approve document")
      }
    } catch (error) {
      console.error("Error approving document:", error)
      alert("Failed to approve document")
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    const reason = prompt("Reason for rejection (optional):")
    if (reason === null) return // User cancelled

    setIsRejecting(true)
    try {
      const response = await fetch(`/api/documents/${documentId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Document rejected:", result)
        router.push("/dashboard/documents")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to reject document")
      }
    } catch (error) {
      console.error("Error rejecting document:", error)
      alert("Failed to reject document")
    } finally {
      setIsRejecting(false)
    }
  }

  const getConfidenceColor = (confidence: number | null) => {
    if (!confidence) return "bg-gray-100 text-gray-800"
    if (confidence >= 0.9) return "bg-green-100 text-green-800"
    if (confidence >= 0.85) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "INVOICE":
        return "bg-purple-100 text-purple-800"
      case "RECEIPT":
        return "bg-green-100 text-green-800"
      case "BANK_STATEMENT":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      case "EXTRACTED":
        return "bg-blue-100 text-blue-800"
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const needsReview = document && document.confidence && document.confidence < 0.85

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading document...</div>
  }

  if (!document) {
    return <div className="flex items-center justify-center h-64">Document not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Document Review</h2>
          <p className="text-gray-600">Review extracted data before approval</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Document View and Extracted Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Document Preview</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDocument(!showDocument)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showDocument ? "Hide" : "Show"}
                </Button>
              </CardTitle>
            </CardHeader>
            {showDocument && (
              <CardContent>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-2">File: {document.fileName}</p>
                  {document.fileUrl ? (
                    <img
                      src={document.fileUrl}
                      alt="Document preview"
                      className="max-w-full h-auto rounded"
                    />
                  ) : (
                    <p className="text-gray-500">Preview not available</p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Extracted Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Extracted Fields</CardTitle>
              <CardDescription>
                Review AI-extracted data. Nothing is saved until you approve.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {document.fields.map((field: DocumentField) => (
                <div key={field.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field.id} className="capitalize">
                      {field.fieldName.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Badge className={getConfidenceColor(field.confidence)}>
                        {field.confidence ? Math.round(field.confidence * 100) : 0}% confidence
                      </Badge>
                      {field.source === "ai" && (
                        <Badge variant="outline">AI</Badge>
                      )}
                    </div>
                  </div>
                  <Input
                    id={field.id}
                    defaultValue={field.fieldValue || ""}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Actions Panel */}
        <div className="space-y-6">
          {/* Document Status */}
          <Card>
            <CardHeader>
              <CardTitle>Document Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Status</Label>
                <Badge className={getStatusColor(document.status)}>
                  {document.status}
                </Badge>
              </div>
              {document.confidence && (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">AI Confidence</Label>
                  <div className="flex items-center space-x-2">
                    <Badge className={getConfidenceColor(document.confidence)}>
                      {Math.round(document.confidence * 100)}%
                    </Badge>
                    {needsReview && (
                      <Badge variant="destructive">Needs Review</Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approval Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Approval Actions</CardTitle>
              <CardDescription>
                Review the extracted data before approving. This will create a transaction record.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={Object.keys(editedFields).length === 0}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Field Edits
              </Button>
              <Button
                className="w-full"
                onClick={handleApprove}
                disabled={isApproving || document.status === "APPROVED"}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {isApproving ? "Approving..." : "Approve & Log"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleReject}
                disabled={isRejecting || document.status === "REJECTED"}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {isRejecting ? "Rejecting..." : "Reject"}
              </Button>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {document.confidence && document.confidence >= 0.9 ? (
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">High confidence</p>
                    <p className="text-xs text-green-700">
                      All fields extracted with high accuracy
                    </p>
                  </div>
                </div>
              ) : needsReview ? (
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900">Review required</p>
                    <p className="text-xs text-yellow-700">
                      Confidence is below 85%. Please verify all fields before approval.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Good confidence</p>
                    <p className="text-xs text-blue-700">
                      Most fields extracted accurately. Quick review recommended.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workflow Info */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>1. Review document preview</p>
              <p>2. Verify extracted fields</p>
              <p>3. Edit if needed</p>
              <p>4. Approve to create transaction</p>
              <p className="text-gray-500 italic">
                Transaction will be logged in audit trail
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, FileText, CheckCircle, AlertTriangle } from "lucide-react"

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params.id as string

  const [document, setDocument] = useState({
    id: documentId,
    fileName: "invoice_1234.pdf",
    type: "INVOICE",
    status: "EXTRACTED",
    extractedData: {
      vendor: "Acme Corp",
      date: "2026-03-15",
      amount: 1250.00,
      currency: "USD",
      tax: 125.00,
      dueDate: "2026-04-15",
    },
    fields: [
      { id: "1", fieldName: "vendor", fieldValue: "Acme Corp", confidence: 0.95, source: "ai" },
      { id: "2", fieldName: "date", fieldValue: "2026-03-15", confidence: 0.98, source: "ai" },
      { id: "3", fieldName: "amount", fieldValue: "1250.00", confidence: 0.99, source: "ai" },
      { id: "4", fieldName: "currency", fieldValue: "USD", confidence: 1.0, source: "ai" },
      { id: "5", fieldName: "tax", fieldValue: "125.00", confidence: 0.92, source: "ai" },
      { id: "6", fieldName: "dueDate", fieldValue: "2026-04-15", confidence: 0.88, source: "ai" },
    ],
  })

  const [editedFields, setEditedFields] = useState<Record<string, string>>({})

  const handleFieldChange = (fieldId: string, value: string) => {
    setEditedFields((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleSave = () => {
    // In production, this would call the API to save the changes
    console.log("Saving changes:", editedFields)
    router.push("/dashboard/documents")
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-100 text-green-800"
    if (confidence >= 0.7) return "bg-yellow-100 text-yellow-800"
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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Document Review</h2>
          <p className="text-gray-600">Review and edit extracted document data</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Document Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Document Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">File Name</Label>
                  <p className="font-medium">{document.fileName}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Document Type</Label>
                  <Badge className={getTypeColor(document.type)}>
                    {document.type}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Status</Label>
                  <Badge className="bg-blue-100 text-blue-800">
                    {document.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Extracted Fields</CardTitle>
              <CardDescription>
                Review and edit the AI-extracted data. Changes will be logged.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {document.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field.id} className="capitalize">
                      {field.fieldName.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Badge className={getConfidenceColor(field.confidence)}>
                        {Math.round(field.confidence * 100)}% confidence
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

        {/* Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" className="w-full">
                Approve & Create Transaction
              </Button>
              <Button variant="outline" className="w-full">
                Reject
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">High confidence</p>
                  <p className="text-xs text-green-700">
                    Most fields extracted with high accuracy
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">Review needed</p>
                  <p className="text-xs text-yellow-700">
                    Due date has lower confidence - please verify
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>1. Review all extracted fields</p>
              <p>2. Edit any incorrect information</p>
              <p>3. Save changes</p>
              <p>4. Approve to create transaction</p>
              <p>5. Link to vendor if needed</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

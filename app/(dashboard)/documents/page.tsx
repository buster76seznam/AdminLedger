"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload, FileText, Search, Filter, Eye } from "lucide-react"

export default function DocumentsPage() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const mockDocuments = [
    {
      id: "1",
      fileName: "invoice_1234.pdf",
      type: "INVOICE",
      status: "REVIEWED",
      date: "2026-03-15",
      vendor: "Acme Corp",
      amount: 1250.00,
    },
    {
      id: "2",
      fileName: "receipt_office_supplies.jpg",
      type: "RECEIPT",
      status: "EXTRACTED",
      date: "2026-03-14",
      vendor: "Office Depot",
      amount: 89.50,
    },
    {
      id: "3",
      fileName: "bank_statement_march.pdf",
      type: "BANK_STATEMENT",
      status: "PENDING",
      date: "2026-03-13",
      vendor: null,
      amount: null,
    },
    {
      id: "4",
      fileName: "contract_vendor_agreement.pdf",
      type: "CONTRACT",
      status: "APPROVED",
      date: "2026-03-10",
      vendor: "Tech Solutions Inc",
      amount: null,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "REVIEWED":
        return "bg-blue-100 text-blue-800"
      case "EXTRACTED":
        return "bg-yellow-100 text-yellow-800"
      case "PENDING":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "INVOICE":
        return "bg-purple-100 text-purple-800"
      case "RECEIPT":
        return "bg-green-100 text-green-800"
      case "BANK_STATEMENT":
        return "bg-blue-100 text-blue-800"
      case "CONTRACT":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
          <p className="text-gray-600">Upload and manage your financial documents</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload invoices, receipts, bank statements, or other financial documents
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  PDF, JPG, PNG, CSV (Max 10MB)
                </p>
                <Input type="file" className="mt-4" />
              </div>
              <Button className="w-full" onClick={() => setUploadDialogOpen(false)}>
                Upload
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
          <CardDescription>
            Manage and review your uploaded documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.fileName}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(doc.type)}>
                      {doc.type.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{doc.date}</TableCell>
                  <TableCell>{doc.vendor || "-"}</TableCell>
                  <TableCell>
                    {doc.amount ? `$${doc.amount.toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

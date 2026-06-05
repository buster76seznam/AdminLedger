"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, Send, FileText } from "lucide-react"

export default function MessagesPage() {
  const [composeDialogOpen, setComposeDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")

  const mockMessages = [
    {
      id: "1",
      subject: "Request for missing invoice #1234",
      recipient: "vendor@acme.com",
      template: "missing_invoice",
      status: "SENT",
      sentAt: "2026-03-15 10:30",
    },
    {
      id: "2",
      subject: "Late payment reminder - INV-2026-002",
      recipient: "client@techsolutions.com",
      template: "late_payment",
      status: "SENT",
      sentAt: "2026-03-14 14:20",
    },
    {
      id: "3",
      subject: "Monthly summary for accountant",
      recipient: "accountant@firm.com",
      template: "accountant_summary",
      status: "DRAFT",
      sentAt: null,
    },
  ]

  const templates = [
    { value: "missing_invoice", label: "Missing Invoice Request" },
    { value: "late_payment", label: "Late Payment Reminder" },
    { value: "receipt_request", label: "Receipt Request" },
    { value: "accountant_summary", label: "Accountant Summary" },
    { value: "document_followup", label: "Document Follow-up" },
  ]

  const getTemplateContent = (template: string) => {
    switch (template) {
      case "missing_invoice":
        return "Dear [Vendor Name],\n\nWe are missing invoice #[Invoice Number] for our records. Could you please send us a copy at your earliest convenience?\n\nThank you,\n[Your Name]"
      case "late_payment":
        return "Dear [Client Name],\n\nThis is a friendly reminder that invoice #[Invoice Number] for $[Amount] is now overdue. Please arrange payment at your earliest convenience.\n\nThank you,\n[Your Name]"
      case "receipt_request":
        return "Dear [Vendor Name],\n\nCould you please provide a receipt for the purchase of [Item] on [Date]?\n\nThank you,\n[Your Name]"
      case "accountant_summary":
        return "Dear [Accountant Name],\n\nPlease find attached the monthly financial summary for [Month]. This includes all transactions, invoices, and categorized expenses.\n\nLet me know if you need any additional information.\n\nBest regards,\n[Your Name]"
      case "document_followup":
        return "Dear [Contact Name],\n\nFollowing up on our previous request for [Document Type]. Please let us know if you need any assistance.\n\nThank you,\n[Your Name]"
      default:
        return ""
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SENT":
        return "bg-green-100 text-green-800"
      case "DRAFT":
        return "bg-gray-100 text-gray-800"
      case "FAILED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
          <p className="text-gray-600">Draft and send emails to vendors, clients, and accountants</p>
        </div>
        <Dialog open={composeDialogOpen} onOpenChange={setComposeDialogOpen}>
          <DialogTrigger>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Compose Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compose Message</DialogTitle>
              <DialogDescription>
                Draft and send an email using templates
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template">Template</Label>
                <Select value={selectedTemplate} onValueChange={(value) => setSelectedTemplate(value || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.value} value={template.value}>
                        {template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <Input id="recipient" type="email" placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Email subject" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  placeholder="Type your message..."
                  className="min-h-[200px]"
                  value={selectedTemplate ? getTemplateContent(selectedTemplate) : ""}
                  onChange={(e) => {}}
                />
              </div>
              <Button className="w-full" onClick={() => setComposeDialogOpen(false)}>
                <Send className="mr-2 h-4 w-4" />
                Send Message
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
            placeholder="Search messages..."
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

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
          <CardDescription>
            View your sent and drafted messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockMessages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell className="font-medium">{message.subject}</TableCell>
                  <TableCell>{message.recipient}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      <FileText className="mr-1 h-3 w-3" />
                      {templates.find((t) => t.value === message.template)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(message.status)}>
                      {message.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{message.sentAt || "-"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
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

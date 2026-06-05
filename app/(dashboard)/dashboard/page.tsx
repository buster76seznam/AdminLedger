import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckSquare, DollarSign, AlertTriangle, TrendingUp, Clock } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-gray-600">Welcome to OpsMate AI - Your admin and bookkeeping copilot</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-gray-600">2 high priority</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Documents</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-600">3 need review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,250</div>
            <p className="text-xs text-gray-600">4 invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookkeeping Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-gray-600">Good standing</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Upcoming Deadlines */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
            <CardDescription>Your priority tasks for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckSquare className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Review Q1 expense reports</p>
                <p className="text-xs text-gray-600">Due today</p>
              </div>
              <Badge variant="destructive">High</Badge>
            </div>
            <div className="flex items-start space-x-3">
              <CheckSquare className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Follow up on missing invoice #1234</p>
                <p className="text-xs text-gray-600">Due today</p>
              </div>
              <Badge variant="destructive">High</Badge>
            </div>
            <div className="flex items-start space-x-3">
              <CheckSquare className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Categorize 8 new receipts</p>
                <p className="text-xs text-gray-600">Due in 2 days</p>
              </div>
              <Badge>Medium</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Important dates to remember</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Quarterly tax filing</p>
                <p className="text-xs text-gray-600">April 15, 2026</p>
              </div>
              <Badge variant="outline">Tax</Badge>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Invoice #5678 payment due</p>
                <p className="text-xs text-gray-600">March 20, 2026</p>
              </div>
              <Badge variant="outline">Invoice</Badge>
            </div>
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Contract renewal with Acme Corp</p>
                <p className="text-xs text-gray-600">March 25, 2026</p>
              </div>
              <Badge variant="destructive">Urgent</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent AI Suggestions</CardTitle>
          <CardDescription>Insights from your AI admin assistant</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Duplicate detected</p>
              <p className="text-xs text-blue-700">Transaction #4521 appears to be a duplicate of #4498. Please review.</p>
            </div>
            <Badge>95% confidence</Badge>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">Category suggestion</p>
              <p className="text-xs text-green-700">Receipt from Office Depot should be categorized as "Office Supplies"</p>
            </div>
            <Badge>88% confidence</Badge>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">Missing information</p>
              <p className="text-xs text-yellow-700">Invoice #1234 is missing vendor tax ID. Request from vendor.</p>
            </div>
            <Badge>92% confidence</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Trust Disclaimer */}
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-600">
          <strong>Disclaimer:</strong> OpsMate AI provides administrative assistance and bookkeeping preparation. 
          We are not certified public accountants (CPAs) and do not provide legal or tax advice. 
          You remain responsible for all financial records and tax filings. Always consult with a qualified 
          professional for legal, tax, or accounting matters.
        </p>
      </div>
    </div>
  )
}

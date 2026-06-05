"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Search, Filter, ArrowUpCircle, ArrowDownCircle, AlertTriangle } from "lucide-react"

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const mockTransactions = [
    {
      id: "1",
      date: "2026-03-15",
      type: "EXPENSE",
      amount: 1250.00,
      category: "Office Supplies",
      vendor: "Office Depot",
      description: "Office supplies and equipment",
      status: "CATEGORIZED",
      isDuplicate: false,
    },
    {
      id: "2",
      date: "2026-03-14",
      type: "EXPENSE",
      amount: 89.50,
      category: "Software",
      vendor: "Adobe",
      description: "Monthly software subscription",
      status: "CATEGORIZED",
      isDuplicate: false,
    },
    {
      id: "3",
      date: "2026-03-13",
      type: "INCOME",
      amount: 5000.00,
      category: "Services",
      vendor: "Acme Corp",
      description: "Project payment - Phase 1",
      status: "CATEGORIZED",
      isDuplicate: false,
    },
    {
      id: "4",
      date: "2026-03-12",
      type: "EXPENSE",
      amount: 250.00,
      category: null,
      vendor: "Unknown",
      description: "Uncategorized expense",
      status: "UNCATEGORIZED",
      isDuplicate: false,
    },
    {
      id: "5",
      date: "2026-03-11",
      type: "EXPENSE",
      amount: 1250.00,
      category: "Office Supplies",
      vendor: "Office Depot",
      description: "Office supplies and equipment",
      status: "DUPLICATE",
      isDuplicate: true,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CATEGORIZED":
        return "bg-green-100 text-green-800"
      case "UNCATEGORIZED":
        return "bg-yellow-100 text-yellow-800"
      case "FLAGGED":
        return "bg-red-100 text-red-800"
      case "DUPLICATE":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    return type === "INCOME" ? (
      <ArrowUpCircle className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownCircle className="h-4 w-4 text-red-600" />
    )
  }

  const totalIncome = mockTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = mockTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0)

  const uncategorizedCount = mockTransactions.filter(
    (t) => t.status === "UNCATEGORIZED"
  ).length

  const duplicateCount = mockTransactions.filter((t) => t.isDuplicate).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-gray-600">View and categorize your financial transactions</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalIncome.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalExpenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uncategorized</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uncategorizedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duplicates</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{duplicateCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value || "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="office">Office Supplies</SelectItem>
            <SelectItem value="software">Software</SelectItem>
            <SelectItem value="services">Services</SelectItem>
            <SelectItem value="uncategorized">Uncategorized</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            Review and categorize your transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(transaction.type)}
                      <span className="text-sm">{transaction.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.description}
                  </TableCell>
                  <TableCell>{transaction.vendor}</TableCell>
                  <TableCell>
                    {transaction.category ? (
                      <Badge variant="outline">{transaction.category}</Badge>
                    ) : (
                      <Badge className={getStatusColor("UNCATEGORIZED")}>
                        Uncategorized
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell
                    className={
                      transaction.type === "INCOME"
                        ? "text-green-600 font-medium"
                        : "text-red-600 font-medium"
                    }
                  >
                    {transaction.type === "INCOME" ? "+" : "-"}$
                    {transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Edit
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

import { prisma } from "@/lib/prisma"
import { categorizeTransaction } from "@/lib/ai/openai"

export interface CSVTransaction {
  date: string
  description: string
  amount: number
  type: "INCOME" | "EXPENSE"
  vendor?: string
  balance?: number
}

export async function parseCSV(csvContent: string): Promise<CSVTransaction[]> {
  const lines = csvContent.split("\n").filter((line) => line.trim())
  if (lines.length < 2) {
    throw new Error("CSV file is empty or has no data rows")
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
  const transactions: CSVTransaction[] = []

  // Try to detect column indices
  const dateIndex = headers.findIndex((h) => h.includes("date"))
  const descriptionIndex = headers.findIndex((h) => h.includes("description") || h.includes("desc"))
  const amountIndex = headers.findIndex((h) => h.includes("amount") || h.includes("debit") || h.includes("credit"))
  const vendorIndex = headers.findIndex((h) => h.includes("vendor") || h.includes("payee") || h.includes("merchant"))

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim())
    if (values.length < 2) continue

    const date = dateIndex >= 0 ? values[dateIndex] : values[0]
    const description = descriptionIndex >= 0 ? values[descriptionIndex] : values[1]
    const amountStr = amountIndex >= 0 ? values[amountIndex] : values[2]
    const vendor = vendorIndex >= 0 ? values[vendorIndex] : undefined

    const amount = parseFloat(amountStr.replace(/[$,]/g, ""))
    if (isNaN(amount)) continue

    const type = amount >= 0 ? "INCOME" : "EXPENSE"

    transactions.push({
      date,
      description,
      amount: Math.abs(amount),
      type,
      vendor,
    })
  }

  return transactions
}

export async function importCSVTransactions(
  organizationId: string,
  userId: string,
  transactions: CSVTransaction[]
) {
  const results = {
    imported: 0,
    skipped: 0,
    errors: 0,
  }

  for (const transaction of transactions) {
    try {
      // Check for duplicates
      const existing = await prisma.transaction.findFirst({
        where: {
          organizationId,
          date: new Date(transaction.date),
          amount: transaction.amount,
          description: transaction.description,
        },
      })

      if (existing) {
        results.skipped++
        continue
      }

      // AI categorization
      const category = await categorizeTransaction(
        transaction.description,
        transaction.vendor || "Unknown",
        transaction.amount
      )

      // Create transaction
      await prisma.transaction.create({
        data: {
          organizationId,
          type: transaction.type,
          amount: transaction.amount,
          currency: "USD",
          date: new Date(transaction.date),
          description: transaction.description,
          vendor: transaction.vendor || "Unknown",
          category,
          status: "CATEGORIZED",
          confidence: 0.8,
          reviewedAt: new Date(),
          reviewedBy: userId,
        },
      })

      results.imported++
    } catch (error) {
      console.error("Error importing transaction:", error)
      results.errors++
    }
  }

  return results
}

export async function detectCSVFormat(csvContent: string): Promise<string> {
  const lines = csvContent.split("\n").filter((line) => line.trim())
  if (lines.length < 2) return "unknown"

  const headers = lines[0].toLowerCase()
  
  if (headers.includes("date") && headers.includes("amount")) {
    if (headers.includes("debit") && headers.includes("credit")) {
      return "bank_standard"
    }
    if (headers.includes("description") || headers.includes("desc")) {
      return "simple"
    }
  }

  return "custom"
}

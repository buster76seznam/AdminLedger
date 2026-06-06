import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parseCSV, importCSVTransactions, detectCSVFormat } from "@/lib/services/csv-import.service"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const csvContent = await file.text()
    const format = detectCSVFormat(csvContent)
    const transactions = await parseCSV(csvContent)

    if (transactions.length === 0) {
      return NextResponse.json({ error: "No valid transactions found in CSV" }, { status: 400 })
    }

    // Get user's organization
    const membership = await prisma.membership.findFirst({
      where: { userId: session.user.id },
    })

    if (!membership) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    // Import transactions
    const results = await importCSVTransactions(membership.organizationId, session.user.id, transactions)

    return NextResponse.json({
      success: true,
      format,
      results,
      total: transactions.length,
    })
  } catch (error) {
    console.error("CSV import error:", error)
    return NextResponse.json({ error: "Failed to import CSV" }, { status: 500 })
  }
}

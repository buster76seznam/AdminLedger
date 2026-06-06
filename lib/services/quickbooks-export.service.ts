import { prisma } from "@/lib/prisma"

export async function generateQuickBooksIIF(organizationId: string, startDate?: Date, endDate?: Date) {
  try {
    const where: any = { organizationId }
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = startDate
      if (endDate) where.date.lte = endDate
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { document: true },
      orderBy: { date: "asc" },
    })

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    })

    // QuickBooks IIF format
    let iif = `!TRNS\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tDOCNUM\tMEMO\n`
    iif += `!SPL\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tDOCNUM\tMEMO\n`
    iif += `!ENDTRNS\n\n`

    for (const transaction of transactions) {
      const date = transaction.date.toISOString().split("T")[0]
      const amount = transaction.amount.toFixed(2)
      const type = transaction.type === "INCOME" ? "INVOICE" : "CHECK"
      const account = transaction.type === "INCOME" ? "Income" : "Expense"
      const name = transaction.vendor || "Unknown"
      const docNum = transaction.documentId || ""
      const memo = transaction.description || ""

      iif += `TRNS\t${type}\t${date}\t${account}\t${name}\t${amount}\t${docNum}\t${memo}\n`
      iif += `SPL\t${type}\t${date}\t${transaction.category || "Uncategorized"}\t${name}\t${amount}\t${docNum}\t${memo}\n`
      iif += `ENDTRNS\n`
    }

    return iif
  } catch (error) {
    console.error("QuickBooks export error:", error)
    throw error
  }
}

export async function generateQuickBooksCSV(organizationId: string, startDate?: Date, endDate?: Date) {
  try {
    const where: any = { organizationId }
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = startDate
      if (endDate) where.date.lte = endDate
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: "asc" },
    })

    // QuickBooks CSV format
    let csv = "Date,Description,Type,Amount,Category,Vendor,Reference\n"

    for (const transaction of transactions) {
      const date = transaction.date.toISOString().split("T")[0]
      const amount = transaction.amount.toFixed(2)
      const type = transaction.type === "INCOME" ? "Deposit" : "Payment"

      csv += `${date},"${transaction.description}",${type},${amount},"${transaction.category || "Uncategorized"}","${transaction.vendor || "Unknown"}","${transaction.documentId || ""}"\n`
    }

    return csv
  } catch (error) {
    console.error("QuickBooks CSV export error:", error)
    throw error
  }
}

export async function generateQuickBooksQBO(organizationId: string, startDate?: Date, endDate?: Date) {
  try {
    const where: any = { organizationId }
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = startDate
      if (endDate) where.date.lte = endDate
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: "asc" },
    })

    // QuickBooks Online (QBO) format - simplified JSON
    const qboTransactions = transactions.map((transaction: any) => ({
      Date: transaction.date.toISOString().split("T")[0],
      Description: transaction.description,
      Amount: transaction.amount,
      Type: transaction.type === "INCOME" ? "Deposit" : "Expense",
      Category: transaction.category || "Uncategorized",
      Vendor: transaction.vendor || "Unknown",
      Reference: transaction.documentId || "",
    }))

    return JSON.stringify(qboTransactions, null, 2)
  } catch (error) {
    console.error("QuickBooks QBO export error:", error)
    throw error
  }
}

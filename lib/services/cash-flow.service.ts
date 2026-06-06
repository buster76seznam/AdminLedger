import { prisma } from "@/lib/prisma"

export interface CashFlowSnapshot {
  period: string
  income: number
  expenses: number
  netCashFlow: number
  openingBalance: number
  closingBalance: number
  topExpenseCategories: { category: string; amount: number }[]
  pendingInvoices: number
  upcomingExpenses: number
}

export async function getCashFlowSnapshot(organizationId: string, period: "week" | "month" | "quarter" = "month") {
  try {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (period) {
      case "week":
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        endDate = now
        break
      case "quarter":
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 3)
        endDate = now
        break
      case "month":
      default:
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 1)
        endDate = now
        break
    }

    // Get transactions for the period
    const transactions = await prisma.transaction.findMany({
      where: {
        organizationId,
        date: { gte: startDate, lte: endDate },
      },
    })

    // Calculate income and expenses
    let income = 0
    let expenses = 0
    const expenseCategories: Record<string, number> = {}

    transactions.forEach((txn: any) => {
      if (txn.type === "INCOME") {
        income += txn.amount
      } else {
        expenses += txn.amount
        const category = txn.category || "Uncategorized"
        expenseCategories[category] = (expenseCategories[category] || 0) + txn.amount
      }
    })

    const netCashFlow = income - expenses

    // Get opening balance (simplified - sum of all transactions before period)
    const openingBalance = await prisma.transaction.aggregate({
      where: {
        organizationId,
        date: { lt: startDate },
      },
      _sum: {
        amount: true,
      },
    })

    const openingBalanceAmount = openingBalance._sum.amount || 0
    const closingBalance = openingBalanceAmount + netCashFlow

    // Get pending invoices
    const pendingInvoices = await prisma.invoice.aggregate({
      where: {
        organizationId,
        status: { in: ["DRAFT", "SENT"] },
      },
      _sum: {
        amount: true,
      },
    })

    // Get upcoming expenses (simplified - expenses in next 30 days)
    const upcomingExpenses = await prisma.transaction.aggregate({
      where: {
        organizationId,
        type: "EXPENSE",
        date: { gte: now, lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
      },
      _sum: {
        amount: true,
      },
    })

    // Top expense categories
    const topExpenseCategories = Object.entries(expenseCategories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    return {
      period: period,
      income,
      expenses,
      netCashFlow,
      openingBalance: openingBalanceAmount,
      closingBalance,
      topExpenseCategories,
      pendingInvoices: pendingInvoices._sum.amount || 0,
      upcomingExpenses: upcomingExpenses._sum.amount || 0,
    }
  } catch (error) {
    console.error("Error getting cash flow snapshot:", error)
    throw error
  }
}

export async function getCashFlowTrend(organizationId: string, months: number = 6) {
  try {
    const trends = []
    const now = new Date()

    for (let i = 0; i < months; i++) {
      const startDate = new Date(now)
      startDate.setMonth(now.getMonth() - (i + 1))
      const endDate = new Date(now)
      endDate.setMonth(now.getMonth() - i)

      const transactions = await prisma.transaction.findMany({
        where: {
          organizationId,
          date: { gte: startDate, lte: endDate },
        },
      })

      let income = 0
      let expenses = 0

      transactions.forEach((txn: any) => {
        if (txn.type === "INCOME") {
          income += txn.amount
        } else {
          expenses += txn.amount
        }
      })

      trends.push({
        period: startDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        income,
        expenses,
        netCashFlow: income - expenses,
      })
    }

    return trends.reverse()
  } catch (error) {
    console.error("Error getting cash flow trend:", error)
    return []
  }
}

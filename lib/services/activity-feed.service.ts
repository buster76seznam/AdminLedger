import { prisma } from "@/lib/prisma"

export interface ActivityItem {
  id: string
  type: string
  entityType: string
  entityId: string
  title: string
  description: string
  userId?: string
  userName?: string
  createdAt: Date
}

export async function getActivityFeed(organizationId: string, limit: number = 50) {
  try {
    const activities: ActivityItem[] = []

    // Get recent audit logs
    const auditLogs = await prisma.auditLog.findMany({
      where: { organizationId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    auditLogs.forEach((log: any) => {
      activities.push({
        id: log.id,
        type: "audit",
        entityType: log.entityType,
        entityId: log.entityId,
        title: formatActionTitle(log.action),
        description: formatActionDescription(log.action, log.entityType),
        userId: log.userId,
        userName: log.user?.name,
        createdAt: log.createdAt,
      })
    })

    // Get recent document changes
    const documents = await prisma.document.findMany({
      where: { organizationId },
      orderBy: { updatedAt: "desc" },
      take: limit,
    })

    documents.forEach((doc: any) => {
      activities.push({
        id: doc.id,
        type: "document",
        entityType: "Document",
        entityId: doc.id,
        title: `Document ${doc.status}`,
        description: doc.fileName,
        createdAt: doc.updatedAt,
      })
    })

    // Get recent transaction changes
    const transactions = await prisma.transaction.findMany({
      where: { organizationId },
      orderBy: { updatedAt: "desc" },
      take: limit,
    })

    transactions.forEach((txn: any) => {
      activities.push({
        id: txn.id,
        type: "transaction",
        entityType: "Transaction",
        entityId: txn.id,
        title: `Transaction ${txn.status}`,
        description: `$${txn.amount.toFixed(2)} - ${txn.vendor}`,
        createdAt: txn.updatedAt,
      })
    })

    // Sort by date and return
    return activities
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
  } catch (error) {
    console.error("Error getting activity feed:", error)
    return []
  }
}

function formatActionTitle(action: string): string {
  const actionTitles: Record<string, string> = {
    CREATE: "Created",
    UPDATE: "Updated",
    DELETE: "Deleted",
    APPROVE: "Approved",
    REJECT: "Rejected",
    EXPORT: "Exported",
    IMPORT: "Imported",
  }

  return actionTitles[action] || action
}

function formatActionDescription(action: string, entityType: string): string {
  return `${action.toLowerCase()} ${entityType.toLowerCase()}`
}

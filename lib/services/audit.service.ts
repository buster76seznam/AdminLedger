import { prisma } from "@/lib/prisma"

export async function logAuditEvent(params: {
  organizationId: string
  userId?: string
  entityType: string
  entityId: string
  action: string
  changes?: any
  oldValue?: any
  newValue?: any
  source?: string
  ipAddress?: string
  userAgent?: string
}) {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        changes: params.changes,
        oldValue: params.oldValue,
        newValue: params.newValue,
        source: params.source || "manual",
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    })
  } catch (error) {
    console.error("Failed to log audit event:", error)
  }
}

export async function getAuditHistory(organizationId: string, entityType?: string, entityId?: string) {
  try {
    const where: any = { organizationId }
    if (entityType) where.entityType = entityType
    if (entityId) where.entityId = entityId

    const logs = await prisma.auditLog.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    return logs
  } catch (error) {
    console.error("Failed to get audit history:", error)
    return []
  }
}

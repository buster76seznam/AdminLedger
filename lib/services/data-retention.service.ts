import { prisma } from "@/lib/prisma"

export async function updateDataRetentionSettings(organizationId: string, settings: {
  dataRetentionDays: number
  autoDeleteEnabled: boolean
}) {
  try {
    return await prisma.organization.update({
      where: { id: organizationId },
      data: {
        dataRetentionDays: settings.dataRetentionDays,
        autoDeleteEnabled: settings.autoDeleteEnabled,
      },
    })
  } catch (error) {
    console.error("Error updating data retention settings:", error)
    throw error
  }
}

export async function getDataRetentionSettings(organizationId: string) {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        dataRetentionDays: true,
        autoDeleteEnabled: true,
      },
    })

    return org || { dataRetentionDays: 365, autoDeleteEnabled: false }
  } catch (error) {
    console.error("Error getting data retention settings:", error)
    return { dataRetentionDays: 365, autoDeleteEnabled: false }
  }
}

export async function deleteOldData(organizationId: string) {
  try {
    const settings = await getDataRetentionSettings(organizationId)
    
    if (!settings.autoDeleteEnabled) {
      return { deleted: 0, message: "Auto-delete is disabled" }
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - settings.dataRetentionDays)

    // Delete old audit logs
    const auditLogsDeleted = await prisma.auditLog.deleteMany({
      where: {
        organizationId,
        createdAt: { lt: cutoffDate },
      },
    })

    // Delete old notifications
    const notificationsDeleted = await prisma.notification.deleteMany({
      where: {
        organizationId,
        createdAt: { lt: cutoffDate },
        isRead: true,
      },
    })

    // Delete old export jobs
    const exportJobsDeleted = await prisma.exportJob.deleteMany({
      where: {
        organizationId,
        createdAt: { lt: cutoffDate },
        status: "COMPLETED",
      },
    })

    return {
      deleted: auditLogsDeleted.count + notificationsDeleted.count + exportJobsDeleted.count,
      details: {
        auditLogs: auditLogsDeleted.count,
        notifications: notificationsDeleted.count,
        exportJobs: exportJobsDeleted.count,
      },
    }
  } catch (error) {
    console.error("Error deleting old data:", error)
    throw error
  }
}

export async function deleteOrganizationData(organizationId: string, confirm: boolean) {
  if (!confirm) {
    throw new Error("Confirmation required to delete organization data")
  }

  try {
    // Delete all data in the correct order to respect foreign key constraints
    await prisma.notification.deleteMany({ where: { organizationId } })
    await prisma.reminder.deleteMany({ where: { task: { organizationId } } } as any)
    await prisma.task.deleteMany({ where: { organizationId } })
    await prisma.message.deleteMany({ where: { organizationId } })
    await prisma.invoice.deleteMany({ where: { organizationId } })
    await prisma.transaction.deleteMany({ where: { organizationId } })
    await prisma.documentField.deleteMany({ where: { document: { organizationId } } } as any)
    await prisma.document.deleteMany({ where: { organizationId } })
    await prisma.contact.deleteMany({ where: { organizationId } })
    await prisma.aiInsight.deleteMany({ where: { organizationId } })
    await prisma.auditLog.deleteMany({ where: { organizationId } })
    await prisma.exportJob.deleteMany({ where: { organizationId } })
    await prisma.categorizationRule.deleteMany({ where: { organizationId } })
    await prisma.template.deleteMany({ where: { organizationId } })
    await prisma.membership.deleteMany({ where: { organizationId } })

    // Finally delete the organization
    await prisma.organization.delete({ where: { id: organizationId } })

    return { success: true }
  } catch (error) {
    console.error("Error deleting organization data:", error)
    throw error
  }
}

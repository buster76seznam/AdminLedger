import { prisma } from "@/lib/prisma"

export async function createNotification(params: {
  organizationId: string
  userId?: string
  type: string
  title: string
  message: string
  link?: string
}) {
  try {
    return await prisma.notification.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
      },
    })
  } catch (error) {
    console.error("Error creating notification:", error)
  }
}

export async function getNotifications(organizationId: string, userId?: string) {
  try {
    const where: any = { organizationId }
    if (userId) where.userId = userId

    return await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    })
  } catch (error) {
    console.error("Error getting notifications:", error)
    return []
  }
}

export async function getUnreadCount(organizationId: string, userId?: string) {
  try {
    const where: any = { organizationId, isRead: false }
    if (userId) where.userId = userId

    return await prisma.notification.count({ where })
  } catch (error) {
    console.error("Error getting unread count:", error)
    return 0
  }
}

export async function markAsRead(notificationId: string) {
  try {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })
  } catch (error) {
    console.error("Error marking notification as read:", error)
  }
}

export async function markAllAsRead(organizationId: string, userId?: string) {
  try {
    const where: any = { organizationId, isRead: false }
    if (userId) where.userId = userId

    return await prisma.notification.updateMany({
      where,
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    return await prisma.notification.delete({
      where: { id: notificationId },
    })
  } catch (error) {
    console.error("Error deleting notification:", error)
  }
}

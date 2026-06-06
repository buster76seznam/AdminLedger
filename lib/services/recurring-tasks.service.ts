import { prisma } from "@/lib/prisma"

export interface RecurringTaskInput {
  organizationId: string
  createdById: string
  assignedToId: string
  title: string
  description?: string
  priority: "LOW" | "MEDIUM" | "HIGH"
  recurringPattern: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY"
  dayOfMonth?: number
  dayOfWeek?: number
  startDate: Date
  endDate?: Date
}

export async function createRecurringTask(input: RecurringTaskInput) {
  try {
    // Create the template task
    const template = await prisma.task.create({
      data: {
        organizationId: input.organizationId,
        createdById: input.createdById,
        assignedToId: input.assignedToId,
        title: input.title,
        description: input.description,
        status: "OPEN",
        priority: input.priority,
        isRecurring: true,
        recurringPattern: input.recurringPattern,
        dueDate: calculateNextDueDate(input.recurringPattern, input.dayOfMonth, input.dayOfWeek),
      },
    })

    return template
  } catch (error) {
    console.error("Error creating recurring task:", error)
    throw error
  }
}

export async function generateRecurringTasks() {
  try {
    // Get all recurring tasks that need new instances
    const recurringTasks = await prisma.task.findMany({
      where: {
        isRecurring: true,
        status: "COMPLETED",
      },
    })

    for (const task of recurringTasks) {
      const nextDueDate = calculateNextDueDate(
        task.recurringPattern as any,
        undefined,
        undefined
      )

      // Check if a task already exists for this date
      const existing = await prisma.task.findFirst({
        where: {
          organizationId: task.organizationId,
          title: task.title,
          dueDate: nextDueDate,
        },
      })

      if (!existing) {
        await prisma.task.create({
          data: {
            organizationId: task.organizationId,
            createdById: task.createdById || "",
            assignedToId: task.assignedToId || "",
            title: task.title,
            description: task.description,
            status: "OPEN",
            priority: task.priority,
            isRecurring: true,
            recurringPattern: task.recurringPattern,
            dueDate: nextDueDate,
          },
        })
      }
    }
  } catch (error) {
    console.error("Error generating recurring tasks:", error)
  }
}

function calculateNextDueDate(
  pattern: string,
  dayOfMonth?: number,
  dayOfWeek?: number
): Date {
  const now = new Date()
  const next = new Date(now)

  switch (pattern) {
    case "DAILY":
      next.setDate(now.getDate() + 1)
      break
    case "WEEKLY":
      next.setDate(now.getDate() + 7)
      break
    case "MONTHLY":
      next.setMonth(now.getMonth() + 1)
      if (dayOfMonth) {
        next.setDate(dayOfMonth)
      }
      break
    case "QUARTERLY":
      next.setMonth(now.getMonth() + 3)
      break
    case "YEARLY":
      next.setFullYear(now.getFullYear() + 1)
      break
    default:
      next.setDate(now.getDate() + 7)
  }

  return next
}

export async function getRecurringTasks(organizationId: string) {
  try {
    return await prisma.task.findMany({
      where: {
        organizationId,
        isRecurring: true,
      },
      orderBy: { dueDate: "asc" },
    })
  } catch (error) {
    console.error("Error getting recurring tasks:", error)
    return []
  }
}

export async function updateRecurringTask(taskId: string, updates: any) {
  try {
    return await prisma.task.update({
      where: { id: taskId },
      data: updates,
    })
  } catch (error) {
    console.error("Error updating recurring task:", error)
    throw error
  }
}

export async function deleteRecurringTask(taskId: string) {
  try {
    return await prisma.task.delete({
      where: { id: taskId },
    })
  } catch (error) {
    console.error("Error deleting recurring task:", error)
    throw error
  }
}

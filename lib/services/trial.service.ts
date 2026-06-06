import { prisma } from "@/lib/prisma"

export async function startTrial(organizationId: string, days: number = 14) {
  try {
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + days)

    return await prisma.organization.update({
      where: { id: organizationId },
      data: { trialEndsAt },
    })
  } catch (error) {
    console.error("Error starting trial:", error)
    throw error
  }
}

export async function checkTrialStatus(organizationId: string) {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { trialEndsAt: true, plan: true },
    })

    if (!org) {
      return { isTrial: false, daysRemaining: 0, isActive: false }
    }

    if (!org.trialEndsAt) {
      return { isTrial: false, daysRemaining: 0, isActive: false }
    }

    const now = new Date()
    const trialEndsAt = new Date(org.trialEndsAt)
    const daysRemaining = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const isActive = daysRemaining > 0

    return {
      isTrial: true,
      daysRemaining: Math.max(0, daysRemaining),
      isActive,
      trialEndsAt: org.trialEndsAt,
    }
  } catch (error) {
    console.error("Error checking trial status:", error)
    return { isTrial: false, daysRemaining: 0, isActive: false }
  }
}

export async function extendTrial(organizationId: string, additionalDays: number) {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { trialEndsAt: true },
    })

    if (!org) {
      throw new Error("Organization not found")
    }

    const trialEndsAt = org.trialEndsAt ? new Date(org.trialEndsAt) : new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + additionalDays)

    return await prisma.organization.update({
      where: { id: organizationId },
      data: { trialEndsAt },
    })
  } catch (error) {
    console.error("Error extending trial:", error)
    throw error
  }
}

export async function endTrial(organizationId: string, convertToPlan: "STARTER" | "PRO" | "TEAM") {
  try {
    return await prisma.organization.update({
      where: { id: organizationId },
      data: {
        trialEndsAt: null,
        plan: convertToPlan,
      },
    })
  } catch (error) {
    console.error("Error ending trial:", error)
    throw error
  }
}

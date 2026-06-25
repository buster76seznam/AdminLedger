import { prisma } from "@/lib/prisma"

interface UsageCheckResult {
  allowed: boolean
  reason?: string
  currentTokens: number
  currentCost: number
  tokenLimit: number
  costLimit: number
}

/**
 * Check if an organization is within their usage limits
 */
export async function checkUsageLimits(
  organizationId: string,
  estimatedCost: number = 0
): Promise<UsageCheckResult> {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        currentMonthTokens: true,
        currentMonthCost: true,
        monthlyTokenLimit: true,
        monthlyCostLimit: true,
        tokenResetDate: true,
      },
    })

    if (!organization) {
      return {
        allowed: false,
        reason: "Organization not found",
        currentTokens: 0,
        currentCost: 0,
        tokenLimit: 0,
        costLimit: 0,
      }
    }

    // Check if we need to reset the monthly counters
    const now = new Date()
    if (organization.tokenResetDate && now > organization.tokenResetDate) {
      // Reset counters (this should be done by a scheduled job, but we handle it here too)
      await prisma.organization.update({
        where: { id: organizationId },
        data: {
          currentMonthTokens: 0,
          currentMonthCost: 0,
          tokenResetDate: getNextMonthReset(),
        },
      })
      
      organization.currentMonthTokens = 0
      organization.currentMonthCost = 0
    }

    // Check cost limit (primary guardrail)
    const projectedCost = organization.currentMonthCost + estimatedCost
    if (projectedCost > organization.monthlyCostLimit) {
      return {
        allowed: false,
        reason: `Monthly cost limit ($${organization.monthlyCostLimit.toFixed(2)}) would be exceeded. Current: $${organization.currentMonthCost.toFixed(2)}, Projected: $${projectedCost.toFixed(2)}`,
        currentTokens: organization.currentMonthTokens,
        currentCost: organization.currentMonthCost,
        tokenLimit: organization.monthlyTokenLimit,
        costLimit: organization.monthlyCostLimit,
      }
    }

    // Check token limit (secondary guardrail)
    if (organization.currentMonthTokens >= organization.monthlyTokenLimit) {
      return {
        allowed: false,
        reason: `Monthly token limit (${organization.monthlyTokenLimit}) has been reached. Please upgrade your plan for continued access.`,
        currentTokens: organization.currentMonthTokens,
        currentCost: organization.currentMonthCost,
        tokenLimit: organization.monthlyTokenLimit,
        costLimit: organization.monthlyCostLimit,
      }
    }

    return {
      allowed: true,
      currentTokens: organization.currentMonthTokens,
      currentCost: organization.currentMonthCost,
      tokenLimit: organization.monthlyTokenLimit,
      costLimit: organization.monthlyCostLimit,
    }
  } catch (error) {
    console.error("Error checking usage limits:", error)
    // Fail open - allow the request if we can't check limits
    return {
      allowed: true,
      currentTokens: 0,
      currentCost: 0,
      tokenLimit: 0,
      costLimit: 0,
    }
  }
}

/**
 * Record AI usage after a successful API call
 */
export async function recordAIUsage(params: {
  organizationId: string
  userId?: string
  taskType: string
  modelUsed: string
  tokensUsed: number
  costUsd: number
  confidence?: number
  metadata?: any
}): Promise<void> {
  try {
    const {
      organizationId,
      userId,
      taskType,
      modelUsed,
      tokensUsed,
      costUsd,
      confidence,
      metadata,
    } = params

    // Update organization usage counters
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        currentMonthTokens: {
          increment: tokensUsed,
        },
        currentMonthCost: {
          increment: costUsd,
        },
        // Set reset date if not set
        tokenResetDate: await prisma.organization
          .findUnique({ where: { id: organizationId }, select: { tokenResetDate: true } })
          .then((org: any) => org?.tokenResetDate || getNextMonthReset()),
      },
    })

    // Log the usage
    await prisma.aIUsageLog.create({
      data: {
        organizationId,
        userId,
        taskType,
        modelUsed,
        tokensUsed,
        costUsd,
        confidence,
        metadata: metadata as any,
      },
    })
  } catch (error) {
    console.error("Error recording AI usage:", error)
    // Don't throw - we don't want to fail the main operation if logging fails
  }
}

/**
 * Get usage statistics for an organization
 */
export async function getUsageStats(organizationId: string) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        currentMonthTokens: true,
        currentMonthCost: true,
        monthlyTokenLimit: true,
        monthlyCostLimit: true,
        tokenResetDate: true,
        plan: true,
      },
    })

    if (!organization) {
      return null
    }

    // Get recent usage logs
    const recentLogs = await prisma.aIUsageLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    // Calculate usage by task type
    const usageByTask = recentLogs.reduce((acc: Record<string, number>, log: any) => {
      acc[log.taskType] = (acc[log.taskType] || 0) + log.costUsd
      return acc
    }, {} as Record<string, number>)

    return {
      currentMonthTokens: organization.currentMonthTokens,
      currentMonthCost: organization.currentMonthCost,
      monthlyTokenLimit: organization.monthlyTokenLimit,
      monthlyCostLimit: organization.monthlyCostLimit,
      tokenResetDate: organization.tokenResetDate,
      plan: organization.plan,
      tokenUsagePercent: (organization.currentMonthTokens / organization.monthlyTokenLimit) * 100,
      costUsagePercent: (organization.currentMonthCost / organization.monthlyCostLimit) * 100,
      usageByTask,
      recentLogs,
    }
  } catch (error) {
    console.error("Error getting usage stats:", error)
    return null
  }
}

/**
 * Get the next month's reset date (1st of next month at midnight)
 */
function getNextMonthReset(): Date {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return nextMonth
}

/**
 * Initialize token reset date for new organizations
 */
export async function initializeTokenReset(organizationId: string): Promise<void> {
  try {
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        tokenResetDate: getNextMonthReset(),
      },
    })
  } catch (error) {
    console.error("Error initializing token reset:", error)
  }
}

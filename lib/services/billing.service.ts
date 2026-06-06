import { prisma } from "@/lib/prisma"

export async function chargeSetupFee(organizationId: string, amount: number) {
  try {
    return await prisma.organization.update({
      where: { id: organizationId },
      data: {
        setupFeePaid: true,
        setupFeeAmount: amount,
      },
    })
  } catch (error) {
    console.error("Error charging setup fee:", error)
    throw error
  }
}

export async function enableAddon(organizationId: string, addonType: string, addonPrice: number) {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { addons: true },
    })

    if (!org) {
      throw new Error("Organization not found")
    }

    const addons = org.addons ? JSON.parse(org.addons as string) : {}
    addons[addonType] = {
      enabled: true,
      price: addonPrice,
      enabledAt: new Date().toISOString(),
    }

    return await prisma.organization.update({
      where: { id: organizationId },
      data: { addons: JSON.stringify(addons) },
    })
  } catch (error) {
    console.error("Error enabling addon:", error)
    throw error
  }
}

export async function disableAddon(organizationId: string, addonType: string) {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { addons: true },
    })

    if (!org) {
      throw new Error("Organization not found")
    }

    const addons = org.addons ? JSON.parse(org.addons as string) : {}
    addons[addonType] = {
      enabled: false,
      disabledAt: new Date().toISOString(),
    }

    return await prisma.organization.update({
      where: { id: organizationId },
      data: { addons: JSON.stringify(addons) },
    })
  } catch (error) {
    console.error("Error disabling addon:", error)
    throw error
  }
}

export async function getAddons(organizationId: string) {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { addons: true },
    })

    if (!org || !org.addons) {
      return {}
    }

    return JSON.parse(org.addons as string)
  } catch (error) {
    console.error("Error getting addons:", error)
    return {}
  }
}

export async function calculateMonthlyBill(organizationId: string) {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true, addons: true },
    })

    if (!org) {
      throw new Error("Organization not found")
    }

    const planPrices: Record<string, number> = {
      STARTER: 29,
      PRO: 79,
      TEAM: 199,
    }

    let total = planPrices[org.plan] || 29

    const addons = org.addons ? JSON.parse(org.addons as string) : {}
    
    // Add-on prices
    const addonPrices: Record<string, number> = {
      accountant_workspace: 49,
      bank_sync: 29,
      multi_location: 99,
    }

    Object.entries(addons).forEach(([addon, config]: [string, any]) => {
      if (config.enabled && addonPrices[addon]) {
        total += addonPrices[addon]
      }
    })

    return {
      basePrice: planPrices[org.plan] || 29,
      addons: Object.entries(addons)
        .filter(([_, config]: [string, any]) => config.enabled)
        .map(([addon, _]) => ({ addon, price: addonPrices[addon] || 0 })),
      total,
    }
  } catch (error) {
    console.error("Error calculating monthly bill:", error)
    throw error
  }
}

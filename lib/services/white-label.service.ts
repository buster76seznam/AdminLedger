import { prisma } from "@/lib/prisma"

export interface WhiteLabelConfig {
  companyName: string
  logoUrl?: string
  primaryColor?: string
  customDomain?: string
  removeBranding: boolean
}

export async function generateWhiteLabelExport(
  organizationId: string,
  config: WhiteLabelConfig,
  exportType: "PDF" | "CSV" | "EXCEL"
) {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    })

    if (!org) {
      throw new Error("Organization not found")
    }

    // Generate export with custom branding
    const exportData = {
      metadata: {
        generatedBy: config.companyName || org.name,
        generatedAt: new Date().toISOString(),
        branding: config.removeBranding ? "none" : "fuiledger",
        customLogo: config.logoUrl || null,
        primaryColor: config.primaryColor || "#2563eb",
      },
      data: await getExportData(organizationId),
    }

    return exportData
  } catch (error) {
    console.error("Error generating white-label export:", error)
    throw error
  }
}

async function getExportData(organizationId: string) {
  // Get organization data for export
  const transactions = await prisma.transaction.findMany({
    where: { organizationId },
    orderBy: { date: "desc" },
    take: 1000,
  })

  const documents = await prisma.document.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 1000,
  })

  const invoices = await prisma.invoice.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 1000,
  })

  return {
    transactions: transactions.map((t: any) => ({
      date: t.date,
      description: t.description,
      amount: t.amount,
      category: t.category,
      vendor: t.vendor,
    })),
    documents: documents.map((d: any) => ({
      fileName: d.fileName,
      type: d.type,
      status: d.status,
      createdAt: d.createdAt,
    })),
    invoices: invoices.map((i: any) => ({
      invoiceNumber: i.invoiceNumber,
      clientName: i.clientName,
      amount: i.amount,
      status: i.status,
      dueDate: i.dueDate,
    })),
  }
}

export async function saveWhiteLabelConfig(organizationId: string, config: WhiteLabelConfig) {
  try {
    const addons = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { addons: true },
    })

    const currentAddons = addons?.addons ? JSON.parse(addons.addons as string) : {}
    currentAddons.white_label = {
      enabled: true,
      config,
      updatedAt: new Date().toISOString(),
    }

    return await prisma.organization.update({
      where: { id: organizationId },
      data: { addons: JSON.stringify(currentAddons) },
    })
  } catch (error) {
    console.error("Error saving white-label config:", error)
    throw error
  }
}

export async function getWhiteLabelConfig(organizationId: string) {
  try {
    const addons = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { addons: true },
    })

    if (!addons?.addons) {
      return null
    }

    const parsed = JSON.parse(addons.addons as string)
    return parsed.white_label || null
  } catch (error) {
    console.error("Error getting white-label config:", error)
    return null
  }
}

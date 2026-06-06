import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { businessType } = await req.json()

    if (!businessType) {
      return NextResponse.json({ error: "Business type is required" }, { status: 400 })
    }

    // Get user's organization
    const membership = await prisma.membership.findFirst({
      where: { userId: session.user.id, role: "OWNER" },
      include: { organization: true },
    })

    if (!membership) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    // Update organization with business type
    const updatedOrg = await prisma.organization.update({
      where: { id: membership.organizationId },
      data: { businessType: businessType as any },
    })

    // Create default categories based on business type
    const categoriesByType: Record<string, string[]> = {
      FREELANCER: ["Services", "Software", "Marketing", "Travel", "Office Supplies"],
      AGENCY: ["Client Services", "Marketing", "Software", "Office Supplies", "Travel"],
      TRADES: ["Materials", "Equipment", "Labor", "Subcontractors", "Permits"],
      CONSULTANT: ["Professional Services", "Travel", "Marketing", "Software", "Office Supplies"],
      LOCAL_SERVICE: ["COGS", "Rent", "Utilities", "Labor", "Marketing", "Supplies"],
      ECOMMERCE: ["COGS", "Shipping", "Marketing", "Platform Fees", "Software", "Returns"],
    }

    const categories = categoriesByType[businessType] || categoriesByType.FREELANCER

    // Create default tasks/checklist based on business type
    const tasksByType: Record<string, { title: string; description: string }[]> = {
      FREELANCER: [
        { title: "Upload first invoice", description: "Upload your first invoice to get started with document processing" },
        { title: "Set up email templates", description: "Configure invoice reminders and follow-up emails" },
        { title: "Connect bank account", description: "Import transactions for automatic categorization" },
      ],
      AGENCY: [
        { title: "Upload client contracts", description: "Upload contracts for document processing" },
        { title: "Set up project tracking", description: "Create tasks for each active project" },
        { title: "Configure client templates", description: "Set up email templates for client communication" },
      ],
      TRADES: [
        { title: "Upload material receipts", description: "Upload receipts for materials and equipment" },
        { title: "Set up subcontractor tracking", description: "Create tasks for subcontractor payments" },
        { title: "Configure job costing", description: "Set up categories for job-based tracking" },
      ],
      CONSULTANT: [
        { title: "Upload consulting agreements", description: "Upload contracts for document processing" },
        { title: "Set up deliverable tracking", description: "Create tasks for project deliverables" },
        { title: "Configure invoice templates", description: "Set up professional invoice templates" },
      ],
      LOCAL_SERVICE: [
        { title: "Upload supplier invoices", description: "Upload invoices from suppliers" },
        { title: "Set up inventory tracking", description: "Create tasks for inventory management" },
        { title: "Configure customer templates", description: "Set up templates for customer communication" },
      ],
      ECOMMERCE: [
        { title: "Upload platform statements", description: "Upload statements from your e-commerce platform" },
        { title: "Set up product tracking", description: "Create categories for product-based tracking" },
        { title: "Configure shipping templates", description: "Set up shipping notification templates" },
      ],
    }

    const defaultTasks = tasksByType[businessType] || tasksByType.FREELANCER

    // Create default tasks
    await prisma.task.createMany({
      data: defaultTasks.map((task) => ({
        organizationId: membership.organizationId,
        createdById: session.user.id,
        assignedToId: session.user.id,
        title: task.title,
        description: task.description,
        status: "OPEN",
        priority: "MEDIUM",
      })),
    })

    return NextResponse.json({ success: true, organization: updatedOrg })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 })
  }
}

import { prisma } from "@/lib/prisma"

export interface TemplateInput {
  organizationId: string
  type: string
  name: string
  subject?: string
  body: string
  variables?: string[]
  isDefault?: boolean
}

export async function createTemplate(input: TemplateInput) {
  try {
    return await prisma.template.create({
      data: {
        organizationId: input.organizationId,
        type: input.type,
        name: input.name,
        subject: input.subject,
        body: input.body,
        variables: input.variables ? JSON.stringify(input.variables) : null,
        isDefault: input.isDefault || false,
      },
    })
  } catch (error) {
    console.error("Error creating template:", error)
    throw error
  }
}

export async function getTemplates(organizationId: string, type?: string) {
  try {
    const where: any = { organizationId }
    if (type) where.type = type

    return await prisma.template.findMany({
      where,
      orderBy: { isDefault: "desc" },
    })
  } catch (error) {
    console.error("Error getting templates:", error)
    return []
  }
}

export async function getTemplate(id: string) {
  try {
    return await prisma.template.findUnique({
      where: { id },
    })
  } catch (error) {
    console.error("Error getting template:", error)
    return null
  }
}

export async function updateTemplate(id: string, updates: Partial<TemplateInput>) {
  try {
    const data: any = {}
    if (updates.name) data.name = updates.name
    if (updates.subject !== undefined) data.subject = updates.subject
    if (updates.body) data.body = updates.body
    if (updates.variables) data.variables = JSON.stringify(updates.variables)
    if (updates.isDefault !== undefined) data.isDefault = updates.isDefault

    return await prisma.template.update({
      where: { id },
      data,
    })
  } catch (error) {
    console.error("Error updating template:", error)
    throw error
  }
}

export async function deleteTemplate(id: string) {
  try {
    return await prisma.template.delete({
      where: { id },
    })
  } catch (error) {
    console.error("Error deleting template:", error)
    throw error
  }
}

export async function applyTemplate(templateId: string, variables: Record<string, string>) {
  try {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      throw new Error("Template not found")
    }

    let body = template.body
    let subject = template.subject || ""

    // Replace variables in body
    Object.entries(variables).forEach(([key, value]) => {
      body = body.replace(new RegExp(`{{${key}}}`, "g"), value)
      subject = subject.replace(new RegExp(`{{${key}}}`, "g"), value)
    })

    return {
      subject,
      body,
      templateId: template.id,
      templateName: template.name,
    }
  } catch (error) {
    console.error("Error applying template:", error)
    throw error
  }
}

export async function initializeDefaultTemplates(organizationId: string, businessType: string) {
  try {
    const defaultTemplates = getDefaultTemplatesForBusinessType(businessType)

    for (const template of defaultTemplates) {
      await prisma.template.create({
        data: {
          organizationId,
          type: template.type,
          name: template.name,
          subject: template.subject,
          body: template.body,
          variables: template.variables ? JSON.stringify(template.variables) : null,
          isDefault: true,
        },
      })
    }
  } catch (error) {
    console.error("Error initializing default templates:", error)
  }
}

function getDefaultTemplatesForBusinessType(businessType: string) {
  const commonTemplates = [
    {
      type: "email",
      name: "Invoice Reminder",
      subject: "Payment Reminder: Invoice {{invoiceNumber}}",
      body: "Dear {{clientName}},\n\nThis is a friendly reminder that invoice {{invoiceNumber}} for {{amount}} is due on {{dueDate}}.\n\nPlease let us know if you have any questions.\n\nBest regards",
      variables: ["clientName", "invoiceNumber", "amount", "dueDate"],
    },
    {
      type: "checklist",
      name: "Monthly Close",
      subject: null,
      body: "1. Review all transactions\n2. Reconcile bank accounts\n3. Review outstanding invoices\n4. Generate reports\n5. Backup data",
      variables: [],
    },
  ]

  const businessSpecificTemplates: Record<string, any[]> = {
    FREELANCER: [
      {
        type: "email",
        name: "Project Update",
        subject: "Project Update: {{projectName}}",
        body: "Hi {{clientName}},\n\nI wanted to provide an update on {{projectName}}. Current status: {{status}}.\n\nExpected completion: {{completionDate}}",
        variables: ["clientName", "projectName", "status", "completionDate"],
      },
    ],
    AGENCY: [
      {
        type: "email",
        name: "Monthly Report",
        subject: "Monthly Progress Report - {{month}}",
        body: "Dear {{clientName}},\n\nHere's your monthly progress report for {{month}}.\n\nProjects completed: {{completedCount}}\nIn progress: {{inProgressCount}}",
        variables: ["clientName", "month", "completedCount", "inProgressCount"],
      },
    ],
    TRADES: [
      {
        type: "email",
        name: "Quote Request",
        subject: "Quote Request for {{projectType}}",
        body: "Dear {{clientName}},\n\nThank you for your interest in {{projectType}}. Here's our quote:\n\n{{quoteDetails}}",
        variables: ["clientName", "projectType", "quoteDetails"],
      },
    ],
    CONSULTANT: [
      {
        type: "email",
        name: "Deliverable Notification",
        subject: "Deliverable Ready: {{deliverableName}}",
        body: "Dear {{clientName}},\n\nThe deliverable {{deliverableName}} is ready for review.\n\nPlease access it via the portal.",
        variables: ["clientName", "deliverableName"],
      },
    ],
    LOCAL_SERVICE: [
      {
        type: "email",
        name: "Appointment Reminder",
        subject: "Appointment Reminder: {{service}}",
        body: "Dear {{customerName}},\n\nThis is a reminder of your appointment for {{service}} on {{date}} at {{time}}.",
        variables: ["customerName", "service", "date", "time"],
      },
    ],
    ECOMMERCE: [
      {
        type: "email",
        name: "Order Confirmation",
        subject: "Order Confirmed: #{{orderNumber}}",
        body: "Dear {{customerName}},\n\nYour order #{{orderNumber}} has been confirmed.\n\nEstimated delivery: {{deliveryDate}}",
        variables: ["customerName", "orderNumber", "deliveryDate"],
      },
    ],
  }

  return [...commonTemplates, ...(businessSpecificTemplates[businessType] || [])]
}

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting seed...")

  // Create test user
  const hashedPassword = await bcrypt.hash("password123", 12)
  const user = await prisma.user.upsert({
    where: { email: "demo@opsmate.ai" },
    update: {},
    create: {
      email: "demo@opsmate.ai",
      name: "Demo User",
      password: hashedPassword,
    },
  })

  console.log("Created user:", user.email)

  // Create organization
  const organization = await prisma.organization.upsert({
    where: { slug: "demo-company" },
    update: {},
    create: {
      name: "Demo Company",
      slug: "demo-company",
      plan: "PRO",
    },
  })

  console.log("Created organization:", organization.name)

  // Create membership
  const membership = await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: organization.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      organizationId: organization.id,
      role: "OWNER",
    },
  })

  console.log("Created membership")

  // Create contacts
  const vendor = await prisma.contact.create({
    data: {
      organizationId: organization.id,
      type: "VENDOR",
      name: "Acme Corp",
      email: "billing@acme.com",
      phone: "+1 555-123-4567",
      company: "Acme Corp",
    },
  })

  const client = await prisma.contact.create({
    data: {
      organizationId: organization.id,
      type: "CLIENT",
      name: "Tech Solutions Inc",
      email: "accounts@techsolutions.com",
      phone: "+1 555-987-6543",
      company: "Tech Solutions Inc",
    },
  })

  const accountant = await prisma.contact.create({
    data: {
      organizationId: organization.id,
      type: "ACCOUNTANT",
      name: "Robert Johnson",
      email: "robert@accountingfirm.com",
      phone: "+1 555-456-7890",
      company: "Johnson & Associates",
    },
  })

  console.log("Created contacts")

  // Create documents
  const document1 = await prisma.document.create({
    data: {
      organizationId: organization.id,
      contactId: vendor.id,
      type: "INVOICE",
      status: "REVIEWED",
      fileName: "invoice_001.pdf",
      fileUrl: "/uploads/invoice_001.pdf",
      fileSize: 245000,
      mimeType: "application/pdf",
      ocrText: "INVOICE #INV-001\nAcme Corp\n123 Business St\nCity, ST 12345\n\nBill To: Demo Company\n\nDate: 2026-03-15\nDue Date: 2026-04-15\n\nItem 1: Office Supplies - $500.00\nItem 2: Software License - $750.00\n\nSubtotal: $1,250.00\nTax: $125.00\nTotal: $1,375.00",
      extractedData: {
        vendor: "Acme Corp",
        date: "2026-03-15",
        amount: 1375.00,
        currency: "USD",
        tax: 125.00,
        dueDate: "2026-04-15",
      },
      reviewedAt: new Date(),
      reviewedBy: user.id,
    },
  })

  const document2 = await prisma.document.create({
    data: {
      organizationId: organization.id,
      type: "RECEIPT",
      status: "EXTRACTED",
      fileName: "receipt_office.jpg",
      fileUrl: "/uploads/receipt_office.jpg",
      fileSize: 125000,
      mimeType: "image/jpeg",
      ocrText: "OFFICE DEPOT\nReceipt #12345\nDate: 2026-03-14\n\nItems:\n- Paper: $25.00\n- Pens: $15.00\n- Folders: $49.50\n\nTotal: $89.50",
      extractedData: {
        vendor: "Office Depot",
        date: "2026-03-14",
        amount: 89.50,
        currency: "USD",
      },
    },
  })

  console.log("Created documents")

  // Create document fields
  await prisma.documentField.createMany({
    data: [
      {
        documentId: document1.id,
        fieldName: "vendor",
        fieldValue: "Acme Corp",
        confidence: 0.95,
        source: "ai",
      },
      {
        documentId: document1.id,
        fieldName: "date",
        fieldValue: "2026-03-15",
        confidence: 0.98,
        source: "ai",
      },
      {
        documentId: document1.id,
        fieldName: "amount",
        fieldValue: "1375.00",
        confidence: 0.99,
        source: "ai",
      },
      {
        documentId: document2.id,
        fieldName: "vendor",
        fieldValue: "Office Depot",
        confidence: 0.92,
        source: "ai",
      },
      {
        documentId: document2.id,
        fieldName: "amount",
        fieldValue: "89.50",
        confidence: 0.95,
        source: "ai",
      },
    ],
  })

  console.log("Created document fields")

  // Create transactions
  await prisma.transaction.createMany({
    data: [
      {
        organizationId: organization.id,
        documentId: document1.id,
        type: "EXPENSE",
        amount: 1375.00,
        currency: "USD",
        date: new Date("2026-03-15"),
        category: "Office Supplies",
        description: "Office supplies and software license",
        vendor: "Acme Corp",
        status: "CATEGORIZED",
        confidence: 0.95,
        reviewedAt: new Date(),
        reviewedBy: user.id,
      },
      {
        organizationId: organization.id,
        documentId: document2.id,
        type: "EXPENSE",
        amount: 89.50,
        currency: "USD",
        date: new Date("2026-03-14"),
        category: "Office Supplies",
        description: "Office supplies from Office Depot",
        vendor: "Office Depot",
        status: "CATEGORIZED",
        confidence: 0.92,
        reviewedAt: new Date(),
        reviewedBy: user.id,
      },
      {
        organizationId: organization.id,
        type: "INCOME",
        amount: 5000.00,
        currency: "USD",
        date: new Date("2026-03-13"),
        category: "Services",
        description: "Project payment - Phase 1",
        vendor: "Tech Solutions Inc",
        status: "CATEGORIZED",
        confidence: 1.0,
        reviewedAt: new Date(),
        reviewedBy: user.id,
      },
    ],
  })

  console.log("Created transactions")

  // Create invoices
  await prisma.invoice.createMany({
    data: [
      {
        organizationId: organization.id,
        invoiceNumber: "INV-2026-001",
        clientId: client.id,
        amount: 5000.00,
        currency: "USD",
        dueDate: new Date("2026-04-15"),
        status: "SENT",
        lineItems: [
          { description: "Web Development Phase 1", quantity: 1, price: 5000.00 },
        ],
      },
      {
        organizationId: organization.id,
        invoiceNumber: "INV-2026-002",
        clientId: client.id,
        amount: 2500.00,
        currency: "USD",
        dueDate: new Date("2026-03-15"),
        status: "OVERDUE",
        lineItems: [
          { description: "Consulting Services", quantity: 10, price: 250.00 },
        ],
      },
    ],
  })

  console.log("Created invoices")

  // Create tasks
  await prisma.task.createMany({
    data: [
      {
        organizationId: organization.id,
        documentId: document1.id,
        createdById: user.id,
        assignedToId: user.id,
        title: "Review Q1 expense reports",
        description: "Review and categorize all Q1 expense reports for bookkeeping",
        status: "OPEN",
        priority: "HIGH",
        dueDate: new Date("2026-03-20"),
      },
      {
        organizationId: organization.id,
        createdById: user.id,
        assignedToId: user.id,
        title: "Follow up on overdue invoice",
        description: "Contact Tech Solutions about overdue invoice INV-2026-002",
        status: "OPEN",
        priority: "HIGH",
        dueDate: new Date("2026-03-16"),
      },
      {
        organizationId: organization.id,
        createdById: user.id,
        assignedToId: user.id,
        title: "Categorize new receipts",
        description: "Review and categorize newly uploaded receipts",
        status: "DONE",
        priority: "MEDIUM",
        dueDate: new Date("2026-03-14"),
        completedAt: new Date("2026-03-14"),
      },
    ],
  })

  console.log("Created tasks")

  // Create AI insights
  await prisma.aIInsight.createMany({
    data: [
      {
        organizationId: organization.id,
        type: "CATEGORY_SUGGESTION",
        content: "Receipt from Office Depot should be categorized as 'Office Supplies'",
        confidence: 0.88,
        context: { documentId: document2.id },
      },
      {
        organizationId: organization.id,
        type: "DUPLICATE_DETECTION",
        content: "Transaction #4521 appears to be a duplicate of #4498. Please review.",
        confidence: 0.95,
      },
      {
        organizationId: organization.id,
        type: "DEADLINE_REMINDER",
        content: "Invoice INV-2026-002 is overdue. Send payment reminder.",
        confidence: 1.0,
      },
    ],
  })

  console.log("Created AI insights")

  // Create messages
  await prisma.message.createMany({
    data: [
      {
        organizationId: organization.id,
        contactId: client.id,
        userId: user.id,
        subject: "Payment Reminder - INV-2026-002",
        body: "Dear Tech Solutions Inc,\n\nThis is a friendly reminder that invoice INV-2026-002 for $2,500.00 is now overdue. Please arrange payment at your earliest convenience.\n\nThank you,\nDemo Company",
        status: "SENT",
        template: "late_payment",
        sentAt: new Date(),
      },
      {
        organizationId: organization.id,
        contactId: accountant.id,
        userId: user.id,
        subject: "Monthly Financial Summary - March 2026",
        body: "Dear Robert,\n\nPlease find attached the monthly financial summary for March 2026. This includes all transactions, invoices, and categorized expenses.\n\nLet me know if you need any additional information.\n\nBest regards,\nDemo User",
        status: "DRAFT",
        template: "accountant_summary",
      },
    ],
  })

  console.log("Created messages")

  console.log("Seed completed successfully!")
  console.log("\nDemo credentials:")
  console.log("Email: demo@opsmate.ai")
  console.log("Password: password123")
}

main()
  .catch((e) => {
    console.error("Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

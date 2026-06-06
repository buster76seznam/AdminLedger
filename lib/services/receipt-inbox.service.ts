import { prisma } from "@/lib/prisma"

export async function generateReceiptEmail(organizationId: string): Promise<string> {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    })

    if (!org) {
      throw new Error("Organization not found")
    }

    // Generate unique email if not exists
    if (!org.receiptEmail) {
      const slug = org.slug.toLowerCase().replace(/[^a-z0-9]/g, "")
      const randomString = Math.random().toString(36).substring(2, 8)
      const uniqueEmail = `receipts-${slug}-${randomString}@fuiledger.app`

      await prisma.organization.update({
        where: { id: organizationId },
        data: { receiptEmail: uniqueEmail },
      })

      return uniqueEmail
    }

    return org.receiptEmail
  } catch (error) {
    console.error("Error generating receipt email:", error)
    throw error
  }
}

export async function processReceiptEmail(
  organizationId: string,
  fromEmail: string,
  subject: string,
  attachments: { filename: string; content: Buffer }[]
) {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    })

    if (!org) {
      throw new Error("Organization not found")
    }

    // Process each attachment as a document
    for (const attachment of attachments) {
      // In a real implementation, you would:
      // 1. Upload the file to S3
      // 2. Run OCR
      // 3. Extract data with AI
      // 4. Create document record

      await prisma.document.create({
        data: {
          organizationId,
          type: "RECEIPT",
          status: "PENDING",
          fileName: attachment.filename,
          fileUrl: `/uploads/${attachment.filename}`, // Placeholder
          fileSize: attachment.content.length,
          mimeType: "application/pdf",
          ocrText: `Received from ${fromEmail}: ${subject}`,
          confidence: 0.7,
          requiresApproval: true,
        },
      })
    }

    return { success: true, processed: attachments.length }
  } catch (error) {
    console.error("Error processing receipt email:", error)
    throw error
  }
}

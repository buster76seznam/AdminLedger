import { prisma } from "@/lib/prisma"
import { extractDocumentData, categorizeTransaction } from "@/lib/ai/ai-service"
import { checkUsageLimits, recordAIUsage } from "@/lib/services/usage-guard.service"

export async function createDocument(data: {
  organizationId: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  ocrText?: string
  type?: string
}) {
  try {
    const document = await prisma.document.create({
      data: {
        organizationId: data.organizationId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        ocrText: data.ocrText,
        type: (data.type as any) || "OTHER",
        status: "PENDING",
      },
    })

    return document
  } catch (error) {
    console.error("Error creating document:", error)
    throw error
  }
}

export async function processDocument(documentId: string, userId?: string) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    })

    if (!document) {
      throw new Error("Document not found")
    }

    // Update status to processing
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "PROCESSING" },
    })

    // Check usage limits before processing
    const usageCheck = await checkUsageLimits(document.organizationId, 0.05) // Estimate $0.05 for extraction
    if (!usageCheck.allowed) {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: "PENDING" },
      })
      throw new Error(usageCheck.reason || "Usage limit reached")
    }

    // Extract data using AI with vision capabilities
    const extractionResult = await extractDocumentData(
      document.fileUrl,
      document.mimeType,
      document.type
    )

    // Record AI usage
    await recordAIUsage({
      organizationId: document.organizationId,
      userId,
      taskType: "document_extraction",
      modelUsed: extractionResult.usage.modelUsed,
      tokensUsed: extractionResult.usage.tokensUsed,
      costUsd: extractionResult.usage.costUsd,
      confidence: extractionResult.result.confidence,
      metadata: {
        documentId,
        documentType: document.type,
        fallbackUsed: extractionResult.fallbackUsed,
      },
    })

    // Save extracted data
    await prisma.document.update({
      where: { id: documentId },
      data: {
        extractedData: extractionResult.result as any,
        confidence: extractionResult.result.confidence,
        status: "EXTRACTED",
      },
    })

    // Create document fields
    if (extractionResult.result) {
      const fields = [
        { fieldName: "vendor", fieldValue: extractionResult.result.vendor, confidence: extractionResult.result.confidence, source: "ai" },
        { fieldName: "date", fieldValue: extractionResult.result.date, confidence: extractionResult.result.confidence, source: "ai" },
        { fieldName: "amount", fieldValue: extractionResult.result.amount?.toString(), confidence: extractionResult.result.confidence, source: "ai" },
        { fieldName: "currency", fieldValue: extractionResult.result.currency, confidence: 1.0, source: "ai" },
        { fieldName: "tax", fieldValue: extractionResult.result.tax?.toString(), confidence: extractionResult.result.confidence, source: "ai" },
        { fieldName: "dueDate", fieldValue: extractionResult.result.dueDate, confidence: extractionResult.result.confidence, source: "ai" },
      ].filter((f) => f.fieldValue)

      await prisma.documentField.createMany({
        data: fields.map((field) => ({
          documentId,
          ...field,
        })),
      })
    }

    return await prisma.document.findUnique({
      where: { id: documentId },
      include: { fields: true },
    })
  } catch (error) {
    console.error("Error processing document:", error)
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "PENDING" },
    })
    throw error
  }
}

export async function getDocuments(organizationId: string) {
  try {
    const documents = await prisma.document.findMany({
      where: { organizationId },
      include: { fields: true },
      orderBy: { createdAt: "desc" },
    })

    return documents
  } catch (error) {
    console.error("Error fetching documents:", error)
    throw error
  }
}

export async function getDocument(documentId: string) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { fields: true, contact: true },
    })

    return document
  } catch (error) {
    console.error("Error fetching document:", error)
    throw error
  }
}

export async function updateDocument(
  documentId: string,
  data: {
    status?: string
    reviewedAt?: Date
    reviewedBy?: string
    extractedData?: any
  }
) {
  try {
    const document = await prisma.document.update({
      where: { id: documentId },
      data,
    })

    return document
  } catch (error) {
    console.error("Error updating document:", error)
    throw error
  }
}

export async function updateDocumentField(
  fieldId: string,
  fieldValue: string,
  source: string = "manual"
) {
  try {
    const field = await prisma.documentField.update({
      where: { id: fieldId },
      data: { fieldValue, source },
    })

    return field
  } catch (error) {
    console.error("Error updating document field:", error)
    throw error
  }
}

export async function deleteDocument(documentId: string) {
  try {
    await prisma.document.delete({
      where: { id: documentId },
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting document:", error)
    throw error
  }
}

export async function approveDocument(
  documentId: string,
  userId: string,
  organizationId: string
) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { fields: true },
    })

    if (!document) {
      throw new Error("Document not found")
    }

    if (document.status !== "EXTRACTED" && document.status !== "REVIEWED") {
      throw new Error("Document must be extracted or reviewed before approval")
    }

    // Get extracted data
    const extractedData = document.extractedData as any
    if (!extractedData) {
      throw new Error("No extracted data found")
    }

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        organizationId,
        documentId,
        type: "EXPENSE",
        amount: extractedData.amount || 0,
        currency: extractedData.currency || "USD",
        date: extractedData.date ? new Date(extractedData.date) : new Date(),
        category: "Uncategorized",
        description: extractedData.vendor ? `Invoice from ${extractedData.vendor}` : document.fileName,
        vendor: extractedData.vendor,
        status: "UNCATEGORIZED",
        confidence: document.confidence,
        requiresApproval: false, // Already approved by user
        approvedAt: new Date(),
        approvedBy: userId,
      },
    })

    // Update document status
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        approvedBy: userId,
        requiresApproval: false,
      },
    })

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId,
        entityType: "Document",
        entityId: documentId,
        action: "APPROVED",
        changes: {
          status: "EXTRACTED -> APPROVED",
          transactionCreated: transaction.id,
        },
        newValue: {
          confidence: document.confidence,
          vendor: extractedData.vendor,
          amount: extractedData.amount,
        },
        source: "manual",
      },
    })

    return { success: true, transactionId: transaction.id }
  } catch (error) {
    console.error("Error approving document:", error)
    throw error
  }
}

export async function rejectDocument(
  documentId: string,
  userId: string,
  organizationId: string,
  reason?: string
) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    })

    if (!document) {
      throw new Error("Document not found")
    }

    // Update document status
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewedBy: userId,
      },
    })

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId,
        entityType: "Document",
        entityId: documentId,
        action: "REJECTED",
        changes: {
          status: document.status + " -> REJECTED",
          reason,
        },
        source: "manual",
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error rejecting document:", error)
    throw error
  }
}

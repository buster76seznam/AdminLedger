import { prisma } from "@/lib/prisma"
import { extractDocumentData } from "@/lib/ai/openai"

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

export async function processDocument(documentId: string) {
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

    // Extract data using AI if OCR text is available
    if (document.ocrText) {
      const extractedData = await extractDocumentData(
        document.ocrText,
        document.type
      )

      // Save extracted data
      await prisma.document.update({
        where: { id: documentId },
        data: {
          extractedData: extractedData as any,
          status: "EXTRACTED",
        },
      })

      // Create document fields
      if (extractedData) {
        const fields = [
          { fieldName: "vendor", fieldValue: extractedData.vendor, source: "ai" },
          { fieldName: "date", fieldValue: extractedData.date, source: "ai" },
          { fieldName: "amount", fieldValue: extractedData.amount?.toString(), source: "ai" },
          { fieldName: "currency", fieldValue: extractedData.currency, source: "ai" },
          { fieldName: "tax", fieldValue: extractedData.tax?.toString(), source: "ai" },
          { fieldName: "dueDate", fieldValue: extractedData.dueDate, source: "ai" },
        ].filter((f) => f.fieldValue)

        await prisma.documentField.createMany({
          data: fields.map((field) => ({
            documentId,
            ...field,
          })),
        })
      }
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

import { prisma } from "@/lib/prisma"
import { logAuditEvent } from "./audit.service"

export async function approveTransaction(transactionId: string, userId: string) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    })

    if (!transaction) {
      throw new Error("Transaction not found")
    }

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: "CATEGORIZED",
        approvedAt: new Date(),
        approvedBy: userId,
      },
    })

    // Log approval
    await logAuditEvent({
      organizationId: transaction.organizationId,
      userId,
      entityType: "Transaction",
      entityId: transactionId,
      action: "APPROVE",
      oldValue: { status: transaction.status },
      newValue: { status: "CATEGORIZED" },
      source: "manual",
    })

    return updated
  } catch (error) {
    console.error("Approval error:", error)
    throw error
  }
}

export async function rejectTransaction(transactionId: string, userId: string, reason?: string) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    })

    if (!transaction) {
      throw new Error("Transaction not found")
    }

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: "REJECTED",
        approvedAt: new Date(),
        approvedBy: userId,
      },
    })

    // Log rejection
    await logAuditEvent({
      organizationId: transaction.organizationId,
      userId,
      entityType: "Transaction",
      entityId: transactionId,
      action: "REJECT",
      oldValue: { status: transaction.status },
      newValue: { status: "REJECTED", reason },
      source: "manual",
    })

    return updated
  } catch (error) {
    console.error("Rejection error:", error)
    throw error
  }
}

export async function approveDocument(documentId: string, userId: string) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    })

    if (!document) {
      throw new Error("Document not found")
    }

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        approvedBy: userId,
      },
    })

    // Log approval
    await logAuditEvent({
      organizationId: document.organizationId,
      userId,
      entityType: "Document",
      entityId: documentId,
      action: "APPROVE",
      oldValue: { status: document.status },
      newValue: { status: "APPROVED" },
      source: "manual",
    })

    return updated
  } catch (error) {
    console.error("Document approval error:", error)
    throw error
  }
}

export async function rejectDocument(documentId: string, userId: string, reason?: string) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    })

    if (!document) {
      throw new Error("Document not found")
    }

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "REJECTED",
        approvedAt: new Date(),
        approvedBy: userId,
      },
    })

    // Log rejection
    await logAuditEvent({
      organizationId: document.organizationId,
      userId,
      entityType: "Document",
      entityId: documentId,
      action: "REJECT",
      oldValue: { status: document.status },
      newValue: { status: "REJECTED", reason },
      source: "manual",
    })

    return updated
  } catch (error) {
    console.error("Document rejection error:", error)
    throw error
  }
}

export async function getPendingApprovals(organizationId: string) {
  try {
    const pendingTransactions = await prisma.transaction.findMany({
      where: {
        organizationId,
        requiresApproval: true,
        status: { in: ["UNCATEGORIZED", "PENDING"] },
      },
      include: { document: true },
      orderBy: { createdAt: "desc" },
    })

    const pendingDocuments = await prisma.document.findMany({
      where: {
        organizationId,
        requiresApproval: true,
        status: { in: ["EXTRACTED", "PENDING"] },
      },
      orderBy: { createdAt: "desc" },
    })

    return {
      transactions: pendingTransactions,
      documents: pendingDocuments,
    }
  } catch (error) {
    console.error("Get pending approvals error:", error)
    return { transactions: [], documents: [] }
  }
}

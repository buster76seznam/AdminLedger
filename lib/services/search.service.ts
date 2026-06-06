import { prisma } from "@/lib/prisma"

export interface SearchResult {
  type: "document" | "transaction" | "invoice" | "contact" | "task" | "message"
  id: string
  title: string
  description: string
  url: string
  relevance: number
}

export async function smartSearch(
  organizationId: string,
  query: string,
  filters?: {
    type?: string[]
    dateFrom?: Date
    dateTo?: Date
  }
): Promise<SearchResult[]> {
  try {
    const results: SearchResult[] = []
    const searchQuery = query.toLowerCase()

    // Search documents
    if (!filters?.type || filters.type.includes("document")) {
      const documents = await prisma.document.findMany({
        where: {
          organizationId,
          OR: [
            { fileName: { contains: searchQuery, mode: "insensitive" } },
            { description: { contains: searchQuery, mode: "insensitive" } },
          ],
          ...(filters?.dateFrom || filters?.dateTo ? {
            createdAt: {
              ...(filters.dateFrom && { gte: filters.dateFrom }),
              ...(filters.dateTo && { lte: filters.dateTo }),
            },
          } : {}),
        },
        take: 10,
      })

      documents.forEach((doc: any) => {
        results.push({
          type: "document",
          id: doc.id,
          title: doc.fileName,
          description: doc.type,
          url: `/documents/${doc.id}`,
          relevance: calculateRelevance(doc.fileName, query),
        })
      })
    }

    // Search transactions
    if (!filters?.type || filters.type.includes("transaction")) {
      const transactions = await prisma.transaction.findMany({
        where: {
          organizationId,
          OR: [
            { description: { contains: searchQuery, mode: "insensitive" } },
            { vendor: { contains: searchQuery, mode: "insensitive" } },
            { category: { contains: searchQuery, mode: "insensitive" } },
          ],
          ...(filters?.dateFrom || filters?.dateTo ? {
            date: {
              ...(filters.dateFrom && { gte: filters.dateFrom }),
              ...(filters.dateTo && { lte: filters.dateTo }),
            },
          } : {}),
        },
        take: 10,
      })

      transactions.forEach((txn: any) => {
        results.push({
          type: "transaction",
          id: txn.id,
          title: `$${txn.amount.toFixed(2)} - ${txn.vendor}`,
          description: txn.description || "",
          url: `/transactions`,
          relevance: calculateRelevance(txn.description || "", query),
        })
      })
    }

    // Search invoices
    if (!filters?.type || filters.type.includes("invoice")) {
      const invoices = await prisma.invoice.findMany({
        where: {
          organizationId,
          OR: [
            { invoiceNumber: { contains: searchQuery, mode: "insensitive" } },
            { clientName: { contains: searchQuery, mode: "insensitive" } },
          ],
          ...(filters?.dateFrom || filters?.dateTo ? {
            dueDate: {
              ...(filters.dateFrom && { gte: filters.dateFrom }),
              ...(filters.dateTo && { lte: filters.dateTo }),
            },
          } : {}),
        },
        take: 10,
      })

      invoices.forEach((invoice: any) => {
        results.push({
          type: "invoice",
          id: invoice.id,
          title: `${invoice.invoiceNumber} - ${invoice.clientName}`,
          description: `$${invoice.amount.toFixed(2)}`,
          url: `/invoices`,
          relevance: calculateRelevance(invoice.clientName, query),
        })
      })
    }

    // Search contacts
    if (!filters?.type || filters.type.includes("contact")) {
      const contacts = await prisma.contact.findMany({
        where: {
          organizationId,
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" } },
            { email: { contains: searchQuery, mode: "insensitive" } },
            { company: { contains: searchQuery, mode: "insensitive" } },
          ],
        },
        take: 10,
      })

      contacts.forEach((contact: any) => {
        results.push({
          type: "contact",
          id: contact.id,
          title: contact.name,
          description: contact.company || contact.email,
          url: `/contacts`,
          relevance: calculateRelevance(contact.name, query),
        })
      })
    }

    // Search tasks
    if (!filters?.type || filters.type.includes("task")) {
      const tasks = await prisma.task.findMany({
        where: {
          organizationId,
          OR: [
            { title: { contains: searchQuery, mode: "insensitive" } },
            { description: { contains: searchQuery, mode: "insensitive" } },
          ],
          ...(filters?.dateFrom || filters?.dateTo ? {
            dueDate: {
              ...(filters.dateFrom && { gte: filters.dateFrom }),
              ...(filters.dateTo && { lte: filters.dateTo }),
            },
          } : {}),
        },
        take: 10,
      })

      tasks.forEach((task: any) => {
        results.push({
          type: "task",
          id: task.id,
          title: task.title,
          description: task.description || "",
          url: `/tasks`,
          relevance: calculateRelevance(task.title, query),
        })
      })
    }

    // Search messages
    if (!filters?.type || filters.type.includes("message")) {
      const messages = await prisma.message.findMany({
        where: {
          organizationId,
          OR: [
            { subject: { contains: searchQuery, mode: "insensitive" } },
            { body: { contains: searchQuery, mode: "insensitive" } },
          ],
          ...(filters?.dateFrom || filters?.dateTo ? {
            createdAt: {
              ...(filters.dateFrom && { gte: filters.dateFrom }),
              ...(filters.dateTo && { lte: filters.dateTo }),
            },
          } : {}),
        },
        take: 10,
      })

      messages.forEach((message: any) => {
        results.push({
          type: "message",
          id: message.id,
          title: message.subject,
          description: message.body.substring(0, 100),
          url: `/messages`,
          relevance: calculateRelevance(message.subject, query),
        })
      })
    }

    // Sort by relevance and return top results
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 50)
  } catch (error) {
    console.error("Search error:", error)
    return []
  }
}

function calculateRelevance(text: string, query: string): number {
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  
  if (lowerText === lowerQuery) return 1.0
  if (lowerText.startsWith(lowerQuery)) return 0.9
  if (lowerText.includes(lowerQuery)) return 0.7
  
  const words = lowerQuery.split(" ")
  const matchCount = words.filter((word) => lowerText.includes(word)).length
  return matchCount / words.length
}

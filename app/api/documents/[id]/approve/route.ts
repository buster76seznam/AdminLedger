import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { approveDocument, rejectDocument } from "@/lib/services/document.service"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const documentId = params.id

    // Get user's organization
    const membership = await prisma.membership.findFirst({
      where: { userId: session.user.id },
      include: { organization: true },
    })

    if (!membership) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 })
    }

    const body = await request.json()
    const { action, reason } = body

    if (action === "approve") {
      const result = await approveDocument(
        documentId,
        session.user.id,
        membership.organizationId
      )
      return NextResponse.json(result)
    } else if (action === "reject") {
      const result = await rejectDocument(
        documentId,
        session.user.id,
        membership.organizationId,
        reason
      )
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing document approval:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process approval" },
      { status: 500 }
    )
  }
}

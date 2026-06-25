import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createDocument, processDocument } from "@/lib/services/document.service"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const documentType = formData.get("type") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Get user's organization
    const membership = await prisma.membership.findFirst({
      where: { userId: session.user.id },
      include: { organization: true },
    })

    if (!membership) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 })
    }

    // In production, you would upload to S3 or similar storage
    // For now, we'll just use a placeholder URL
    const fileUrl = `/uploads/${file.name}`
    const fileSize = file.size
    const mimeType = file.type

    // Create document record
    const document = await createDocument({
      organizationId: membership.organizationId,
      fileName: file.name,
      fileUrl,
      fileSize,
      mimeType,
      type: documentType || "OTHER",
    })

    // Process document asynchronously (in production, use a job queue)
    // For now, we'll process it synchronously
    try {
      await processDocument(document.id, session.user.id)
    } catch (error) {
      console.error("Error processing document:", error)
      // Don't fail the upload if processing fails
    }

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error("Error uploading document:", error)
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const membership = await prisma.membership.findFirst({
      where: { userId: session.user.id },
      include: { organization: true },
    })

    if (!membership) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 })
    }

    const documents = await prisma.document.findMany({
      where: { organizationId: membership.organizationId },
      include: { fields: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ documents })
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    )
  }
}

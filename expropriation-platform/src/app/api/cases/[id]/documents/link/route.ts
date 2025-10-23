import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { z } from 'zod'

const LinkDocumentSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required')
})

// POST /api/cases/[id]/documents/link - Link existing document to case
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const caseId = params.id
    const body = await request.json()
    const { documentId } = LinkDocumentSchema.parse(body)

    // Get user to check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if case exists and user has access
    const existingCase = await prisma.case.findUnique({
      where: { id: caseId },
      include: { department: true }
    })

    if (!existingCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Check department-based access control
    const role = user.role.name as string
    if (role !== 'SUPER_ADMIN' && existingCase.departmentId !== user.departmentId) {
      return NextResponse.json(
        { error: 'You can only link documents to cases in your department' },
        { status: 403 }
      )
    }

    // Check if document exists and user has access
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
      include: { uploadedBy: true }
    })

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check if document is already linked to this case
    const existingLink = await prisma.caseDocument.findUnique({
      where: {
        caseId_documentId: {
          caseId,
          documentId
        }
      }
    })

    if (existingLink) {
      return NextResponse.json(
        { error: 'Document is already linked to this case' },
        { status: 409 }
      )
    }

    // Create the link between case and document
    const caseDocument = await prisma.caseDocument.create({
      data: {
        caseId,
        documentId,
        linkedById: user.id,
        linkedAt: new Date()
      },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            fileName: true,
            documentType: true,
            securityLevel: true
          }
        }
      }
    })

    // Log activity
    await logActivity({
      userId: user.id,
      action: 'LINKED',
      entityType: 'case_document',
      entityId: caseDocument.id,
      description: `Linked document "${existingDocument.title}" to case ${existingCase.fileNumber}`,
      metadata: {
        caseId,
        documentId,
        caseFileNumber: existingCase.fileNumber,
        documentTitle: existingDocument.title
      }
    })

    return NextResponse.json({
      message: 'Document linked successfully',
      caseDocument
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error linking document to case:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
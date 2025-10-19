import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { DocumentType, DocumentCategory, DocumentStatus, DocumentSecurityLevel } from '@prisma/client';

// Validation schemas
const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  documentType: z.nativeEnum(DocumentType),
  category: z.nativeEnum(DocumentCategory),
  securityLevel: z.nativeEnum(DocumentSecurityLevel).default(DocumentSecurityLevel.INTERNAL),
  caseId: z.string().optional(),
  tags: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  customFields: z.record(z.any()).optional(),
  retentionPeriod: z.number().optional(),
  expiresAt: z.string().datetime().optional(),
});

const queryDocumentsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  documentType: z.nativeEnum(DocumentType).optional(),
  category: z.nativeEnum(DocumentCategory).optional(),
  status: z.nativeEnum(DocumentStatus).optional(),
  securityLevel: z.nativeEnum(DocumentSecurityLevel).optional(),
  caseId: z.string().optional(),
  uploadedById: z.string().optional(),
  tags: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'fileSize', 'downloadCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// File upload configuration
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_MIME_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/tiff',
  // Text files
  'text/plain',
  'text/csv',
  'text/html',
  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
];

// Storage configuration
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'documents');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Generate unique file path
function generateFilePath(originalName: string): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  return `${timestamp}-${random}-${name}${ext}`;
}

// Calculate file hash
async function calculateFileHash(filePath: string): Promise<string> {
  const fileBuffer = await fs.readFile(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

// Create directory for date-based organization
async function createDateDirectory(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const dateDir = path.join(UPLOAD_DIR, String(year), month, day);
  await fs.mkdir(dateDir, { recursive: true });

  return dateDir;
}

// GET /api/documents - List documents with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = queryDocumentsSchema.parse(Object.fromEntries(searchParams));

    // Build where clause
    const where: any = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { fileName: { contains: query.search, mode: 'insensitive' } },
        { contentText: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.documentType) where.documentType = query.documentType;
    if (query.category) where.category = query.category;
    if (query.status) where.status = query.status;
    if (query.securityLevel) where.securityLevel = query.securityLevel;
    if (query.caseId) where.caseId = query.caseId;
    if (query.uploadedById) where.uploadedById = query.uploadedById;
    if (query.tags) {
      where.tags = { contains: query.tags, mode: 'insensitive' };
    }

    // Date range filtering
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }

    // Skip deleted/archived documents unless specifically requested
    if (query.status !== 'ARCHIVED') {
      where.OR = [
        { status: { not: 'ARCHIVED' } },
        ...(where.OR ? [where.OR] : [])
      ];
    }

    // Get total count
    const total = await prisma.document.count({ where });

    // Get documents with pagination
    const documents = await prisma.document.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        case: {
          select: {
            id: true,
            fileNumber: true,
            title: true,
          },
        },
        tagsRelations: {
          select: {
            id: true,
            tag: true,
            color: true,
          },
        },
        _count: {
          select: {
            versions: true,
            history: true,
            signatures: true,
          },
        },
      },
      orderBy: { [query.sortBy]: query.sortOrder },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    // Format documents
    const formattedDocuments = documents.map(doc => ({
      ...doc,
      uploadedBy: {
        ...doc.uploadedBy,
        fullName: `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}`,
      },
      tags: doc.tagsRelations.map(tag => ({
        id: tag.id,
        tag: tag.tag,
        color: tag.color,
      })),
      fileSizeFormatted: formatFileSize(doc.fileSize),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      documents: formattedDocuments,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Upload and create a new document
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentData = JSON.parse(formData.get('documentData') as string);

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed size (100MB)' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    // Validate document data
    const validatedData = createDocumentSchema.parse(documentData);

    // Ensure upload directory exists
    await ensureUploadDir();
    const dateDir = await createDateDirectory();

    // Generate file path and save file
    const fileName = generateFilePath(file.name);
    const filePath = path.join(dateDir, fileName);

    // Save file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Calculate file hash
    const fileHash = await calculateFileHash(filePath);

    // Extract text content for indexing (simplified version)
    let contentText = '';
    if (file.type === 'text/plain') {
      contentText = buffer.toString('utf-8');
    }
    // TODO: Add text extraction for PDF, DOCX, etc.

    // Create document record
    const document = await prisma.document.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        fileName: fileName,
        originalFileName: file.name,
        filePath: path.relative(process.cwd(), filePath),
        fileSize: file.size,
        mimeType: file.type,
        fileHash,
        documentType: validatedData.documentType,
        category: validatedData.category,
        status: DocumentStatus.DRAFT,
        securityLevel: validatedData.securityLevel,
        version: 1,
        isLatest: true,
        isDraft: true,
        caseId: validatedData.caseId || null,
        uploadedById: session.user.id,
        tags: validatedData.tags,
        metadata: validatedData.metadata || {},
        customFields: validatedData.customFields || {},
        retentionPeriod: validatedData.retentionPeriod,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        contentText,
        isIndexed: contentText.length > 0,
        indexedAt: contentText.length > 0 ? new Date() : null,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        case: {
          select: {
            id: true,
            fileNumber: true,
            title: true,
          },
        },
      },
    });

    // Create initial document history entry
    await prisma.documentHistory.create({
      data: {
        documentId: document.id,
        action: 'UPLOADED',
        description: `Document uploaded: ${file.name}`,
        userId: session.user.id,
        fileSize: file.size,
        fileName: file.name,
        filePath: document.filePath,
        metadata: {
          originalFileName: file.name,
          mimeType: file.type,
          uploadTimestamp: new Date().toISOString(),
        },
      },
    });

    // Create tags if provided
    if (validatedData.tags) {
      const tags = validatedData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      for (const tag of tags) {
        await prisma.documentTag.create({
          data: {
            documentId: document.id,
            tag,
          },
        });
      }
    }

    // Format response
    const response = {
      ...document,
      uploadedBy: {
        ...document.uploadedBy,
        fullName: `${document.uploadedBy.firstName} ${document.uploadedBy.lastName}`,
      },
      fileSizeFormatted: formatFileSize(document.fileSize),
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
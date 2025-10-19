import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { ActivityType } from '@prisma/client';

const revokeSignatureSchema = z.object({
  reason: z.string().min(1, 'Revocation reason is required'),
});

// POST /api/signatures/[id]/revoke - Revoke a digital signature
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = revokeSignatureSchema.parse(body);

    // Check if signature exists and user has permission
    const signature = await prisma.digitalSignature.findUnique({
      where: { id: params.id },
    });

    if (!signature) {
      return NextResponse.json(
        { error: 'Signature not found' },
        { status: 404 }
      );
    }

    // Users can only revoke their own signatures, admins can revoke any
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    });

    const canRevoke =
      signature.userId === session.user.id ||
      user?.role.name === 'SUPER_ADMIN' ||
      user?.role.name === 'DEPARTMENT_ADMIN';

    if (!canRevoke) {
      return NextResponse.json(
        { error: 'Insufficient permissions to revoke this signature' },
        { status: 403 }
      );
    }

    if (!signature.isActive) {
      return NextResponse.json(
        { error: 'Signature is already revoked' },
        { status: 400 }
      );
    }

    // Revoke the signature
    const revokedSignature = await prisma.digitalSignature.update({
      where: { id: params.id },
      data: {
        isActive: false,
        revokedAt: new Date(),
        revokedBy: session.user.id,
        revokedReason: validatedData.reason,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: ActivityType.DELETED,
        entityType: 'digital_signature',
        entityId: signature.id,
        description: `Digital signature revoked: ${validatedData.reason}`,
        userId: session.user.id,
        metadata: {
          signatureId: signature.id,
          signatureType: signature.signatureType,
          entityType: signature.entityType,
          entityId: signature.entityId,
          revocationReason: validatedData.reason,
        },
      },
    });

    return NextResponse.json({
      message: 'Signature revoked successfully',
      signature: {
        id: revokedSignature.id,
        revokedAt: revokedSignature.revokedAt,
        revokedReason: revokedSignature.revokedReason,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error revoking digital signature:', error);
    return NextResponse.json(
      { error: 'Failed to revoke digital signature' },
      { status: 500 }
    );
  }
}
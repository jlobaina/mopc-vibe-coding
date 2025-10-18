import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logActivity } from '@/lib/activity-logger';

// Schema for role creation
const createRoleSchema = z.object({
  name: z.string().min(1, 'El nombre del rol es requerido'),
  description: z.string().optional(),
  permissions: z.record(z.boolean()).default({}),
  isActive: z.boolean().default(true),
});

// Schema for role updates
const updateRoleSchema = createRoleSchema.partial();

// GET /api/roles - List roles with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const includeUserCount = searchParams.get('includeUserCount') === 'true';

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    // Get roles with optional user count
    const roles = await prisma.role.findMany({
      where,
      include: includeUserCount ? {
        _count: {
          select: {
            users: {
              where: { isActive: true, deletedAt: null },
            },
          },
        },
      } : false,
      orderBy: { [sortBy]: sortOrder },
    });

    // Format response
    const sanitizedRoles = roles.map((role) => ({
      ...role,
      userCount: includeUserCount ? role._count?.users || 0 : undefined,
      _count: undefined, // Remove Prisma count from response
    }));

    return NextResponse.json(sanitizedRoles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Error al obtener roles' },
      { status: 500 }
    );
  }
}

// POST /api/roles - Create a new role
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if user has permission to manage users/roles
    const userPermissions = session.user.permissions as Record<string, boolean>;
    if (!userPermissions?.canManageUsers) {
      return NextResponse.json(
        { error: 'No tiene permisos para crear roles' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createRoleSchema.parse(body);

    // Check if role name already exists
    const existingRole = await prisma.role.findUnique({
      where: { name: validatedData.name },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: 'El nombre del rol ya existe' },
        { status: 400 }
      );
    }

    // Create role
    const role = await prisma.role.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: 'CREATED',
      entityType: 'role',
      entityId: role.id,
      description: `Rol creado: ${role.name}`,
      metadata: {
        roleName: role.name,
        roleDescription: role.description,
        permissions: role.permissions,
      },
    });

    // Remove sensitive data and format response
    const sanitizedRole = {
      ...role,
      userCount: role._count?.users || 0,
      _count: undefined,
    };

    return NextResponse.json(sanitizedRole, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating role:', error);
    return NextResponse.json(
      { error: 'Error al crear rol' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logActivity } from '@/lib/activity-logger';

// Schema for department creation
const createDepartmentSchema = z.object({
  name: z.string().min(1, 'El nombre del departamento es requerido'),
  code: z.string().min(1, 'El código del departamento es requerido'),
  parentId: z.string().optional(),
  description: z.string().optional(),
  headUserId: z.string().optional(),
  contactInfo: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
  location: z.object({
    building: z.string().optional(),
    floor: z.string().optional(),
    office: z.string().optional(),
    coordinates: z.object({
      lat: z.number().optional(),
      lng: z.number().optional(),
    }).optional(),
  }).optional(),
  type: z.string().optional(),
  isActive: z.boolean().default(true),
  userCapacity: z.number().positive().optional(),
  budget: z.number().positive().optional(),
  operatingHours: z.object({
    monday: z.string().optional(),
    tuesday: z.string().optional(),
    wednesday: z.string().optional(),
    thursday: z.string().optional(),
    friday: z.string().optional(),
    saturday: z.string().optional(),
    sunday: z.string().optional(),
  }).optional(),
});

// Schema for department updates
const updateDepartmentSchema = createDepartmentSchema.partial();

// GET /api/departments - List departments with filtering and hierarchy
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');
    const parentId = searchParams.get('parentId');
    const includeHierarchy = searchParams.get('includeHierarchy') === 'true';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    if (parentId) {
      where.parentId = parentId === 'null' ? null : parentId;
    }

    // Get departments with optional hierarchy
    const departments = await prisma.department.findMany({
      where,
      include: {
        parent: {
          select: { id: true, name: true, code: true },
        },
        headUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        children: includeHierarchy ? {
          select: { id: true, name: true, code: true, isActive: true },
          orderBy: { name: 'asc' },
        } : false,
        _count: {
          select: {
            users: {
              where: { isActive: true, deletedAt: null },
            },
            cases: true,
            children: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
    });

    // If hierarchy is requested, build tree structure
    if (includeHierarchy) {
      const buildTree = (items: any[], parentId: string | null = null): any[] => {
        return items
          .filter(item => item.parentId === parentId)
          .map(item => ({
            ...item,
            children: buildTree(items, item.id),
            userCount: item._count.users,
            caseCount: item._count.cases,
            childCount: item._count.children,
            _count: undefined, // Remove Prisma count from response
          }));
      };

      const tree = buildTree(departments);
      return NextResponse.json(tree);
    }

    // Return flat list with counts
    const sanitizedDepartments = departments.map((dept) => ({
      ...dept,
      userCount: dept._count.users,
      caseCount: dept._count.cases,
      childCount: dept._count.children,
      _count: undefined, // Remove Prisma count from response
    }));

    return NextResponse.json(sanitizedDepartments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Error al obtener departamentos' },
      { status: 500 }
    );
  }
}

// POST /api/departments - Create a new department
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if user has permission to manage departments
    const userPermissions = session.user.permissions as Record<string, boolean>;
    if (!userPermissions?.canManageDepartments && !userPermissions?.canManageUsers) {
      return NextResponse.json(
        { error: 'No tiene permisos para crear departamentos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createDepartmentSchema.parse(body);

    // Check if department code already exists
    const existingDept = await prisma.department.findUnique({
      where: { code: validatedData.code },
    });

    if (existingDept) {
      return NextResponse.json(
        { error: 'El código de departamento ya existe' },
        { status: 400 }
      );
    }

    // If parentId is provided, validate it exists
    if (validatedData.parentId) {
      const parentDept = await prisma.department.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentDept) {
        return NextResponse.json(
          { error: 'Departamento padre no encontrado' },
          { status: 400 }
        );
      }

      // Prevent circular reference
      if (validatedData.parentId === validatedData.parentId) {
        return NextResponse.json(
          { error: 'Un departamento no puede ser su propio padre' },
          { status: 400 }
        );
      }
    }

    // If headUserId is provided, validate the user exists
    if (validatedData.headUserId) {
      const headUser = await prisma.user.findUnique({
        where: { id: validatedData.headUserId },
      });

      if (!headUser) {
        return NextResponse.json(
          { error: 'Usuario designado como jefe no encontrado' },
          { status: 400 }
        );
      }
    }

    // Create department
    const department = await prisma.department.create({
      data: validatedData,
      include: {
        parent: {
          select: { id: true, name: true, code: true },
        },
        headUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        children: {
          select: { id: true, name: true, code: true, isActive: true },
        },
        _count: {
          select: {
            users: true,
            cases: true,
            children: true,
          },
        },
      },
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: 'CREATED',
      entityType: 'department',
      entityId: department.id,
      description: `Departamento creado: ${department.name}`,
      metadata: {
        departmentName: department.name,
        departmentCode: department.code,
        parentDepartment: department.parent?.name || 'Ninguno',
      },
    });

    // Remove sensitive data and format response
    const sanitizedDepartment = {
      ...department,
      userCount: department._count.users,
      caseCount: department._count.cases,
      childCount: department._count.children,
      _count: undefined,
    };

    return NextResponse.json(sanitizedDepartment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating department:', error);
    return NextResponse.json(
      { error: 'Error al crear departamento' },
      { status: 500 }
    );
  }
}
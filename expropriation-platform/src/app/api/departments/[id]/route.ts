import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logActivity } from '@/lib/activity-logger';

// Schema for department updates
const updateDepartmentSchema = z.object({
  name: z.string().min(1, 'El nombre del departamento es requerido').optional(),
  code: z.string().min(1, 'El código del departamento es requerido').optional(),
  parentId: z.string().nullable().optional(),
  description: z.string().optional(),
  headUserId: z.string().nullable().optional(),
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
  isActive: z.boolean().optional(),
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

// GET /api/departments/[id] - Get specific department
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const department = await prisma.department.findUnique({
      where: { id: params.id },
      include: {
        parent: {
          select: { id: true, name: true, code: true },
        },
        headUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        children: {
          select: { id: true, name: true, code: true, isActive: true },
          orderBy: { name: 'asc' },
        },
        users: {
          where: { isActive: true, deletedAt: null },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: {
              select: { id: true, name: true },
            },
            createdAt: true,
          },
          orderBy: { firstName: 'asc' },
        },
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
    });

    if (!department) {
      return NextResponse.json(
        { error: 'Departamento no encontrado' },
        { status: 404 }
      );
    }

    // Return formatted response
    const sanitizedDepartment = {
      ...department,
      userCount: department._count.users,
      caseCount: department._count.cases,
      childCount: department._count.children,
      _count: undefined,
    };

    return NextResponse.json(sanitizedDepartment);
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json(
      { error: 'Error al obtener departamento' },
      { status: 500 }
    );
  }
}

// PUT /api/departments/[id] - Update department
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if user has permission to manage departments
    const userPermissions = session.user.permissions as Record<string, boolean>;
    if (!userPermissions?.canManageDepartments && !userPermissions?.canManageUsers) {
      return NextResponse.json(
        { error: 'No tiene permisos para actualizar departamentos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateDepartmentSchema.parse(body);

    // Check if department exists
    const existingDept = await prisma.department.findUnique({
      where: { id: params.id },
    });

    if (!existingDept) {
      return NextResponse.json(
        { error: 'Departamento no encontrado' },
        { status: 404 }
      );
    }

    // Check if department code already exists (if being updated)
    if (validatedData.code && validatedData.code !== existingDept.code) {
      const codeExists = await prisma.department.findUnique({
        where: { code: validatedData.code },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: 'El código de departamento ya existe' },
          { status: 400 }
        );
      }
    }

    // Validate parentId if provided
    if (validatedData.parentId !== undefined) {
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
        if (validatedData.parentId === params.id) {
          return NextResponse.json(
            { error: 'Un departamento no puede ser su propio padre' },
            { status: 400 }
          );
        }

        // Prevent creating cycles in hierarchy
        const isDescendant = await checkIsDescendant(validatedData.parentId, params.id);
        if (isDescendant) {
          return NextResponse.json(
            { error: 'No se puede establecer un departamento hijo como padre' },
            { status: 400 }
          );
        }
      }
    }

    // Validate headUserId if provided
    if (validatedData.headUserId !== undefined && validatedData.headUserId) {
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

    // Update department
    const department = await prisma.department.update({
      where: { id: params.id },
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
      action: 'UPDATED',
      entityType: 'department',
      entityId: department.id,
      description: `Departamento actualizado: ${department.name}`,
      metadata: {
        departmentName: department.name,
        departmentCode: department.code,
        previousData: existingDept,
        newData: validatedData,
      },
    });

    // Return formatted response
    const sanitizedDepartment = {
      ...department,
      userCount: department._count.users,
      caseCount: department._count.cases,
      childCount: department._count.children,
      _count: undefined,
    };

    return NextResponse.json(sanitizedDepartment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: 'Error al actualizar departamento' },
      { status: 500 }
    );
  }
}

// DELETE /api/departments/[id] - Delete department
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if user has permission to manage departments
    const userPermissions = session.user.permissions as Record<string, boolean>;
    if (!userPermissions?.canManageDepartments && !userPermissions?.canManageUsers) {
      return NextResponse.json(
        { error: 'No tiene permisos para eliminar departamentos' },
        { status: 403 }
      );
    }

    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id: params.id },
      include: {
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
    });

    if (!department) {
      return NextResponse.json(
        { error: 'Departamento no encontrado' },
        { status: 404 }
      );
    }

    // Prevent deletion if department has users or cases
    if (department._count.users > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un departamento con usuarios activos' },
        { status: 400 }
      );
    }

    if (department._count.cases > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un departamento con casos asignados' },
        { status: 400 }
      );
    }

    if (department._count.children > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un departamento con departamentos hijos' },
        { status: 400 }
      );
    }

    // Delete department
    await prisma.department.delete({
      where: { id: params.id },
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: 'DELETED',
      entityType: 'department',
      entityId: params.id,
      description: `Departamento eliminado: ${department.name}`,
      metadata: {
        departmentName: department.name,
        departmentCode: department.code,
      },
    });

    return NextResponse.json({ message: 'Departamento eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { error: 'Error al eliminar departamento' },
      { status: 500 }
    );
  }
}

// Helper function to check if a department is a descendant of another
async function checkIsDescendant(potentialParentId: string, currentId: string): Promise<boolean> {
  const department = await prisma.department.findUnique({
    where: { id: potentialParentId },
    select: { parentId: true },
  });

  if (!department) {
    return false;
  }

  if (department.parentId === currentId) {
    return true;
  }

  if (department.parentId) {
    return await checkIsDescendant(department.parentId, currentId);
  }

  return false;
}
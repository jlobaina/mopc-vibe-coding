import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/cases/generate-number - Generate next case number
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user to check permissions and get department info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        role: true,
        department: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has permission to create cases
    const role = user.role.name as string
    if (!['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'ANALYST', 'SUPERVISOR'].includes(role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to generate case numbers' },
        { status: 403 }
      )
    }

    // Get current year
    const currentYear = new Date().getFullYear()

    // Count existing cases for this year and department
    const count = await prisma.case.count({
      where: {
        createdAt: {
          gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`)
        },
        ...(role !== 'SUPER_ADMIN' && { departmentId: user.departmentId })
      }
    })

    // Generate case number format: EXP-YYYY-DEPT-NNNN
    const departmentCode = role === 'SUPER_ADMIN' ? 'MOPC' : (user.department?.code || 'GEN')
    const sequence = (count + 1).toString().padStart(4, '0')
    const fileNumber = `EXP-${currentYear}-${departmentCode}-${sequence}`

    return NextResponse.json({
      fileNumber,
      sequence: count + 1,
      year: currentYear,
      department: departmentCode
    })
  } catch (error) {
    console.error('Error generating case number:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
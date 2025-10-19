import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.gte = new Date(startDate);
      dateFilter.lte = new Date(endDate);
    } else if (startDate) {
      dateFilter.gte = new Date(startDate);
    } else if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Build department filter
    const departmentFilter = departmentId ? { departmentId } : {};

    // Get overall statistics
    const [
      totalCases,
      activeCases,
      completedCases,
      pendingCases,
      inProgressCases,
      overdueCases,
      totalUsers,
      activeUsers,
      totalDepartments,
      avgCompletionTime,
      casesThisMonth,
      casesLastMonth
    ] = await Promise.all([
      // Total cases
      prisma.case.count({
        where: {
          ...departmentFilter,
          deletedAt: null,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        }
      }),

      // Active cases (not completed, archived, suspended, or cancelled)
      prisma.case.count({
        where: {
          ...departmentFilter,
          deletedAt: null,
          status: { notIn: ['COMPLETADO', 'ARCHIVED', 'SUSPENDED', 'CANCELLED'] },
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        }
      }),

      // Completed cases
      prisma.case.count({
        where: {
          ...departmentFilter,
          deletedAt: null,
          status: 'COMPLETADO',
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        }
      }),

      // Pending cases
      prisma.case.count({
        where: {
          ...departmentFilter,
          deletedAt: null,
          status: 'PENDIENTE',
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        }
      }),

      // In progress cases
      prisma.case.count({
        where: {
          ...departmentFilter,
          deletedAt: null,
          status: 'EN_PROGRESO',
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        }
      }),

      // Overdue cases (cases past expected end date)
      prisma.case.count({
        where: {
          ...departmentFilter,
          deletedAt: null,
          expectedEndDate: { lt: new Date() },
          status: { notIn: ['COMPLETADO', 'ARCHIVED', 'CANCELLED'] },
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        }
      }),

      // Total users
      prisma.user.count({
        where: {
          deletedAt: null,
          isActive: true,
          ...(departmentId && { departmentId })
        }
      }),

      // Active users (logged in within last 30 days)
      prisma.user.count({
        where: {
          deletedAt: null,
          isActive: true,
          lastLoginAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          ...(departmentId && { departmentId })
        }
      }),

      // Total departments
      prisma.department.count({
        where: { isActive: true }
      }),

      // Average completion time (in days)
      prisma.case.findMany({
        where: {
          ...departmentFilter,
          deletedAt: null,
          status: 'COMPLETADO',
          actualEndDate: { not: null },
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        },
        select: {
          startDate: true,
          actualEndDate: true
        }
      }).then(cases => {
        if (cases.length === 0) return 0;

        const totalDays = cases.reduce((sum, case_) => {
          if (case_.actualEndDate && case_.startDate) {
            const days = Math.ceil(
              (new Date(case_.actualEndDate).getTime() - new Date(case_.startDate).getTime()) /
              (1000 * 60 * 60 * 24)
            );
            return sum + days;
          }
          return sum;
        }, 0);

        return Math.round(totalDays / cases.length);
      }),

      // Cases this month
      prisma.case.count({
        where: {
          ...departmentFilter,
          deletedAt: null,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),

      // Cases last month
      prisma.case.count({
        where: {
          ...departmentFilter,
          deletedAt: null,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    // Calculate trends
    const monthlyTrend = casesThisMonth - casesLastMonth;
    const monthlyTrendPercent = casesLastMonth > 0 ? (monthlyTrend / casesLastMonth) * 100 : 0;

    // Get priority distribution
    const priorityDistribution = await prisma.case.groupBy({
      by: ['priority'],
      where: {
        ...departmentFilter,
        deletedAt: null,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
      },
      _count: true
    });

    // Get status distribution
    const statusDistribution = await prisma.case.groupBy({
      by: ['status'],
      where: {
        ...departmentFilter,
        deletedAt: null,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
      },
      _count: true
    });

    // Get stage distribution
    const stageDistribution = await prisma.case.groupBy({
      by: ['currentStage'],
      where: {
        ...departmentFilter,
        deletedAt: null,
        status: { notIn: ['COMPLETADO', 'ARCHIVED', 'CANCELLED'] },
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
      },
      _count: true
    });

    const statistics = {
      overview: {
        totalCases,
        activeCases,
        completedCases,
        pendingCases,
        inProgressCases,
        overdueCases,
        totalUsers,
        activeUsers,
        totalDepartments,
        avgCompletionTime: avgCompletionTime, // Calculated average
        monthlyTrend,
        monthlyTrendPercent: Number(monthlyTrendPercent.toFixed(1))
      },
      distributions: {
        priority: priorityDistribution.map(item => ({
          name: item.priority,
          value: item._count
        })),
        status: statusDistribution.map(item => ({
          name: item.status,
          value: item._count
        })),
        stage: stageDistribution.map(item => ({
          name: item.currentStage,
          value: item._count
        }))
      }
    };

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
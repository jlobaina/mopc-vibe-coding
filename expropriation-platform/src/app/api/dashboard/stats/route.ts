import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface DashboardStats {
  totalCases: number
  activeCases: number
  completedCases: number
  pendingCases: number
  inProgressCases: number
  overdueCases: number
  totalUsers: number
  activeUsers: number
  totalDepartments: number
  avgCompletionTime: number
  casesThisMonth: number
  casesLastMonth: number
  monthlyTrend: number
  monthlyTrendPercent: number
}

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

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Optimized single query approach for cases statistics
    const caseStats = await prisma.case.groupBy({
      by: ['status', 'priority', 'currentStage'],
      where: {
        ...departmentFilter,
        deletedAt: null,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
      },
      _count: true,
    });

    // Get completion time data in a single query
    const completionData = await prisma.case.findMany({
      where: {
        ...departmentFilter,
        deletedAt: null,
        status: 'COMPLETADO',
        actualEndDate: { not: null },
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
      },
      select: {
        startDate: true,
        actualEndDate: true,
        expectedEndDate: true
      }
    });

    // Get overdue cases data separately since it requires date comparison
    const overdueCasesCount = await prisma.case.count({
      where: {
        ...departmentFilter,
        deletedAt: null,
        status: { notIn: ['COMPLETADO', 'ARCHIVED', 'CANCELLED'] },
        expectedEndDate: { lt: now }
      }
    });

    // Get monthly data in parallel with other queries
    const [monthlyData, userStats, totalDepartments] = await Promise.all([
      // Monthly cases data
      prisma.case.groupBy({
        by: ['createdAt'],
        where: {
          ...departmentFilter,
          deletedAt: null,
          createdAt: {
            gte: lastMonthStart
          }
        },
        _count: true,
        _min: { createdAt: true }
      }).then(data => {
        const thisMonth = data.filter(item =>
          item.createdAt && item.createdAt >= thisMonthStart
        ).reduce((sum, item) => sum + item._count, 0);

        const lastMonth = data.filter(item =>
          item.createdAt && item.createdAt >= lastMonthStart && item.createdAt < thisMonthStart
        ).reduce((sum, item) => sum + item._count, 0);

        return { thisMonth, lastMonth };
      }),

      // User statistics
      prisma.user.groupBy({
        by: ['isActive', 'lastLoginAt'],
        where: {
          deletedAt: null,
          ...(departmentId && { departmentId })
        },
        _count: true
      }).then(data => {
        const totalUsers = data
          .filter(item => item.isActive)
          .reduce((sum, item) => sum + item._count, 0);

        const activeUsers = data
          .filter(item => item.isActive && item.lastLoginAt && item.lastLoginAt >= thirtyDaysAgo)
          .reduce((sum, item) => sum + item._count, 0);

        return { totalUsers, activeUsers };
      }),

      // Total departments
      prisma.department.count({
        where: { isActive: true }
      })
    ]);

    // Process case statistics from aggregated data
    const stats: DashboardStats = {
      totalCases: caseStats.reduce((sum, item) => sum + item._count, 0),
      completedCases: caseStats.find(item => item.status === 'COMPLETADO')?._count || 0,
      pendingCases: caseStats.find(item => item.status === 'PENDIENTE')?._count || 0,
      inProgressCases: caseStats.find(item => item.status === 'EN_PROGRESO')?._count || 0,
      activeCases: caseStats
        .filter(item => !['COMPLETADO', 'ARCHIVED', 'SUSPENDED', 'CANCELLED'].includes(item.status))
        .reduce((sum, item) => sum + item._count, 0),
      overdueCases: overdueCasesCount,
      totalUsers: userStats.totalUsers,
      activeUsers: userStats.activeUsers,
      totalDepartments,
      avgCompletionTime: 0,
      casesThisMonth: monthlyData.thisMonth,
      casesLastMonth: monthlyData.lastMonth,
      monthlyTrend: monthlyData.thisMonth - monthlyData.lastMonth,
      monthlyTrendPercent: monthlyData.lastMonth > 0
        ? ((monthlyData.thisMonth - monthlyData.lastMonth) / monthlyData.lastMonth) * 100
        : 0
    };

    // Calculate average completion time
    if (completionData.length > 0) {
      const totalDays = completionData.reduce((sum, case_) => {
        if (case_.actualEndDate && case_.startDate) {
          const days = Math.ceil(
            (new Date(case_.actualEndDate).getTime() - new Date(case_.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
          );
          return sum + days;
        }
        return sum;
      }, 0);
      stats.avgCompletionTime = Math.round(totalDays / completionData.length);
    }

    // Create distributions from the same grouped data
    const priorityDistribution = caseStats.reduce((acc, item) => {
      const existing = acc.find(p => p.name === item.priority);
      if (existing) {
        existing.value += item._count;
      } else {
        acc.push({ name: item.priority, value: item._count });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

    const statusDistribution = caseStats.reduce((acc, item) => {
      const existing = acc.find(s => s.name === item.status);
      if (existing) {
        existing.value += item._count;
      } else {
        acc.push({ name: item.status, value: item._count });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

    const stageDistribution = caseStats
      .filter(item => !['COMPLETADO', 'ARCHIVED', 'CANCELLED'].includes(item.status))
      .reduce((acc, item) => {
        if (item.currentStage) {
          const existing = acc.find(s => s.name === item.currentStage);
          if (existing) {
            existing.value += item._count;
          } else {
            acc.push({ name: item.currentStage, value: item._count });
          }
        }
        return acc;
      }, [] as { name: string; value: number }[]);

    const statistics = {
      success: true,
      data: stats,
      distributions: {
        priority: priorityDistribution,
        status: statusDistribution,
        stage: stageDistribution
      }
    };

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
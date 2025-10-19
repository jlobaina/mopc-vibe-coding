import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET /api/meetings - List meetings with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    if (type) {
      where.meetingType = type.toUpperCase();
    }

    if (startDate || endDate) {
      where.scheduledStart = {};
      if (startDate) {
        where.scheduledStart.gte = new Date(startDate);
      }
      if (endDate) {
        where.scheduledStart.lte = new Date(endDate);
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get user's department for filtering
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { department: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Filter meetings based on user role and participation
    const userRole = user.role.name;
    if (userRole !== "SUPER_ADMIN" && userRole !== "DEPARTMENT_ADMIN") {
      where.OR = [
        { organizerId: session.user.id },
        { chairId: session.user.id },
        { participants: { some: { userId: session.user.id } } },
        { departmentId: user.departmentId },
      ];
    }

    const [meetings, total] = await Promise.all([
      prisma.meeting.findMany({
        where,
        include: {
          organizer: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          chair: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          department: {
            select: { id: true, name: true, code: true },
          },
          participants: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, email: true },
              },
            },
          },
          _count: {
            select: {
              participants: true,
              agendaItems: true,
              decisions: true,
              commitments: true,
            },
          },
        },
        orderBy: { scheduledStart: "desc" },
        skip,
        take: limit,
      }),
      prisma.meeting.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      meetings,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/meetings - Create a new meeting
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const meetingSchema = z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().optional(),
      meetingType: z.enum([
        "SITE_VISIT",
        "COORDINATION",
        "DECISION",
        "PUBLIC_CONSULTATION",
        "TECHNICAL_REVIEW",
        "LEGAL_REVIEW",
        "NEGOTIATION",
        "STATUS_UPDATE",
        "RECURRING",
        "EMERGENCY",
        "TRAINING",
        "BOARD_MEETING",
        "COMMITTEE_MEETING",
        "STAKEHOLDER_MEETING",
        "KICKOFF_MEETING",
        "REVIEW_MEETING",
        "PLANNING_MEETING",
        "RETROSPECTIVE",
      ]),
      priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"]).default("MEDIUM"),
      location: z.string().optional(),
      virtual: z.boolean().default(false),
      meetingUrl: z.string().optional(),
      dialInInfo: z.string().optional(),
      room: z.string().optional(),
      equipment: z.array(z.string()).optional(),
      scheduledStart: z.string().transform((str) => new Date(str)),
      scheduledEnd: z.string().transform((str) => new Date(str)),
      timezone: z.string().default("America/Santo_Domingo"),
      maxParticipants: z.number().optional(),
      allowGuests: z.boolean().default(true),
      requireApproval: z.boolean().default(false),
      isPrivate: z.boolean().default(false),
      recordMeeting: z.boolean().default(false),
      enableChat: z.boolean().default(true),
      enableScreenShare: z.boolean().default(true),
      chairId: z.string().optional(),
      caseId: z.string().optional(),
      agendaTemplateId: z.string().optional(),
      tags: z.string().optional(),
      metadata: z.object({}).optional(),
      isRecurring: z.boolean().default(false),
      recurrenceRule: z.object({}).optional(),
    });

    const validatedData = meetingSchema.parse(body);

    // Check if user has permission to create meetings
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true, department: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for scheduling conflicts
    const conflicts = await checkMeetingConflicts(
      validatedData.scheduledStart,
      validatedData.scheduledEnd,
      user.id,
      validatedData.room
    );

    if (conflicts.length > 0) {
      return NextResponse.json(
        {
          error: "Scheduling conflicts detected",
          conflicts
        },
        { status: 409 }
      );
    }

    // Create meeting
    const meeting = await prisma.meeting.create({
      data: {
        ...validatedData,
        organizerId: session.user.id,
        departmentId: user.departmentId,
        plannedDuration: Math.round(
          (validatedData.scheduledEnd.getTime() - validatedData.scheduledStart.getTime()) / (1000 * 60)
        ),
        metadata: validatedData.metadata || {},
        equipment: validatedData.equipment || [],
        recurrenceRule: validatedData.recurrenceRule || null,
      },
      include: {
        organizer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        chair: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        department: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: {
            participants: true,
            agendaItems: true,
          },
        },
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        action: "CREATED",
        entityType: "MEETING",
        entityId: meeting.id,
        description: `Created meeting: ${meeting.title}`,
        userId: session.user.id,
        metadata: {
          meetingType: meeting.meetingType,
          scheduledStart: meeting.scheduledStart,
        },
      },
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error("Error creating meeting:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to check for meeting conflicts
async function checkMeetingConflicts(
  startTime: Date,
  endTime: Date,
  userId: string,
  room?: string
): Promise<any[]> {
  const conflicts = [];

  // Check participant conflicts
  const participantConflicts = await prisma.meeting.findMany({
    where: {
      OR: [
        { organizerId: userId },
        { chairId: userId },
        { participants: { some: { userId } } },
      ],
      status: { not: "CANCELLED" },
      OR: [
        {
          AND: [
            { scheduledStart: { lte: startTime } },
            { scheduledEnd: { gt: startTime } },
          ],
        },
        {
          AND: [
            { scheduledStart: { lt: endTime } },
            { scheduledEnd: { gte: endTime } },
          ],
        },
        {
          AND: [
            { scheduledStart: { gte: startTime } },
            { scheduledEnd: { lte: endTime } },
          ],
        },
      ],
    },
    include: {
      organizer: { select: { firstName: true, lastName: true } },
    },
  });

  participantConflicts.forEach((conflict) => {
    conflicts.push({
      type: "PARTICIPANT_UNAVAILABLE",
      meetingId: conflict.id,
      title: conflict.title,
      startTime: conflict.scheduledStart,
      endTime: conflict.scheduledEnd,
      description: `You are already scheduled in meeting "${conflict.title}" with ${conflict.organizer.firstName} ${conflict.organizer.lastName}`,
    });
  });

  // Check room conflicts
  if (room) {
    const roomConflicts = await prisma.meeting.findMany({
      where: {
        room,
        status: { not: "CANCELLED" },
        OR: [
          {
            AND: [
              { scheduledStart: { lte: startTime } },
              { scheduledEnd: { gt: startTime } },
            ],
          },
          {
            AND: [
              { scheduledStart: { lt: endTime } },
              { scheduledEnd: { gte: endTime } },
            ],
          },
          {
            AND: [
              { scheduledStart: { gte: startTime } },
              { scheduledEnd: { lte: endTime } },
            ],
          },
        ],
      },
    });

    roomConflicts.forEach((conflict) => {
      conflicts.push({
        type: "ROOM_UNAVAILABLE",
        meetingId: conflict.id,
        title: conflict.title,
        startTime: conflict.scheduledStart,
        endTime: conflict.scheduledEnd,
        description: `Room "${room}" is already booked for meeting "${conflict.title}"`,
      });
    });
  }

  return conflicts;
}
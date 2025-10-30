import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// POST /api/meetings/[id]/participants/[participantId]/rsvp - RSVP to meeting
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const rsvpSchema = z.object({
      status: z.enum(["ACCEPTED", "DECLINED", "TENTATIVE"]),
      notes: z.string().optional(),
    });

    const validatedData = rsvpSchema.parse(body);

    // Get meeting and participant
    const [meeting, participant] = await Promise.all([
      prisma.meeting.findUnique({
        where: { id: (await params).id },
        include: {
          organizer: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          chair: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.meetingParticipant.findUnique({
        where: { id: (await params).participantId },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
    ]);

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (!participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Users can only RSVP for themselves or if they have admin permissions
    const canRSVP = participant.userId === session.user.id ||
                   user.role.name === "SUPER_ADMIN" ||
                   user.role.name === "DEPARTMENT_ADMIN" ||
                   meeting.organizer.id === session.user.id ||
                   meeting.chair.id === session.user.id;

    if (!canRSVP) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Check if meeting has already started or ended
    const now = new Date();
    if (meeting.scheduledStart <= now) {
      return NextResponse.json(
        { error: "Cannot RSVP to meeting that has already started" },
        { status: 400 }
      );
    }

    // Check if meeting is cancelled
    if (meeting.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot RSVP to cancelled meeting" },
        { status: 400 }
      );
    }

    // Update participant RSVP
    const updatedParticipant = await prisma.meetingParticipant.update({
      where: { id: (await params).participantId },
      data: {
        rsvpStatus: validatedData.status,
        rsvpAt: new Date(),
        rsvpNotes: validatedData.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            department: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
    });

    // Update meeting counts
    const countUpdate: any = {};
    if (validatedData.status === "ACCEPTED") {
      countUpdate.acceptedCount = { increment: 1 };
    } else if (participant.rsvpStatus === "ACCEPTED") {
      countUpdate.acceptedCount = { decrement: 1 };
    }

    if (Object.keys(countUpdate).length > 0) {
      await prisma.meeting.update({
        where: { id: (await params).id },
        data: countUpdate,
      });
    }

    // Create activity log
    await prisma.activity.create({
      data: {
        action: "UPDATED",
        entityType: "MEETING_PARTICIPANT",
        entityId: participant.id,
        description: `${participant.user?.firstName || participant.name} ${participant.user?.lastName || ""} RSVP ${validatedData.status.toLowerCase()} to meeting: ${meeting.title}`,
        userId: session.user.id,
        metadata: {
          meetingId: (await params).id,
          rsvpStatus: validatedData.status,
          rsvpNotes: validatedData.notes,
        },
      },
    });

    // Send notification to organizer and chair
    const notifications = [
      {
        recipientId: meeting.organizer.id,
        title: `RSVP Update: ${participant.user?.firstName || participant.name} ${participant.user?.lastName || ""}`,
        message: `${participant.user?.firstName || participant.name} ${participant.user?.lastName || ""} has ${validatedData.status.toLowerCase()} your invitation to "${meeting.title}".`,
        details: {
          rsvpStatus: validatedData.status,
          rsvpNotes: validatedData.notes,
          participant: {
            id: participant.id,
            name: participant.user?.firstName || participant.name,
            email: participant.user?.email || participant.email,
          },
          meetingDetails: {
            title: meeting.title,
            startTime: meeting.scheduledStart,
            endTime: meeting.scheduledEnd,
          },
        },
      },
    ];

    // Add chair notification if different from organizer
    if (meeting.chair.id !== meeting.organizer.id) {
      notifications.push({
        recipientId: meeting.chair.id,
        title: `RSVP Update: ${participant.user?.firstName || participant.name} ${participant.user?.lastName || ""}`,
        message: `${participant.user?.firstName || participant.name} ${participant.user?.lastName || ""} has ${validatedData.status.toLowerCase()} your invitation to "${meeting.title}".`,
        details: {
          rsvpStatus: validatedData.status,
          rsvpNotes: validatedData.notes,
          participant: {
            id: participant.id,
            name: participant.user?.firstName || participant.name,
            email: participant.user?.email || participant.email,
          },
          meetingDetails: {
            title: meeting.title,
            startTime: meeting.scheduledStart,
            endTime: meeting.scheduledEnd,
          },
        },
      });
    }

    // Create notifications
    await Promise.all(
      notifications.map((notification) =>
        prisma.meetingNotification.create({
          data: {
            meetingId: (await params).id,
            recipientId: notification.recipientId,
            type: "UPDATE",
            title: notification.title,
            message: notification.message,
            details: notification.details,
            channels: ["EMAIL", "IN_APP"],
            scheduledAt: new Date(),
            createdBy: session.user.id,
          },
        })
      )
    );

    return NextResponse.json({
      participant: updatedParticipant,
      message: `RSVP ${validatedData.status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error("Error updating RSVP:", error);
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
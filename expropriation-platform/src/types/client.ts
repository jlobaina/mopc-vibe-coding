// Client-safe types - no Prisma imports

export interface User {
  id: string;
  email: string;
  name: string;
  departmentId: string;
  roleId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  permissions: Record<string, boolean>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Case {
  id: string;
  fileNumber: string;
  title: string;
  description?: string;
  currentStage: string;
  priority: string;
  status: string;
  startDate: Date;
  expectedEndDate?: Date;
  actualEndDate?: Date;
  propertyAddress: string;
  propertyCity: string;
  propertyProvince: string;
  propertyDescription?: string;
  propertyCoordinates?: string;
  propertyArea?: number;
  propertyType?: string;
  ownerName: string;
  ownerIdentification?: string;
  ownerContact?: string;
  ownerEmail?: string;
  ownerAddress?: string;
  ownerType?: string;
  estimatedValue?: number;
  actualValue?: number;
  appraisalValue?: number;
  compensationAmount?: number;
  currency: string;
  expropriationDecree?: string;
  judicialCaseNumber?: string;
  legalStatus?: string;
  progressPercentage: number;
  departmentId: string;
  createdById: string;
  assignedToId?: string;
  supervisedById?: string;
  createdAt: Date;
  updatedAt: Date;
  department?: {
    id: string;
    name: string;
    code: string;
  };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  supervisedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count?: {
    documents: number;
    histories: number;
    activities: number;
    meetings: number;
  };
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  isPublic: boolean;
  caseId: string;
  uploadedById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  action: string;
  description?: string;
  entityType: string;
  entityId: string;
  userId: string;
  createdAt: Date;
}

// Client-safe extended types
export interface UserWithDepartment extends User {
  department: Department;
  role: Role;
}

export interface CaseWithDetails extends Case {
  department: Department;
  createdBy: User;
  assignedTo?: User;
  supervisedBy?: User;
  documents: Document[];
  _count: {
    documents: number;
    activities: number;
  };
}

export interface DepartmentWithUsers extends Department {
  _count: {
    users: number;
    cases: number;
  };
}

export interface ActivityWithUser extends Activity {
  user: User;
}

// Search and filter types
export interface CaseSearchInput {
  query?: string;
  status?: string;
  priority?: string;
  currentStage?: string;
  departmentId?: string;
  assignedToId?: string;
  createdBy?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
  expectedEndDateFrom?: Date;
  expectedEndDateTo?: Date;
  ownerName?: string;
  propertyAddress?: string;
  fileNumber?: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
}

// Meeting types - client safe
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  meetingType: string;
  priority: string;
  status: string;
  location?: string;
  virtual: boolean;
  meetingUrl?: string;
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  timezone: string;
  maxParticipants?: number;
  allowGuests: boolean;
  requireApproval: boolean;
  isPrivate: boolean;
  recordMeeting: boolean;
  enableChat: boolean;
  enableScreenShare: boolean;
  isRecurring: boolean;
  recurrenceRule?: any;
  parentMeetingId?: string;
  agendaTemplateId?: string;
  minutesTemplate?: string;
  tags?: string;
  invitedCount: number;
  acceptedCount: number;
  attendedCount: number;
  effectiveness?: string;
  organizerId: string;
  chairId?: string;
  caseId?: string;
  createdAt: Date;
  updatedAt: Date;
  organizer?: {
    id: string;
    name: string;
    email: string;
  };
  chair?: {
    id: string;
    name: string;
    email: string;
  };
  case?: {
    id: string;
    fileNumber: string;
    title: string;
  };
  _count?: {
    participants: number;
    agendaItems: number;
    decisions: number;
    commitments: number;
    documents: number;
  };
}

export interface MeetingParticipant {
  id: string;
  meetingId: string;
  userId?: string;
  invitedBy: string;
  delegatedFrom?: string;
  status: string;
  role: string;
  isRequired: boolean;
  hasResponded: boolean;
  responseAt?: Date;
  notes?: string;
  joinedAt?: Date;
  leftAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface MeetingAgendaItem {
  id: string;
  meetingId: string;
  title: string;
  description?: string;
  sequence: number;
  duration: number;
  status: string;
  presenterId?: string;
  ownerId?: string;
  votingSessionId?: string;
  decisionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeetingDecision {
  id: string;
  meetingId: string;
  agendaItemId?: string;
  title: string;
  description?: string;
  decisionType: string;
  status: string;
  priority: string;
  proposedById: string;
  reviewedBy?: string;
  approvedBy?: string;
  votingSessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeetingCommitment {
  id: string;
  meetingId: string;
  decisionId?: string;
  title: string;
  description?: string;
  assigneeId: string;
  assignerId: string;
  dueDate?: Date;
  priority: string;
  status: string;
  reviewedBy?: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Meeting search and filter types
export interface MeetingSearchInput {
  query?: string;
  meetingType?: string;
  status?: string;
  priority?: string;
  departmentId?: string;
  organizerId?: string;
  chairId?: string;
  caseId?: string;
  scheduledStartTimeFrom?: Date;
  scheduledStartTimeTo?: Date;
  virtual?: boolean;
  isRecurring?: boolean;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
}

export interface MeetingFormData {
  title: string;
  description?: string;
  meetingType: string;
  priority: string;
  location?: string;
  virtual: boolean;
  meetingUrl?: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  timezone: string;
  maxParticipants?: number;
  allowGuests: boolean;
  requireApproval: boolean;
  isPrivate: boolean;
  recordMeeting: boolean;
  enableChat: boolean;
  enableScreenShare: boolean;
  isRecurring: boolean;
  recurrenceRule?: string;
  chairId?: string;
  caseId?: string;
  tags?: string;
}
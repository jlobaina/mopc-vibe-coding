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
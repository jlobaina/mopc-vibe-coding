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
  caseNumber: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  departmentId: string;
  createdById: string;
  assignedToId?: string;
  supervisedById?: string;
  createdAt: Date;
  updatedAt: Date;
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
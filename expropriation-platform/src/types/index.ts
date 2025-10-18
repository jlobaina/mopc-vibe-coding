// Prisma types - only used in server components
import type { User, Case, Department, Role, Document, Activity } from '@prisma/client';

// Export Prisma types as server-only types
export type {
  User as PrismaUser,
  Case as PrismaCase,
  Department as PrismaDepartment,
  Role as PrismaRole,
  Document as PrismaDocument,
  Activity as PrismaActivity
} from '@prisma/client';

// Server-only types that extend Prisma types
export interface UserWithRelations extends User {
  department: Department;
  role: Role;
}

export interface CaseWithRelations extends Case {
  department: Department;
  createdBy: User;
  assignedTo?: User;
  supervisedBy?: User;
  documents: Document[];
  _count: {
    documents: number;
    activities: number;
    histories: number;
  };
}

export interface DepartmentWithChildren extends Department {
  children: Department[];
  _count: {
    users: number;
    cases: number;
  };
}

export interface ActivityWithUser extends Activity {
  user: User;
}

export interface CaseFilters {
  status?: string;
  priority?: string;
  departmentId?: string;
  assignedToId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

export interface CaseStats {
  total: number;
  active: number;
  completed: number;
  pending: number;
  overdue: number;
  avgDuration: number;
}

export interface UserPermissions {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canAssign: boolean;
  canSupervise: boolean;
  canExport: boolean;
  canManageUsers: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  permissions: UserPermissions;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CaseStage {
  id: string;
  name: string;
  description: string;
  order: number;
  duration: number; // in days
  requiredDocuments: string[];
  permissions: string[];
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: Date;
  entityType?: string;
  entityId?: string;
}

export interface DashboardStats {
  totalCases: number;
  activeCases: number;
  completedCases: number;
  pendingTasks: number;
  overdueCases: number;
  recentActivities: ActivityWithUser[];
  casesByDepartment: Array<{
    department: string;
    count: number;
  }>;
  casesByStatus: Array<{
    status: string;
    count: number;
  }>;
}

export interface FileUpload {
  file: File;
  title: string;
  description?: string;
  tags?: string[];
  isPublic: boolean;
}

export interface SearchFilters {
  query?: string;
  entityType?: 'case' | 'user' | 'document' | 'department';
  departmentId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  filters: CaseFilters;
  fields: string[];
  includeDocuments: boolean;
  includeHistory: boolean;
}

export interface SystemConfig {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description?: string;
}
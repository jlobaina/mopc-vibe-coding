// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: Department;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;
}

// Department Types
export interface Department {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  users: User[];
  createdAt: string;
  updatedAt: string;
}

// Expediente Types
export interface Expediente {
  id: string;
  expedientNumber: string;
  subject: string;
  description: string;
  status: ExpedienteStatus;
  priority: Priority;
  assignedTo?: User;
  createdBy: User;
  department: Department;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  tags: string[];
  documents: Document[];
  workflowSteps: WorkflowStep[];
}

export interface ExpedienteStatus {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface Priority {
  id: string;
  name: string;
  level: number;
  color: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assignedTo?: User;
  completedAt?: string;
  dueDate?: string;
  order: number;
}

// Document Types
export interface Document {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  category: DocumentCategory;
  status: DocumentStatus;
  uploadedBy: User;
  expediente?: Expediente;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface DocumentStatus {
  id: string;
  name: string;
  color: string;
}

export interface DocumentUploadData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  expedienteId?: string;
  file: File;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'multiselect' | 'date' | 'file';
  required: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | undefined;
  };
}

// Dashboard Types
export interface DashboardStats {
  totalExpedientes: number;
  activeExpedientes: number;
  completedExpedientes: number;
  overdueExpedientes: number;
  totalDocuments: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'expediente_created' | 'expediente_updated' | 'document_uploaded' | 'status_changed';
  description: string;
  user: User;
  timestamp: string;
  expedienteId?: string;
  documentId?: string;
}

// Filter and Search Types
export interface SearchFilters {
  query?: string;
  status?: string[];
  priority?: string[];
  department?: string[];
  assignedTo?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// UI State Types
export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  loading: {
    global: boolean;
    [key: string]: boolean;
  };
}
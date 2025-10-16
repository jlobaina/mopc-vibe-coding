import { get, post, put, del } from './api';
import {
  Expediente,
  ApiResponse,
  PaginatedResponse,
  SearchFilters,
  SortOption,
  WorkflowStep,
} from '../types';

export interface CreateExpedienteData {
  subject: string;
  description: string;
  priorityId: string;
  departmentId: string;
  assignedToId?: string;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateExpedienteData extends Partial<CreateExpedienteData> {
  statusId?: string;
}

export interface ExpedientesQuery {
  page?: number;
  limit?: number;
  filters?: SearchFilters;
  sort?: SortOption;
}

export const expedientesService = {
  // Get all expedientes with pagination and filtering
  getExpedientes: async (query: ExpedientesQuery = {}): Promise<PaginatedResponse<Expediente>> => {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.sort) {
      params.append('sortBy', query.sort.field);
      params.append('sortDirection', query.sort.direction);
    }

    if (query.filters) {
      if (query.filters.query) params.append('search', query.filters.query);
      if (query.filters.status?.length) {
        query.filters.status.forEach(status => params.append('status', status));
      }
      if (query.filters.priority?.length) {
        query.filters.priority.forEach(priority => params.append('priority', priority));
      }
      if (query.filters.department?.length) {
        query.filters.department.forEach(dept => params.append('department', dept));
      }
      if (query.filters.assignedTo?.length) {
        query.filters.assignedTo.forEach(user => params.append('assignedTo', user));
      }
      if (query.filters.dateRange) {
        params.append('dateFrom', query.filters.dateRange.start);
        params.append('dateTo', query.filters.dateRange.end);
      }
      if (query.filters.tags?.length) {
        query.filters.tags.forEach(tag => params.append('tags', tag));
      }
    }

    const response = await get<PaginatedResponse<Expediente>>(`/expedientes?${params.toString()}`);
    return response.data;
  },

  // Get single expediente by ID
  getExpediente: async (id: string): Promise<Expediente> => {
    const response = await get<Expediente>(`/expedientes/${id}`);
    return response.data;
  },

  // Create new expediente
  createExpediente: async (data: CreateExpedienteData): Promise<Expediente> => {
    const response = await post<Expediente>('/expedientes', data);
    return response.data;
  },

  // Update existing expediente
  updateExpediente: async (id: string, data: UpdateExpedienteData): Promise<Expediente> => {
    const response = await put<Expediente>(`/expedientes/${id}`, data);
    return response.data;
  },

  // Delete expediente
  deleteExpediente: async (id: string): Promise<void> => {
    await del<void>(`/expedientes/${id}`);
  },

  // Get expediente statistics
  getExpedienteStats: async (): Promise<{
    total: number;
    byStatus: Array<{ status: string; count: number }>;
    byPriority: Array<{ priority: string; count: number }>;
    byDepartment: Array<{ department: string; count: number }>;
    overdue: number;
    dueThisWeek: number;
    completedThisMonth: number;
  }> => {
    const response = await get<any>('/expedientes/stats');
    return response.data;
  },

  // Get expediente workflow steps
  getWorkflowSteps: async (expedienteId: string): Promise<WorkflowStep[]> => {
    const response = await get<WorkflowStep[]>(`/expedientes/${expedienteId}/workflow`);
    return response.data;
  },

  // Update workflow step
  updateWorkflowStep: async (
    expedienteId: string,
    stepId: string,
    data: {
      status: 'pending' | 'in_progress' | 'completed' | 'skipped';
      assignedToId?: string;
      notes?: string;
    }
  ): Promise<WorkflowStep> => {
    const response = await put<WorkflowStep>(
      `/expedientes/${expedienteId}/workflow/${stepId}`,
      data
    );
    return response.data;
  },

  // Assign expediente to user
  assignExpediente: async (id: string, userId: string): Promise<Expediente> => {
    const response = await post<Expediente>(`/expedientes/${id}/assign`, {
      assignedToId: userId,
    });
    return response.data;
  },

  // Unassign expediente
  unassignExpediente: async (id: string): Promise<Expediente> => {
    const response = await post<Expediente>(`/expedientes/${id}/unassign`);
    return response.data;
  },

  // Add comment to expediente
  addComment: async (
    id: string,
    comment: string,
    attachments?: File[]
  ): Promise<{
    id: string;
    comment: string;
    author: any;
    createdAt: string;
    attachments: any[];
  }> => {
    const formData = new FormData();
    formData.append('comment', comment);

    if (attachments) {
      attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }

    const response = await post<any>(`/expedientes/${id}/comments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get expediente history
  getHistory: async (id: string): Promise<Array<{
    id: string;
    action: string;
    description: string;
    user: any;
    timestamp: string;
    changes?: Record<string, any>;
  }>> => {
    const response = await get<any[]>(`/expedientes/${id}/history`);
    return response.data;
  },
};

// Export individual functions for convenience
export const getExpedientes = expedientesService.getExpedientes;
export const getExpediente = expedientesService.getExpediente;
export const createExpediente = expedientesService.createExpediente;
export const updateExpediente = expedientesService.updateExpediente;
export const deleteExpediente = expedientesService.deleteExpediente;
export const getExpedienteStats = expedientesService.getExpedienteStats;
export const getWorkflowSteps = expedientesService.getWorkflowSteps;
export const updateWorkflowStep = expedientesService.updateWorkflowStep;
export const assignExpediente = expedientesService.assignExpediente;
export const unassignExpediente = expedientesService.unassignExpediente;
export const addComment = expedientesService.addComment;
export const getHistory = expedientesService.getHistory;
import { useQuery } from 'react-query';
import { Expediente, PaginatedResponse } from '../types';
import { getExpedientes } from '../services/expedientes';

interface UseExpedientesParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: any;
  sort?: any;
}

// Mock data for now - replace with actual API calls
const mockExpedientes: Expediente[] = [
  {
    id: '1',
    expedientNumber: 'EXP-2024-001',
    subject: 'Property Acquisition - Main Street Project',
    description: 'Acquisition of commercial property for municipal development project',
    status: {
      id: 'in_progress',
      name: 'In Progress',
      color: '#1976d2',
      order: 2,
    },
    priority: {
      id: 'high',
      name: 'High',
      level: 3,
      color: '#d32f2f',
    },
    assignedTo: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: {
        id: '1',
        name: 'Manager',
        permissions: [],
      },
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    createdBy: {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      role: {
        id: '2',
        name: 'Analyst',
        permissions: [],
      },
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    department: {
      id: '1',
      name: 'Legal Department',
      description: 'Handles all legal matters',
      isActive: true,
      users: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T14:45:00Z',
    dueDate: '2024-02-15T00:00:00Z',
    tags: ['urgent', 'commercial', 'municipal'],
    documents: [],
    workflowSteps: [],
  },
  {
    id: '2',
    expedientNumber: 'EXP-2024-002',
    subject: 'Land Expropriation for Highway Expansion',
    description: 'Expropriation proceedings for highway expansion project',
    status: {
      id: 'under_review',
      name: 'Under Review',
      color: '#ed6c02',
      order: 3,
    },
    priority: {
      id: 'medium',
      name: 'Medium',
      level: 2,
      color: '#ed6c02',
    },
    assignedTo: {
      id: '3',
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      email: 'carlos.rodriguez@example.com',
      role: {
        id: '2',
        name: 'Analyst',
        permissions: [],
      },
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    createdBy: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: {
        id: '1',
        name: 'Manager',
        permissions: [],
      },
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    department: {
      id: '2',
      name: 'Infrastructure Department',
      description: 'Manages infrastructure projects',
      isActive: true,
      users: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-14T16:30:00Z',
    dueDate: '2024-03-01T00:00:00Z',
    tags: ['highway', 'infrastructure', 'expropriation'],
    documents: [],
    workflowSteps: [],
  },
];

export const useExpedientes = (params: UseExpedientesParams = {}) => {
  return useQuery(
    ['expedientes', params],
    async (): Promise<PaginatedResponse<Expediente>> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Filter mock data based on search and filters
      let filteredExpedientes = mockExpedientes;

      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredExpedientes = filteredExpedientes.filter(expediente =>
          expediente.subject.toLowerCase().includes(searchLower) ||
          expediente.description.toLowerCase().includes(searchLower) ||
          expediente.expedientNumber.toLowerCase().includes(searchLower)
        );
      }

      if (params.filters?.status?.length) {
        filteredExpedientes = filteredExpedientes.filter(expediente =>
          params.filters.status.includes(expediente.status.id)
        );
      }

      if (params.filters?.priority?.length) {
        filteredExpedientes = filteredExpedientes.filter(expediente =>
          params.filters.priority.includes(expediente.priority.level.toString())
        );
      }

      // Sort data
      if (params.sort?.field) {
        filteredExpedientes.sort((a, b) => {
          let aValue: any = a[params.sort.field as keyof Expediente];
          let bValue: any = b[params.sort.field as keyof Expediente];

          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }

          if (params.sort.direction === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
      }

      // Paginate
      const startIndex = (params.page! - 1) * params.limit!;
      const endIndex = startIndex + params.limit!;
      const paginatedData = filteredExpedientes.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 20,
          total: filteredExpedientes.length,
          totalPages: Math.ceil(filteredExpedientes.length / (params.limit || 20)),
        },
      };
    },
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
};
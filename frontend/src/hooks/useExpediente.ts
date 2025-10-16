import { useQuery } from 'react-query';
import { Expediente } from '../types';

// Mock data - would fetch from API
const mockExpediente: Expediente = {
  id: '1',
  expedientNumber: 'EXP-2024-001',
  subject: 'Property Acquisition - Main Street Project',
  description: 'Acquisition of commercial property for municipal development project involving the purchase of three adjacent lots for the construction of a new public park and community center.',
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
    description: 'Handles all legal matters for expropriation cases',
    isActive: true,
    users: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-16T14:45:00Z',
  dueDate: '2024-02-15T00:00:00Z',
  tags: ['urgent', 'commercial', 'municipal', 'park-development'],
  documents: [],
  workflowSteps: [
    {
      id: '1',
      name: 'Initial Assessment',
      description: 'Conduct initial property assessment and valuation',
      status: 'completed',
      assignedTo: {
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
      completedAt: '2024-01-16T11:00:00Z',
      order: 1,
    },
    {
      id: '2',
      name: 'Legal Review',
      description: 'Review legal documentation and compliance requirements',
      status: 'in_progress',
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
      dueDate: '2024-01-20T00:00:00Z',
      order: 2,
    },
    {
      id: '3',
      name: 'Stakeholder Notification',
      description: 'Notify all relevant stakeholders about the expropriation',
      status: 'pending',
      order: 3,
    },
  ],
};

export const useExpediente = (id: string) => {
  return useQuery(
    ['expediente', id],
    async (): Promise<Expediente> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // In a real implementation, this would fetch from the API
      // For now, return mock data or throw error if not found
      if (id === '1') {
        return mockExpediente;
      }

      throw new Error('Expediente not found');
    },
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};
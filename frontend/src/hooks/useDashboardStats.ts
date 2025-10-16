import { useQuery } from 'react-query';
import { DashboardStats } from '../types';
import { getExpedienteStats } from '../services/expedientes';
import { getDocumentStats } from '../services/documents';

// Mock data for now - replace with actual API calls
const mockDashboardStats: DashboardStats = {
  totalExpedientes: 156,
  activeExpedientes: 42,
  completedExpedientes: 89,
  overdueExpedientes: 7,
  totalDocuments: 1247,
  recentActivity: [
    {
      id: '1',
      type: 'expediente_created',
      description: 'New expediente "Property Acquisition - Main Street" was created',
      user: {
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
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      expedienteId: '123',
    },
    {
      id: '2',
      type: 'document_uploaded',
      description: 'Document "Legal Agreement" was uploaded to expediente #456',
      user: {
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
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      documentId: '789',
    },
    {
      id: '3',
      type: 'status_changed',
      description: 'Expediente #789 status changed to "Under Review"',
      user: {
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
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      expedienteId: '789',
    },
  ],
};

export const useDashboardStats = () => {
  // In a real implementation, this would fetch data from multiple API endpoints
  // For now, we'll return mock data with a simulated loading state
  return useQuery(
    'dashboardStats',
    async (): Promise<DashboardStats> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockDashboardStats;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 10 * 60 * 1000, // 10 minutes
    }
  );
};
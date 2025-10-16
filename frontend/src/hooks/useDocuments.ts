import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Document, DocumentUploadData, PaginatedResponse } from '../types';

interface UseDocumentsParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: any;
  sort?: any;
}

// Mock data for now - replace with actual API calls
const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Property Valuation Report',
    description: 'Professional property valuation for Main Street acquisition',
    fileName: 'property_valuation_main_st.pdf',
    fileSize: 2048576, // 2MB
    mimeType: 'application/pdf',
    filePath: '/documents/property_valuation_main_st.pdf',
    category: {
      id: 'financial',
      name: 'Financial',
      description: 'Financial documents and reports',
      color: '#4caf50',
    },
    status: {
      id: 'approved',
      name: 'Approved',
      color: '#2e7d32',
    },
    uploadedBy: {
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
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    tags: ['valuation', 'property', 'main-street'],
  },
  {
    id: '2',
    title: 'Legal Agreement Draft',
    description: 'Initial draft of the purchase agreement for property acquisition',
    fileName: 'legal_agreement_draft.docx',
    fileSize: 1024000, // 1MB
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    filePath: '/documents/legal_agreement_draft.docx',
    category: {
      id: 'legal',
      name: 'Legal',
      description: 'Legal documents and agreements',
      color: '#f44336',
    },
    status: {
      id: 'pending_review',
      name: 'Pending Review',
      color: '#ed6c02',
    },
    uploadedBy: {
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
    createdAt: '2024-01-14T15:30:00Z',
    updatedAt: '2024-01-14T15:30:00Z',
    tags: ['legal', 'agreement', 'draft'],
  },
];

export const useDocuments = (params: UseDocumentsParams = {}) => {
  const queryClient = useQueryClient();

  const documentsQuery = useQuery(
    ['documents', params],
    async (): Promise<PaginatedResponse<Document>> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));

      // Filter mock data based on search and filters
      let filteredDocuments = mockDocuments;

      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredDocuments = filteredDocuments.filter(doc =>
          doc.title.toLowerCase().includes(searchLower) ||
          doc.description.toLowerCase().includes(searchLower) ||
          doc.fileName.toLowerCase().includes(searchLower)
        );
      }

      if (params.filters?.status?.length) {
        filteredDocuments = filteredDocuments.filter(doc =>
          params.filters.status.includes(doc.status.id)
        );
      }

      // Sort data
      if (params.sort?.field) {
        filteredDocuments.sort((a, b) => {
          let aValue: any = a[params.sort.field as keyof Document];
          let bValue: any = b[params.sort.field as keyof Document];

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
      const paginatedData = filteredDocuments.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 20,
          total: filteredDocuments.length,
          totalPages: Math.ceil(filteredDocuments.length / (params.limit || 20)),
        },
      };
    },
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  const uploadMutation = useMutation(
    async (data: DocumentUploadData) => {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Return mock document
      return {
        id: Date.now().toString(),
        title: data.title,
        description: data.description,
        fileName: data.file.name,
        fileSize: data.file.size,
        mimeType: data.file.type,
        filePath: `/documents/${data.file.name}`,
        category: {
          id: data.category,
          name: data.category.charAt(0).toUpperCase() + data.category.slice(1),
          description: '',
          color: '#1976d2',
        },
        status: {
          id: 'pending_review',
          name: 'Pending Review',
          color: '#ed6c02',
        },
        uploadedBy: {
          id: '1',
          firstName: 'Current',
          lastName: 'User',
          email: 'user@example.com',
          role: {
            id: '1',
            name: 'Manager',
            permissions: [],
          },
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: data.tags,
      } as Document;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('documents');
      },
    }
  );

  const deleteMutation = useMutation(
    async (id: string) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return id;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('documents');
      },
    }
  );

  return {
    documents: documentsQuery.data?.data || [],
    total: documentsQuery.data?.pagination.total || 0,
    isLoading: documentsQuery.isLoading,
    error: documentsQuery.error,
    refetch: documentsQuery.refetch,
    uploadDocument: uploadMutation.mutateAsync,
    deleteDocument: deleteMutation.mutateAsync,
    isUploading: uploadMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
  };
};
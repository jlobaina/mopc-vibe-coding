import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Visibility,
  Edit,
  Delete,
  GetApp,
  Assignment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { debounce } from '@mui/material/utils';

import { useExpedientes } from '../hooks/useExpedientes';
import { useNotification } from '../hooks/useNotification';
import { Expediente, SearchFilters, SortOption } from '../types';
import {
  EXPEDIENTE_STATUS,
  PRIORITY_LEVELS,
  STATUS_COLORS,
  formatRelativeTime,
  formatDate,
  truncate,
} from '../utils';

// Status Chip Component
const StatusChip: React.FC<{ status: string; label: string }> = ({ status, label }) => (
  <Chip
    label={label}
    size="small"
    sx={{
      backgroundColor: STATUS_COLORS.EXPEDIENTE[status as keyof typeof STATUS_COLORS.EXPEDIENTE],
      color: 'white',
    }}
  />
);

// Priority Chip Component
const PriorityChip: React.FC<{ priority: number; label: string }> = ({ priority, label }) => (
  <Chip
    label={label}
    size="small"
    variant="outlined"
    sx={{
      borderColor: STATUS_COLORS.PRIORITY[priority as keyof typeof STATUS_COLORS.PRIORITY],
      color: STATUS_COLORS.PRIORITY[priority as keyof typeof STATUS_COLORS.PRIORITY],
    }}
  />
);

const ExpedientesPage: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sort, setSort] = useState<SortOption>({ field: 'createdAt', direction: 'desc' });

  const {
    expedientes,
    total,
    isLoading,
    error,
    refetch,
  } = useExpedientes({
    page: page + 1,
    limit: rowsPerPage,
    search: searchQuery,
    filters,
    sort,
  });

  // Debounced search
  const debouncedSearch = React.useMemo(
    () => debounce((query: string) => {
      setSearchQuery(query);
      setPage(0); // Reset to first page on search
    }, 300),
    []
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(event.target.value);
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateExpediente = () => {
    navigate('/expedientes/create');
  };

  const handleViewExpediente = (id: string) => {
    navigate(`/expedientes/${id}`);
  };

  const handleEditExpediente = (id: string) => {
    navigate(`/expedientes/${id}/edit`);
  };

  const handleSort = (field: string) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  if (error) {
    return (
      <Box className="page-container">
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load expedientes: {error}
        </Alert>
        <Button onClick={() => refetch()}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box className="page-container">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Expedientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateExpediente}
        >
          New Expediente
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search expedientes..."
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              select
              label="Status"
              value={filters.status?.[0] || ''}
              onChange={(e) => {
                const status = e.target.value as string;
                setFilters(prev => ({
                  ...prev,
                  status: status ? [status] : undefined,
                }));
                setPage(0);
              }}
            >
              <MenuItem value="">All Status</MenuItem>
              {Object.entries(EXPEDIENTE_STATUS).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              select
              label="Priority"
              value={filters.priority?.[0] || ''}
              onChange={(e) => {
                const priority = e.target.value as string;
                setFilters(prev => ({
                  ...prev,
                  priority: priority ? [priority] : undefined,
                }));
                setPage(0);
              }}
            >
              <MenuItem value="">All Priorities</MenuItem>
              <MenuItem value={PRIORITY_LEVELS.LOW.toString()}>Low</MenuItem>
              <MenuItem value={PRIORITY_LEVELS.MEDIUM.toString()}>Medium</MenuItem>
              <MenuItem value={PRIORITY_LEVELS.HIGH.toString()}>High</MenuItem>
              <MenuItem value={PRIORITY_LEVELS.URGENT.toString()}>Urgent</MenuItem>
              <MenuItem value={PRIORITY_LEVELS.CRITICAL.toString()}>Critical</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => {
                setFilters({});
                setSearchQuery('');
                setPage(0);
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Summary */}
      <Box mb={2}>
        <Typography variant="body2" color="text.secondary">
          Showing {expedientes?.length || 0} of {total} expedientes
        </Typography>
      </Box>

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('expedientNumber')}
                >
                  Expedient # {sort.field === 'expedientNumber' && (sort.direction === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('subject')}
                >
                  Subject {sort.field === 'subject' && (sort.direction === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('createdAt')}
                >
                  Created {sort.field === 'createdAt' && (sort.direction === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : expedientes?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No expedientes found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                expedientes?.map((expediente) => (
                  <TableRow key={expediente.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {expediente.expedientNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {truncate(expediente.subject, 50)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {truncate(expediente.description, 80)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        status={expediente.status.id}
                        label={expediente.status.name}
                      />
                    </TableCell>
                    <TableCell>
                      <PriorityChip
                        priority={expediente.priority.level}
                        label={expediente.priority.name}
                      />
                    </TableCell>
                    <TableCell>
                      {expediente.assignedTo ? (
                        <Typography variant="body2">
                          {expediente.assignedTo.firstName} {expediente.assignedTo.lastName}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(expediente.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {expediente.dueDate ? (
                        <Typography variant="body2">
                          {formatDate(expediente.dueDate)}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No due date
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => handleViewExpediente(expediente.id)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditExpediente(expediente.id)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Paper>
    </Box>
  );
};

export default ExpedientesPage;
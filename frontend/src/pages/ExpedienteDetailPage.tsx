import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, Edit, Assignment } from '@mui/icons-material';

import { useExpediente } from '../hooks/useExpediente';
import { Expediente } from '../types';
import { formatDate, formatRelativeTime } from '../utils/helpers';

const ExpedienteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { expediente, isLoading, error } = useExpediente(id!);

  if (isLoading) {
    return (
      <Box className="page-container">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={40} />
        </Box>
      </Box>
    );
  }

  if (error || !expediente) {
    return (
      <Box className="page-container">
        <Alert severity="error">
          Failed to load expediente details. Please try again.
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/expedientes')}
          sx={{ mt: 2 }}
        >
          Back to Expedientes
        </Button>
      </Box>
    );
  }

  return (
    <Box className="page-container">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/expedientes')}
            sx={{ mb: 2 }}
          >
            Back to Expedientes
          </Button>
          <Typography variant="h4" component="h1">
            {expediente.subject}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Expedient #{expediente.expedientNumber}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => navigate(`/expedientes/${expediente.id}/edit`)}
        >
          Edit Expediente
        </Button>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1">
                  {expediente.description || 'No description provided'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={expediente.status.name}
                  size="small"
                  sx={{
                    backgroundColor: expediente.status.color,
                    color: 'white',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Priority
                </Typography>
                <Chip
                  label={expediente.priority.name}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: expediente.priority.color,
                    color: expediente.priority.color,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Department
                </Typography>
                <Typography variant="body1">
                  {expediente.department.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Created Date
                </Typography>
                <Typography variant="body1">
                  {formatDate(expediente.createdAt)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Due Date
                </Typography>
                <Typography variant="body1">
                  {expediente.dueDate
                    ? formatDate(expediente.dueDate)
                    : 'No due date set'}
                </Typography>
              </Grid>
            </Grid>

            {expediente.tags.length > 0 && (
              <Box mt={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tags
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {expediente.tags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Assignment Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Assignment
            </Typography>
            {expediente.assignedTo ? (
              <Box>
                <Typography variant="body1">
                  {expediente.assignedTo.firstName} {expediente.assignedTo.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {expediente.assignedTo.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Role: {expediente.assignedTo.role.name}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Unassigned
              </Typography>
            )}
          </Paper>

          {/* Created By */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Created By
            </Typography>
            <Typography variant="body1">
              {expediente.createdBy.firstName} {expediente.createdBy.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatRelativeTime(expediente.createdAt)}
            </Typography>
          </Paper>

          {/* Quick Actions */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Button
                variant="outlined"
                startIcon={<Assignment />}
                fullWidth
                onClick={() => {/* TODO: Implement workflow actions */}}
              >
                Update Workflow
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExpedienteDetailPage;
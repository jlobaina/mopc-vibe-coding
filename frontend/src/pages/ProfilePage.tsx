import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Person, Edit } from '@mui/icons-material';

import { useAuth } from '../hooks/useAuth';
import { User } from '../types';
import { getUserDisplayName, getUserInitials } from '../utils/auth';

const ProfilePage: React.FC = () => {
  const { user, isLoading, error } = useAuth();

  if (isLoading) {
    return (
      <Box className="page-container">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={40} />
        </Box>
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box className="page-container">
        <Alert severity="error">
          Failed to load profile information.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="page-container">
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your personal information and account settings.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Personal Information</Typography>
              <Button variant="outlined" startIcon={<Edit />} size="small">
                Edit Profile
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={user.firstName}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={user.lastName}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  value={user.email}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Role"
                  value={user.role.name}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={user.department?.name || 'Not assigned'}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Account Status"
                  value={user.isActive ? 'Active' : 'Inactive'}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Member Since"
                  value={new Date(user.createdAt).toLocaleDateString()}
                  disabled
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: '3rem',
              }}
            >
              {getUserInitials(user)}
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {getUserDisplayName(user)}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
            <Chip
              label={user.role.name}
              color="primary"
              size="small"
              sx={{ mb: 2 }}
            />
            <Box>
              <Button variant="contained" startIcon={<Person />} fullWidth>
                Change Password
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
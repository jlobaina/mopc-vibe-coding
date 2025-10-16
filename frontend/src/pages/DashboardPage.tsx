import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Assignment,
  Description,
  Pending,
  CheckCircle,
  TrendingUp,
  Warning,
} from '@mui/icons-material';

import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { DashboardStats as DashboardStatsType } from '../types';

import { formatNumber, formatRelativeTime } from '../utils/helpers';

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  subtitle,
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" mb={2}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 1,
            bgcolor: color,
            color: 'white',
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </Box>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

// Recent Activity Component
interface RecentActivityProps {
  activities: DashboardStatsType['recentActivity'];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => (
  <Paper sx={{ p: 3, height: '100%' }}>
    <Typography variant="h6" gutterBottom>
      Recent Activity
    </Typography>
    {activities.length === 0 ? (
      <Typography variant="body2" color="text.secondary">
        No recent activity
      </Typography>
    ) : (
      <Box>
        {activities.slice(0, 5).map((activity) => (
          <Box
            key={activity.id}
            sx={{
              py: 1,
              borderBottom: '1px solid #eee',
              '&:last-child': { borderBottom: 'none' },
            }}
          >
            <Typography variant="body2" gutterBottom>
              {activity.description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {activity.user.firstName} {activity.user.lastName} • {formatRelativeTime(activity.timestamp)}
            </Typography>
          </Box>
        ))}
      </Box>
    )}
  </Paper>
);

// Main Dashboard Component
const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load dashboard data. Please try refreshing the page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="page-container">
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.firstName}! Here's what's happening with your expedientes today.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Expedientes"
            value={formatNumber(stats?.totalExpedientes || 0)}
            icon={<Assignment />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active"
            value={formatNumber(stats?.activeExpedientes || 0)}
            icon={<Pending />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Completed"
            value={formatNumber(stats?.completedExpedientes || 0)}
            icon={<CheckCircle />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Overdue"
            value={formatNumber(stats?.overdueExpedientes || 0)}
            icon={<Warning />}
            color="#d32f2f"
            subtitle={stats?.overdueExpedientes ? 'Need attention' : 'All on track'}
          />
        </Grid>
      </Grid>

      {/* Documents Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Total Documents"
            value={formatNumber(stats?.totalDocuments || 0)}
            icon={<Description />}
            color="#7c4dff"
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <RecentActivity activities={stats?.recentActivity || []} />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create new expedientes, upload documents, or manage your workflow from the main navigation.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All systems operational. Last updated: {formatRelativeTime(new Date().toISOString())}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
'use client';

import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { KeyboardShortcutsPanel } from '@/components/help/keyboard-shortcuts-panel';
import { useKeyboardShortcuts, commonShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useTutorial } from '@/components/tutorial/tutorial-provider';
import {
  Building2,
  Users,
  FileText,
  Settings,
  LogOut,
  User,
  BarChart3,
  AlertTriangle,
  Clock,
  TrendingUp,
  Activity,
  HelpCircle,
  Keyboard
} from 'lucide-react';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';
import { DashboardCases } from '@/components/dashboard/dashboard-cases';
import { DashboardAlerts } from '@/components/dashboard/dashboard-alerts';

export default function DashboardPage() {
  const { user, signOut, isSuperAdmin, isDepartmentAdmin, isAnalyst, isSupervisor } = useAuth();
  const { startTutorial } = useTutorial();
  const router = useRouter();

  // Keyboard shortcuts
  const shortcuts = [
    {
      ...commonShortcuts.goToDashboard,
      action: () => router.push('/dashboard'),
    },
    {
      ...commonShortcuts.goToCases,
      action: () => router.push('/cases'),
    },
    {
      ...commonShortcuts.goToReports,
      action: () => router.push('/reports'),
    },
    {
      ...commonShortcuts.createNew,
      action: () => router.push('/cases?action=create'),
    },
    {
      ...commonShortcuts.help,
      action: () => startTutorial('dashboard-intro'),
    },
    {
      ...commonShortcuts.toggleTheme,
      action: () => {
        // Theme toggle is handled by the component
      },
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card shadow-sm border-b sticky top-0 z-10">
          <ResponsiveContainer size="xl">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">Plataforma MOPC</h1>
                  <p className="text-xs text-muted-foreground">Sistema de Gestión de Casos de Expropiación</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <KeyboardShortcutsPanel
                  shortcuts={shortcuts.map(s => ({ ...s, category: 'Navegación' }))}
                >
                  <Button variant="ghost" size="sm" aria-label="Atajos de teclado">
                    <Keyboard className="h-4 w-4" />
                  </Button>
                </KeyboardShortcutsPanel>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startTutorial('dashboard-intro')}
                  aria-label="Iniciar tutorial"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.role} - {user?.department}
                  </p>
                </div>
                <Button
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </ResponsiveContainer>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <ResponsiveContainer size="xl" padding="lg">
            {/* Welcome Section */}
            <section className="mb-8" aria-labelledby="welcome-heading">
              <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
                <div>
                  <h2 id="welcome-heading" className="text-2xl font-bold text-foreground mb-2">
                    Bienvenido, {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-muted-foreground">
                    Panel principal del Sistema de Gestión de Casos de Expropiación
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {user?.role?.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {user?.department}
                  </Badge>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="mb-8" aria-labelledby="quick-actions-heading">
              <h2 id="quick-actions-heading" className="sr-only">Acciones Rápidas</h2>
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                data-tutorial="quick-actions"
              >
                <Card
                  className="hover:shadow-md transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  onClick={() => router.push('/cases')}
                  onKeyDown={(e) => e.key === 'Enter' && router.push('/cases')}
                  tabIndex={0}
                  role="button"
                  aria-label="Ir a gestión de casos"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
                      <div>
                        <h3 className="font-semibold text-sm">Casos</h3>
                        <p className="text-xs text-muted-foreground">Gestión de casos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="hover:shadow-md transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  onClick={() => router.push('/reports')}
                  onKeyDown={(e) => e.key === 'Enter' && router.push('/reports')}
                  tabIndex={0}
                  role="button"
                  aria-label="Ir a reportes"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="h-8 w-8 text-green-600 group-hover:scale-110 transition-transform" />
                      <div>
                        <h3 className="font-semibold text-sm">Reportes</h3>
                        <p className="text-xs text-muted-foreground">Análisis y estadísticas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {(isSuperAdmin || isDepartmentAdmin) && (
                  <Card
                    className="hover:shadow-md transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    onClick={() => router.push('/users')}
                    onKeyDown={(e) => e.key === 'Enter' && router.push('/users')}
                    tabIndex={0}
                    role="button"
                    aria-label="Ir a gestión de usuarios"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Users className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform" />
                        <div>
                          <h3 className="font-semibold text-sm">Usuarios</h3>
                          <p className="text-xs text-muted-foreground">Gestión de usuarios</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(isAnalyst || isDepartmentAdmin || isSuperAdmin) && (
                  <Card
                    className="hover:shadow-md transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    onClick={() => router.push('/cases?action=create')}
                    onKeyDown={(e) => e.key === 'Enter' && router.push('/cases?action=create')}
                    tabIndex={0}
                    role="button"
                    aria-label="Crear nuevo caso"
                    data-tutorial="create-case-button"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Activity className="h-8 w-8 text-orange-600 group-hover:scale-110 transition-transform" />
                        <div>
                          <h3 className="font-semibold text-sm">Nuevo Caso</h3>
                          <p className="text-xs text-muted-foreground">Crear caso</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>

            {/* Dashboard Tabs */}
            <Tabs defaultValue="overview" className="space-y-6" data-tutorial="dashboard-tabs">
              <TabsList
                className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-auto lg:grid-cols-4"
                role="tablist"
                aria-label="Vistas del panel"
              >
                <TabsTrigger
                  value="overview"
                  className="flex items-center space-x-2"
                  role="tab"
                  aria-selected="true"
                  aria-controls="overview-panel"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Resumen</span>
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="flex items-center space-x-2"
                  role="tab"
                  aria-selected="false"
                  aria-controls="analytics-panel"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Análisis</span>
                </TabsTrigger>
                <TabsTrigger
                  value="cases"
                  className="flex items-center space-x-2"
                  role="tab"
                  aria-selected="false"
                  aria-controls="cases-panel"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Casos</span>
                </TabsTrigger>
                <TabsTrigger
                  value="alerts"
                  className="flex items-center space-x-2"
                  role="tab"
                  aria-selected="false"
                  aria-controls="alerts-panel"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span className="hidden sm:inline">Alertas</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6" id="overview-panel" role="tabpanel">
                <DashboardStats departmentId={user?.departmentId} />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6" id="analytics-panel" role="tabpanel">
                <DashboardCharts departmentId={user?.departmentId} />
              </TabsContent>

              <TabsContent value="cases" className="space-y-6" id="cases-panel" role="tabpanel">
                <DashboardCases
                  departmentId={user?.departmentId}
                  userId={user?.id}
                />
              </TabsContent>

              <TabsContent value="alerts" className="space-y-6" id="alerts-panel" role="tabpanel">
                <DashboardAlerts
                  departmentId={user?.departmentId}
                  userId={user?.id}
                />
              </TabsContent>
            </Tabs>
          </ResponsiveContainer>
        </main>
      </div>
    </ProtectedRoute>
  );
}
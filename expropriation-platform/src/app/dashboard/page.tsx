'use client';

import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, FileText, Settings, LogOut, User } from 'lucide-react';

export default function DashboardPage() {
  const { user, signOut, isSuperAdmin, isDepartmentAdmin, isAnalyst, isSupervisor } = useAuth();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Building2 className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold text-gray-900">Plataforma MOPC</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role} - {user?.department}</p>
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
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bienvenido, {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-600">
              Panel principal del Sistema de Gestión de Casos de Expropiación
            </p>
          </div>

          {/* User Info Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información de Usuario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Nombre:</span> {user?.name}
                  </div>
                  <div>
                    <span className="font-medium">Correo:</span> {user?.email}
                  </div>
                  <div>
                    <span className="font-medium">Usuario:</span> {user?.username}
                  </div>
                  <div>
                    <span className="font-medium">Rol:</span> {user?.role}
                  </div>
                  <div>
                    <span className="font-medium">Departamento:</span> {user?.department}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role-based Quick Actions */}
            {(isSuperAdmin || isDepartmentAdmin) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gestión de Usuarios
                  </CardTitle>
                  <CardDescription>
                    Administrar usuarios y roles del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push('/users')}
                    >
                      Ver todos los usuarios
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push('/users?action=create')}
                    >
                      Crear nuevo usuario
                    </Button>
                    {isSuperAdmin && (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => router.push('/users?action=manage-roles')}
                      >
                        Administrar roles
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Casos
                </CardTitle>
                <CardDescription>
                  Gestión de casos de expropiación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/cases')}
                  >
                    Ver todos los casos
                  </Button>
                  {(isAnalyst || isDepartmentAdmin || isSuperAdmin) && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push('/cases?action=create')}
                    >
                      Crear nuevo caso
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/reports')}
                  >
                    Reportes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {isSuperAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Administración del Sistema
                  </CardTitle>
                  <CardDescription>
                    Configuración general del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push('/admin/settings')}
                    >
                      Configuración general
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push('/departments')}
                    >
                      Departamentos
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push('/admin/logs')}
                    >
                      Logs del sistema
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Casos Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">+3 esta semana</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Requiere atención</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Completados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">Este mes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">En Progreso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">En revisión</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
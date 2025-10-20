'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SuperAdminRoute } from '@/components/auth/protected-route'
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Users,
  Settings,
  Eye,
  EyeOff,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'

interface Role {
  id: string
  name: string
  description?: string
  permissions: Record<string, any>
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    users: number
  }
}

interface PermissionGroup {
  name: string
  permissions: {
    key: string
    label: string
    description: string
    category: string
  }[]
}

const permissionGroups: PermissionGroup[] = [
  {
    name: 'Gestión de Casos',
    permissions: [
      { key: 'cases.create', label: 'Crear Casos', description: 'Permite crear nuevos casos de expropiación', category: 'cases' },
      { key: 'cases.read', label: 'Ver Casos', description: 'Permite ver casos existentes', category: 'cases' },
      { key: 'cases.update', label: 'Actualizar Casos', description: 'Permite modificar información de casos', category: 'cases' },
      { key: 'cases.delete', label: 'Eliminar Casos', description: 'Permite eliminar casos', category: 'cases' },
      { key: 'cases.assign', label: 'Asignar Casos', description: 'Permite asignar casos a analistas', category: 'cases' },
      { key: 'cases.approve', label: 'Aprobar Casos', description: 'Permite aprobar transiciones de etapa', category: 'cases' }
    ]
  },
  {
    name: 'Gestión de Usuarios',
    permissions: [
      { key: 'users.create', label: 'Crear Usuarios', description: 'Permite crear nuevos usuarios', category: 'users' },
      { key: 'users.read', label: 'Ver Usuarios', description: 'Permite ver usuarios existentes', category: 'users' },
      { key: 'users.update', label: 'Actualizar Usuarios', description: 'Permite modificar información de usuarios', category: 'users' },
      { key: 'users.delete', label: 'Eliminar Usuarios', description: 'Permite eliminar usuarios', category: 'users' },
      { key: 'users.assign_roles', label: 'Asignar Roles', description: 'Permite asignar roles a usuarios', category: 'users' },
      { key: 'users.manage_sessions', label: 'Gestionar Sesiones', description: 'Permite ver y gestionar sesiones activas', category: 'users' }
    ]
  },
  {
    name: 'Gestión de Departamentos',
    permissions: [
      { key: 'departments.create', label: 'Crear Departamentos', description: 'Permite crear nuevos departamentos', category: 'departments' },
      { key: 'departments.read', label: 'Ver Departamentos', description: 'Permite ver departamentos existentes', category: 'departments' },
      { key: 'departments.update', label: 'Actualizar Departamentos', description: 'Permite modificar departamentos', category: 'departments' },
      { key: 'departments.delete', label: 'Eliminar Departamentos', description: 'Permite eliminar departamentos', category: 'departments' },
      { key: 'departments.assign_users', label: 'Asignar Usuarios', description: 'Permite asignar usuarios a departamentos', category: 'departments' }
    ]
  },
  {
    name: 'Gestión de Documentos',
    permissions: [
      { key: 'documents.create', label: 'Subir Documentos', description: 'Permite subir nuevos documentos', category: 'documents' },
      { key: 'documents.read', label: 'Ver Documentos', description: 'Permite ver documentos existentes', category: 'documents' },
      { key: 'documents.update', label: 'Actualizar Documentos', description: 'Permite actualizar documentos', category: 'documents' },
      { key: 'documents.delete', label: 'Eliminar Documentos', description: 'Permite eliminar documentos', category: 'documents' },
      { key: 'documents.approve', label: 'Aprobar Documentos', description: 'Permite aprobar documentos', category: 'documents' }
    ]
  },
  {
    name: 'Sistema y Reportes',
    permissions: [
      { key: 'system.access_admin', label: 'Acceso Admin', description: 'Permite acceder al panel de administración', category: 'system' },
      { key: 'system.view_logs', label: 'Ver Logs', description: 'Permite ver logs del sistema', category: 'system' },
      { key: 'system.export_data', label: 'Exportar Datos', description: 'Permite exportar datos del sistema', category: 'system' },
      { key: 'system.manage_settings', label: 'Configuración', description: 'Permite modificar configuración del sistema', category: 'system' },
      { key: 'reports.create', label: 'Crear Reportes', description: 'Permite generar nuevos reportes', category: 'reports' },
      { key: 'reports.read', label: 'Ver Reportes', description: 'Permite ver reportes existentes', category: 'reports' },
      { key: 'reports.export', label: 'Exportar Reportes', description: 'Permite exportar reportes', category: 'reports' }
    ]
  }
]

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {} as Record<string, boolean>
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock data for development
  useEffect(() => {
    const mockRoles: Role[] = [
      {
        id: '1',
        name: 'super_admin',
        description: 'Administrador del sistema con acceso completo',
        permissions: Object.fromEntries(
          permissionGroups.flatMap(group =>
            group.permissions.map(p => [p.key, true])
          )
        ),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { users: 1 }
      },
      {
        id: '2',
        name: 'department_admin',
        description: 'Administrador de departamento',
        permissions: {
          'cases.create': true,
          'cases.read': true,
          'cases.update': true,
          'cases.assign': true,
          'users.create': true,
          'users.read': true,
          'users.update': true,
          'departments.read': true,
          'departments.update': true,
          'documents.create': true,
          'documents.read': true,
          'documents.update': true,
          'reports.read': true,
          'reports.export': true
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { users: 3 }
      },
      {
        id: '3',
        name: 'analyst',
        description: 'Analista de casos',
        permissions: {
          'cases.read': true,
          'cases.update': true,
          'documents.create': true,
          'documents.read': true,
          'documents.update': true
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { users: 8 }
      }
    ]

    setTimeout(() => {
      setRoles(mockRoles)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = showInactive || role.isActive
    return matchesSearch && matchesStatus
  })

  const handleCreateRole = async () => {
    if (!formData.name.trim()) {
      setError('El nombre del rol es requerido')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Mock API call
      const newRole: Role = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { users: 0 }
      }

      setRoles(prev => [...prev, newRole])
      setIsCreateDialogOpen(false)
      setFormData({ name: '', description: '', permissions: {} })
    } catch (err) {
      setError('Error al crear el rol')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateRole = async () => {
    if (!editingRole) return

    setSubmitting(true)
    setError(null)

    try {
      // Mock API call
      setRoles(prev => prev.map(role =>
        role.id === editingRole.id
          ? {
              ...role,
              name: formData.name,
              description: formData.description,
              permissions: formData.permissions,
              updatedAt: new Date().toISOString()
            }
          : role
      ))

      setEditingRole(null)
      setFormData({ name: '', description: '', permissions: {} })
    } catch (err) {
      setError('Error al actualizar el rol')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este rol? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      // Mock API call
      setRoles(prev => prev.filter(role => role.id !== roleId))
    } catch (err) {
      setError('Error al eliminar el rol')
    }
  }

  const handleToggleRoleStatus = async (roleId: string, currentStatus: boolean) => {
    try {
      // Mock API call
      setRoles(prev => prev.map(role =>
        role.id === roleId
          ? { ...role, isActive: !currentStatus, updatedAt: new Date().toISOString() }
          : role
      ))
    } catch (err) {
      setError('Error al cambiar el estado del rol')
    }
  }

  const openEditDialog = (role: Role) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: Object.fromEntries(
        Object.entries(role.permissions).map(([key, value]) => [key, Boolean(value)])
      )
    })
  }

  const handlePermissionChange = (permissionKey: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionKey]: checked
      }
    }))
  }

  const getPermissionCount = (permissions: Record<string, any>) => {
    return Object.values(permissions).filter(Boolean).length
  }

  if (loading) {
    return (
      <SuperAdminRoute>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </SuperAdminRoute>
    )
  }

  return (
    <SuperAdminRoute>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Roles</h1>
            <p className="text-muted-foreground mt-2">
              Administra los roles y permisos del sistema
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Rol
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Rol</DialogTitle>
                <DialogDescription>
                  Define un nuevo rol con sus permisos correspondientes
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre del Rol</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="ej: department_admin"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción del rol"
                    />
                  </div>
                </div>

                <Tabs defaultValue="cases" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    {permissionGroups.map(group => (
                      <TabsTrigger key={group.name} value={group.permissions[0].category}>
                        {group.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {permissionGroups.map(group => (
                    <TabsContent key={group.name} value={group.permissions[0].category} className="space-y-4">
                      <div className="grid gap-3">
                        {group.permissions.map(permission => (
                          <div key={permission.key} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium">{permission.label}</div>
                              <div className="text-sm text-muted-foreground">{permission.description}</div>
                            </div>
                            <Switch
                              checked={formData.permissions[permission.key] || false}
                              onCheckedChange={(checked) => handlePermissionChange(permission.key, checked)}
                            />
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              {error && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateRole} disabled={submitting}>
                  {submitting ? 'Creando...' : 'Crear Rol'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-inactive"
                  checked={showInactive}
                  onCheckedChange={setShowInactive}
                />
                <Label htmlFor="show-inactive">Mostrar inactivos</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role) => (
            <Card key={role.id} className={role.isActive ? '' : 'opacity-60'}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Switch
                      checked={role.isActive}
                      onCheckedChange={() => handleToggleRoleStatus(role.id, role.isActive)}
                      size="sm"
                    />
                  </div>
                </div>
                {role.description && (
                  <CardDescription>{role.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {getPermissionCount(role.permissions)} permisos
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      {role._count?.users || 0} usuarios
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {role.isActive ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      {role.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(role)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRole(role.id)}
                      className="text-destructive hover:text-destructive"
                      disabled={role._count?.users ? role._count.users > 0 : false}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Rol: {editingRole?.name}</DialogTitle>
              <DialogDescription>
                Modifica los permisos y configuración del rol
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Nombre del Rol</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Descripción</Label>
                  <Input
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              <Tabs defaultValue="cases" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  {permissionGroups.map(group => (
                    <TabsTrigger key={group.name} value={group.permissions[0].category}>
                      {group.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {permissionGroups.map(group => (
                  <TabsContent key={group.name} value={group.permissions[0].category} className="space-y-4">
                    <div className="grid gap-3">
                      {group.permissions.map(permission => (
                        <div key={permission.key} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{permission.label}</div>
                            <div className="text-sm text-muted-foreground">{permission.description}</div>
                          </div>
                          <Switch
                            checked={formData.permissions[permission.key] || false}
                            onCheckedChange={(checked) => handlePermissionChange(permission.key, checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {error && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditingRole(null)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button onClick={handleUpdateRole} disabled={submitting}>
                {submitting ? 'Actualizando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminRoute>
  )
}
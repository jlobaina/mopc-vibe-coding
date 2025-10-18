'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';
import { Building, Mail, Phone, MapPin, User, Briefcase, Clock, DollarSign, Users } from 'lucide-react';

// Schema for department form
const departmentSchema = z.object({
  name: z.string().min(1, 'El nombre del departamento es requerido'),
  code: z.string().min(1, 'El código del departamento es requerido'),
  parentId: z.string().nullable().optional(),
  description: z.string().optional(),
  headUserId: z.string().nullable().optional(),
  contactInfo: z.object({
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
  location: z.object({
    building: z.string().optional(),
    floor: z.string().optional(),
    office: z.string().optional(),
  }).optional(),
  type: z.string().optional(),
  isActive: z.boolean().default(true),
  userCapacity: z.number().positive().optional().or(z.literal('')),
  budget: z.number().positive().optional().or(z.literal('')),
  operatingHours: z.object({
    monday: z.string().optional(),
    tuesday: z.string().optional(),
    wednesday: z.string().optional(),
    thursday: z.string().optional(),
    friday: z.string().optional(),
    saturday: z.string().optional(),
    sunday: z.string().optional(),
  }).optional(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface Department {
  id: string;
  name: string;
  code: string;
  parentId?: string | null;
  description?: string | null;
  headUserId?: string | null;
  contactInfo?: any;
  location?: any;
  type?: string | null;
  isActive: boolean;
  userCapacity?: number | null;
  budget?: number | null;
  operatingHours?: any;
  parent?: {
    id: string;
    name: string;
    code: string;
  } | null;
  headUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: {
    id: string;
    name: string;
  };
}

interface DepartmentFormProps {
  mode: 'create' | 'edit';
  initialData?: Department;
  departments?: Department[];
  users?: User[];
  onSubmit: (data: DepartmentFormData) => Promise<void>;
  onCancel: () => void;
}

export function DepartmentForm({
  mode,
  initialData,
  departments = [],
  users = [],
  onSubmit,
  onCancel,
}: DepartmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      parentId: initialData?.parentId || null,
      description: initialData?.description || '',
      headUserId: initialData?.headUserId || null,
      contactInfo: {
        email: initialData?.contactInfo?.email || '',
        phone: initialData?.contactInfo?.phone || '',
        address: initialData?.contactInfo?.address || '',
      },
      location: {
        building: initialData?.location?.building || '',
        floor: initialData?.location?.floor || '',
        office: initialData?.location?.office || '',
      },
      type: initialData?.type || '',
      isActive: initialData?.isActive ?? true,
      userCapacity: initialData?.userCapacity || '',
      budget: initialData?.budget || '',
      operatingHours: {
        monday: initialData?.operatingHours?.monday || '',
        tuesday: initialData?.operatingHours?.tuesday || '',
        wednesday: initialData?.operatingHours?.wednesday || '',
        thursday: initialData?.operatingHours?.thursday || '',
        friday: initialData?.operatingHours?.friday || '',
        saturday: initialData?.operatingHours?.saturday || '',
        sunday: initialData?.operatingHours?.sunday || '',
      },
    },
  });

  const selectedHeadUser = watch('headUserId');
  const isActive = watch('isActive');

  // Filter departments that can be parent (exclude current department and its children)
  const eligibleParentDepartments = departments.filter(dept => {
    if (mode === 'edit' && initialData) {
      // Exclude current department and its children
      return dept.id !== initialData.id && !isChildOf(dept, initialData, departments);
    }
    return true;
  });

  // Filter users for department head selection (typically only admins and department admins)
  const eligibleHeadUsers = users.filter(user => {
    const role = user.role.name.toLowerCase();
    return role.includes('admin') || role.includes('super');
  });

  const handleFormSubmit = async (data: DepartmentFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      if (mode === 'create') {
        reset();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to check if a department is a child of another
  function isChildOf(potentialChild: Department, parent: Department, allDepartments: Department[]): boolean {
    if (potentialChild.parentId === parent.id) {
      return true;
    }
    if (potentialChild.parentId) {
      const parentDept = allDepartments.find(d => d.id === potentialChild.parentId);
      return parentDept ? isChildOf(parentDept, parent, allDepartments) : false;
    }
    return false;
  }

  const getSelectedHeadUserName = () => {
    if (!selectedHeadUser) return 'Ninguno';
    const user = eligibleHeadUsers.find(u => u.id === selectedHeadUser);
    return user ? `${user.firstName} ${user.lastName}` : 'Ninguno';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {mode === 'create' ? 'Nuevo Departamento' : 'Editar Departamento'}
          </h2>
          <p className="text-muted-foreground">
            {mode === 'create'
              ? 'Complete la información para crear un nuevo departamento'
              : 'Modifique la información del departamento'
            }
          </p>
        </div>
        {mode === 'edit' && (
          <div className="flex items-center space-x-2">
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Información Básica
            </CardTitle>
            <CardDescription>
              Información fundamental del departamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre del Departamento *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Ej: Recursos Humanos"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="code">Código del Departamento *</Label>
                <Input
                  id="code"
                  {...register('code')}
                  placeholder="Ej: RH001"
                  disabled={isSubmitting}
                />
                {errors.code && (
                  <p className="text-sm text-destructive mt-1">{errors.code.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descripción del departamento y sus responsabilidades"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentId">Departamento Padre</Label>
                <Select
                  value={watch('parentId') || ''}
                  onValueChange={(value) => setValue('parentId', value === 'none' ? null : value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar departamento padre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno (departamento raíz)</SelectItem>
                    {eligibleParentDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="headUserId">Jefe del Departamento</Label>
                <Select
                  value={watch('headUserId') || ''}
                  onValueChange={(value) => setValue('headUserId', value === 'none' ? null : value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar jefe">
                      {getSelectedHeadUserName()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {eligibleHeadUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} - {user.role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Tipo de Departamento</Label>
                <Select
                  value={watch('type') || ''}
                  onValueChange={(value) => setValue('type', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrative">Administrativo</SelectItem>
                    <SelectItem value="technical">Técnico</SelectItem>
                    <SelectItem value="operational">Operacional</SelectItem>
                    <SelectItem value="support">Soporte</SelectItem>
                    <SelectItem value="executive">Ejecutivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={watch('isActive')}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="isActive">Departamento Activo</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Información de Contacto
            </CardTitle>
            <CardDescription>
              Datos de contacto del departamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactInfo.email">Correo Electrónico</Label>
                <Input
                  id="contactInfo.email"
                  {...register('contactInfo.email')}
                  type="email"
                  placeholder="departamento@ejemplo.com"
                  disabled={isSubmitting}
                />
                {errors.contactInfo?.email && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.contactInfo.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="contactInfo.phone">Teléfono</Label>
                <Input
                  id="contactInfo.phone"
                  {...register('contactInfo.phone')}
                  placeholder="+1 (809) 123-4567"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contactInfo.address">Dirección</Label>
              <Input
                id="contactInfo.address"
                {...register('contactInfo.address')}
                placeholder="Calle Principal #123, Santo Domingo"
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicación Física
            </CardTitle>
            <CardDescription>
              Información sobre la ubicación física del departamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="location.building">Edificio</Label>
                <Input
                  id="location.building"
                  {...register('location.building')}
                  placeholder="Edificio Central"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="location.floor">Piso</Label>
                <Input
                  id="location.floor"
                  {...register('location.floor')}
                  placeholder="3er Piso"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="location.office">Oficina</Label>
                <Input
                  id="location.office"
                  {...register('location.office')}
                  placeholder="Oficina 301"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración Avanzada
            </CardTitle>
            <CardDescription>
              Configuraciones adicionales del departamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userCapacity" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Capacidad de Usuarios
                </Label>
                <Input
                  id="userCapacity"
                  {...register('userCapacity', { valueAsNumber: true })}
                  type="number"
                  placeholder="50"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Número máximo de usuarios en el departamento
                </p>
              </div>
              <div>
                <Label htmlFor="budget" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Presupuesto Anual
                </Label>
                <Input
                  id="budget"
                  {...register('budget', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  placeholder="100000.00"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Presupuesto asignado en moneda local
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horario de Operación
            </CardTitle>
            <CardDescription>
              Horarios de atención del departamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { day: 'monday', label: 'Lunes' },
                { day: 'tuesday', label: 'Martes' },
                { day: 'wednesday', label: 'Miércoles' },
                { day: 'thursday', label: 'Jueves' },
                { day: 'friday', label: 'Viernes' },
                { day: 'saturday', label: 'Sábado' },
                { day: 'sunday', label: 'Domingo' },
              ].map(({ day, label }) => (
                <div key={day}>
                  <Label htmlFor={`operatingHours.${day}`}>{label}</Label>
                  <Input
                    id={`operatingHours.${day}`}
                    {...register(`operatingHours.${day}` as any)}
                    placeholder="9:00 AM - 5:00 PM"
                    disabled={isSubmitting}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting
              ? mode === 'create' ? 'Creando...' : 'Actualizando...'
              : mode === 'create' ? 'Crear Departamento' : 'Actualizar Departamento'
            }
          </Button>
        </div>
      </form>
    </div>
  );
}

// Fix import for Settings icon
import { Settings } from 'lucide-react';
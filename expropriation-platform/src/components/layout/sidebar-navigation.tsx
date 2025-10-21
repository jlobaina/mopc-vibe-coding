'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from '@/hooks/use-auth'
import {
  BarChart3,
  FileText,
  Calendar,
  Users,
  Settings,
  Building2,
  Database,
  FileImage,
  Menu,
  X,
  Home,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  ChevronRight,
  Shield
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: any
  badge?: string
  description?: string
  children?: NavItem[]
  roles?: string[]
}

const navigationItems: NavItem[] = [
  {
    title: 'Inicio',
    href: '/dashboard',
    icon: Home,
    description: 'Panel principal del sistema'
  },
  {
    title: 'Expropiaciones',
    href: '/cases',
    icon: FileText,
    description: 'Gestión de casos de expropiación',
    children: [
      {
        title: 'Todos los Casos',
        href: '/cases',
        icon: FileText,
        description: 'Ver todos los casos de expropiación'
      },
      {
        title: 'Nuevo Caso',
        href: '/cases?action=create',
        icon: FileText,
        description: 'Crear un nuevo caso de expropiación',
        roles: ['super_admin', 'department_admin', 'analyst']
      }
    ]
  },
  {
    title: 'Reuniones',
    href: '/meetings',
    icon: Calendar,
    description: 'Gestión de reuniones técnicas',
    children: [
      {
        title: 'Todas las Reuniones',
        href: '/meetings',
        icon: Calendar,
        description: 'Ver todas las reuniones programadas'
      },
      {
        title: 'Nueva Reunión',
        href: '/meetings/create',
        icon: Calendar,
        description: 'Agendar una nueva reunión técnica',
        roles: ['super_admin', 'department_admin', 'technical_meeting_coordinator']
      }
    ]
  },
  {
    title: 'Informes',
    href: '/reports',
    icon: BarChart3,
    description: 'Reportes y estadísticas',
    children: [
      {
        title: 'Panel de Informes',
        href: '/reports',
        icon: BarChart3,
        description: 'Ver todos los informes disponibles'
      },
      {
        title: 'Exportar Datos',
        href: '/reports/export',
        icon: Database,
        description: 'Exportar información del sistema',
        roles: ['super_admin', 'department_admin']
      }
    ]
  },
  {
    title: 'Usuarios',
    href: '/users',
    icon: Users,
    description: 'Administración de usuarios',
    roles: ['super_admin', 'department_admin'],
    children: [
      {
        title: 'Todos los Usuarios',
        href: '/users',
        icon: Users,
        description: 'Ver todos los usuarios del sistema'
      },
      {
        title: 'Roles y Permisos',
        href: '/dashboard/roles',
        icon: Shield,
        description: 'Gestionar roles y permisos de acceso',
        roles: ['super_admin']
      }
    ]
  },
  {
    title: 'Departamentos',
    href: '/departments',
    icon: Building2,
    description: 'Gestión de departamentos',
    roles: ['super_admin']
  },
  {
    title: 'Documentos',
    href: '/documents',
    icon: FileImage,
    description: 'Gestión de documentos digitales'
  },
  {
    title: 'Notificaciones',
    href: '/notifications',
    icon: Bell,
    description: 'Centro de notificaciones',
    children: [
      {
        title: 'Ver Notificaciones',
        href: '/notifications',
        icon: Bell,
        description: 'Ver todas las notificaciones recibidas'
      },
      {
        title: 'Configuración',
        href: '/notifications/settings',
        icon: Settings,
        description: 'Configurar preferencias de notificación'
      }
    ]
  },
  {
    title: 'Administración',
    href: '/admin',
    icon: Settings,
    description: 'Configuración avanzada del sistema',
    roles: ['super_admin'],
    badge: 'Admin'
  }
]

interface SidebarNavigationProps {
  className?: string
  isCollapsed?: boolean
  onToggle?: () => void
}

export function SidebarNavigation({
  className,
  isCollapsed = false,
  onToggle
}: SidebarNavigationProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()
  const { user, signOut, isSuperAdmin, isDepartmentAdmin, isAnalyst, isSupervisor } = useAuth()

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const hasPermission = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true

    return roles.some(role => {
      switch (role) {
        case 'super_admin':
          return isSuperAdmin
        case 'department_admin':
          return isDepartmentAdmin
        case 'analyst':
          return isAnalyst
        case 'supervisor':
          return isSupervisor
        default:
          return false
      }
    })
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href || pathname === '/'
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  const renderNavItem = (item: NavItem, level = 0) => {
    if (!hasPermission(item.roles)) return null

    const isExpanded = expandedItems.includes(item.title)
    const active = isActive(item.href)
    const hasChildren = item.children && item.children.length > 0

    const buttonContent = (
      <Button
        variant={active ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start text-left h-auto py-2 px-3",
          isCollapsed && level === 0 && "justify-center px-2",
          active && "bg-secondary font-medium",
          "hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
        )}
        onClick={() => {
          if (hasChildren) {
            toggleExpanded(item.title)
          } else if (item.href) {
            window.location.href = item.href
          }
        }}
      >
        <item.icon className={cn(
          "h-4 w-4 flex-shrink-0",
          isCollapsed && level === 0 ? "mr-0" : "mr-3"
        )} />
        {!isCollapsed || level > 0 ? (
          <>
            <span className="flex-1">{item.title}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {item.badge}
              </Badge>
            )}
            {hasChildren && (
              isExpanded ?
                <ChevronDown className="h-4 w-4 ml-2" /> :
                <ChevronRight className="h-4 w-4 ml-2" />
              )}
          </>
        ) : null}
      </Button>
    )

    return (
      <div key={item.title}>
        {item.description ? (
          <Tooltip>
            <TooltipTrigger asChild>
              {buttonContent}
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.description}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          buttonContent
        )}

        {hasChildren && isExpanded && !isCollapsed && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-background border-r", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-primary" />
              <div>
                <h2 className="font-bold text-sm">MOPC</h2>
                <p className="text-xs text-muted-foreground">
                  Sistema de Expropiación
                </p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <Building2 className="h-6 w-6 text-primary mx-auto" />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-1 h-8 w-8"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
              {user?.firstName?.[0] || user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-2">
          {navigationItems.map(item => renderNavItem(item))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        {!isCollapsed && (
          <>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => window.location.href = '/search'}
            >
              <Search className="h-4 w-4 mr-3" />
              Búsqueda global
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => window.location.href = '/notifications'}
            >
              <Bell className="h-4 w-4 mr-3" />
              Ver notificaciones
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10",
            isCollapsed && "justify-center"
          )}
          onClick={signOut}
        >
          <LogOut className={cn("h-4 w-4", isCollapsed ? "" : "mr-3")} />
          {!isCollapsed && "Cerrar Sesión"}
        </Button>
      </div>
      </div>
    </TooltipProvider>
  )
}

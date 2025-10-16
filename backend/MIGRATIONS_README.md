# Django Database Migrations for MOPC Platform

This document describes the database migrations and initial data fixtures created for the MOPC Expropriation Management System.

## Migration Files Overview

### Core App Migrations (`/src/core/migrations/`)

1. **0001_initial.py** - Creates all core models:
   - Department (departamentos)
   - User (usuarios) - Custom user model extending AbstractUser
   - Permission (permisos) - RBAC permissions
   - UserPermission (usuario_permisos) - Junction table
   - WorkflowState (workflow_estados) - Workflow states
   - Notification (notificaciones) - System notifications
   - AuditLog (auditoria) - Comprehensive audit logging

2. **0002_create_initial_departments.py** - Creates 18 departments based on the 16-step expropriation process:
   - DS: Departamento de Solicitudes (Step 1)
   - DJ: Departamento Jurídico (Step 2)
   - DT: Departamento Técnico (Step 3)
   - DA: Departamento de Avalúos (Step 4)
   - DAMB: Departamento Ambiental (Step 5)
   - DPU: Departamento de Planificación Urbana (Step 6)
   - DF: Departamento Financiero (Step 7)
   - DDS: Departamento de Desarrollo Social (Step 8)
   - DNOT: Departamento de Notificaciones (Step 9)
   - DADM: Departamento Administrativo (Step 10)
   - DNEG: Departamento de Negociación (Step 11)
   - DDOC: Departamento de Documentación (Step 12)
   - DPAG: Departamento de Pagos (Step 13)
   - DREG: Departamento de Registro (Step 14)
   - DCAL: Departamento de Control de Calidad (Step 15)
   - DCIE: Departamento de Cierre (Step 16)
   - DTI: Departamento de TI (Support)
   - DAUD: Departamento de Auditoría Interna (Support)

3. **0003_create_default_permissions.py** - Creates comprehensive RBAC permissions:
   - User Management (4 permissions)
   - Expediente Management (6 permissions)
   - Document Management (6 permissions)
   - Task Management (6 permissions)
   - Department Management (4 permissions)
   - Report Permissions (3 permissions)
   - System Administration (3 permissions)
   - Workflow Management (2 permissions)
   - Notification Permissions (2 permissions)

4. **0004_create_workflow_states.py** - Creates 15 workflow states with colors:
   - Iniciado (Blue)
   - En Revisión Legal (Amber)
   - En Evaluación Técnica (Purple)
   - En Análisis Ambiental (Green)
   - En Análisis Financiero (Red)
   - En Notificación Pública (Orange)
   - En Negociación (Pink)
   - Pendiente de Aprobación (Teal)
   - Aprobado (Green)
   - En Ejecución (Sky)
   - Completado (Green) - Final
   - Rechazado (Red) - Final
   - En Apelación (Violet)
   - Suspendido (Gray)
   - Cancelado (Dark Red) - Final

5. **0005_create_admin_user.py** - Creates sample users:
   - **admin** (admin@mopc.gov.do / admin123) - System administrator with all permissions
   - **juridico_user** - Department of Legal user
   - **tecnico_user** - Technical Department user
   - **valuos_user** - Valuations Department user
   - **finanzas_user** - Finance Department user
   - **solicitudes_user** - Requests Department user

### Workflow App Migrations (`/src/workflow/migrations/`)

1. **0001_initial.py** - Creates workflow models:
   - Expediente (expedientes) - Main expropriation case entity
   - WorkflowTransition (workflow_transiciones) - Transition tracking
   - Task (tareas) - Task management with dependencies
   - TaskDependency (task_dependencies) - Explicit task dependencies

### Documents App Migrations (`/src/documents/migrations/`)

1. **0001_initial.py** - Creates document management models:
   - DocumentType (tipos_documento) - Document type definitions
   - Document (documentos) - Document storage with versioning
   - DocumentReview (revisiones_documento) - Document review process
   - DocumentTemplate (document_templates) - Document templates
   - DocumentAccessLog (document_access_logs) - Access audit trail

2. **0002_create_document_types.py** - Creates 30 document types:
   - Initial Request Documents (4 types)
   - Legal Documents (2 types)
   - Technical Documents (3 types)
   - Valuation Documents (2 types)
   - Environmental Documents (2 types)
   - Urban Planning Documents (2 types)
   - Financial Documents (2 types)
   - Social Impact Documents (2 types)
   - Notification Documents (2 types)
   - Negotiation Documents (3 types)
   - Payment Documents (2 types)
   - Registration Documents (2 types)
   - Supporting Documents (2 types)

## How to Run Migrations

1. **Make sure you're in the backend directory:**
   ```bash
   cd /Users/juanky/WebstormProjects/mopc/.worktrees/mopc-platform/backend
   ```

2. **Run all migrations:**
   ```bash
   python manage.py migrate
   ```

3. **Run migrations for specific app:**
   ```bash
   python manage.py migrate core
   python manage.py migrate workflow
   python manage.py migrate documents
   ```

4. **Check migration status:**
   ```bash
   python manage.py showmigrations
   ```

## Default Login Credentials

After running migrations, you can log in with these default users:

### System Administrator
- **Username:** admin
- **Email:** admin@mopc.gov.do
- **Password:** admin123
- **Role:** Full system administrator with all permissions

### Department Users
- **Username:** juridico_user
- **Email:** juridico@mopc.gov.do
- **Password:** user123
- **Role:** Legal Department user

- **Username:** tecnico_user
- **Email:** tecnico@mopc.gov.do
- **Password:** user123
- **Role:** Technical Department user

- **Username:** valuos_user
- **Email:** valuos@mopc.gov.do
- **Password:** user123
- **Role:** Valuations Department user

- **Username:** finanzas_user
- **Email:** finanzas@mopc.gov.do
- **Password:** user123
- **Role:** Finance Department user

- **Username:** solicitudes_user
- **Email:** solicitudes@mopc.gov.do
- **Password:** user123
- **Role:** Requests Department user

## Database Schema

The migrations create the following database tables:

### Core Tables
- `departamentos` - Department information
- `usuarios` - User accounts
- `permisos` - RBAC permissions
- `usuario_permisos` - User-permission relationships
- `workflow_estados` - Workflow states
- `notificaciones` - System notifications
- `auditoria` - Audit logs

### Workflow Tables
- `expedientes` - Expropriation cases
- `workflow_transiciones` - Workflow transitions
- `tareas` - Tasks
- `task_dependencies` - Task dependencies

### Document Tables
- `tipos_documento` - Document types
- `documentos` - Documents
- `revisiones_documento` - Document reviews
- `document_templates` - Document templates
- `document_access_logs` - Document access logs

## Important Notes

1. **All migrations are reversible** and include proper reverse operations
2. **UUID primary keys** are used for all models for better scalability
3. **Soft delete** is implemented for relevant models (Expediente, Document)
4. **Comprehensive indexing** is set up for performance optimization
5. **Audit logging** is configured for all important operations
6. **RBAC system** is fully implemented with granular permissions
7. **Workflow states** include color coding for UI representation

## Security Considerations

- **Change default passwords** before deploying to production
- **Review user permissions** according to your organizational needs
- **Configure proper database access** in production environment
- **Enable SSL** for database connections in production
- **Regular backups** should be configured for the database

## Performance Optimizations

- Database indexes are created for frequently queried fields
- JSON fields are used for flexible metadata storage
- Soft delete prevents data loss while maintaining performance
- Audit logs are optimized with proper indexing
- Document storage uses efficient path generation

The migrations are now ready to be deployed and will create a fully functional database schema for the MOPC Expropriation Management System.
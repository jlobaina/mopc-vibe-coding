# MOPC Database Schema Design

## Overview

This document outlines the comprehensive database schema for the MOPC Expropriation Management System, designed to support the 16-step workflow while enabling the optimization improvements identified in the process analysis.

## Core Design Principles

1. **Event Sourcing**: All workflow changes stored as immutable events for complete audit trails
2. **Polyglot Persistence**: PostgreSQL for structured data, MongoDB for document metadata
3. **Domain-Driven Design**: Clear bounded contexts for each department
4. **CQRS Pattern**: Separate read and write models for optimal performance

## Primary Database Schema (PostgreSQL)

### Core Entities

```sql
-- Core Expediente Entity
CREATE TABLE expedientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_expediente VARCHAR(50) UNIQUE NOT NULL,
    estado_actual VARCHAR(50) NOT NULL,
    departamento_actual_id UUID REFERENCES departamentos(id),
    propietario_nombre VARCHAR(255) NOT NULL,
    propietario_cedula VARCHAR(20) NOT NULL,
    ubicacion_direccion TEXT NOT NULL,
    ubicacion_municipio VARCHAR(100) NOT NULL,
    ubicacion_provincia VARCHAR(100) NOT NULL,
    area_terreno NUMERIC(15, 2),
    area_construccion NUMERIC(15, 2),
    valor Tasacion NUMERIC(18, 2),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    creado_por_usuario_id UUID REFERENCES usuarios(id),
    metadata JSONB,

    -- Indexes for performance
    INDEX idx_expedientes_estado (estado_actual),
    INDEX idx_expedientes_departamento (departamento_actual_id),
    INDEX idx_expedientes_fecha (fecha_creacion),
    INDEX idx_expedientes_propietario (propietario_cedula)
);

-- Department Master Data
CREATE TABLE departamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descripcion TEXT,
    orden_flujo INTEGER NOT NULL, -- Order in workflow
    puede_procesar_paralelo BOOLEAN DEFAULT FALSE,
    tiempo_responder_horas INTEGER DEFAULT 48,
    activo BOOLEAN DEFAULT TRUE,

    INDEX idx_departamentos_orden (orden_flujo)
);

-- User Management with RBAC
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    departamento_id UUID REFERENCES departamentos(id),
    rol VARCHAR(50) NOT NULL, -- admin, supervisor, analista, etc.
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,

    INDEX idx_usuarios_departamento (departamento_id),
    INDEX idx_usuarios_email (email)
);

-- Role-based Permissions
CREATE TABLE permisos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    recurso VARCHAR(50) NOT NULL, -- expediente, documento, etc.
    accion VARCHAR(50) NOT NULL, -- crear, leer, actualizar, eliminar
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE usuario_permisos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    permiso_id UUID REFERENCES permisos(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, permiso_id)
);
```

### Workflow Management

```sql
-- Workflow States and Transitions
CREATE TABLE workflow_estados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    es_final BOOLEAN DEFAULT FALSE,
    color VARCHAR(7) DEFAULT '#6B7280', -- Hex color for UI
    orden INTEGER NOT NULL
);

CREATE TABLE workflow_transiciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    desde_estado_id UUID REFERENCES workflow_estados(id),
    hacia_estado_id UUID REFERENCES workflow_estados(id),
    desde_departamento_id UUID REFERENCES departamentos(id),
    hacia_departamento_id UUID REFERENCES departamentos(id),
    usuario_id UUID REFERENCES usuarios(id),
    fecha_transicion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    comentarios TEXT,
    motivo_rechazo TEXT,
    metadata JSONB,

    INDEX idx_transiciones_expediente (expediente_id),
    INDEX idx_transiciones_fecha (fecha_transicion)
);

-- Task Management
CREATE TABLE tareas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    departamento_id UUID REFERENCES departamentos(id),
    usuario_asignado_id UUID REFERENCES usuarios(id),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) NOT NULL, -- revision, aprobacion, coordinacion, etc.
    prioridad VARCHAR(20) DEFAULT 'media', -- baja, media, alta, urgente
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento TIMESTAMP,
    fecha_completacion TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, en_progreso, completada, cancelada
    resultado TEXT, -- Result of task completion

    INDEX idx_tareas_expediente (expediente_id),
    INDEX idx_tareas_departamento (departamento_id),
    INDEX idx_tareas_usuario (usuario_asignado_id),
    INDEX idx_tareas_estado (estado),
    INDEX idx_tareas_vencimiento (fecha_vencimiento)
);
```

### Document Management

```sql
-- Document Types and Templates
CREATE TABLE tipos_documento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descripcion TEXT,
    es_requerido BOOLEAN DEFAULT FALSE,
    departamento_id UUID REFERENCES departamentos(id),
    formato_permitido VARCHAR(100), -- PDF, DOC, IMG, etc.
    tamano_maximo_mb INTEGER,
    orden INTEGER,

    INDEX idx_tipos_documento_departamento (departamento_id)
);

-- Document Storage and Versioning
CREATE TABLE documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    tipo_documento_id UUID REFERENCES tipos_documento(id),
    nombre_original VARCHAR(255) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL, -- Stored filename
    ruta_archivo VARCHAR(500) NOT NULL,
    tamano_bytes INTEGER NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    hash_sha256 VARCHAR(64) NOT NULL, -- For integrity verification
    version INTEGER NOT NULL DEFAULT 1,
    documento_padre_id UUID REFERENCES documentos(id), -- For versioning
    subido_por_usuario_id UUID REFERENCES usuarios(id),
    fecha_subida TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento TIMESTAMP, -- For documents with expiration
    estado VARCHAR(20) DEFAULT 'activo', -- activo, reemplazado, eliminado

    INDEX idx_documentos_expediente (expediente_id),
    INDEX idx_documentos_tipo (tipo_documento_id),
    INDEX idx_documentos_estado (estado),
    INDEX idx_documentos_hash (hash_sha256)
);

-- Document Review and Validation
CREATE TABLE revisiones_documento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    documento_id UUID REFERENCES documentos(id) ON DELETE CASCADE,
    revisor_usuario_id UUID REFERENCES usuarios(id),
    resultado VARCHAR(20) NOT NULL, -- aprobado, rechazado, requiere_cambios
    comentarios TEXT,
    fecha_revision TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_revisiones_documento (documento_id),
    INDEX idx_revisiones_revisor (revisor_usuario_id)
);
```

### Financial Management

```sql
-- Payment and Budget Tracking
CREATE TABLE registros_pago (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    monto NUMERIC(18, 2) NOT NULL,
    concepto VARCHAR(255) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, autorizado, pagado, rechazado
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_autorizacion TIMESTAMP,
    fecha_pago TIMESTAMP,
    autorizado_por_usuario_id UUID REFERENCES usuarios(id),
    numero_cheque VARCHAR(50),
    referencia_bancaria VARCHAR(100),

    INDEX idx_pagos_expediente (expediente_id),
    INDEX idx_pagos_estado (estado),
    INDEX idx_pagos_fecha (fecha_creacion)
);

-- Budget Allocations
CREATE TABLE asignaciones_presupuesto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    departamento_id UUID REFERENCES departamentos(id),
    anio_fiscal INTEGER NOT NULL,
    monto_asignado NUMERIC(18, 2) NOT NULL,
    monto_utilizado NUMERIC(18, 2) DEFAULT 0,
    descripcion TEXT,
    creado_por_usuario_id UUID REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_presupuesto_departamento (departamento_id),
    INDEX idx_presupuesto_anio (anio_fiscal)
);
```

### Integration and External Systems

```sql
-- External System Integrations
CREATE TABLE integraciones_externas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sistema VARCHAR(100) NOT NULL, -- catastro, bienes_nacionales, contraloria, etc.
    tipo_integracion VARCHAR(50) NOT NULL, -- api, ftp, batch, etc.
    endpoint_url VARCHAR(500),
    credenciales_cifradas TEXT, -- Encrypted credentials
    activo BOOLEAN DEFAULT TRUE,
    configuracion JSONB,

    INDEX idx_integraciones_sistema (sistema)
);

-- Integration Logs
CREATE TABLE logs_integracion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integracion_id UUID REFERENCES integraciones_externas(id),
    expediente_id UUID REFERENCES expedientes(id),
    tipo_solicitud VARCHAR(50) NOT NULL, -- consulta, envio, recepcion
    datos_enviados JSONB,
    datos_recibidos JSONB,
    estado VARCHAR(20) NOT NULL, -- exitoso, fallido, pendiente
    codigo_error INTEGER,
    mensaje_error TEXT,
    fecha_ejecucion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_logs_integracion_fecha (fecha_ejecucion),
    INDEX idx_logs_integracion_estado (estado)
);
```

### Audit and Security

```sql
-- Comprehensive Audit Log
CREATE TABLE auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tabla_afectada VARCHAR(100) NOT NULL,
    registro_id UUID NOT NULL,
    tipo_accion VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    usuario_id UUID REFERENCES usuarios(id),
    fecha_accion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    datos_antiguos JSONB,
    datos_nuevos JSONB,

    INDEX idx_auditoria_fecha (fecha_accion),
    INDEX idx_auditoria_usuario (usuario_id),
    INDEX idx_auditoria_tabla (tabla_afectada)
);

-- Notification System
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id),
    expediente_id UUID REFERENCES expedientes(id),
    tipo VARCHAR(50) NOT NULL, -- tarea_asignada, documento_requerido, etc.
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP,

    INDEX idx_notificaciones_usuario (usuario_id),
    INDEX idx_notificaciones_leida (leida),
    INDEX idx_notificaciones_fecha (fecha_creacion)
);
```

## Secondary Database Schema (MongoDB)

### Document Metadata and Content
```javascript
// documents collection
{
  _id: ObjectId,
  expedienteId: UUID,
  documentId: UUID, // References PostgreSQL document
  metadata: {
    extractedText: String,
    keywords: [String],
    entities: {
      persons: [String],
      organizations: [String],
      locations: [String]
    },
    confidence: Number
  },
  versions: [{
    version: Number,
    uploadedAt: Date,
    uploadedBy: UUID,
    changes: String
  }],
  fullTextIndex: String, // For search
  extractedAt: Date,
  lastModified: Date
}

// workflow_analytics collection
{
  _id: ObjectId,
  expedienteId: UUID,
  metrics: {
    totalTimeInProcess: Number, // hours
    timeInEachDepartment: [{
      departmentId: UUID,
      timeSpent: Number, // hours
      activities: Number
    }],
    bottlenecks: [String],
    efficiency: Number // percentage
  },
  predictions: {
    estimatedCompletionTime: Date,
    confidence: Number,
    riskFactors: [String]
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Database Optimization Strategies

### Indexes
1. **Composite indexes** for common query patterns
2. **Partial indexes** for filtered queries
3. **JSONB indexes** for metadata queries
4. **Full-text search** indexes for document content

### Partitioning
1. **Time-based partitioning** for audit logs
2. **Range partitioning** for financial records by fiscal year
3. **Hash partitioning** for large document tables

### Materialized Views
```sql
-- Department workload summary
CREATE MATERIALIZED VIEW resumen_carga_departamento AS
SELECT
    d.id as departamento_id,
    d.nombre as departamento_nombre,
    COUNT(t.id) as tareas_pendientes,
    COUNT(e.id) as expedientes_en_proceso,
    AVG(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - t.fecha_creacion))/3600) as tiempo_promedio_tareas
FROM departamentos d
LEFT JOIN tareas t ON d.id = t.departamento_id AND t.estado = 'pendiente'
LEFT JOIN expedientes e ON d.id = e.departamento_actual_id AND e.estado_actual != 'completado'
GROUP BY d.id, d.nombre;

-- Refresh strategy
CREATE OR REPLACE FUNCTION refresh_department_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY resumen_carga_departamento;
END;
$$ LANGUAGE plpgsql;
```

## Security Considerations

1. **Row-Level Security**: Implement RLS for sensitive data
2. **Encryption**: Encrypt PII and financial data at rest
3. **Audit Trails**: Complete audit logging for all operations
4. **Access Controls**: Granular permissions by department and role

## Migration Strategy

1. **Phase 1**: Core tables (expedientes, departamentos, usuarios)
2. **Phase 2**: Workflow and document management
3. **Phase 3**: Financial and integration tables
4. **Phase 4**: Analytics and optimization tables

This schema provides the foundation for a robust, scalable, and secure expropriation management system that addresses all the identified issues in the current 16-step process while enabling the proposed optimizations.
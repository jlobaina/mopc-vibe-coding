# Plataforma de Expropiación MOPC

Plataforma digital integral para la gestión y seguimiento de casos de expropiación en la República Dominicana, desarrollada con tecnologías modernas para garantizar eficiencia, seguridad y trazabilidad.

## 🚀 Características Principales

### Gestión de Casos
- Seguimiento completo del ciclo de vida de casos de expropiación
- Sistema de 17 etapas definidas con aprobaciones y validaciones
- Asignación automática y manual de casos
- Historial completo de cambios y actividades

### Gestión de Usuarios y Roles
- Sistema de autenticación seguro con NextAuth.js
- Roles basados en permisos (Super Admin, Dept. Admin, Analista, Supervisor, Observador, Coordinador de Reuniones Técnicas)
- Jerarquía de departamentos con relaciones padre-hijo
- Control de acceso granular

### Documentos
- Gestión de documentos con control de versiones
- Soporte para múltiples formatos de archivo
- Indexación y búsqueda avanzada
- Permisos de acceso por documento

### Reportes y Análisis
- Dashboard con métricas en tiempo real
- Reportes personalizables por departamento y período
- Exportación a CSV, Excel y PDF
- Análisis de tendencias y estadísticas

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15 con App Router y TypeScript
- **Estilos**: Tailwind CSS con shadcn/ui
- **Base de Datos**: SQLite con Prisma ORM
- **Autenticación**: NextAuth.js con adaptador Prisma
- **Validación**: Zod y React Hook Form
- **Estado**: React Context y Zustand
- **Testing**: Jest y Testing Library

## 📋 Requisitos del Sistema

- Node.js 18.0 o superior
- npm o yarn
- SQLite 3

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd expropriation-platform
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```

   Editar `.env.local` con las configuraciones necesarias:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Configurar la base de datos**
   ```bash
   npm run db:push
   npm run db:generate
   npm run db:seed
   ```

5. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
expropriation-platform/
├── prisma/
│   ├── schema.prisma          # Esquema de la base de datos
│   └── migrations/            # Migraciones de la base de datos
├── src/
│   ├── app/                   # App Router de Next.js
│   │   ├── globals.css        # Estilos globales
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página de inicio
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes de UI (shadcn/ui)
│   │   ├── forms/            # Formularios
│   │   └── layout/           # Componentes de layout
│   ├── lib/                  # Utilidades y configuraciones
│   │   ├── prisma.ts         # Cliente de Prisma
│   │   └── utils.ts          # Funciones utilitarias
│   ├── types/                # Definiciones de TypeScript
│   ├── hooks/                # Custom hooks
│   ├── store/                # Gestión de estado
│   └── config/               # Configuraciones
├── public/                   # Archivos estáticos
├── uploads/                  # Archivos subidos
└── docs/                     # Documentación
```

## 🗄️ Base de Datos

### Modelos Principales

- **Department**: Gestión de departamentos con jerarquía
- **User**: Usuarios con roles y permisos
- **Role**: Definición de roles con permisos JSON
- **Case**: Gestión completa de casos de expropiación
- **Document**: Gestión de documentos con versiones
- **Activity**: Registro de auditoría de actividades
- **CaseHistory**: Historial de cambios de estado
- **TechnicalMeeting**: Gestión de reuniones técnicas

### Relaciones

El esquema está diseñado para mantener integridad referencial y permitir consultas eficientes con relaciones bien definidas entre todos los modelos.

## 🔐 Roles y Permisos

### Roles Disponibles

1. **Super Admin**: Acceso completo a todo el sistema
2. **Department Admin**: Administración de usuarios y casos en su departamento
3. **Analyst**: Gestión de casos asignados
4. **Supervisor**: Supervisión y aprobación de casos
5. **Observer**: Solo lectura de casos y reportes
6. **Technical Meeting Coordinator**: Gestión de reuniones técnicas

### Permisos

Los permisos se almacenan como JSON en la base de datos, permitiendo configuraciones flexibles y granulares.

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev                 # Iniciar servidor de desarrollo
npm run build              # Compilar para producción
npm run start              # Iniciar servidor de producción

# Calidad de código
npm run lint               # Ejecutar ESLint
npm run lint:fix           # Corregir problemas de ESLint
npm run format             # Formatear código con Prettier
npm run type-check         # Verificación de tipos TypeScript

# Base de datos
npm run db:generate        # Generar cliente Prisma
npm run db:push            # Sincronizar esquema con DB
npm run db:migrate         # Ejecutar migraciones
npm run db:studio          # Abrir Prisma Studio
npm run db:seed            # Poblar base de datos con datos iniciales
npm run db:reset           # Resetear base de datos

# Testing
npm run test               # Ejecutar tests
npm run test:watch         # Tests en modo watch
npm run test:coverage      # Tests con cobertura
```

## 🎨 Guía de Estilos

### CSS Variables

El proyecto utiliza CSS variables para mantener consistencia en los colores y estilos:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --secondary: 240 4.8% 95.9%;
  --muted: 240 4.8% 95.9%;
  --accent: 240 4.8% 95.9%;
  --destructive: 0 84.2% 60.2%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 10% 3.9%;
  --radius: 0.5rem;
}
```

### Componentes

Todos los componentes siguen el patrón de shadcn/ui con:
- Consistencia en el uso de Tailwind CSS
- Accesibilidad con Radix UI
- TypeScript para type safety
- Variants con class-variance-authority

## 🔧 Configuración de Entorno

### Variables de Entorno Requeridas

```env
# Base de Datos
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Aplicación
NODE_ENV="development"
APP_NAME="Plataforma de Expropiación"
APP_URL="http://localhost:3000"

# Upload de Archivos
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760"

# Seguridad
BCRYPT_ROUNDS="12"
SESSION_MAX_AGE="86400"
```

## 📝 Flujo de Trabajo de Casos

### Etapas del Proceso

1. **Revisión Inicial**: Validación de documentos básicos
2. **Verificación Legal**: Revisión de aspectos legales
3. **Evaluación Técnica**: Análisis técnico del caso
4. **Avalúo**: Determinación del valor del inmueble
5. **Notificación**: Comunicación con las partes
6. **Negociación**: Proceso de negociación
7. **Acuerdo**: Formalización del acuerdo
8. **Documentación**: Preparación de documentos finales
9. **Aprobación**: Aprobación final
10. **Ejecución**: Ejecución del acuerdo
11. **Seguimiento**: Seguimiento post-ejecución
12. **Cierre**: Cierre del caso

### Transiciones Automáticas

El sistema puede configurarse para transiciones automáticas entre etapas basadas en:
- Tiempo transcurrido
- Aprobaciones recibidas
- Documentos completados
- Requisitos cumplidos

## 🧪 Testing

### Estrategia de Testing

- **Unit Tests**: Lógica de negocio y utilidades
- **Integration Tests**: API routes y componentes
- **E2E Tests**: Flujos completos de usuario
- **Visual Tests**: Consistencia visual de componentes

### Ejecutar Tests

```bash
npm run test              # Todos los tests
npm run test:watch        # Tests en modo watch
npm run test:coverage     # Con cobertura de código
```

## 🚀 Despliegue

### Producción

1. **Variables de Entorno**: Configurar todas las variables de producción
2. **Base de Datos**: Ejecutar migraciones en producción
3. **Build**: Compilar la aplicación
4. **Assets**: Optimizar y subir archivos estáticos

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel --prod
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Monitorización

### Métricas Importantes

- Rendimiento de consultas a la base de datos
- Tiempo de respuesta de la API
- Tasa de errores y excepciones
- Uso de recursos del sistema

### Herramientas Sugeridas

- **Sentry**: Error tracking
- **Vercel Analytics**: Métricas de usuario
- **Prisma Studio**: Gestión de base de datos
- **Next.js Bundle Analyzer**: Optimización de bundle

## 🤝 Contribución

### Flujo de Trabajo

1. Fork del repositorio
2. Crear feature branch (`git checkout -b feature/amazing-feature`)
3. Commit con mensajes descriptivos
4. Push al branch (`git push origin feature/amazing-feature`)
5. Crear Pull Request

### Convenciones

- **Commits**: Seguir [Conventional Commits](https://www.conventionalcommits.org/)
- **Code Review**: Todo código requiere revisión
- **Tests**: Todo cambio debe incluir tests
- **Documentación**: Actualizar documentación relevante

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Para soporte técnico o preguntas:

- Email: support@mopc.gob.do
- Documentación: [docs/](./docs/)
- Issues: [GitHub Issues](https://github.com/mopc/expropriation-platform/issues)

## 🗺️ Roadmap

### v1.0 (Lanzamiento)
- ✅ Gestión básica de casos
- ✅ Sistema de usuarios y roles
- ✅ Gestión de documentos
- ✅ Dashboard básico

### v1.1 (Mejoras)
- 🔄 Notificaciones en tiempo real
- 🔄 Móvil responsive mejorado
- 🔄 Reportes avanzados
- 🔄 Integración con APIs gubernamentales

### v2.0 (Futuro)
- 📋 Sistema de workflows personalizable
- 📋 Inteligencia artificial para predicciones
- 📋 Integración con sistemas de pago
- 📋 Portal público para ciudadanos
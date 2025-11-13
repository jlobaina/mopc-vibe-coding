# Setup Guide

Guía completa de instalación y configuración para la Plataforma de Expropiación MOPC.

## 📋 Requisitos del Sistema

- **Node.js**: 22.2 o superior
- **npm** o **yarn**
- **SQLite 3**
- **Git**

## 🔧 Instalación Detallada

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd expropriation-platform
```

### 2. Instalar Dependencias

```bash
# Usando npm
npm install

# O usando yarn
yarn install
```

### 3. Configurar Variables de Entorno

```bash
cp .env.example .env.local
```

Edita el archivo `.env.local` con las siguientes configuraciones:

#### Variables Obligatorias

```env
# Base de Datos
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-min-32-chars"

# Aplicación
NODE_ENV="development"
APP_NAME="Plataforma de Expropiación"
APP_URL="http://localhost:3000"
```

#### Variables Opcionales

```env
# Upload de Archivos
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760"  # 10MB en bytes

# Seguridad
BCRYPT_ROUNDS="12"
SESSION_MAX_AGE="86400"    # 24 horas en segundos

# Email (opcional, para notificaciones)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

**Importante**: `NEXTAUTH_SECRET` debe ser una cadena de al menos 32 caracteres. Puedes generar una con:
```bash
openssl rand -base64 32
```

### 4. Configurar Base de Datos

```bash
# Generar cliente Prisma
npm run db:generate

# Sincronizar esquema con la base de datos
npm run db:push

# Poblar base de datos con datos iniciales
npm run db:seed
```

### 5. Verificar Instalación

```bash
# Iniciar servidor de desarrollo
npm run dev
```

La aplicación debería estar disponible en [http://localhost:3000](http://localhost:3000).

## 🔍 Verificación Post-Instalación

### 1. Verificar Base de Datos

```bash
# Abrir Prisma Studio para visualizar datos
npm run db:studio
```

Deberías ver las siguientes tablas con datos iniciales:
- `Department` (al menos 1 departamento)
- `Role` (6 roles predefinidos)
- `User` (usuario admin por defecto)

### 2. Usuarios por Defecto

| Email | Password | Rol |
|-------|----------|-----|
| admin@mopc.gob.do | admin123 | Super Admin |
| dept.admin@mopc.gob.do | admin123 | Department Admin |
| analyst@mopc.gob.do | admin123 | Analyst |

### 3. Verificar Archivos Creados

Asegúrate de que existen estos archivos y directorios:
- `dev.db` (base de datos SQLite)
- `uploads/` (directorio para archivos)
- `.next/` (directorio de build de Next.js)

### 4. Test de Autenticación

1. Visita `http://localhost:3000/auth/signin`
2. Inicia sesión con las credenciales del usuario seed
3. Verifica que puedas acceder al dashboard

## 🛠️ Comandos de Base de Datos

```bash
# Generar cliente Prisma
npm run db:generate

# Sincronizar esquema (sin migraciones)
npm run db:push

# Crear y ejecutar migraciones
npm run db:migrate

# Resetear base de datos (¡cuidado en producción!)
npm run db:reset

# Ver datos en interfaz gráfica
npm run db:studio

# Sembrar datos iniciales
npm run db:seed
```

## 🔧 Solución de Problemas

### Problemas Comunes

#### 1. Error: "Database connection failed"
```bash
# Verificar archivo .env.local
cat .env.local | grep DATABASE_URL

# Recrear base de datos
rm dev.db
npm run db:push
npm run db:seed
```

#### 2. Error: "NEXTAUTH_SECRET is required"
```bash
# Generar nuevo secreto
openssl rand -base64 32

# Agregar a .env.local
echo "NEXTAUTH_SECRET=tu-nuevo-secreto" >> .env.local
```

#### 3. Error: "Module not found" después de instalar
```bash
# Limpiar caché de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

#### 4. Error de permisos en uploads
```bash
# Asegurar permisos correctos
chmod 755 uploads/
chmod 644 uploads/*  # si hay archivos
```

#### 5. Puerto 3000 en uso
```bash
# Ver qué proceso usa el puerto
lsof -ti:3000

# Matar proceso
kill -9 $(lsof -ti:3000)

# O usar otro puerto
npm run dev -- -p 3001
```

### Verificación de Dependencias

```bash
# Verificar versión de Node
node --version  # debe ser >= 18.0

# Verificar versión de npm
npm --version

# Verificar instalación de Prisma
npx prisma --version

# Verificar instalación de Next.js
npx next --version
```

## 🌐 Configuración de Entorno

### Desarrollo
```env
NODE_ENV="development"
NEXTAUTH_URL="http://localhost:3000"
DATABASE_URL="file:./dev.db"
```

### Producción
```env
NODE_ENV="production"
NEXTAUTH_URL="https://tu-dominio.com"
DATABASE_URL="file:./prod.db"
```

### Docker
Si usas Docker, ajusta las variables:
```env
DATABASE_URL="file:./data/app.db"
NEXTAUTH_URL="http://localhost:3000"
```

## 📝 Notas Adicionales

- **SQLite**: La base de datos se crea como un archivo local. Haz backup regularmente de `dev.db`.
- **Archivos**: Los archivos subidos se guardan en `uploads/`. Este directorio debe estar en tu backup.
- **Sesiones**: Las sesiones expiran después de 24 horas por defecto.
- **Email**: La configuración de email es opcional pero recomendada para notificaciones.

## 🆘 Ayuda Adicional

Si encuentras problemas no cubiertos en esta guía:

1. Revisa los [logs del servidor](../logs/)
2. Consulta la [documentación de desarrollo](./DEVELOPMENT.md)
3. Crea un issue en el repositorio del proyecto

---

**Siguiente paso**: Una vez configurado, consulta la [Guía de Desarrollo](./DEVELOPMENT.md) para empezar a trabajar con el proyecto.
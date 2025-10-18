import { PrismaClient, CaseStage, CaseStatus, Priority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super_admin' },
    update: {},
    create: {
      name: 'super_admin',
      description: 'Administrador con acceso completo al sistema',
      permissions: {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canAssign: true,
        canSupervise: true,
        canExport: true,
        canManageUsers: true,
      },
    },
  });

  const deptAdminRole = await prisma.role.upsert({
    where: { name: 'department_admin' },
    update: {},
    create: {
      name: 'department_admin',
      description: 'Administrador de departamento',
      permissions: {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: false,
        canAssign: true,
        canSupervise: true,
        canExport: true,
        canManageUsers: false,
      },
    },
  });

  const analystRole = await prisma.role.upsert({
    where: { name: 'analyst' },
    update: {},
    create: {
      name: 'analyst',
      description: 'Analista de casos',
      permissions: {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: false,
        canAssign: false,
        canSupervise: false,
        canExport: true,
        canManageUsers: false,
      },
    },
  });

  const supervisorRole = await prisma.role.upsert({
    where: { name: 'supervisor' },
    update: {},
    create: {
      name: 'supervisor',
      description: 'Supervisor de casos',
      permissions: {
        canCreate: false,
        canRead: true,
        canUpdate: true,
        canDelete: false,
        canAssign: true,
        canSupervise: true,
        canExport: true,
        canManageUsers: false,
      },
    },
  });

  const observerRole = await prisma.role.upsert({
    where: { name: 'observer' },
    update: {},
    create: {
      name: 'observer',
      description: 'Observador con solo lectura',
      permissions: {
        canCreate: false,
        canRead: true,
        canUpdate: false,
        canDelete: false,
        canAssign: false,
        canSupervise: false,
        canExport: false,
        canManageUsers: false,
      },
    },
  });

  // Create departments
  const mainDepartment = await prisma.department.upsert({
    where: { code: 'MOPC' },
    update: {},
    create: {
      name: 'Ministerio de Obras Públicas y Comunicaciones',
      code: 'MOPC',
      isActive: true,
    },
  });

  const legalDept = await prisma.department.upsert({
    where: { code: 'LEGAL' },
    update: {},
    create: {
      name: 'Departamento Jurídico',
      code: 'LEGAL',
      parentId: mainDepartment.id,
      isActive: true,
    },
  });

  const technicalDept = await prisma.department.upsert({
    where: { code: 'TECHNICAL' },
    update: {},
    create: {
      name: 'Departamento Técnico',
      code: 'TECHNICAL',
      parentId: mainDepartment.id,
      isActive: true,
    },
  });

  // Create users
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@mopc.gob.do' },
    update: {},
    create: {
      email: 'admin@mopc.gob.do',
      username: 'admin',
      passwordHash: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '809-555-0100',
      departmentId: mainDepartment.id,
      roleId: superAdminRole.id,
      isActive: true,
    },
  });

  const deptAdmin = await prisma.user.upsert({
    where: { email: 'dept.admin@mopc.gob.do' },
    update: {},
    create: {
      email: 'dept.admin@mopc.gob.do',
      username: 'dept_admin',
      passwordHash: hashedPassword,
      firstName: 'Dept',
      lastName: 'Admin',
      phone: '809-555-0101',
      departmentId: legalDept.id,
      roleId: deptAdminRole.id,
      isActive: true,
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@mopc.gob.do' },
    update: {},
    create: {
      email: 'analyst@mopc.gob.do',
      username: 'analyst',
      passwordHash: hashedPassword,
      firstName: 'Juan',
      lastName: 'Analista',
      phone: '809-555-0102',
      departmentId: legalDept.id,
      roleId: analystRole.id,
      isActive: true,
    },
  });

  // Create system configuration
  await prisma.systemConfig.upsert({
    where: { key: 'app_version' },
    update: {},
    create: {
      key: 'app_version',
      value: '1.0.0',
      type: 'string',
      category: 'system',
      description: 'Versión actual de la aplicación',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'max_file_size' },
    update: {},
    create: {
      key: 'max_file_size',
      value: '10485760',
      type: 'number',
      category: 'upload',
      description: 'Tamaño máximo de archivo en bytes (10MB)',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'allowed_file_types' },
    update: {},
    create: {
      key: 'allowed_file_types',
      value: 'pdf,doc,docx,xls,xlsx,jpg,jpeg,png',
      type: 'json',
      category: 'upload',
      description: 'Tipos de archivo permitidos para subida',
    },
  });

  // Sample cases will be created later after authentication is tested

  console.log('✅ Database seeding completed successfully!');
  console.log('');
  console.log('👤 Created users:');
  console.log('   - admin@mopc.gob.do / admin123 (Super Admin)');
  console.log('   - dept.admin@mopc.gob.do / admin123 (Department Admin)');
  console.log('   - analyst@mopc.gob.do / admin123 (Analyst)');
  console.log('');
  console.log('🏢 Created departments:');
  console.log('   - MOPC (Main)');
  console.log('   - LEGAL (Child of MOPC)');
  console.log('   - TECHNICAL (Child of MOPC)');
  console.log('');
  console.log('⚙️ Created system configuration');
  console.log('📋 Sample cases will be created later');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import { PrismaClient } from '@prisma/client';
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

  // Create sample cases
  const sampleCase1 = await prisma.case.upsert({
    where: { caseNumber: 'EXP-2024-0001' },
    update: {},
    create: {
      caseNumber: 'EXP-2024-0001',
      title: 'Expropiación para construcción de carretera',
      description: 'Caso de expropiación para la construcción de la nueva carretera Duarte-KM9',
      currentStage: 'initial_review',
      priority: 'high',
      status: 'active',
      locationAddress: 'Calle Duarte #123',
      locationCity: 'Santo Domingo',
      locationProvince: 'Distrito Nacional',
      estimatedValue: 5000000,
      departmentId: legalDept.id,
      createdById: deptAdmin.id,
      assignedToId: analyst.id,
    },
  });

  const sampleCase2 = await prisma.case.upsert({
    where: { caseNumber: 'EXP-2024-0002' },
    update: {},
    create: {
      caseNumber: 'EXP-2024-0002',
      title: 'Expropiación para proyecto hidroeléctrico',
      description: 'Adquisición de terrenos para la construcción de una planta hidroeléctrica en la región sur',
      currentStage: 'technical_evaluation',
      priority: 'medium',
      status: 'active',
      locationAddress: 'Carretera Sánchez #456',
      locationCity: 'Barahona',
      locationProvince: 'Barahona',
      estimatedValue: 12000000,
      departmentId: technicalDept.id,
      createdById: deptAdmin.id,
      assignedToId: analyst.id,
    },
  });

  const sampleCase3 = await prisma.case.upsert({
    where: { caseNumber: 'EXP-2024-0003' },
    update: {},
    create: {
      caseNumber: 'EXP-2024-0003',
      title: 'Expropiación para expansión de puerto',
      description: 'Expansión de las instalaciones del puerto de Santo Domingo para aumentar capacidad de carga',
      currentStage: 'legal_review',
      priority: 'urgent',
      status: 'active',
      locationAddress: 'Avenida George Washington #789',
      locationCity: 'Santo Domingo',
      locationProvince: 'Distrito Nacional',
      estimatedValue: 25000000,
      departmentId: legalDept.id,
      createdById: deptAdmin.id,
      assignedToId: deptAdmin.id,
      supervisedById: superAdmin.id,
    },
  });

  const sampleCase4 = await prisma.case.upsert({
    where: { caseNumber: 'EXP-2023-0999' },
    update: {},
    create: {
      caseNumber: 'EXP-2023-0999',
      title: 'Expropiación para línea de transmisión eléctrica',
      description: 'Instalación de torres de alta tensión para interconexión eléctrica regional',
      currentStage: 'completed',
      priority: 'low',
      status: 'completed',
      locationAddress: 'Carretera Mella #321',
      locationCity: 'Santiago',
      locationProvince: 'Santiago',
      estimatedValue: 3500000,
      actualValue: 3200000,
      startDate: new Date('2023-01-15'),
      expectedEndDate: new Date('2023-06-30'),
      actualEndDate: new Date('2023-07-15'),
      progressPercentage: 100,
      departmentId: technicalDept.id,
      createdById: superAdmin.id,
      assignedToId: analyst.id,
    },
  });

  const sampleCase5 = await prisma.case.upsert({
    where: { caseNumber: 'EXP-2024-0004' },
    update: {},
    create: {
      caseNumber: 'EXP-2024-0004',
      title: 'Expropiación para parque nacional',
      description: 'Creación de un área protegida y parque nacional en la zona este del país',
      currentStage: 'public_consultation',
      priority: 'medium',
      status: 'active',
      locationAddress: 'Calle Principal #100',
      locationCity: 'Higüey',
      locationProvince: 'La Altagracia',
      estimatedValue: 8000000,
      departmentId: legalDept.id,
      createdById: deptAdmin.id,
      assignedToId: analyst.id,
      supervisedById: deptAdmin.id,
    },
  });

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
  console.log('📋 Created sample cases:');
  console.log(`   - ${sampleCase1.caseNumber}: ${sampleCase1.title} (${sampleCase1.currentStage})`);
  console.log(`   - ${sampleCase2.caseNumber}: ${sampleCase2.title} (${sampleCase2.currentStage})`);
  console.log(`   - ${sampleCase3.caseNumber}: ${sampleCase3.title} (${sampleCase3.currentStage})`);
  console.log(`   - ${sampleCase4.caseNumber}: ${sampleCase4.title} (${sampleCase4.currentStage})`);
  console.log(`   - ${sampleCase5.caseNumber}: ${sampleCase5.title} (${sampleCase5.currentStage})`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
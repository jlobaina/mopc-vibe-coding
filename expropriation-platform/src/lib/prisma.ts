import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db'

  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Connection pooling configuration for SQLite (via better-sqlite3)
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })

  // Enhanced connection health check (server-side only)
  if (typeof window === 'undefined') {
    client.$connect()
      .then(() => {
        console.log('✅ Database connected successfully')
      })
      .catch((error) => {
        console.error('❌ Database connection failed:', error)
        // In production, you might want to implement retry logic here
      })

    // Graceful shutdown (server-side only)
    if (typeof process !== 'undefined') {
      process.on('beforeExit', async () => {
        await client.$disconnect()
        console.log('📴 Database disconnected')
      })
    }
  }

  return client
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { logUserLogin, logFailedLogin } from '@/lib/activity-logger';

const credentialsSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Correo electrónico', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Validate credentials with Zod
        const validatedCredentials = credentialsSchema.safeParse(credentials);
        if (!validatedCredentials.success) {
          return null;
        }

        const { email, password } = validatedCredentials.data;
        const ipAddress = req.headers['x-forwarded-for'] as string || req.ip;
        const userAgent = req.headers['user-agent'];

        // Find user with all necessary relations
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            department: true,
            role: true,
          },
        });

        if (!user) {
          // Log failed login for non-existent user
          await logFailedLogin(email, ipAddress, userAgent);
          return null;
        }

        // Check if user is active and not suspended
        if (!user.isActive || user.isSuspended) {
          await logFailedLogin(email, ipAddress, userAgent);
          return null;
        }

        // Check if account is locked due to failed attempts
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          return null;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
          // Log failed login
          await logFailedLogin(email, ipAddress, userAgent);
          return null;
        }

        // Check if user must change password
        if (user.mustChangePassword) {
          // Return user but with a flag to force password change
          const userData = {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            role: user.role.name,
            department: user.department.name,
            departmentId: user.departmentId,
            roleId: user.roleId,
            permissions: user.role.permissions as Record<string, boolean>,
            isActive: user.isActive,
            phone: user.phone,
            avatar: user.avatar,
            mustChangePassword: true,
          };

          return userData;
        }

        // Log successful login and update user info
        await logUserLogin(user.id, ipAddress, userAgent);

        // Create user session record
        const sessionToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        await prisma.userSession.create({
          data: {
            userId: user.id,
            sessionToken,
            ipAddress,
            userAgent,
            deviceInfo: JSON.stringify({
              ip: ipAddress,
              userAgent,
              timestamp: new Date().toISOString(),
            }),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        });

        // Return user data in the format expected by NextAuth
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          role: user.role.name,
          department: user.department.name,
          departmentId: user.departmentId,
          roleId: user.roleId,
          permissions: user.role.permissions as Record<string, boolean>,
          isActive: user.isActive,
          phone: user.phone,
          avatar: user.avatar,
          sessionToken,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update session every hour
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Update token when user signs in
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.username = user.username;
        token.role = user.role;
        token.department = user.department;
        token.departmentId = user.departmentId;
        token.roleId = user.roleId;
        token.permissions = user.permissions;
        token.isActive = user.isActive;
        token.phone = user.phone;
        token.avatar = user.avatar;
      }

      // Handle session updates (e.g., when role changes)
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.department = token.department as string;
        session.user.departmentId = token.departmentId as string;
        session.user.roleId = token.roleId as string;
        session.user.permissions = token.permissions as Record<string, boolean>;
        session.user.isActive = token.isActive as boolean;
        session.user.phone = token.phone as string;
        session.user.avatar = token.avatar as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login?error=true',
    signOut: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development',
};
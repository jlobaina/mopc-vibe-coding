# 🚀 Quick Setup Guide

This guide will help you get the expropriation platform running in minutes.

## Prerequisites

- Node.js 18.0 or higher
- npm or yarn
- Git

## ⚡ Quick Start

1. **Navigate to the project directory**
   ```bash
   cd expropriation-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   npm run db:generate
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Default Users

The database is seeded with the following users:

| Email | Password | Role |
|-------|----------|------|
| admin@mopc.gob.do | admin123 | Super Admin |
| dept.admin@mopc.gob.do | admin123 | Department Admin |
| analyst@mopc.gob.do | admin123 | Analyst |

## 🗄️ Database Management

### View Database
```bash
npm run db:studio
```

### Reset Database
```bash
npm run db:reset
npm run db:seed
```

### Add New Data
```bash
npm run db:seed
```

## 🛠️ Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run type-check   # Check TypeScript types
```

### Testing
```bash
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env.local`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
NODE_ENV="development"
```

### Database Configuration

The platform uses SQLite with Prisma ORM. The database file is located at `./prisma/dev.db`.

## 🐛 Troubleshooting

### Build Issues

If you encounter build issues:

1. Clear the cache:
   ```bash
   rm -rf .next
   npm run build
   ```

2. Regenerate Prisma client:
   ```bash
   npm run db:generate
   ```

### Database Issues

If you have database problems:

1. Reset the database:
   ```bash
   npm run db:reset
   npm run db:seed
   ```

2. Check database status:
   ```bash
   npm run db:studio
   ```

### Port Issues

If port 3000 is already in use:

1. Kill existing processes:
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. Or use a different port:
   ```bash
   PORT=3001 npm run dev
   ```
   *Note: If you use a different port, make sure to update NEXTAUTH_URL and APP_URL in your .env.local file to match.*

## 📚 Next Steps

1. **Explore the dashboard**: Log in with the admin user
2. **Review the database**: Open Prisma Studio to see the data structure
3. **Read the documentation**: Check the main README.md for detailed information
4. **Start development**: Begin building new features

## 🤝 Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review the [Prisma schema](./prisma/schema.prisma) for database structure
- Look at the [components directory](./src/components) for UI examples
- Check the [API routes](./src/app/api) for backend examples

## 🚀 Production Deployment

When ready for production:

1. Update environment variables
2. Build the application: `npm run build`
3. Start production server: `npm run start`
4. Set up a production database
5. Configure reverse proxy (nginx/Apache)
6. Set up SSL certificates

For detailed deployment instructions, see the [README.md](./README.md) file.
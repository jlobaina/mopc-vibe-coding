# GitHub Action Deployment Setup for Google Cloud Platform (Staging Environment)

## Overview
Create a complete CI/CD pipeline that automatically deploys the expropriation-platform to Google Cloud Platform as a **staging environment** when code is merged to the main branch. The environment will run in production mode with debugging options hidden, optimized for ~10 concurrent users using the latest Node.js LTS version (20.x).

## Prerequisites
- Google Cloud Platform project with billing enabled
- Google Cloud CLI installed and configured
- Domain name configured (if using custom domain)
- Project repository on GitHub
- Latest Node.js LTS (20.x) for local development

## Step-by-Step Implementation Guide

### Step 1: Google Cloud Platform Setup
1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing one
   - Enable billing for the project

2. **Enable Required APIs**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   gcloud services enable sql-component.googleapis.com
   gcloud services enable sqladmin.googleapis.com
   ```

3. **Create Artifact Registry Repository**
   ```bash
   gcloud artifacts repositories create expropriation-repo \
     --repository-format=docker \
     --location=us-central1 \
     --description="Docker repository for expropriation platform"
   ```

4. **Set up Cloud SQL Database (Optimized for Staging)**
   ```bash
   # Create PostgreSQL instance (optimized for ~10 users)
   gcloud sql instances create expropriation-staging-db \
     --database-version=POSTGRES_15 \
     --tier=db-g1-small \
     --region=us-central1 \
     --storage-size=20GB \
     --storage-type=SSD \
     --backup-start-time=02:00 \
     --maintenance-release-channel=production

   # Create database
   gcloud sql databases create expropriation_staging_db \
     --instance=expropriation-staging-db

   # Create database user
   gcloud sql users create expropriation_staging_user \
     --instance=expropriation-staging-db \
     --password=YOUR_SECURE_STAGING_PASSWORD
   ```

### Step 2: Application Configuration Updates

1. **Update Dockerfile (Production Mode with Node.js 20 LTS)**
   ```dockerfile
   # Use multi-stage build for optimization with Node.js 20 LTS
   FROM node:20-alpine AS base
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production && npm cache clean --force

   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   # Generate Prisma client during build
   RUN npx prisma generate
   # Build the application in production mode
   ENV NODE_ENV=production
   RUN npm run build

   FROM node:20-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV=production

   # Add a non-root user for security
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs

   # Copy necessary files
   COPY --from=base /app/node_modules ./node_modules
   COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
   COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
   COPY --from=builder --chown=nextjs:nodejs /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

   USER nextjs

   EXPOSE 3000
   ENV PORT 3000
   # Ensure debugging is disabled in production
   ENV NODE_OPTIONS="--max-old-space-size=1536"
   CMD ["npm", "start"]
   ```

2. **Create .dockerignore**
   ```
   .git
   .gitignore
   README.md
   node_modules
   .next
   .env.local
   .env.development.local
   .env.test.local
   .DS_Store
   ```

3. **Update Prisma Configuration**
   ```javascript
   // prisma/schema.prisma - Update database URL for production
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

### Step 3: GitHub Secrets Configuration

1. **Generate Google Cloud Service Account Key**
   ```bash
   # Create service account
   gcloud iam service-accounts create github-actions \
     --description="Service account for GitHub Actions" \
     --display-name="GitHub Actions Deployer"

   # Grant necessary permissions
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/run.admin"

   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/cloudbuild.builds.builder"

   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/secretmanager.admin"

   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/cloudsql.client"

   # Create and download JSON key
   gcloud iam service-accounts keys create ~/key.json \
     --iam-account=github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

2. **Add Secrets to GitHub Repository (Staging Environment)**
   - `GCP_PROJECT_ID`: Your Google Cloud project ID
   - `GCP_SA_KEY`: Content of the downloaded JSON key file
   - `GCP_REGION`: Deployment region (e.g., us-central1)
   - `DATABASE_URL`: `postgresql://expropriation_staging_user:PASSWORD@/expropriation_staging_db?host=/cloudsql/PROJECT_ID:REGION:expropriation-staging-db`
   - `DATABASE_PASSWORD`: Staging database password
   - `NEXTAUTH_SECRET`: Random secret for NextAuth (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL`: Staging environment URL (e.g., `https://staging.expropriation-platform.com`)
   - `REPOSITORY_NAME`: Artifact Registry repository name (e.g., `expropriation-staging-repo`)
   - `SERVICE_NAME`: Cloud Run service name (e.g., `expropriation-staging`)

### Step 4: Create GitHub Action Workflow

Create file: `.github/workflows/deploy-staging.yml`

```yaml
name: Deploy to Staging

on:
  push:
    branches: [ main ]
  workflow_dispatch:

env:
  GCP_PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  GCP_REGION: ${{ secrets.GCP_REGION }}
  REPOSITORY_NAME: ${{ secrets.REPOSITORY_NAME }}
  SERVICE_NAME: ${{ secrets.SERVICE_NAME }}
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  NODE_ENV: production

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'  # Latest LTS version
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run tests
        run: npm run test

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: 'read'
      id-token: 'write'

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Google Auth
        id: auth
        uses: 'google-github-actions/auth@v1'
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Setup Cloud SDK
        uses: 'google-github-actions/setup-gcloud@v1'
        with:
          version: '>= 363.0.0'

      - name: Configure Docker to use gcloud as a credential helper
        run: gcloud auth configure-docker ${{ env.GCP_REGION }}-docker.pkg.dev

      - name: Build and push Docker image
        run: |
          # Build and tag the image
          docker build -t ${{ env.GCP_REGION }}-docker.pkg.dev/${{ env.GCP_PROJECT_ID }}/${{ env.REPOSITORY_NAME }}/expropriation-platform:${{ github.sha }} .
          docker build -t ${{ env.GCP_REGION }}-docker.pkg.dev/${{ env.GCP_PROJECT_ID }}/${{ env.REPOSITORY_NAME }}/expropriation-platform:latest .

          # Push the image
          docker push ${{ env.GCP_REGION }}-docker.pkg.dev/${{ env.GCP_PROJECT_ID }}/${{ env.REPOSITORY_NAME }}/expropriation-platform:${{ github.sha }}
          docker push ${{ env.GCP_REGION }}-docker.pkg.dev/${{ env.GCP_PROJECT_ID }}/${{ env.REPOSITORY_NAME }}/expropriation-platform:latest

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ${{ env.SERVICE_NAME }} \
            --image ${{ env.GCP_REGION }}-docker.pkg.dev/${{ env.GCP_PROJECT_ID }}/${{ env.REPOSITORY_NAME }}/expropriation-platform:${{ github.sha }} \
            --region ${{ env.GCP_REGION }} \
            --platform managed \
            --allow-unauthenticated \
            --set-env-vars="DATABASE_URL=${{ secrets.DATABASE_URL }},NEXTAUTH_SECRET=${{ secrets.NEXTAUTH_SECRET }},NEXTAUTH_URL=${{ secrets.NEXTAUTH_URL }}" \
            --set-cloudsql-instances="${{ secrets.GCP_PROJECT_ID }}:${{ env.GCP_REGION }}:expropriation-staging-db" \
            --memory=512Mi \
            --cpu=1 \
            --timeout=300 \
            --concurrency=20 \
            --min-instances=0 \
            --max-instances=3 \
            --max-instances-request=3

      - name: Run Database Migrations
        run: |
          # Create temporary instance for migrations
          gcloud run jobs create migrate-database \
            --image ${{ env.GCP_REGION }}-docker.pkg.dev/${{ env.GCP_PROJECT_ID }}/${{ env.REPOSITORY_NAME }}/expropriation-platform:${{ github.sha }} \
            --region ${{ env.GCP_REGION }} \
            --set-env-vars="DATABASE_URL=${{ secrets.DATABASE_URL }}" \
            --task-timeout=300s \
            --memory=512Mi || true

          # Execute migration job
          gcloud run jobs execute migrate-database \
            --region ${{ env.GCP_REGION }} \
            --wait || true

          # Clean up migration job
          gcloud run jobs delete migrate-database \
            --region ${{ env.GCP_REGION }} \
            --quiet || true

      - name: Display deployment URL
        run: |
          URL=$(gcloud run services describe ${{ env.SERVICE_NAME }} \
            --region ${{ env.GCP_REGION }} \
            --format='value(status.url)')
          echo "🚀 Staging environment deployed successfully!"
          echo "🌐 Staging URL: $URL"
          echo "🔗 Live staging environment: $URL"
          echo "⚠️  This is a staging environment - no debug information visible to users"

      - name: Health Check
        run: |
          URL=$(gcloud run services describe ${{ env.SERVICE_NAME }} \
            --region ${{ env.GCP_REGION }} \
            --format='value(status.url)')

          # Wait for deployment to be ready
          sleep 30

          # Perform health check
          for i in {1..10}; do
            if curl -f "$URL/api/health" > /dev/null 2>&1; then
              echo "✅ Health check passed!"
              break
            else
              echo "⏳ Waiting for service to be ready... (attempt $i/10)"
              sleep 10
            fi
          done
```

### Step 5: Environment Variables and Configuration

1. **Create staging environment variables**
   ```bash
   # In Google Cloud Console > Secret Manager
   # Create secrets for sensitive data
   echo "DATABASE_URL=postgresql://expropriation_staging_user:PASSWORD@/expropriation_staging_db?host=/cloudsql/PROJECT_ID:REGION:expropriation-staging-db" | gcloud secrets create staging-database-url --data-file=-
   echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" | gcloud secrets create staging-nextauth-secret --data-file=-
   echo "NODE_ENV=production" | gcloud secrets create staging-node-env --data-file=-
   ```

2. **Update package.json scripts**
   ```json
   {
     "scripts": {
       "build": "prisma generate && next build",
       "start": "next start",
       "lint": "next lint",
       "type-check": "tsc --noEmit",
       "test": "jest",
       "test:ci": "jest --ci --coverage --watchAll=false",
       "migrate:deploy": "prisma migrate deploy",
       "migrate:dev": "prisma migrate dev",
       "postinstall": "prisma generate"
     }
   }
   ```

### Step 6: Database Setup for Staging

1. **Create migration script for Cloud Run (Node.js 20 LTS)**
   ```dockerfile
   # Add to Dockerfile for migration container
   FROM node:20-alpine AS migration
   WORKDIR /app
   COPY package*.json ./
   COPY prisma ./prisma/
   RUN npm ci
   RUN npx prisma generate
   CMD ["npx", "prisma", "migrate", "deploy"]
   ```

2. **Update prisma schema for staging**
   ```prisma
   // Ensure proper database configuration
   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

### Step 7: Monitoring and Logging Setup

1. **Enable Cloud Monitoring**
   ```bash
   gcloud services enable monitoring.googleapis.com
   gcloud services enable logging.googleapis.com
   ```

2. **Create monitoring dashboard**
   - Go to Google Cloud Console > Monitoring
   - Create dashboard for Cloud Run metrics
   - Set up alerts for error rates, response times, and resource usage

### Step 8: Domain Configuration (Optional)

1. **Configure custom staging domain**
   ```bash
   gcloud run domain-mappings create \
     --service=expropriation-staging \
     --domain=staging.expropriation-platform.com \
     --region=us-central1
   ```

2. **Set up SSL certificate**
   - SSL is automatically managed by Google Cloud Run

### Step 9: Testing the Deployment

1. **Test the workflow**
   - Create a test branch
   - Make a small change
   - Create pull request to main
   - Merge and monitor deployment

2. **Verify deployment**
   - Check GitHub Actions logs
   - Verify application is accessible at the deployed URL
   - Test all major functionalities
   - Check database connectivity

### Step 10: Maintenance and Updates

1. **Regular maintenance tasks**
   - Monitor deployment logs
   - Update dependencies regularly
   - Review security advisories
   - Backup database regularly

2. **Rollback procedures**
   ```bash
   # Rollback to previous version
   gcloud run services update-traffic expropriation-staging \
     --region=us-central1 \
     --to-revisions=expropriation-staging-previous-version=100
   ```

## Security Considerations

1. **Secrets Management**
   - Use Google Secret Manager for sensitive data
   - Rotate secrets regularly
   - Limit access to production secrets

2. **Network Security**
   - Use HTTPS for all communications
   - Configure firewall rules if needed
   - Enable IAP (Identity-Aware Proxy) for additional security

3. **Database Security**
   - Use strong passwords
   - Enable SSL connections
   - Regular database backups
   - Limit database user permissions

## Cost Optimization (Staging Environment)

1. **Cloud Run Configuration (Optimized for ~10 Users)**
   - Set min instances to 0 (scale to zero when not in use)
   - Set max instances to 3 (sufficient for 10 concurrent users)
   - Use 512Mi memory limit (cost-effective for staging)
   - Enable request timeout settings (300s)
   - Use CPU allocation only when needed

2. **Database Optimization**
   - Choose db-g1-small instance (cost-effective for staging)
   - Enable automatic backups during off-hours (2 AM)
   - Monitor storage usage (20GB should be sufficient)
   - Consider automatic suspension during long idle periods

## Troubleshooting

Common issues and solutions:
- Build failures: Check logs in GitHub Actions
- Deployment errors: Verify Cloud Run logs
- Database connection issues: Check SQL instance logs
- Environment variable problems: Verify secret configuration

## Production Mode Configuration

### Debugging & Development Features Disabled
The staging environment runs in **production mode** with the following debugging features hidden from users:

1. **Environment Configuration**
   - `NODE_ENV=production` is explicitly set
   - Source maps are not generated in production builds
   - Hot reloading is disabled
   - Development error pages are replaced with production error pages

2. **Next.js Production Optimizations**
   - Production build optimization enabled
   - Client-side debugging information removed
   - Verbose logging disabled
   - Development middleware disabled

3. **Security Hardening**
   - Stack traces are not exposed to users
   - Detailed error messages are logged server-side only
   - Development headers are removed
   - Debug endpoints are disabled

4. **Performance Optimizations**
   - Code splitting and tree shaking enabled
   - Minification enabled for JavaScript and CSS
   - Image optimization enabled
   - Static asset optimization

This comprehensive setup will provide a robust, cost-effective, automated deployment pipeline for your expropriation-platform staging environment that:
- Runs on Node.js 20 LTS (latest stable version)
- Handles ~10 concurrent users efficiently
- Operates in production mode with debugging disabled
- Scales to zero when not in use to minimize costs
- Provides a realistic production-like environment for testing
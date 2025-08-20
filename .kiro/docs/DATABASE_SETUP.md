# Database Setup Guide

This guide will help you set up PostgreSQL for the Moldova Direct e-commerce platform.

## Prerequisites

You need PostgreSQL installed on your system. Here are the recommended installation methods:

### Option 1: Postgres.app (Recommended for macOS)
1. Download from [https://postgresapp.com/](https://postgresapp.com/)
2. Install and start the app
3. PostgreSQL will be available at `localhost:5432`

### Option 2: Homebrew (macOS)
```bash
brew install postgresql@14
brew services start postgresql@14
```

### Option 3: Docker
```bash
docker run --name moldovadirect-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=moldovadirect \
  -p 5432:5432 \
  -d postgres:14
```

## Environment Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update database URL in `.env`:**
   ```env
   # For local PostgreSQL:
   DATABASE_URL="postgresql://localhost:5432/moldovadirect"
   
   # For PostgreSQL with username/password:
   DATABASE_URL="postgresql://username:password@localhost:5432/moldovadirect"
   
   # For Docker setup:
   DATABASE_URL="postgresql://postgres:password@localhost:5432/moldovadirect"
   ```

## Database Setup

1. **Create the database:**
   ```bash
   # Connect to PostgreSQL
   psql postgres
   
   # Create database
   CREATE DATABASE moldovadirect;
   
   # Exit psql
   \q
   ```

2. **Generate and run migrations:**
   ```bash
   # Generate migration files
   npm run db:generate
   
   # Apply migrations to database
   npm run db:migrate
   ```

3. **Seed the database with sample data:**
   ```bash
   # Start the development server
   npm run dev
   
   # Visit the admin dashboard
   # Go to http://localhost:3000/admin
   
   # Click "Seed Database" to add sample products
   ```

## Verification

1. **Check database connection:**
   ```bash
   # Open Drizzle Studio to view your data
   npm run db:studio
   ```

2. **Test the application:**
   - Visit [http://localhost:3000/products](http://localhost:3000/products)
   - You should see the product catalog with sample data
   - Test search and filtering functionality
   - Try switching between languages (ES/EN/RO/RU)

## Sample Data Included

After seeding, you'll have:
- **6 Products**: Wines, traditional foods, cheese, honey, sausage
- **4 Categories**: Wines, Traditional Foods, Preserves, Dairy
- **Product Images**: Professional images from Unsplash
- **Multi-language Content**: All content in 4 languages

## Database Management Commands

```bash
# Generate new migration after schema changes
npm run db:generate

# Apply pending migrations
npm run db:migrate

# Open database admin interface
npm run db:studio

# View database schema in browser
# Drizzle Studio will open at http://localhost:4983
```

## Troubleshooting

### Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env` file
- Verify database exists: `psql -l | grep moldovadirect`

### Migration Issues
- Delete migration files in `server/database/migrations/` and regenerate
- Ensure database schema is clean before running migrations

### Seed Data Issues
- Check console for detailed error messages
- Ensure migrations have been applied first
- Verify API endpoints are working: visit `/api/products`

## Production Deployment

For production, consider using:
- **Railway**: PostgreSQL hosting with automatic backups
- **Supabase**: PostgreSQL with additional features
- **AWS RDS**: Enterprise-grade PostgreSQL hosting
- **DigitalOcean**: Managed PostgreSQL databases

Update your production DATABASE_URL accordingly and run migrations in your deployment pipeline.
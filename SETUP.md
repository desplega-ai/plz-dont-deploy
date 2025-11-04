# Setup Guide

This guide will help you set up the Finance Tracker application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher
- **pnpm** (recommended) - Install with: `npm install -g pnpm`
- **PostgreSQL** 14 or higher
- **Git**

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd plz-dont-deploy
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all dependencies and automatically run `prisma generate` via the postinstall script.

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure the following required variables:

#### Database Configuration

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finance_tracker"
```

**Note**: Adjust username, password, host, port, and database name according to your PostgreSQL setup.

#### JWT Secret (Required)

Generate a secure 32+ character secret:

```bash
openssl rand -base64 32
```

Then add it to `.env`:

```env
JWT_SECRET="your-generated-secret-here"
```

#### Application URL

Set the base URL for your application:

```env
NEXT_PUBLIC_APP_URL="http://localhost:4010"
```

**Note**: The application runs on port 4010 by default (not 3000).

#### Email Service (Required for auth features)

Get an API key from [Resend](https://resend.com/api-keys):

```env
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

For production, also set the verified sender email:

```env
EMAIL_FROM="Finance Tracker <noreply@yourdomain.com>"
```

#### AI Gateway (Optional)

If using AI categorization features:

```env
AI_GATEWAY_API_KEY="vck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 4. Create the Database

Create a PostgreSQL database for the application:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE finance_tracker;

# Exit psql
\q
```

Alternatively, if your `DATABASE_URL` is configured correctly, Prisma will create the database automatically when you run migrations.

### 5. Run Database Migrations

Apply the database schema:

```bash
pnpm prisma migrate dev
```

This will:
- Create all necessary tables
- Set up indexes and relationships
- Generate the Prisma Client

### 6. Seed the Database (Optional but Recommended)

Populate the database with test data:

```bash
pnpm db:seed
```

This creates two test users with sample data:

#### Regular User
- **Email:** `user@test.com`
- **Password:** `password123`
- Includes 2 bank accounts (Checking & Savings)
- 6 sample transactions
- 4 categories with categorization rules

#### Admin User
- **Email:** `admin@test.com`
- **Password:** `password123`
- Full admin access to the admin dashboard
- Can view all users and transactions (with privacy redaction)

**Note:** The seed script uses `upsert`, so it's safe to run multiple times to reset test data.

### 7. Start the Development Server

```bash
pnpm dev
```

The application will be available at **http://localhost:4010**

You should see:

```
▲ Next.js 16.0.1
- Local:        http://localhost:4010
```

## Known Issues

### Prisma + Next.js 16 Compatibility

There's a compatibility issue between Prisma and Next.js 16 RC that has been resolved in the current configuration. The workaround is already applied in `next.config.ts`:

- **Webpack is used instead of Turbopack** for bundling
- `@prisma/client` and `prisma` are externalized in webpack config
- This allows Prisma to work correctly with Next.js 16

**Current Status**: The issue is resolved with the webpack configuration. If you encounter problems:

1. Clear `.next` cache: `rm -rf .next`
2. Regenerate Prisma Client: `pnpm prisma generate`
3. Restart dev server: `pnpm dev`

### If Dev Server Fails to Start

If you encounter errors on first run, try this sequence:

```bash
# Clean everything
rm -rf .next node_modules

# Reinstall
pnpm install

# Regenerate Prisma Client
pnpm prisma generate

# Try again
pnpm dev
```

## Development Commands

### Database Management

```bash
# View database in browser GUI
pnpm prisma studio

# Create a new migration after schema changes
pnpm prisma migrate dev --name describe_your_change

# Reset database (WARNING: Deletes all data)
pnpm prisma migrate reset

# Apply migrations in production
pnpm prisma migrate deploy

# Regenerate Prisma Client after schema changes
pnpm prisma generate

# Seed or reset test data
pnpm db:seed
```

### Application Commands

```bash
# Start development server (port 4010)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Verification

After setup, verify everything is working:

1. **Database Connection**: `pnpm prisma studio` should open without errors
2. **Dev Server**: `pnpm dev` should start on port 4010
3. **Login**: Visit http://localhost:4010 and log in with `user@test.com` / `password123`
4. **Test Features**:
   - View transactions
   - Create a new account
   - Import a CSV file
   - Create categories
   - Build a workflow

## What's Included

All features are fully functional:

- ✅ **Authentication** - Register, login, email verification, magic links
- ✅ **Bank Accounts** - Multi-account management with currencies
- ✅ **Transactions** - CRUD operations with pagination and filtering
- ✅ **CSV Import** - Intelligent column detection and bulk import
- ✅ **Categories** - Hierarchical categories with subcategories
- ✅ **Categorization Rules** - Rule-based auto-categorization
- ✅ **Workflows** - Visual workflow builder with AI integration
- ✅ **AI Categorization** - 20+ AI models for smart categorization
- ✅ **Analytics** - Charts, graphs, and spending trends
- ✅ **Map View** - Geographic visualization of transactions
- ✅ **Reports** - PDF export and detailed reporting
- ✅ **Admin Dashboard** - User management and system statistics

## Troubleshooting

### Database Connection Errors

**Problem**: `Can't reach database server at localhost:5432`

**Solutions**:
- Ensure PostgreSQL is running: `pg_ctl status` or check system services
- Verify connection string in `.env`
- Check PostgreSQL is listening on the correct port
- For hosted databases (Neon, Railway), verify SSL settings

### JWT Secret Error

**Problem**: `JWT_SECRET environment variable is required`

**Solution**:
- Ensure `.env` file exists and contains `JWT_SECRET`
- Secret must be at least 32 characters
- Generate new secret: `openssl rand -base64 32`

### Build Errors

**Problem**: Build fails with Prisma errors

**Solutions**:
```bash
# Clear build cache
rm -rf .next

# Regenerate Prisma Client
pnpm prisma generate

# Try building again
pnpm build
```

### Port Already in Use

**Problem**: `Port 4010 is already in use`

**Solutions**:
- Kill the process using port 4010: `lsof -ti:4010 | xargs kill -9`
- Or change the port in `package.json` scripts: `-p 4010` to `-p 3000`

### Prisma Generate Fails

**Problem**: `Error: @prisma/client did not initialize yet`

**Solution**:
```bash
pnpm prisma generate --no-hints
```

### Email Not Sending

**Problem**: Email verification/magic links not working

**Solutions**:
- Verify `RESEND_API_KEY` is set correctly in `.env`
- Check API key is valid at [Resend Dashboard](https://resend.com/api-keys)
- In development, Resend provides a test domain (no verification needed)
- In production, verify your domain with Resend before setting `EMAIL_FROM`

## Database Schema Changes

When you modify `prisma/schema.prisma`:

1. Create a migration:
   ```bash
   pnpm prisma migrate dev --name your_change_description
   ```

2. The Prisma Client will be automatically regenerated

3. Review the generated migration in `prisma/migrations/`

4. Commit both the schema and migration files to git

## Production Deployment

For production deployment (Vercel, Railway, Render, etc.):

1. Set all environment variables in your hosting platform
2. Ensure `JWT_SECRET` is a strong 32+ character secret
3. Set `DATABASE_URL` to your production database
4. Set `NEXT_PUBLIC_APP_URL` to your production domain
5. Verify your email domain with Resend and set `EMAIL_FROM`
6. The build command includes migration deployment: `pnpm build`

See the main [README.md](./README.md) for detailed deployment instructions.

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Resend Documentation](https://resend.com/docs)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)

## Need Help?

- Check [CLAUDE.md](./CLAUDE.md) for architecture and development guidelines
- Review [README.md](./README.md) for feature documentation
- Check [SECURITY.md](./SECURITY.md) for security best practices
- Open an issue on GitHub for bugs or questions

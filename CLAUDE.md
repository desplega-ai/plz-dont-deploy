# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack financial transaction management application with AI-powered categorization, workflow automation, and comprehensive analytics. Built with Next.js 16, PostgreSQL, Prisma, and the Vercel AI SDK.

## Package Manager

**Always use pnpm** for all package operations:
- `pnpm install` - Install dependencies
- `pnpm add <package>` - Add new dependencies
- `pnpm dev` - Start development server (runs on port 4010)
- `pnpm build` - Build for production (includes Prisma generation and migration)
- `pnpm prisma generate` - Regenerate Prisma client after schema changes
- `pnpm prisma migrate dev` - Create and apply new migrations
- `pnpm prisma studio` - Open Prisma Studio GUI for database management
- `pnpm db:seed` - Seed database with test data (creates user@test.com and admin@test.com)

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript with strict mode
- **Database**: PostgreSQL with Prisma ORM
- **UI**: Tailwind CSS 4 + shadcn/ui + Radix UI
- **Workflow Visualization**: React Flow (@xyflow/react)
- **Authentication**: JWT with jose library (cookie-based sessions)
- **Email**: Resend
- **AI**: Vercel AI SDK with 20+ model support (OpenAI, Anthropic, Google, xAI, Mistral, DeepSeek, Llama via Groq)
- **Maps**: Leaflet with heatmap support
- **Charts**: Recharts

## Critical Compatibility Notes

### Prisma + Next.js 16 Configuration

Due to compatibility issues between Prisma and Next.js 16 RC:
- **Webpack is used instead of Turbopack** for bundling
- `@prisma/client` and `prisma` are externalized in `next.config.ts`
- See `SETUP.md` for detailed troubleshooting
- **Always run `pnpm prisma generate` after schema changes**
- Database connection uses singleton pattern in `src/lib/db.ts` to prevent connection exhaustion

### Port Configuration

The application runs on **port 4010** by default (not 3000). This is configured in package.json scripts.

## Architecture Overview

### Database Schema Architecture

The application uses a hierarchical data model:

1. **User System**:
   - `User` model with role-based access (USER/ADMIN)
   - Session-based auth with JWT tokens stored in cookies
   - Email verification and magic link support
   - Sessions tracked in `Session` table with expiration

2. **Banking Hierarchy**:
   - `User` → `BankAccount` (1:many) - Multi-account support with currency
   - `BankAccount` → `Transaction` (1:many) - All transactions belong to an account
   - Transactions support location data (lat/lng) for map visualization

3. **Category System**:
   - `Category` model supports hierarchical categories (parent-child)
   - `CategoryRule` defines rule-based auto-categorization (regex, amount ranges)
   - Rules have priority ordering for evaluation

4. **Workflow System**:
   - `Workflow` model stores React Flow graph structure (nodes + edges as JSON)
   - `WorkflowRun` tracks execution history and status
   - Only one workflow can be active per user at a time

### Authentication Flow

Authentication is cookie-based using JWT tokens:

1. User credentials validated via `src/lib/auth.ts`
2. Session created in database and JWT token generated with nonce for uniqueness
3. Token stored in httpOnly cookie named `auth_token`
4. `getCurrentUser()` validates session from cookie
5. Password hashing uses bcrypt with salt rounds of 10
6. JWT secret must be minimum 32 characters

**Key functions** (`src/lib/auth.ts`):
- `createSession(userId)` - Generate JWT and store session
- `getCurrentUser()` - Get authenticated user from cookie
- `validateSession(token)` - Verify and return session
- `hashPassword()` / `verifyPassword()` - Password utilities

### API Route Pattern

All API routes follow a consistent pattern:

1. **Authentication**: Use `getCurrentUser()` to verify user
2. **Validation**: Use Zod schemas for input validation
3. **Authorization**: Check user ownership of resources
4. **Error Handling**: Return appropriate HTTP status codes with messages
5. **Response Format**: Consistent JSON structure

Example API structure:
```
src/app/api/
├── auth/          # Authentication endpoints
├── accounts/      # Bank account CRUD
├── transactions/  # Transaction CRUD + import
├── categories/    # Category and rule management
├── workflows/     # Workflow CRUD
└── dashboard/     # Analytics and reporting
```

### Component Architecture

1. **Server Components by Default**: All components are Server Components unless they need:
   - User interaction (onClick, onChange, etc.)
   - React hooks (useState, useEffect, etc.)
   - Browser APIs (localStorage, window, etc.)

2. **shadcn/ui Components**: Located in `src/components/ui/`
   - These are client components with `"use client"` directive
   - Used as building blocks for both server and client components

3. **Workflow Nodes**: Custom React Flow nodes in `src/components/workflow/`
   - `InputNode` - Transaction entry point
   - `AICategoryNode` - AI-powered categorization with model selection
   - `RulesCategoryNode` - Rule-based categorization logic
   - `OutputNode` - Output destinations (webhook, email, Slack)

### CSV Import Intelligence

The transaction import system (`src/app/api/transactions/import/route.ts`) features:
- **Automatic column detection** - Intelligently maps CSV headers to transaction fields
- **Pattern matching** - Detects date, amount, description, type, location columns
- **Flexible mapping** - Supports various CSV formats from different banks
- **Batch processing** - Handles large CSV files efficiently

### Workflow Execution

Workflows are represented as React Flow graphs:
- **Nodes**: Stored as JSON array with type, position, and config
- **Edges**: Define flow between nodes
- **Execution**: Nodes process transactions sequentially following edges
- **AI Integration**: AI nodes use Vercel AI SDK with structured output
- **Rule Engine**: Rule nodes evaluate CategoryRule patterns against transactions

## Development Workflow

### Making Database Changes

1. Edit `prisma/schema.prisma`
2. Run `pnpm prisma migrate dev --name describe_change`
3. Prisma Client is auto-regenerated
4. Update TypeScript code to use new schema

### Adding New API Endpoints

1. Create route handler in `src/app/api/[resource]/route.ts`
2. Use `getCurrentUser()` for authentication
3. Define Zod schema for validation
4. Follow RESTful conventions (GET/POST/PUT/DELETE)
5. Apply rate limiting for sensitive operations (see `src/lib/rate-limit.ts`)

### Testing with Seed Data

Run `pnpm db:seed` to reset test environment:
- Creates `user@test.com` (password: `password123`) - Regular user with sample data
- Creates `admin@test.com` (password: `password123`) - Admin access
- Includes 2 bank accounts, 6 transactions, 4 categories with rules
- Safe to run multiple times (uses upsert)

## Security Considerations

### Environment Variables

Required variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Minimum 32 characters (generate with `openssl rand -base64 32`)
- `RESEND_API_KEY` - For email functionality
- `NEXT_PUBLIC_APP_URL` - Application base URL
- `AI_GATEWAY_API_KEY` - Optional, for AI features

### Security Headers

Production security headers configured in `next.config.ts`:
- Strict Transport Security (HSTS)
- Content Security Policy (CSP) with restrictions
- X-Frame-Options, X-Content-Type-Options
- Permissions-Policy for camera/microphone/geolocation

### Best Practices

- **Never commit `.env`** - Use `.env.example` as template
- **Rate limiting** - Applied to auth endpoints and sensitive operations
- **Input validation** - Always use Zod schemas
- **SQL injection protection** - Prisma provides parameterization
- **XSS prevention** - React automatically escapes output
- **Authentication** - httpOnly cookies prevent XSS token theft

## Code Style Guidelines

- TypeScript strict mode enabled
- Server Components by default, `"use client"` only when necessary
- Zod for all input validation
- Proper error handling with logging via `src/lib/logger.ts`
- Follow Next.js App Router conventions (route handlers, layouts, loading/error states)
- Use Prisma Client from `src/lib/db.ts` singleton instance

## Common Development Tasks

### Resetting Development Environment

```bash
# Stop dev server
# Drop and recreate database (or just reset tables)
pnpm prisma migrate reset  # Runs migrations + seed automatically
pnpm dev
```

### Viewing Database

```bash
pnpm prisma studio  # Opens web GUI at http://localhost:5555
```

### Checking Build

```bash
pnpm build  # Test production build locally
```

## Known Issues

See `SETUP.md` for detailed information about the Prisma + Next.js 16 compatibility issue and workarounds. The application is fully functional; the issue only affects workflow bundling configuration.

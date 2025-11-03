---
description: Project-specific instructions for Finance Tracker development
globs: "*.ts, *.tsx, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---

# Finance Tracker Development Guide

This project uses **Next.js 16 (App Router)** with **pnpm** as the package manager.

## Package Manager

**Always use pnpm** for consistency:

- Use `pnpm install` to install dependencies
- Use `pnpm add <package>` to add new dependencies
- Use `pnpm run <script>` to run scripts
- Use `pnpm dev` to start the development server

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **UI**: React 19 + Tailwind CSS 4 + shadcn/ui
- **Authentication**: JWT with jose library
- **Email**: Resend
- **AI**: Vercel AI SDK

## Important Notes

### Prisma Compatibility

This project uses Prisma with Next.js 16 RC. Due to compatibility issues:

- Webpack is used instead of Turbopack
- `@prisma/client` and `prisma` are externalized
- See `next.config.ts` and `SETUP.md` for details

### Database Operations

- Always use Prisma Client for database operations
- Run `pnpm prisma generate` after schema changes
- Use `pnpm prisma migrate dev` for migrations
- Use `pnpm prisma studio` to view database in browser

### Development Server

```bash
# Start development server
pnpm dev

# The app will be available at http://localhost:3000
```

### Building for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Code Style

- Use TypeScript with strict mode enabled
- Follow Next.js App Router conventions
- Use Server Components by default
- Add `"use client"` only when needed (interactivity, hooks, etc.)
- Use Zod for input validation
- Use proper error handling and logging (see `src/lib/logger.ts`)

### Security

- Never commit `.env` files
- Use environment variables for all secrets
- JWT_SECRET must be at least 32 characters
- Apply rate limiting to sensitive endpoints (see `src/lib/rate-limit.ts`)
- Follow security best practices in `SECURITY.md`

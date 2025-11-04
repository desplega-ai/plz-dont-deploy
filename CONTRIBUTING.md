# Contributing to Finance Tracker

Thank you for your interest in contributing to Finance Tracker! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Coding Guidelines](#coding-guidelines)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/plz-dont-deploy.git
   cd plz-dont-deploy
   ```
3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL-OWNER/plz-dont-deploy.git
   ```

## Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon account)
- Resend account (for email features)
- pnpm (recommended) or npm

### Installation

1. **Install dependencies**:
   ```bash
   pnpm install
   # or
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your values (see `.env.example` for required variables)

3. **Set up the database**:
   ```bash
   pnpm prisma migrate dev
   pnpm prisma db seed
   ```

4. **Start the development server**:
   ```bash
   pnpm dev
   ```

5. **Access the application** at http://localhost:4010

### Test Credentials (Development)

After seeding the database:
- User: `user@test.com` / `password123`
- Admin: `admin@test.com` / `password123`

For more troubleshooting, see [SETUP.md](./SETUP.md).

## Making Changes

### Creating a Branch

Always create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Use descriptive branch names:
- `feature/add-budget-tracking` for new features
- `fix/transaction-date-bug` for bug fixes
- `docs/update-readme` for documentation
- `refactor/auth-module` for refactoring

### Keeping Your Fork Updated

Before starting work, sync with upstream:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

## Coding Guidelines

### TypeScript

- Write type-safe code using TypeScript
- Avoid `any` types - use proper typing
- Use interfaces for object shapes
- Export types that might be reused

### Code Style

- Use **2 spaces** for indentation
- Use **double quotes** for strings
- Add semicolons at the end of statements
- Use descriptive variable and function names
- Add comments for complex logic

### File Organization

- Place React components in `src/components/`
- Place API routes in `src/app/api/`
- Place utility functions in `src/lib/`
- Place database logic in `src/lib/db.ts` or related files
- Keep components focused and single-purpose

### React Best Practices

- Use functional components with hooks
- Implement proper loading and error states
- Use Server Components by default (Next.js 16 App Router)
- Add Client Components only when needed (`"use client"`)
- Implement proper form validation with Zod
- Keep client components minimal - only add `"use client"` for interactivity/hooks

### Database

- Use Prisma for all database operations
- Always use the singleton instance from `src/lib/db.ts`
- Create migrations for schema changes: `pnpm prisma migrate dev --name description`
- Run `pnpm prisma generate` after schema changes
- Test migrations both up and down
- Never commit `.env` with real credentials

### Security

- Never commit secrets or API keys
- Validate all user inputs
- Use parameterized queries (Prisma handles this)
- Implement proper authentication checks
- Follow OWASP guidelines

## Testing

### Manual Testing

Before submitting:
- Test your changes in development (on port 4010)
- Test on different screen sizes (responsive design)
- Test with different user roles (user vs admin)
- Check browser console for errors
- Verify no TypeScript errors: `pnpm exec tsc --noEmit`
- Run linter: `pnpm lint`
- Test build process: `pnpm build`

## Submitting Changes

### Commit Messages

Write clear, concise commit messages:

```
Add budget tracking feature

- Implement budget creation and editing
- Add budget vs actual spending comparison
- Create budget visualization charts
```

Format:
- Use present tense ("Add feature" not "Added feature")
- First line: brief summary (50 chars or less)
- Add blank line, then detailed description if needed
- Reference issues: "Fixes #123" or "Closes #456"

### Pull Request Process

1. **Push your changes** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub:
   - Use a clear, descriptive title
   - Describe what changes you made and why
   - Reference any related issues
   - Add screenshots for UI changes
   - Ensure CI checks pass

3. **PR Template** (include in description):
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   Describe how you tested this

   ## Screenshots (if applicable)
   Add screenshots here

   ## Checklist
   - [ ] My code follows the project's style guidelines
   - [ ] I have performed a self-review
   - [ ] I have commented complex code
   - [ ] I have updated documentation
   - [ ] My changes generate no new warnings
   - [ ] I have added tests
   - [ ] All tests pass locally
   ```

4. **Respond to feedback**:
   - Address reviewer comments promptly
   - Make requested changes
   - Push updates to the same branch
   - Re-request review when ready

5. **After merge**:
   - Delete your feature branch
   - Update your local main branch

## Reporting Issues

### Bug Reports

Include:
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or error messages
- Environment (OS, browser, Node version)
- Relevant logs

### Feature Requests

Include:
- Clear description of the feature
- Use case / problem it solves
- Proposed solution (if any)
- Alternative solutions considered
- Additional context

### Security Issues

**Do not open public issues for security vulnerabilities.**

Instead, see our [Security Policy](./SECURITY.md) for instructions on how to report security issues privately.

## Development Tips

### Useful Commands

**Always use pnpm for consistency:**

```bash
# Run linter
pnpm lint

# Build for production
pnpm build

# Check TypeScript
pnpm exec tsc --noEmit

# Generate Prisma client after schema changes
pnpm prisma generate

# View database in browser (opens on port 5555)
pnpm prisma studio

# Create a new migration
pnpm prisma migrate dev --name description

# Seed/reset test data
pnpm db:seed

# Reset database (WARNING: deletes all data!)
pnpm prisma migrate reset
```

### Debugging

- Use browser DevTools for frontend debugging
- Check Next.js console output for server errors
- Use `console.log` temporarily (remove before committing)
- Use Prisma Studio to inspect database

### Common Issues

See [SETUP.md](./SETUP.md) for common issues and solutions, especially regarding:
- Prisma and Next.js 16 compatibility (webpack configuration)
- Port 4010 configuration (not standard 3000)
- Environment variable requirements
- Database connection troubleshooting

### Project-Specific Notes

- **Port 4010**: This app runs on port 4010 by default, not 3000
- **pnpm Only**: Use pnpm for all package operations for consistency
- **Webpack**: The project uses webpack instead of Turbopack due to Prisma compatibility
- **Prisma Singleton**: Always import `db` from `src/lib/db.ts`, never create new PrismaClient instances

## Questions?

If you have questions:
- Check existing issues and discussions
- Review the documentation
- Ask in a new issue with the "question" label

## Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!

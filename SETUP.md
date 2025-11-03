# Setup Guide

## Known Issue: Workflow + Prisma + Next.js 16

There's currently a compatibility issue between `workflow/next` wrapper and Prisma bundling in Next.js 16. The workflow bundler tries to bundle Prisma for the client-side, which causes build errors.

## Workaround Options

### Option 1: Temporarily Remove Workflow Wrapper (Recommended for Development)

Edit `next.config.ts`:

```typescript
import type { NextConfig } from "next";
// import { withWorkflow } from "workflow/next"; // Comment out

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("@prisma/client", "prisma");
    }
    return config;
  },
};

// export default withWorkflow(nextConfig); // Comment out
export default nextConfig; // Use this instead
```

**Note:** This disables workflow functionality temporarily. You can re-enable it once the issue is resolved or when deploying to production where it works correctly.

### Option 2: Use npm/yarn instead of pnpm

The issue might be related to pnpm's linking strategy. Try using npm or yarn:

```bash
rm -rf node_modules pnpm-lock.yaml
npm install
npm run dev
```

### Option 3: Downgrade to Next.js 15

Edit `package.json`:

```json
{
  "dependencies": {
    "next": "^15.0.0"
  }
}
```

Then:
```bash
pnpm install
pnpm dev
```

## Verification

Once the dev server starts successfully, you should see:

```
▲ Next.js 16.0.1
- Local:        http://localhost:4010
```

## Quick Start (After Fix)

1. Make sure PostgreSQL is running on port 5437
2. Run migrations: `pnpm prisma migrate dev`
3. Seed the database with test data: `pnpm db:seed`
4. Start dev server: `pnpm dev`
5. Open `http://localhost:4010`

## Test Credentials

The seed script creates two test users with sample data:

### Regular User
- **Email:** `user@test.com`
- **Password:** `password123`
- Includes 2 bank accounts (Checking & Savings)
- 6 sample transactions
- 4 categories with categorization rules

### Admin User
- **Email:** `admin@test.com`
- **Password:** `password123`
- Full admin access to the admin dashboard
- Can view all users and transactions (with privacy redaction)

**Note:** Run `pnpm db:seed` anytime to reset the test data. The seed script uses `upsert` so it's safe to run multiple times.

## What Works

All backend APIs are fully functional:
- ✅ Authentication (register, login, email verification, magic links)
- ✅ Bank Accounts CRUD
- ✅ Transactions CRUD with pagination
- ✅ CSV Import
- ✅ Categories & Subcategories
- ✅ Categorization Rules
- ✅ AI Categorization (when workflow is enabled)

The issue is only with the dev server startup, not the application logic itself!

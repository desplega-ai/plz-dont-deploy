# Finance Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)

A full-stack financial transaction management application with intelligent workflow automation, AI-powered categorization, and comprehensive analytics.

## Features

### Transaction Management
- Import transactions from CSV files
- View, edit, and delete transactions
- Filter by account, category, type, and date range
- Search transactions by description
- Map view for transactions with location data
- Export transactions to PDF

### Bank Account Management
- Create and manage multiple bank accounts
- Track balances across accounts
- Multi-currency support
- Account-specific transaction history

### Smart Categorization
- Create custom transaction categories with hierarchies
- Define rule-based categorization
- AI-powered categorization with multiple model options
- Visual workflow builder for categorization logic

### Workflow Builder
- Visual drag-and-drop workflow designer
- Multiple node types:
  - **Input Node**: Transaction entry point
  - **AI Categorization**: Use AI models to categorize transactions
  - **Rules Categorization**: Apply rule-based logic
  - **Output**: Configure webhooks, email, or Slack notifications
- Support for 20+ AI models from:
  - OpenAI (GPT-5, GPT-5 Mini, etc.)
  - Anthropic (Claude Opus 4.x, Claude Sonnet 4.0)
  - Google (Gemini 2.0, Gemini 1.5)
  - xAI (Grok 4, Grok 3)
  - Mistral
  - DeepSeek
  - Meta/Llama (via Groq)

### Analytics & Visualization
- Interactive charts and graphs
- Spending trends over time
- Category breakdown
- Heatmap visualization for geographic spending patterns

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **UI**: React 19 with Tailwind CSS 4
- **Components**: shadcn/ui + Radix UI
- **Workflow**: React Flow (@xyflow/react)
- **Maps**: Leaflet with heatmap support
- **Charts**: Recharts
- **AI**: Vercel AI SDK
- **Authentication**: JWT with jose

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR-USERNAME/finance-tracker.git
cd finance-tracker
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and fill in your values. See [.env.example](./.env.example) for detailed documentation on each variable.

**Required environment variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secure secret for JWT signing (minimum 32 characters)
- `RESEND_API_KEY` - API key from [Resend](https://resend.com) for emails
- `NEXT_PUBLIC_APP_URL` - Your application URL

**Generate a secure JWT secret:**
```bash
openssl rand -base64 32
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma db seed
```

**Test credentials after seeding:**
- User: `user@test.com` / `password123`
- Admin: `admin@test.com` / `password123`

### Development

Run the development server:
```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Vercel will automatically detect Next.js and deploy

### Railway / Render / Other Platforms

1. Set `NODE_ENV=production`
2. Configure all environment variables from `.env.example`
3. Run database migrations: `npx prisma migrate deploy`
4. Build command: `npm run build`
5. Start command: `npm start`

### Docker (Optional)

The application is configured for standalone output. You can containerize it:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Important**: Remember to:
- Set all required environment variables
- Use production database credentials
- Set a strong `JWT_SECRET` (32+ characters)
- Configure `EMAIL_FROM` with a verified domain on Resend
- Run migrations before first deployment

## Project Structure

```
├── prisma/              # Database schema and migrations
├── src/
│   ├── app/            # Next.js app router pages
│   │   ├── accounts/   # Bank account management
│   │   ├── api/        # API routes
│   │   ├── dashboard/  # Dashboard and analytics
│   │   ├── transactions/ # Transaction management
│   │   └── workflows/  # Workflow builder
│   ├── components/     # React components
│   │   ├── ui/        # shadcn/ui components
│   │   └── workflow/  # Workflow node components
│   └── lib/           # Utilities and helpers
└── public/            # Static assets
```

## Database Schema

The application uses Prisma ORM with the following main models:

- **User**: User accounts with authentication
- **BankAccount**: Bank account information
- **Transaction**: Financial transactions
- **Category**: Transaction categories (hierarchical)
- **CategoryRule**: Rule-based categorization logic
- **Workflow**: Workflow configurations

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Sign in

### Bank Accounts
- `GET /api/accounts` - List all accounts
- `POST /api/accounts` - Create account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

### Transactions
- `GET /api/transactions` - List transactions (with filters)
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/import` - Import from CSV

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Category Rules
- `GET /api/categories/rules` - List rules
- `POST /api/categories/rules` - Create rule
- `PUT /api/categories/rules/:id` - Update rule
- `DELETE /api/categories/rules/:id` - Delete rule

### Workflows
- `GET /api/workflows` - List workflows
- `POST /api/workflows` - Create workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

## Features in Detail

### CSV Import
Upload CSV files with the following columns:
- Date
- Description
- Amount
- Type (income/expense)
- Optional: Category, Location

### Workflow Builder
Create sophisticated categorization workflows:

1. **Visual Editor**: Drag nodes onto the canvas
2. **Configure Nodes**: Set up AI prompts, rules, or output destinations
3. **Connect Nodes**: Draw edges to define flow
4. **Save & Activate**: Make workflow active for automatic categorization

### Rule-Based Categorization
Define rules with:
- Field matching (description, amount, date)
- Pattern matching (regex support)
- Amount ranges
- Priority ordering

### AI Categorization
Configure AI nodes with:
- Model selection from 20+ options
- Custom prompts for categorization
- Structured output schema
- Category selection

## Troubleshooting

### Common Issues

#### Prisma / Next.js 16 Compatibility

If you encounter Prisma-related errors with Next.js 16 RC, see [SETUP.md](./SETUP.md) for known issues and solutions.

#### Database Connection Errors

- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check firewall/network settings
- For hosted databases (Neon, Railway), verify SSL mode is included

#### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate
```

#### JWT Validation Errors

- Ensure `JWT_SECRET` is set and at least 32 characters
- Check that the same secret is used in both development and production
- Clear browser cookies and try logging in again

### Additional Help

- See [SETUP.md](./SETUP.md) for detailed troubleshooting
- Check [Issues](https://github.com/YOUR-USERNAME/finance-tracker/issues) for similar problems
- Open a new issue if your problem persists

## Contributing

We welcome contributions from the community! Whether it's:

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Development setup guide
- Code style guidelines
- How to submit pull requests
- Testing requirements

## Security

Security is important to us. If you discover a security vulnerability, please follow our responsible disclosure process:

- **Do not** open a public issue
- See [SECURITY.md](./SECURITY.md) for how to report vulnerabilities
- We aim to respond to security reports within 48 hours

For general security best practices when deploying this application, see the [Security section in SECURITY.md](./SECURITY.md#security-best-practices).

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/), [Prisma](https://www.prisma.io/), and [shadcn/ui](https://ui.shadcn.com/)
- AI capabilities powered by [Vercel AI SDK](https://sdk.vercel.ai/)
- Workflow visualization by [React Flow](https://reactflow.dev/)

## Support

- 📖 [Documentation](./CONTRIBUTING.md)
- 🐛 [Report Issues](https://github.com/YOUR-USERNAME/finance-tracker/issues)
- 💬 [Discussions](https://github.com/YOUR-USERNAME/finance-tracker/discussions)
- 🔒 [Security](./SECURITY.md)

---

**Note**: Remember to update placeholder URLs with your actual repository URL before publishing!

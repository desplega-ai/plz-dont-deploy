# Features Overview

A comprehensive guide to all features available in Finance Tracker.

## Core Features

### 1. Bank Account Management

**What it does**: Manage multiple bank accounts in one centralized location.

**Key capabilities**:
- Create unlimited bank accounts
- Support for different account types (checking, savings, credit card, investment)
- Multi-currency support (USD, EUR, GBP, CAD, and more)
- Real-time balance tracking
- Account-specific transaction history
- Edit and delete accounts

**Why it matters**: Keep all your financial accounts organized in one place, regardless of which banks you use.

---

### 2. Transaction Management

**What it does**: Track, view, edit, and search all financial transactions.

**Key capabilities**:
- Create transactions manually
- View transactions with pagination
- Filter by account, category, type (income/expense), and date range
- Search transactions by description
- Edit transaction details (amount, date, description, category)
- Delete transactions
- Mark transactions as recurring
- Add location data to transactions

**Why it matters**: Have complete visibility and control over every financial transaction.

---

### 3. CSV Import

**What it does**: Bulk import transactions from your bank statements.

**Key capabilities**:
- Intelligent column detection (automatically recognizes date, amount, description)
- Support for various CSV formats
- Configurable column mapping
- Handles different date formats
- Bulk transaction creation
- Preview before import

**Supported columns**:
- Date (required)
- Amount (required)
- Description (required)
- Type (income/expense)
- Category
- Location information

**Why it matters**: Save hours of manual data entry by importing bank statements directly.

---

### 4. Category System

**What it does**: Organize transactions into categories for better insights.

**Key capabilities**:
- Create custom categories
- Hierarchical categories (parent and subcategories)
- Color-coding for visual identification
- Assign categories to transactions
- Category-based analytics
- Edit and delete categories

**Example hierarchy**:
```
Food & Dining
├── Restaurants
├── Groceries
└── Coffee Shops

Transportation
├── Gas
├── Public Transit
└── Parking
```

**Why it matters**: Understand exactly where your money is going by category.

---

### 5. Rule-Based Categorization

**What it does**: Automatically categorize transactions based on rules you define.

**Key capabilities**:
- Create categorization rules
- Pattern matching (regex support)
- Match by description, amount, or date
- Amount range matching
- Priority ordering (higher priority rules execute first)
- Enable/disable rules
- Multiple rules per category

**Rule types**:
- **Description Match**: e.g., "Starbucks" → Coffee Shops
- **Amount Range**: e.g., $50-$100 at gas stations → Gas
- **Date Pattern**: e.g., transactions on 1st of month → Rent
- **Regex Pattern**: Advanced pattern matching

**Example rules**:
- Any transaction containing "UBER" → Transportation
- Transactions between $100-$200 on 1st of month → Utilities
- Descriptions matching "^AMAZON.*" → Shopping

**Why it matters**: Set it once, and let the system automatically categorize future transactions.

---

### 6. Visual Workflow Builder

**What it does**: Design sophisticated categorization workflows with a drag-and-drop interface.

**Key capabilities**:
- Visual canvas for designing workflows
- Multiple node types (Input, AI Category, Rules Category, Output)
- Connect nodes to define flow
- Configure each node independently
- Save and activate workflows
- Only one active workflow at a time

**Node types**:
1. **Input Node**: Entry point for transactions
2. **AI Categorization Node**: Use AI models to categorize
3. **Rules Categorization Node**: Apply rule-based logic
4. **Output Node**: Send results (webhook, email, Slack)

**Why it matters**: Create complex categorization logic without writing code.

[Learn more about workflows →](./workflows-guide.md)

---

### 7. AI-Powered Categorization

**What it does**: Use artificial intelligence to intelligently categorize transactions.

**Key capabilities**:
- 20+ AI models to choose from
- Custom prompts for categorization logic
- Structured output (always returns a category)
- Context-aware categorization
- Learn from transaction patterns

**Supported AI models**:
- **OpenAI**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic**: Claude Opus 4, Claude Sonnet 4, Claude Haiku
- **Google**: Gemini 2.0 Pro, Gemini 1.5 Flash
- **xAI**: Grok 4, Grok 3
- **Mistral**: Large, Medium, Small
- **DeepSeek**: V3, V2.5
- **Meta**: Llama 3 models (via Groq)

**Example prompts**:
- "Categorize this transaction based on the merchant name and amount"
- "Look for recurring patterns and categorize accordingly"
- "Use context from previous transactions to determine the category"

**Why it matters**: AI understands nuances that rules can't capture, like vendor name variations or context.

---

### 8. Analytics & Visualization

**What it does**: Visualize spending patterns and trends.

**Key capabilities**:
- Interactive charts and graphs
- Spending trends over time
- Category breakdown (pie/donut charts)
- Income vs expenses comparison
- Monthly/yearly comparisons
- Filtering by date range, account, category

**Visualization types**:
- **Line charts**: Spending trends over time
- **Bar charts**: Category comparisons
- **Pie charts**: Spending distribution
- **Area charts**: Cumulative spending

**Why it matters**: Pictures tell stories that spreadsheets can't. See patterns at a glance.

---

### 9. Map View

**What it does**: Visualize transactions geographically.

**Key capabilities**:
- Interactive map with transaction markers
- Heatmap visualization for spending density
- Filter by date range and category
- Click markers to view transaction details
- Geographic spending analysis

**Use cases**:
- See where you spend money most often
- Identify spending patterns by location
- Track business expenses across cities
- Visualize travel spending

**Why it matters**: Understand the geographic dimension of your spending habits.

---

### 10. PDF Export

**What it does**: Export transaction data and reports to PDF format.

**Key capabilities**:
- Generate PDF reports
- Include transaction lists
- Add charts and visualizations
- Customizable date ranges
- Professional formatting

**Why it matters**: Share reports with accountants, business partners, or for record-keeping.

---

### 11. User Authentication

**What it does**: Secure access to your financial data.

**Key capabilities**:
- Email/password authentication
- Email verification
- Magic link login (passwordless)
- Secure sessions with automatic timeout
- Password hashing (bcrypt)

**Security features**:
- JWT tokens with httpOnly cookies
- Session expiration (7 days)
- Rate limiting on auth endpoints
- XSS protection
- CSRF protection

**Why it matters**: Your financial data is sensitive and must be protected.

---

### 12. Admin Dashboard

**What it does**: Administrative tools for system management (admin users only).

**Key capabilities**:
- View all users (with privacy redaction)
- System statistics
- Transaction overview across all users
- User role management
- System health monitoring

**Admin features**:
- User count and growth
- Total transactions across system
- Active accounts count
- Category usage statistics

**Why it matters**: System administrators need visibility into overall usage and health.

---

## Feature Comparison

### Free Features (All Users)
- ✅ Unlimited bank accounts
- ✅ Unlimited transactions
- ✅ CSV import
- ✅ Manual categorization
- ✅ Rule-based categorization
- ✅ Basic analytics
- ✅ Map view
- ✅ PDF export

### AI Features (Requires API Key)
- 🔑 AI-powered categorization
- 🔑 Workflow builder with AI nodes
- 🔑 20+ AI model selection

---

## Coming Soon

Features currently in development:

- 📋 **Budget Management**: Set and track budgets by category
- 🔔 **Notifications**: Get alerts for unusual spending or low balances
- 📊 **Advanced Reports**: Custom report builder with multiple templates
- 🔄 **Recurring Transactions**: Automatic creation of recurring transactions
- 🏷️ **Tags**: Add multiple tags to transactions
- 🤝 **Shared Accounts**: Multiple users for same account
- 📱 **Mobile App**: iOS and Android applications
- 🔗 **Bank Integrations**: Direct bank connections (Plaid integration)

---

## Related Documentation

- [Getting Started Guide](./getting-started.md) - Learn how to use these features
- [Workflows Guide](./workflows-guide.md) - Master the workflow builder
- [Use Cases](./use-cases.md) - See features in action
- [Limitations](./limitations.md) - Understand current constraints

---

**Have questions about a feature?** Check the [FAQ](./faq.md) or open an issue on GitHub.

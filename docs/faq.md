# Frequently Asked Questions (FAQ)

Quick answers to common questions about Finance Tracker.

## Table of Contents

- [General Questions](#general-questions)
- [Getting Started](#getting-started)
- [Features & Functionality](#features--functionality)
- [Data & Privacy](#data--privacy)
- [Importing & Exporting](#importing--exporting)
- [Categorization](#categorization)
- [Workflows](#workflows)
- [Technical Questions](#technical-questions)
- [Pricing & Cost](#pricing--cost)
- [Troubleshooting](#troubleshooting)

---

## General Questions

### What is Finance Tracker?

Finance Tracker is a self-hosted financial transaction management application. It helps you track spending, categorize transactions, and visualize your finances across multiple accounts.

**Key features**:
- Multi-account management
- CSV import
- Automatic categorization (rules and AI)
- Visual workflow builder
- Analytics and charts
- Map view for geographic spending

---

### Is Finance Tracker free?

**Yes!** Finance Tracker is free and open source. However:

- ✅ **Free**: Core application, all features
- ✅ **Free**: Self-hosting on your own server
- 🔑 **Paid**: AI features require your own API keys (you pay AI providers, not us)
- 💰 **Optional**: Cloud hosting costs if using services like Vercel or Railway

**No subscription fees, no premium tiers, no paywalls.**

---

### How is this different from Mint or YNAB?

| Feature | Finance Tracker | Mint | YNAB |
|---------|----------------|------|------|
| **Privacy** | ✅ Self-hosted, you own data | ❌ Company owns data | ⚠️ Company stores data |
| **Bank Sync** | ❌ Manual import | ✅ Automatic | ✅ Automatic |
| **Cost** | 🆓 Free | 🆓 Free | 💰 $99/year |
| **AI Features** | ✅ 20+ models | ❌ No | ❌ No |
| **Workflows** | ✅ Visual builder | ❌ No | ❌ No |
| **Open Source** | ✅ Yes | ❌ No | ❌ No |
| **Mobile App** | ❌ Not yet | ✅ Yes | ✅ Yes |
| **Budgeting** | ⏳ Coming soon | ✅ Yes | ✅ Yes |

**Choose Finance Tracker if you want**: Privacy, AI features, customization, no cost
**Choose alternatives if you need**: Bank sync, native mobile apps, full budgeting

---

### Do I need coding skills to use it?

**For using the app**: No! The interface is user-friendly and no coding required.

**For self-hosting**: Some technical knowledge helpful but not required. If you can:
- Follow a tutorial
- Copy/paste commands
- Set up environment variables

You can self-host Finance Tracker. See [SETUP.md](../SETUP.md) for guidance.

**Alternative**: Use hosting services like Vercel or Railway for easier deployment.

---

### Is my financial data secure?

**Yes!** Security features include:

- 🔒 **Self-hosted**: You control where data lives
- 🔐 **Encrypted passwords**: Bcrypt hashing
- 🍪 **Secure sessions**: httpOnly cookies
- 🛡️ **Security headers**: XSS, CSRF protection
- 🚫 **No data sharing**: We never see your data
- 🔑 **JWT authentication**: Industry-standard

**Additional recommendations**:
- Use strong passwords
- Enable HTTPS in production
- Keep software updated
- Regular database backups

See [SECURITY.md](../SECURITY.md) for details.

---

## Getting Started

### How do I start using Finance Tracker?

See the [Getting Started Guide](./getting-started.md) for a complete walkthrough. Quick version:

1. Create account and verify email
2. Add your bank accounts
3. Import transactions (CSV)
4. Create categories
5. Set up categorization rules
6. View dashboard

**Time**: ~15 minutes

---

### What do I need to begin?

**Minimum requirements**:
- Web browser (Chrome, Firefox, Safari, Edge)
- Email address
- Bank statements or transaction data (CSV format)

**Optional**:
- AI API key (for AI categorization)
- Multiple accounts to track
- Historical transaction data

---

### Can I import my data from other apps?

**Depends on the app**:

✅ **Yes, if you can export to CSV**:
- Mint (export transactions as CSV)
- Personal Capital (export as CSV)
- Bank statements (download CSV)
- Credit card statements (download CSV)
- Excel spreadsheets (save as CSV)

❌ **Not directly from**:
- YNAB (proprietary format)
- Quicken (QFX format not supported yet)
- QuickBooks (accounting format)

**Workaround**: Export from those apps to CSV, then import to Finance Tracker.

---

## Features & Functionality

### Can Finance Tracker automatically sync with my bank?

**Not yet.** Currently you must:
- Download CSV from your bank's website
- Import CSV to Finance Tracker

**Why no automatic sync?**
- Bank integrations require partnerships
- Privacy trade-off (give access to bank credentials)
- Self-hosted apps can't easily use services like Plaid

**Future**: Bank integration (Plaid) is on the roadmap.

---

### Does it work on mobile phones?

**Yes, but no native app yet.**

- ✅ **Responsive design**: Works in mobile browsers
- ✅ **Can use on phone**: Access from Safari, Chrome, etc.
- ❌ **No app store app**: Not in iOS/Android app stores
- ❌ **No native features**: No camera for receipts, no offline mode

**Workaround**: Add to home screen from browser for app-like experience.

**Future**: Native mobile apps planned for v1.0.

---

### Can multiple people use the same account?

**Not yet.** Current limitations:

- One user per account
- Cannot share with partner/spouse
- No collaboration features
- No multi-user permissions

**Workarounds**:
- One person manages, exports reports to share
- Create separate accounts (not ideal)

**Future**: Shared accounts coming in v0.2.

---

### Can I set budgets?

**Not yet.** Current capabilities:

- ✅ View spending by category
- ✅ Track trends over time
- ✅ Compare month-to-month
- ❌ Set budget limits
- ❌ Get budget alerts
- ❌ Track budget vs. actual

**Workaround**: Use category spending as informal budget tracking.

**Future**: Full budget management coming in v0.4.

---

### Does it track investments?

**No.** Finance Tracker focuses on cash flow transactions (income and expenses), not:

- ❌ Stock portfolios
- ❌ Crypto holdings
- ❌ Investment returns
- ❌ Market data

**What it can do**:
- Track investment account transfers
- Record dividends as income
- Log investment purchases as expenses

**Use a dedicated investment app** for portfolio tracking.

---

## Data & Privacy

### Where is my data stored?

**Self-hosted version**:
- On your server/computer
- In your PostgreSQL database
- You control 100%

**Cloud-hosted (Vercel/Railway)**:
- On your hosting provider's servers
- Still your database
- You control access

**We never see your data.** Finance Tracker is open source and self-hosted.

---

### Can you see my financial data?

**No!**

- Finance Tracker is self-hosted
- Data lives on YOUR server
- We have zero access
- No analytics tracking
- No data collection

**Your data never leaves your control.**

---

### What happens if I lose my password?

**Current situation**:

- Email password reset link is sent
- Click link to set new password
- Requires access to your email

**If email is also lost**:
- No recovery possible
- Would need database admin access
- This is a security feature (no backdoor)

**Best practice**: Use a password manager!

---

### Can I delete my account and data?

**Yes!** You have full control:

**Self-hosted**:
- Delete your user account from UI (Settings)
- Or drop database tables directly
- Or delete entire database

**Data deletion is permanent** - no recovery.

**Best practice**: Export data before deletion.

---

## Importing & Exporting

### What CSV format is required?

**Required columns**:
- Date (in any common format)
- Amount (number, can have $ or commas)
- Description (transaction text)

**Optional columns**:
- Type (Income/Expense/Credit/Debit)
- Category
- Location
- Notes

**Auto-detection**: Finance Tracker intelligently detects column names like:
- Date: "Date", "Transaction Date", "Posted Date"
- Amount: "Amount", "Value", "Total"
- Description: "Description", "Memo", "Merchant"

See [Features: CSV Import](./features.md#3-csv-import) for details.

---

### My bank's CSV format is weird. Will it work?

**Probably!** Finance Tracker supports many formats:

✅ **Common formats**:
- Standard CSV from major banks
- Credit card statements
- PayPal exports
- Venmo exports

❌ **Not supported**:
- PDF statements (convert to CSV first)
- OFX/QFX files (Quicken format)
- Excel files with formulas
- Multi-sheet Excel files

**Workaround**:
- Open in Excel/Google Sheets
- Clean up format
- Export as simple CSV
- Import to Finance Tracker

---

### Can I export my data?

**Current export options**:
- ✅ PDF reports (with filters and charts)

**Not yet available**:
- ❌ CSV export of categorized transactions
- ❌ Excel export
- ❌ JSON export
- ❌ Integrations with other tools

**Workaround**: Access your PostgreSQL database directly for full data export.

**Future**: More export formats coming.

---

### How often should I import transactions?

**Recommended frequency**:

- **Monthly**: Most common, good for casual tracking
- **Weekly**: Better for tight budget monitoring
- **After major purchases**: For real-time tracking
- **Quarterly**: Minimum for tax purposes

**More frequent = better insights**, but balance with convenience.

---

## Categorization

### How does automatic categorization work?

**Two methods**:

**1. Rules-Based** (fast, free):
- You create rules
- "If description contains X, categorize as Y"
- Can match patterns, amounts, dates
- Processed instantly

**2. AI-Based** (smart, costs money):
- Uses machine learning models
- Understands context and variations
- Handles edge cases
- Requires API key

**Best approach**: Combine both! Use rules for known patterns, AI for everything else.

See [Workflows Guide](./workflows-guide.md) for details.

---

### Can AI categorize without me creating rules?

**Yes!** AI can categorize with zero setup:

1. Configure AI node in workflow
2. Provide list of your categories
3. Write a prompt like: "Categorize based on merchant name"
4. AI handles the rest

**Example**:
- "STARBUCKS" → Coffee (AI figured it out)
- "WHOLE FOODS" → Groceries (AI knows it's a store)
- "SHELL GAS" → Transportation (AI understands)

**Benefit**: Works immediately, no rule creation needed.

**Downside**: Costs money per transaction (usually pennies).

---

### Which AI model should I use?

**Quick guide**:

| Model | Best For | Speed | Cost | Accuracy |
|-------|----------|-------|------|----------|
| **GPT-3.5** | General use | ⚡️ Fast | 💰 Cheap | ⭐️⭐️⭐️⭐️ |
| **GPT-4** | High accuracy | 🐌 Slow | 💰💰💰 Expensive | ⭐️⭐️⭐️⭐️⭐️ |
| **Claude** | Context understanding | ⚡️ Fast | 💰💰 Medium | ⭐️⭐️⭐️⭐️⭐️ |
| **Gemini** | Pattern recognition | ⚡️⚡️ Very fast | 💰 Cheap | ⭐️⭐️⭐️⭐️ |
| **Llama** | Free option | ⚡️⚡️ Very fast | 🆓 Free! | ⭐️⭐️⭐️ |

**Recommendation**:
- **Starting out**: Llama (free via Groq)
- **Best value**: GPT-3.5 Turbo
- **Highest quality**: Claude Sonnet
- **Maximum accuracy**: GPT-4

---

### How accurate is AI categorization?

**Typical accuracy**:
- 85-95% correct on first try
- Improves with better prompts
- Better models = higher accuracy
- Context helps (amount, date, etc.)

**Factors affecting accuracy**:
- ✅ Clear merchant names: High accuracy
- ⚠️ Vague descriptions: Medium accuracy
- ❌ Cryptic codes: Low accuracy

**Example**:
- "STARBUCKS #12345": 99% accurate → Coffee
- "SQ* COFFEE SHOP": 90% accurate → Coffee
- "TRN*123456789": 40% accurate → Unknown

**Tip**: Use AI for clear transactions, review unclear ones manually.

---

### Can I change categories after they're assigned?

**Yes!** Categorization is never permanent:

1. Find the transaction
2. Click Edit
3. Change category
4. Save

**Bulk re-categorization**:
- Filter transactions
- Select multiple
- Change category for all
- (Feature coming soon)

---

## Workflows

### What are workflows and do I need them?

**Workflows** are visual representations of your categorization logic.

**You DON'T need workflows if**:
- Simple categorization needs
- Few categories (< 10)
- Happy with basic rules

**You NEED workflows if**:
- Complex logic (if this, then that)
- Combining AI and rules
- Different handling for different amounts
- Want output actions (webhooks, emails)

See [Workflows Guide](./workflows-guide.md) for complete explanation.

---

### Can I have multiple workflows?

**No**, only one workflow can be active at a time.

**Why?**
- Prevents conflicting logic
- Simpler to understand
- Clearer which workflow categorized what

**Workaround**: Design one comprehensive workflow with branches.

**Future**: May support multiple workflows with priority ordering.

---

### Do workflows cost money?

**Workflows themselves**: Free

**AI nodes in workflows**: Cost money (you pay AI provider)

**Rules nodes in workflows**: Free

**Example costs**:
- Workflow with only rules: $0
- Workflow with AI for 100 transactions: ~$0.20 (GPT-3.5)
- Workflow with AI for 100 transactions: $0 (Llama via Groq)

---

## Technical Questions

### What technology is Finance Tracker built with?

**Tech stack**:
- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **UI**: Tailwind CSS, shadcn/ui
- **AI**: Vercel AI SDK
- **Auth**: JWT with jose

**Why Next.js?** Full-stack framework, great DX, easy deployment.

---

### Can I self-host Finance Tracker?

**Yes!** That's the intended use case.

**Requirements**:
- Node.js 18+
- PostgreSQL database
- pnpm or npm
- Basic technical knowledge

See [SETUP.md](../SETUP.md) for complete setup guide.

---

### Can I modify the code?

**Yes!** Finance Tracker is open source (MIT License).

**You can**:
- ✅ Modify for personal use
- ✅ Add features
- ✅ Fix bugs
- ✅ Customize UI
- ✅ Fork the project

**We welcome**:
- Bug reports
- Feature requests
- Pull requests
- Documentation improvements

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

---

### What browsers are supported?

**Fully supported**:
- ✅ Chrome/Edge (Chromium) - latest
- ✅ Firefox - latest
- ✅ Safari - latest

**Probably works**:
- ⚠️ Older browser versions (may have issues)

**Not supported**:
- ❌ Internet Explorer (please upgrade!)

---

### Does it work offline?

**No**, Finance Tracker requires internet connection:

- Needs database connection
- AI features require API calls
- Web-based application

**Future**: Progressive Web App (PWA) with offline mode is planned.

---

## Pricing & Cost

### How much does Finance Tracker cost?

**Application**: $0 (free and open source)

**Additional costs you may incur**:

1. **Hosting** (if using cloud):
   - Vercel: Free tier available
   - Railway: $5/month minimum
   - Or self-host for free

2. **Database** (if using managed):
   - Neon: Free tier available
   - Supabase: Free tier available
   - Or self-host PostgreSQL for free

3. **AI features** (if using):
   - OpenAI API: Pay per use (~$0.002-$0.01 per transaction)
   - Anthropic API: Pay per use
   - Groq (Llama): FREE!

**Realistic monthly cost**:
- **$0**: Self-hosted, no AI
- **$0-5**: Cloud-hosted free tiers, Llama for AI
- **$5-15**: Paid hosting, occasional AI use
- **$50+**: Heavy AI use with premium models

---

### Are there any premium features?

**No!** All features are free. No:
- ❌ Paid tiers
- ❌ Feature paywalls
- ❌ Subscription fees
- ❌ "Pro" version
- ❌ Locked features

**Everything is free and open source.**

---

## Troubleshooting

### Transactions not importing

**Common causes**:

1. **Wrong CSV format**
   - Solution: Check required columns (date, amount, description)

2. **Large file**
   - Solution: Split into smaller files (< 5,000 rows)

3. **Special characters**
   - Solution: Open in Excel, save as clean CSV

4. **Wrong encoding**
   - Solution: Save CSV as UTF-8

See [Getting Started: Import](./getting-started.md#step-3-import-your-transactions) for details.

---

### Rules not working

**Check these**:

1. **Rule pattern matches exactly**
   - Example: "Starbucks" won't match "STARBUCKS"
   - Solution: Use case-insensitive matching or "STARBUCKS|Starbucks"

2. **Rule priority**
   - Lower priority rules may not run
   - Solution: Increase priority number

3. **Rule is inactive**
   - Check "Active" toggle is on

4. **Rule conflict**
   - Multiple rules match same transaction
   - Solution: Adjust priorities or patterns

---

### Dashboard shows no data

**Possible causes**:

1. **No transactions** in selected date range
   - Solution: Expand date range

2. **No categorized transactions**
   - Solution: Categorize some transactions

3. **Wrong filters** applied
   - Solution: Clear filters

4. **Browser cache**
   - Solution: Hard refresh (Ctrl+F5 or Cmd+Shift+R)

---

### Forgot my password

1. Click "Forgot Password" on login page
2. Enter your email
3. Check email for reset link
4. Click link and set new password

**No email received?**
- Check spam folder
- Verify email address correct
- Check server email configuration

---

### Map view not showing transactions

**Requirements for map view**:
- Transactions must have latitude/longitude data
- Usually from CSV import with location columns
- Manually added transactions won't have location unless you add it

**If locations exist but not showing**:
- Check date filter
- Try hard refresh browser
- Clear category filter

---

## Still Have Questions?

### Documentation

- [Getting Started Guide](./getting-started.md)
- [Features Overview](./features.md)
- [Use Cases & Examples](./use-cases.md)
- [Workflows Guide](./workflows-guide.md)
- [User Stories](./user-stories.md)
- [Limitations](./limitations.md)

### Get Help

- 🔍 Search existing [GitHub Issues](https://github.com/YOUR-REPO/issues)
- 💬 Join [GitHub Discussions](https://github.com/YOUR-REPO/discussions)
- 🐛 Report bugs on GitHub
- 📧 Email: support@example.com (if configured)

### Contribute

- ⭐ Star the project on GitHub
- 🐛 Report bugs
- 💡 Suggest features
- 🔧 Submit pull requests
- 📖 Improve documentation

---

**Didn't find your answer?** Ask on GitHub Discussions - we're happy to help!

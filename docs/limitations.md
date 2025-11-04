# Limitations & Constraints

Understanding what Finance Tracker can and cannot do helps set appropriate expectations.

## Current Limitations

### 1. No Direct Bank Connections

**What this means**:
- Cannot automatically sync with banks
- No real-time transaction updates
- Must manually import CSV files or enter transactions

**Why**:
- Bank integrations (like Plaid) require partnerships and compliance
- Self-hosted solution prioritizes data privacy
- API connections expensive for free tool

**Workaround**:
- Download CSV from your bank monthly
- Import takes seconds with intelligent column detection
- Many users prefer manual control over automatic sync

**Future**: Plaid integration is on the roadmap

---

### 2. Single User Per Account

**What this means**:
- Each account belongs to one user
- Cannot share accounts with partner/spouse
- No collaboration features
- No multi-user permissions

**Why**:
- Initial MVP focused on individual users
- Multi-user requires complex permission system
- Authentication model currently single-user

**Workaround**:
- Export PDFs to share with others
- One person manages, shares reports
- Create separate accounts (not ideal)

**Future**: Shared accounts feature planned for v0.2

---

### 3. One Active Workflow At a Time

**What this means**:
- Only one workflow can be active
- Cannot run multiple workflows simultaneously
- Must deactivate current to activate different one

**Why**:
- Prevents conflicting categorization logic
- Simpler mental model for users
- Avoids "which workflow categorized this?" confusion

**Workaround**:
- Design comprehensive workflow with branches
- Switch workflows for different time periods
- Use rules + one workflow for most cases

**Future**: May support multiple workflows with priority ordering

---

### 4. No Mobile App

**What this means**:
- No native iOS or Android app
- Must use web browser on mobile
- Responsive design, but not app experience

**Why**:
- Web-first development approach
- Mobile apps require separate development
- Progressive Web App (PWA) not yet implemented

**Current Mobile Experience**:
- ✅ Responsive design works on phones
- ✅ Can use mobile browser
- ❌ No app store presence
- ❌ No native features (camera for receipts)
- ❌ No offline mode

**Workaround**:
- Bookmark in mobile browser
- Add to home screen (works like app)
- Use desktop for heavy work, mobile for quick views

**Future**: Mobile app planned for v1.0

---

### 5. No Automatic Recurring Transactions

**What this means**:
- Cannot automatically create recurring transactions
- Must manually enter monthly bills each time
- No templates for recurring charges

**Why**:
- Feature not yet implemented
- Requires scheduler and complex logic
- CSV import usually captures recurring charges anyway

**Workaround**:
- Mark transactions as "recurring" for reference
- Import monthly bank statements
- Set calendar reminders for manual entry

**Future**: Auto-recurring transactions coming in v0.3

---

### 6. Limited Budget Features

**What this means**:
- No budget creation
- No budget vs. actual tracking
- No budget alerts or notifications
- Can see spending by category, but can't set limits

**Why**:
- MVP focused on transaction management
- Budget feature requires complex UI
- Many competing priorities

**Current Capabilities**:
- ✅ View spending by category
- ✅ Track trends over time
- ✅ Compare month-to-month
- ❌ Set budget limits
- ❌ Get budget alerts

**Workaround**:
- Track spending in categories
- Manually note desired limits
- Use external budgeting tool

**Future**: Full budget management in v0.4

---

### 7. No Attachments or Receipt Storage

**What this means**:
- Cannot upload receipt images
- No document attachment to transactions
- No receipt OCR (scanning)

**Why**:
- Requires file storage system
- OCR requires AI processing
- Storage costs can escalate

**Workaround**:
- Store receipts externally (Google Drive, Dropbox)
- Add notes with receipt details
- Reference external file in transaction notes

**Future**: Receipt upload feature on roadmap

---

### 8. CSV Import Format Dependencies

**What this means**:
- Works best with standard CSV formats
- Some bank formats may need adjustment
- Non-standard date formats may cause issues

**Supported**:
- ✅ Standard date formats (MM/DD/YYYY, YYYY-MM-DD, DD/MM/YYYY)
- ✅ Common column names
- ✅ Basic CSV structure

**Not Supported**:
- ❌ PDF bank statements
- ❌ OFX/QFX files (Quicken format)
- ❌ MT940 files
- ❌ Excel files with formulas

**Workaround**:
- Convert PDF to CSV using online tools
- Export from financial software as CSV
- Manually clean up problematic CSVs

**Future**: Support for additional formats planned

---

### 9. AI Categorization Costs

**What this means**:
- AI features require API keys
- You pay for AI API usage
- No AI credits included
- Cost varies by model and usage

**Typical Costs** (as of 2024):
- GPT-3.5: ~$0.002 per transaction
- GPT-4: ~$0.01 per transaction
- Claude: ~$0.005 per transaction
- Llama (via Groq): Free!

**Example monthly cost**:
- 200 transactions/month with GPT-3.5: ~$0.40
- 200 transactions/month with GPT-4: ~$2.00
- Using rules for 80%: ~$0.08 (GPT-3.5 for 20%)

**Workaround**:
- Use free models (Llama via Groq)
- Maximize rule usage
- Only use AI for uncertain transactions
- Choose cheaper models

**Future**: May offer bundled AI credits

---

### 10. No Investment Tracking

**What this means**:
- Not designed for stocks, crypto, or investments
- Focuses on cash flow transactions
- No portfolio tracking
- No market data integration

**What it can do**:
- Track investment account transfers
- Record dividends as income
- Log investment purchases as expenses

**What it cannot do**:
- Track stock prices
- Calculate investment returns
- Monitor portfolio performance
- Show capital gains/losses

**Workaround**:
- Use dedicated investment apps
- Track investment cash flows in Finance Tracker
- Separate tool for portfolio management

**Future**: Basic investment tracking may be added

---

### 11. Limited Data Export Options

**What this means**:
- Can export to PDF
- No CSV export of categorized data
- No Excel export
- No integration with accounting software

**Current Export**:
- ✅ PDF reports with filters
- ❌ CSV export
- ❌ Excel export
- ❌ JSON export
- ❌ QuickBooks integration

**Workaround**:
- Copy data from UI
- Use API if self-hosting
- PDF often sufficient for most needs

**Future**: More export formats coming

---

### 12. Self-Hosted Complexity

**What this means**:
- Requires technical setup
- Must maintain your own server
- Need database management
- Updates not automatic

**Requirements**:
- PostgreSQL database
- Node.js environment
- Technical knowledge
- Server maintenance

**Not for**:
- Non-technical users
- Those wanting "just works" solution
- Users who don't want server management

**Workaround**:
- Use cloud hosting (Vercel, Railway)
- Managed database (Neon, Supabase)
- Follow setup guides carefully

**Future**: Hosted SaaS version possible

---

### 13. No Audit Trail

**What this means**:
- No history of changes
- Can't see who changed what
- Can't undo bulk actions
- No transaction version history

**Example**:
- Change transaction category: old category not logged
- Delete transaction: no recovery
- Bulk update: can't undo

**Impact**:
- Must be careful with bulk operations
- No forensic trail for errors
- Can't track categorization changes

**Workaround**:
- Regular database backups
- Export data before bulk changes
- Be cautious with delete operations

**Future**: Audit log feature planned

---

### 14. Limited Search Capabilities

**What this means**:
- Basic text search only
- No advanced query builder
- No saved searches
- No fuzzy matching

**Current Search**:
- ✅ Description text search
- ✅ Filter by category
- ✅ Filter by date range
- ✅ Filter by account
- ❌ Complex queries
- ❌ Multiple conditions
- ❌ Saved searches

**Workaround**:
- Use multiple filters
- Export and search externally
- Use category system strategically

**Future**: Advanced search coming

---

### 15. Performance with Large Datasets

**What this means**:
- Slows down with 10,000+ transactions
- Map view slow with many points
- Workflows may timeout on large batches

**Tested**:
- ✅ Smooth up to 5,000 transactions
- ⚠️ Noticeable lag at 10,000+
- ❌ Issues beyond 50,000

**Workaround**:
- Archive old transactions
- Filter date ranges
- Use pagination
- Avoid map view with 1,000+ transactions

**Future**: Performance optimizations ongoing

---

## Design Decisions (Not Bugs)

These are intentional design choices:

### 1. Email Verification Required
**Why**: Security and account recovery
**Impact**: Extra step during signup
**No workaround**: Required for production use

### 2. JWT Expiration (7 Days)
**Why**: Security best practice
**Impact**: Must re-login weekly
**No workaround**: Intentional security measure

### 3. Port 4010 Default
**Why**: Avoid conflicts with other dev servers
**Impact**: Non-standard URL
**Workaround**: Can change in config

### 4. Webpack Instead of Turbopack
**Why**: Prisma compatibility with Next.js 16
**Impact**: Slightly slower build times
**Workaround**: None needed, works correctly

---

## What Finance Tracker Is NOT

To set clear expectations:

### ❌ Not a Bank Replacement
- Cannot store money
- Cannot make payments
- Not FDIC insured
- Not a financial institution

### ❌ Not Financial Advice
- Does not provide recommendations
- No investment advice
- No tax advice
- Informational tool only

### ❌ Not a Budgeting App (Yet)
- No budget creation
- No spending limits
- No alerts for overspending
- (Coming in future versions)

### ❌ Not Mint or YNAB
- Different feature set
- Privacy-focused (self-hosted)
- No bank partnerships
- More technical setup

### ❌ Not Accounting Software
- Not double-entry bookkeeping
- No invoicing
- No payroll
- Not for business accounting
- (Use QuickBooks, Xero, or FreshBooks for that)

---

## Known Issues

Current bugs or problems being worked on:

### 1. Map Heatmap Performance
**Issue**: Heatmap slow with 500+ points
**Workaround**: Use regular markers, filter date range
**Status**: Investigating optimization

### 2. Date Format Edge Cases
**Issue**: Some international date formats not detected
**Workaround**: Pre-format CSV before import
**Status**: Expanding format detection

### 3. Workflow Builder Mobile
**Issue**: Workflow canvas hard to use on phones
**Workaround**: Use desktop for workflow building
**Status**: Mobile workflow builder redesign planned

### 4. Large CSV Imports
**Issue**: Browser may hang with 5,000+ row CSV
**Workaround**: Split into smaller files
**Status**: Implementing chunked upload

---

## Comparison to Alternatives

Understanding where Finance Tracker fits:

| Feature | Finance Tracker | Mint | YNAB | Quicken |
|---------|----------------|------|------|---------|
| Bank Sync | ❌ | ✅ | ✅ | ✅ |
| Self-Hosted | ✅ | ❌ | ❌ | ❌ |
| Open Source | ✅ | ❌ | ❌ | ❌ |
| AI Categorization | ✅ | ❌ | ❌ | ❌ |
| Visual Workflows | ✅ | ❌ | ❌ | ❌ |
| Mobile App | ❌ | ✅ | ✅ | ✅ |
| Budgeting | ❌* | ✅ | ✅ | ✅ |
| Investment Tracking | ❌ | ✅ | ❌ | ✅ |
| Cost | Free | Free | $99/yr | $52/yr |
| Privacy | High | Low | Medium | Medium |

*Coming soon

**Choose Finance Tracker if you want**:
- Complete data privacy
- Self-hosted solution
- AI-powered categorization
- Workflow automation
- Open source flexibility
- No ongoing costs

**Choose alternatives if you need**:
- Automatic bank syncing
- Native mobile apps
- Full budget management
- Investment tracking
- Simpler setup

---

## Roadmap Priorities

What's coming next (subject to change):

### Version 0.2 (Q1 2025)
- 🎯 **Budget Management**: Set and track budgets
- 🎯 **Shared Accounts**: Multi-user support
- 🎯 **CSV Export**: Export categorized data
- 🎯 **Recurring Transactions**: Auto-create

### Version 0.3 (Q2 2025)
- 📱 **Progressive Web App**: Better mobile experience
- 📁 **Receipt Upload**: Attach images to transactions
- 🔔 **Notifications**: Budget and unusual spending alerts
- 🔍 **Advanced Search**: Complex queries and saved searches

### Version 1.0 (Q3 2025)
- 📱 **Native Mobile Apps**: iOS and Android
- 🏦 **Bank Integration**: Plaid connection (optional)
- 📊 **Custom Reports**: Report builder
- 🔗 **API Access**: Public API for integrations

### Future Considerations
- Investment tracking
- Bill pay reminders
- Goal tracking
- Multi-currency improvements
- Forecasting/predictions

---

## Providing Feedback

Help us prioritize:

### Report Issues
- Bug reports: GitHub Issues
- Feature requests: GitHub Discussions
- Security issues: See SECURITY.md

### Vote on Features
- Star issues you care about
- Comment with use cases
- Share your workflows

### Contribute
- Code contributions welcome
- Documentation improvements
- Testing and feedback

---

## Related Documentation

- [Features Overview](./features.md) - What Finance Tracker CAN do
- [Use Cases](./use-cases.md) - Real-world applications
- [FAQ](./faq.md) - Common questions
- [Getting Started](./getting-started.md) - Begin using the app

---

**Questions about limitations?** Check the [FAQ](./faq.md) or ask in GitHub Discussions.

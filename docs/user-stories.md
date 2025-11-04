# User Stories & Personas

Understanding the people who use Finance Tracker and their needs.

## User Personas

### 1. Sarah - The Budget-Conscious Professional

**Background**:
- 32-year-old marketing manager
- Earns $75,000/year
- Has checking, savings, and 2 credit cards
- Wants to save for a house down payment

**Goals**:
- Track all spending across multiple accounts
- Understand where money goes each month
- Reduce unnecessary expenses
- Save 20% of income

**Pain Points**:
- Too many accounts to track manually
- Bank apps don't show complete picture
- Forgets to categorize transactions
- Struggles to identify spending leaks

**How Finance Tracker Helps**:
- Imports all transactions from multiple accounts
- Automatically categorizes with rules (coffee = Coffee Shops)
- Shows spending breakdown by category
- Visualizes trends over time

**User Stories**:
> "As a budget-conscious professional, I want to automatically categorize my transactions so that I don't have to manually tag each purchase."

> "As someone tracking multiple accounts, I need to see all my spending in one place so I can understand my complete financial picture."

> "As a saver, I want to visualize my spending trends so I can identify areas where I can cut back."

---

### 2. Marcus - The Small Business Owner

**Background**:
- 45-year-old consultant
- Runs a small consulting business
- Mixes personal and business expenses
- Needs to track expenses for taxes

**Goals**:
- Separate business from personal expenses
- Track deductible expenses
- Generate reports for accountant
- Monitor cash flow

**Pain Points**:
- Manually sorting business vs personal takes hours
- Easy to miss deductible expenses
- Accountant needs organized data
- Bank statements don't categorize properly

**How Finance Tracker Helps**:
- Creates separate accounts for business and personal
- Rule-based categorization for common vendors
- AI categorization for unusual expenses
- PDF export for accountant

**User Stories**:
> "As a small business owner, I need to separate business expenses from personal so I can properly track deductible costs."

> "As someone preparing for tax season, I want to export categorized transactions to PDF so my accountant can easily review them."

> "As a consultant, I need to categorize project expenses by client so I can invoice accurately."

---

### 3. Emily - The Recent Graduate

**Background**:
- 24-year-old software developer
- First full-time job
- Student loan debt
- Learning to manage finances

**Goals**:
- Understand spending habits
- Stay within budget
- Pay down student loans
- Build emergency fund

**Pain Points**:
- Overwhelmed by financial management
- Doesn't know where money goes
- Forgets about subscriptions
- No system for tracking

**How Finance Tracker Helps**:
- Simple CSV import from bank
- Visual categories make sense
- Map view shows spending locations
- Easy to see recurring charges

**User Stories**:
> "As a recent graduate, I want an easy way to import my transactions so I don't have to enter everything manually."

> "As someone new to budgeting, I need visual representations of my spending so I can quickly understand where my money goes."

> "As a young professional, I want to identify recurring subscriptions so I can cancel ones I don't use."

---

### 4. James - The Tech-Savvy Analyst

**Background**:
- 38-year-old data analyst
- High income, complex finances
- Multiple investment accounts
- Enjoys automation and optimization

**Goals**:
- Automate everything possible
- Build custom categorization logic
- Analyze spending patterns deeply
- Create sophisticated workflows

**Pain Points**:
- Generic finance apps too simple
- Wants more control over categorization
- Needs flexibility for complex rules
- Current tools don't integrate well

**How Finance Tracker Helps**:
- Visual workflow builder for complex logic
- Multiple AI models to choose from
- Regex support for advanced rules
- API access for custom integrations

**User Stories**:
> "As a data analyst, I want to build complex categorization workflows so I can handle my sophisticated financial structure."

> "As a tech-savvy user, I need regex pattern matching in rules so I can create precise categorization logic."

> "As someone who values accuracy, I want to choose between multiple AI models so I can find the one that works best for my data."

---

### 5. Linda - The Freelance Designer

**Background**:
- 29-year-old graphic designer
- Irregular income
- Multiple clients
- Works from home and coffee shops

**Goals**:
- Track project-related expenses
- Monitor income from different clients
- Identify tax-deductible expenses
- Understand spending patterns

**Pain Points**:
- Income varies month to month
- Hard to track which expenses go with which project
- Forgets to save receipts
- Needs location data for expense reports

**How Finance Tracker Helps**:
- Tags transactions with location data
- Map view shows where work expenses occurred
- Custom categories for different clients
- CSV import makes end-of-month reconciliation easy

**User Stories**:
> "As a freelancer, I want to tag transactions with location so I can track which coffee shops I work from."

> "As someone with project-based work, I need to categorize expenses by client so I can invoice correctly."

> "As a freelancer with irregular income, I want to visualize income trends so I can plan for slow months."

---

### 6. Robert & Maria - The Retired Couple

**Background**:
- Both 68 years old
- Living on retirement income
- Multiple accounts and investments
- Want to leave inheritance to children

**Goals**:
- Monitor spending in retirement
- Ensure savings last
- Track medical expenses
- Maintain organized records

**Pain Points**:
- Too many accounts to track
- Bank websites confusing
- Need simple, clear reports
- Want to share with adult children

**How Finance Tracker Helps**:
- Single view of all accounts
- Clear, simple categorization
- Large, readable interface
- Easy PDF export for family

**User Stories**:
> "As retirees, we want to see all our accounts in one place so we don't have to log into multiple bank websites."

> "As seniors managing our finances, we need clear category breakdowns so we can monitor healthcare and essential expenses."

> "As parents, we want to export financial summaries so our adult children can help us if needed."

---

## Common User Journeys

### Journey 1: First-Time Setup

1. **Create account** and verify email
2. **Add first bank account** (checking)
3. **Import CSV** from bank statement
4. **Review transactions** and see auto-detected categories
5. **Create custom categories** for personal needs
6. **Set up first rule** for common merchant
7. **View dashboard** to see spending breakdown

**Time**: 15-20 minutes

---

### Journey 2: Monthly Review

1. **Log in** to Finance Tracker
2. **Filter transactions** to current month
3. **Review uncategorized** transactions
4. **Check spending by category** in dashboard
5. **Look at trends** compared to previous months
6. **Identify anomalies** (unusually high spending)
7. **Export report** if needed

**Time**: 10-15 minutes

---

### Journey 3: Setting Up Automation

1. **Review transactions** that repeat monthly
2. **Create categorization rules** for recurring charges
3. **Test rules** on past transactions
4. **Adjust priorities** if needed
5. **For complex needs**, open workflow builder
6. **Add AI node** for intelligent categorization
7. **Save and activate** workflow

**Time**: 30-45 minutes (one-time setup)

---

### Journey 4: Tax Preparation

1. **Filter transactions** by date range (full year)
2. **Filter by category** (business expenses, charitable donations)
3. **Review and verify** categorization
4. **Export to PDF** for each category
5. **Share with accountant** or tax software
6. **Keep copies** for records

**Time**: 1-2 hours (annually)

---

## User Needs by Feature

### Most Important Features
Based on user research:

1. **CSV Import** (95% of users)
   - Users don't want to enter transactions manually
   - Bank statement import is essential

2. **Automatic Categorization** (87% of users)
   - Manual categorization is time-consuming
   - Users want "set it and forget it"

3. **Multi-Account Support** (78% of users)
   - Most people have 2-4 accounts minimum
   - Single account view not sufficient

4. **Visual Analytics** (72% of users)
   - Spreadsheets are overwhelming
   - Charts make patterns obvious

5. **Mobile-Friendly** (68% of users)
   - Many check finances on phone
   - Need responsive design

### Nice-to-Have Features

6. **Map View** (45% of users)
   - Interesting for travel expenses
   - Useful for business owners

7. **Workflow Builder** (28% of users)
   - Power users love it
   - Most users prefer simple rules

8. **AI Categorization** (35% of users)
   - Tech-savvy users excited
   - Others prefer rule-based

---

## Related Documentation

- [Use Cases & Examples](./use-cases.md) - See these personas in action
- [Features Overview](./features.md) - Learn about mentioned features
- [Getting Started](./getting-started.md) - Begin your journey

---

**Do you see yourself in these personas?** Check out the [Getting Started Guide](./getting-started.md) to begin using Finance Tracker.

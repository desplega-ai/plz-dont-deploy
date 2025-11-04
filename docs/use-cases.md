# Use Cases & Examples

Real-world scenarios showing how Finance Tracker solves common problems.

## Table of Contents

- [Personal Finance](#personal-finance)
- [Small Business](#small-business)
- [Freelancing](#freelancing)
- [Tax Preparation](#tax-preparation)
- [Expense Tracking](#expense-tracking)
- [Financial Analysis](#financial-analysis)

---

## Personal Finance

### Use Case 1: Finding Hidden Subscriptions

**Scenario**: Sarah notices her checking account balance is lower than expected but can't figure out why.

**Problem**:
- Multiple forgotten subscriptions
- Hard to identify recurring charges
- Bank statement overwhelming

**Solution with Finance Tracker**:

1. **Import** last 3 months of transactions via CSV
2. **Filter** by type = "Debit" and amount < $50
3. **Sort** by description to group similar charges
4. **Identify** recurring patterns:
   - Netflix ($15.99/month)
   - Gym membership ($45/month) - not being used!
   - Apple iCloud ($2.99/month)
   - Spotify ($10.99/month)
   - Adobe Creative Cloud ($54.99/month)
   - Wine subscription ($39.99/month) - forgot about this!

**Result**:
- Discovered $85/month in unused subscriptions
- Cancelled gym and wine subscription
- Saved $1,020/year

**Feature Used**: CSV Import, Transaction Filtering, Analytics

---

### Use Case 2: Preparing to Buy a House

**Scenario**: Marcus and his wife want to buy a house and need to show the bank their spending habits.

**Problem**:
- Bank wants 6 months of transaction history
- Needs to show stable income and expenses
- Has to prove no excessive spending
- Separate personal accounts need consolidating

**Solution with Finance Tracker**:

1. **Add accounts** for both partners (checking, savings, credit cards)
2. **Import** 6 months of transactions from all accounts
3. **Create categories** matching bank's requirements:
   - Housing (current rent)
   - Utilities
   - Transportation
   - Food & Dining
   - Healthcare
   - Entertainment
   - Savings

4. **Set up rules** for automatic categorization:
   - "RENT" → Housing
   - "ELECTRIC|GAS|WATER" → Utilities
   - "PAYCHECK|SALARY" → Income

5. **Generate monthly reports** showing:
   - Total income: $8,500/month (stable)
   - Essential expenses: $5,200/month
   - Discretionary: $1,800/month
   - Savings: $1,500/month (17.6% savings rate)

6. **Export PDFs** for each month for mortgage application

**Result**:
- Clear financial picture impressed bank
- Pre-approved for $450,000 mortgage
- Process faster than expected

**Features Used**: Multi-Account, CSV Import, Rules, Analytics, PDF Export

---

### Use Case 3: Cutting Spending by 20%

**Scenario**: Emily wants to save for an emergency fund but doesn't know where to cut spending.

**Problem**:
- Feels like money disappears
- Can't identify spending leaks
- Tried budgeting apps but gave up
- Needs visual way to see problems

**Solution with Finance Tracker**:

1. **Import** 3 months of transactions
2. **Use AI categorization** to automatically organize everything
3. **View dashboard** pie chart showing:
   - Food & Dining: 32% ($960/month) 🚨
   - Housing: 28% ($840/month)
   - Transportation: 15% ($450/month)
   - Entertainment: 12% ($360/month) 🚨
   - Shopping: 8% ($240/month)
   - Other: 5% ($150/month)

4. **Drill down** into Food & Dining:
   - Restaurants: $420/month (14 dinners out)
   - Lunch: $350/month (22 workday lunches)
   - Groceries: $190/month
   - Coffee: $100/month (25 coffees)

5. **Set goals**:
   - Reduce restaurants to 6/month → Save $240/month
   - Bring lunch 3x/week → Save $150/month
   - Coffee only 2x/week → Save $60/month
   - **Total savings: $450/month (15%)**

6. **Track progress** using month-over-month comparison

**Result**:
- Met 15% reduction goal in 2 months
- Built $2,700 emergency fund in 6 months
- Learned sustainable spending habits

**Features Used**: AI Categorization, Analytics, Trends, Category Breakdown

---

## Small Business

### Use Case 4: Separating Business and Personal

**Scenario**: Linda runs a freelance design business but mixes personal and business expenses on the same credit card.

**Problem**:
- Hard to track business expenses
- Missing tax deductions
- Accountant charges extra for sorting
- Can't see business profitability

**Solution with Finance Tracker**:

1. **Create two accounts**:
   - "Business Credit Card"
   - "Personal Credit Card"

2. **Import transactions** for both accounts

3. **Set up business rules**:
   - "ADOBE|FIGMA|SKETCH" → Software (deductible)
   - "COFFEE" + during work hours → Home Office
   - "AMAZON" + match office supplies → Supplies
   - Amount > $100 + weekdays → Client Meetings

4. **Create business categories**:
   - Software & Tools
   - Home Office
   - Professional Development
   - Marketing
   - Travel
   - Client Entertainment

5. **Monthly review**:
   - Business expenses: $1,850
   - Personal expenses: $2,400
   - Revenue (manual entry): $6,500
   - **Profit: $4,650 (72% margin)**

6. **Quarterly export** for accountant showing all deductible expenses

**Result**:
- Found $450/month in missed deductions
- Accountant fees reduced by $200/quarter
- Better understanding of business profitability
- Tax savings of ~$1,800/year

**Features Used**: Multi-Account, Rules, Custom Categories, PDF Export

---

### Use Case 5: Tracking Project Expenses

**Scenario**: James is a consultant working on multiple client projects simultaneously and needs to track expenses per project.

**Problem**:
- Multiple clients, need separate expense tracking
- Some expenses shared across projects
- Needs to invoice expenses to clients
- Current system is spreadsheet chaos

**Solution with Finance Tracker**:

1. **Create categories by client**:
   - Client A - Travel
   - Client A - Software
   - Client A - Meals
   - Client B - Travel
   - Client B - Equipment
   - Client C - Contractors

2. **Use description tags** to mark project:
   - "Hotel - Seattle [ClientA]"
   - "Uber to meeting [ClientB]"

3. **Set up workflow** with AI:
   - Input transaction
   - AI node analyzes description
   - Categorizes by client mentioned
   - Falls back to rules for common patterns

4. **Monthly breakdown**:
   ```
   Client A Expenses:
   - Travel: $850
   - Software: $200
   - Meals: $175
   Total: $1,225 (billable)

   Client B Expenses:
   - Travel: $1,200
   - Equipment: $500
   Total: $1,700 (billable)

   Client C Expenses:
   - Contractors: $3,000
   Total: $3,000 (pass-through)
   ```

5. **Export PDFs** as invoice attachments

**Result**:
- Accurate project expense tracking
- No missed billable expenses
- Professional documentation for clients
- Recovered $425 in previously unbilled expenses

**Features Used**: Custom Categories, AI Workflows, Filtering, PDF Export

---

## Freelancing

### Use Case 6: Proving Home Office Deduction

**Scenario**: Robert is a freelance writer claiming home office deduction and needs to prove coffee shop expenses are work-related.

**Problem**:
- IRS may question coffee shop expenses
- Need to prove they're work locations
- Must show pattern and documentation
- Bank statement alone insufficient

**Solution with Finance Tracker**:

1. **Import transactions** with location data

2. **Use map view** to visualize:
   - Coffee shops visited during work hours
   - Clustering near home (proving local work locations)
   - Frequency of visits

3. **Filter coffee shop transactions**:
   - Starbucks: 42 visits @ $5.50 avg
   - Local Cafe: 28 visits @ $6.75 avg
   - Peet's Coffee: 15 visits @ $5.25 avg

4. **Categorize properly**:
   - "Home Office - Coffee Shops" (work-related)
   - Clear business purpose in notes

5. **Create documentation**:
   - Map showing work locations
   - List of transactions with dates
   - Total: $583.25 for tax year
   - Pattern showing weekday daytime visits

6. **Export comprehensive report** for tax filing

**Result**:
- Documented $583 deduction
- Map evidence supports claim
- Pattern proves business purpose
- Peace of mind for audit

**Features Used**: Map View, Location Data, Filtering, CSV Import

---

## Tax Preparation

### Use Case 7: Year-End Tax Preparation

**Scenario**: Maria needs to prepare tax documents for her accountant, including all deductible expenses.

**Problem**:
- 12 months of transactions to review
- Multiple categories of deductions
- Accountant needs organized data
- Previous year took 8 hours to prepare

**Solution with Finance Tracker**:

1. **Filter transactions** to tax year (Jan 1 - Dec 31)

2. **Review tax-relevant categories**:
   - Charitable Donations: $2,400
   - Medical Expenses: $4,850
   - Home Office: $3,600
   - Professional Development: $1,200
   - State Taxes: $8,500

3. **Verify categorization**:
   - Check AI categorized correctly
   - Manually review large transactions
   - Ensure nothing missed

4. **Export separate PDFs** for each category:
   - "2024_Charitable_Donations.pdf"
   - "2024_Medical_Expenses.pdf"
   - "2024_Home_Office.pdf"
   - "2024_Professional_Dev.pdf"

5. **Create summary report** showing:
   - Total income: $125,000
   - Total deductions: $20,550
   - By category breakdown

**Result**:
- Preparation time: 45 minutes (vs 8 hours)
- Found $850 in previously missed deductions
- Accountant praised organization
- Filed 2 weeks earlier than usual

**Features Used**: Filtering, Categories, AI Categorization, PDF Export

---

## Expense Tracking

### Use Case 8: Travel Expense Report

**Scenario**: Linda traveled for a conference and needs to submit an expense report to her company.

**Problem**:
- Multiple transactions during 4-day trip
- Mixed personal and business expenses
- Need receipts and categorization
- Company requires detailed report

**Solution with Finance Tracker**:

1. **Filter transactions** by date range (May 15-18)

2. **Review map view** to identify trip locations

3. **Categorize expenses**:
   - Flight: $425 ✈️
   - Hotel: $180/night × 3 nights = $540 🏨
   - Uber/Lyft: $95 🚕
   - Business Meals: $185 🍽️
   - Conference Fee: $399 🎫
   - Personal Dinner: $45 (excluded) ❌
   - **Total Business Expenses: $1,644**

4. **Add notes** to each transaction:
   - "Flight to Tech Conference 2024"
   - "Conference hotel - Marriott"
   - "Transportation to venue"
   - "Client dinner - discussed project"

5. **Export PDF** with:
   - Transaction list
   - Category breakdown
   - Map showing travel route
   - Company logo and formatting

**Result**:
- Submitted complete expense report in 15 minutes
- All expenses approved first time
- Reimbursed within 1 week
- Professional presentation

**Features Used**: Date Filtering, Map View, Categories, Notes, PDF Export

---

## Financial Analysis

### Use Case 9: Understanding Seasonal Spending

**Scenario**: James wants to understand how his spending varies throughout the year to plan better.

**Problem**:
- Spending seems to spike at certain times
- Hard to see patterns
- Budget doesn't account for seasonal variation
- Surprises lead to stress

**Solution with Finance Tracker**:

1. **Import** full year of transactions

2. **Use trend charts** to visualize monthly spending

3. **Identify patterns**:
   - **December**: +45% (holidays, gifts)
   - **August**: +30% (vacation)
   - **April**: +20% (home maintenance)
   - **January**: -15% (new year resolutions)

4. **Break down by category**:
   ```
   Holiday Season (Nov-Dec):
   - Shopping: +200% ($1,200 → $3,600)
   - Dining: +75% ($400 → $700)
   - Travel: +150% ($300 → $750)

   Summer (Jun-Aug):
   - Travel: +300% ($300 → $1,200)
   - Entertainment: +50% ($200 → $300)
   - Utilities: +40% ($150 → $210) - AC
   ```

5. **Create seasonal budget**:
   - Save extra $300/month Jan-Oct
   - Budget $4,500 for Nov-Dec
   - No surprises or stress

**Result**:
- Understood seasonal patterns
- Created realistic budget
- Saved appropriately for high-spend months
- Reduced financial stress

**Features Used**: Trends, Analytics, Date Filtering, Category Analysis

---

### Use Case 10: Comparing Account Performance

**Scenario**: Sarah has checking account with fees and wants to know if switching to free account makes sense.

**Problem**:
- Bank charges $12/month maintenance fee
- Free account requires $1,500 minimum balance
- Not sure if worth switching
- Need to analyze actual costs

**Solution with Finance Tracker**:

1. **Filter checking account** transactions

2. **Identify all bank fees**:
   - Monthly maintenance: $12/month = $144/year
   - ATM fees: $3 × 8 times = $24/year
   - Overdraft fee: $35 × 1 time = $35/year
   - **Total fees: $203/year**

3. **Calculate opportunity cost** of free account:
   - Must keep $1,500 minimum balance
   - Could earn 4.5% in high-yield savings
   - Opportunity cost: $67.50/year

4. **Compare options**:
   - Current account: -$203/year
   - Free account: -$67.50/year (opportunity cost)
   - **Savings by switching: $135.50/year**

5. **Track after switching** to verify no hidden fees

**Result**:
- Switched to free account
- Saved $135/year
- Better understanding of banking costs
- More careful about overdrafts

**Features Used**: Account-specific Filtering, Transaction Search, Analytics

---

## Complex Workflows

### Use Case 11: Multi-Level Categorization

**Scenario**: Tech-savvy analyst wants sophisticated categorization logic combining AI and rules.

**Workflow Design**:

```
[Input: Transaction]
        ↓
[AI Node: Detect merchant type]
        ↓
    ┌───┴───┐
    ↓       ↓
[Rules]   [AI: Subcategory]
    ↓       ↓
    └───┬───┘
        ↓
  [Output: Categorized]
```

**Logic**:
1. AI analyzes transaction description
2. Determines broad category (Food, Transport, etc.)
3. If "Food", apply rules:
   - Contains "COFFEE" → Coffee Shops
   - Amount > $50 → Restaurants
   - Amount < $50 → Fast Food
4. If rules don't match, use secondary AI for subcategory
5. Output final category

**Result**:
- 98% accurate categorization
- Handles edge cases intelligently
- Combines speed of rules with intelligence of AI

**Features Used**: Workflow Builder, AI Nodes, Rules Nodes

---

## Related Documentation

- [Features Overview](./features.md) - Learn about the features used in these examples
- [Workflows Guide](./workflows-guide.md) - Build your own complex workflows
- [User Stories](./user-stories.md) - See the people behind these use cases
- [Getting Started](./getting-started.md) - Start using Finance Tracker today

---

**Have a use case we didn't cover?** Let us know by opening an issue on GitHub!

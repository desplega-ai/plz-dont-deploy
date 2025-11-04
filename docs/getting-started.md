# Getting Started with Finance Tracker

A beginner-friendly guide to start tracking your finances in 15 minutes.

## What You'll Learn

- ✅ Create your account
- ✅ Add your first bank account
- ✅ Import transactions
- ✅ Set up categories
- ✅ Create categorization rules
- ✅ View your spending dashboard

**Time needed**: 15-20 minutes

---

## Step 1: Create Your Account

### Sign Up

1. Open Finance Tracker in your browser
2. Click **"Sign Up"** or **"Register"**
3. Enter your details:
   - Email address
   - Password (minimum 8 characters)
4. Click **"Create Account"**

### Verify Your Email

1. Check your email inbox
2. Look for "Verify your Finance Tracker account"
3. Click the verification link
4. You'll be redirected back to Finance Tracker

### Log In

1. Enter your email and password
2. Click **"Log In"**
3. You're in! 🎉

**Tip**: Use a strong password manager to generate and store your password securely.

---

## Step 2: Add Your First Bank Account

### Create an Account

1. From the dashboard, click **"Accounts"** in the navigation
2. Click **"Add Account"** button
3. Fill in the details:
   - **Name**: e.g., "Chase Checking"
   - **Type**: Select from dropdown (Checking, Savings, Credit Card, etc.)
   - **Currency**: Choose your currency (USD, EUR, etc.)
   - **Current Balance**: Enter your current balance
   - **Description** (optional): e.g., "Main checking account"
4. Click **"Save"**

### Example Account Setup

```
Name: Chase Checking
Type: Checking
Currency: USD
Balance: $2,450.00
Description: Primary checking account
```

**Success!** Your first account is created. Now let's add transactions.

---

## Step 3: Import Your Transactions

You have two options: import from CSV or add manually.

### Option A: Import from CSV (Recommended)

**Step 1: Get your bank statement**

1. Log into your bank's website
2. Navigate to your account
3. Look for **"Export"** or **"Download"**
4. Choose **CSV format**
5. Select date range (e.g., last 3 months)
6. Download the file

**Step 2: Import to Finance Tracker**

1. In Finance Tracker, click **"Transactions"**
2. Click **"Import CSV"**
3. Select the account (e.g., "Chase Checking")
4. Click **"Choose File"** and select your CSV
5. Preview the data - Finance Tracker will auto-detect columns:
   - ✅ Date detected
   - ✅ Amount detected
   - ✅ Description detected
6. If detection is wrong, manually map columns
7. Click **"Import Transactions"**

**Success!** Your transactions are imported.

**What if my bank doesn't export CSV?**
- Try exporting as Excel, then save as CSV
- Use online converters for PDF statements
- Or add transactions manually (see Option B)

---

### Option B: Add Transactions Manually

For just a few transactions:

1. Click **"Transactions"**
2. Click **"Add Transaction"**
3. Fill in the details:
   - **Account**: Select your account
   - **Date**: When it occurred
   - **Amount**: How much
   - **Type**: Income or Expense
   - **Description**: What it was for
   - **Category** (optional): We'll set this up next
4. Click **"Save"**

**Example transaction**:
```
Account: Chase Checking
Date: November 1, 2024
Amount: $45.50
Type: Expense
Description: Whole Foods groceries
```

---

## Step 4: Set Up Categories

Categories help you understand where your money goes.

### Create Your First Categories

1. Click **"Categories"** in navigation
2. Click **"Add Category"**
3. Enter category name, e.g., **"Groceries"**
4. Choose a color (for visual identification)
5. Click **"Save"**

### Recommended Starter Categories

Create these common categories:

**Essential**:
- 🏠 Housing (rent/mortgage)
- 🍎 Groceries
- 🚗 Transportation
- ⚡ Utilities
- 🏥 Healthcare

**Discretionary**:
- 🍽️ Dining Out
- ☕ Coffee
- 🎬 Entertainment
- 🛍️ Shopping
- 💇 Personal Care

**Financial**:
- 💰 Income
- 💳 Savings
- 📝 Fees

**Tip**: Start with 10-15 categories. You can always add more later.

### Create Subcategories (Optional)

For more detail, create hierarchies:

```
Food & Dining (parent)
├── Groceries
├── Restaurants
├── Coffee
└── Fast Food
```

To create a subcategory:
1. Create the parent category first
2. When creating child category, select "Parent Category"
3. Choose the parent from dropdown

---

## Step 5: Categorize Your Transactions

### Manual Categorization

1. Go to **"Transactions"**
2. Find an uncategorized transaction
3. Click **"Edit"** (pencil icon)
4. Select a category from dropdown
5. Click **"Save"**

Do this for a few transactions to get started.

---

### Automatic Categorization with Rules

Once you categorize a few manually, create rules so future transactions are automatic.

**Example**: Categorize all Starbucks purchases as "Coffee"

1. Go to **"Categories"**
2. Click on **"Coffee"** category
3. Click **"Add Rule"**
4. Fill in the rule:
   - **Name**: "Starbucks Rule"
   - **Match Field**: Description
   - **Pattern**: "STARBUCKS" (or "starbucks" if case-insensitive)
   - **Priority**: 1 (higher numbers = higher priority)
5. Click **"Save"**

**Success!** Now all transactions with "STARBUCKS" in the description will automatically be categorized as Coffee.

### More Rule Examples

**Groceries**:
```
Name: Grocery Stores
Match Field: Description
Pattern: WHOLE FOODS|SAFEWAY|TRADER JOES|KROGER
Priority: 1
```

**Rent**:
```
Name: Monthly Rent
Match Field: Amount Range
Min Amount: $1200
Max Amount: $1500
Priority: 10 (high priority)
```

**Transportation**:
```
Name: Ride Sharing
Match Field: Description
Pattern: UBER|LYFT
Priority: 1
```

**Tip**: Use the pipe symbol `|` to match multiple patterns (means "OR").

---

## Step 6: View Your Dashboard

Now that you have transactions and categories, let's see your spending!

1. Click **"Dashboard"** in navigation
2. You'll see:
   - 📊 **Spending by Category** (pie chart)
   - 📈 **Trends Over Time** (line chart)
   - 💰 **Income vs Expenses**
   - 📅 **Recent Transactions**

### Interpreting Your Dashboard

**Pie Chart** shows:
- What percentage of spending goes to each category
- Largest slices = biggest expenses
- Hover to see exact amounts

**Line Chart** shows:
- How spending changes over time
- Spot trends (increasing/decreasing)
- Compare months

**Filter Options**:
- Date range (last month, last 3 months, year-to-date)
- Specific account
- Specific category
- Income vs Expenses

---

## Step 7: Explore Advanced Features (Optional)

### Map View

If transactions have location data:

1. Click **"Transactions"** → **"Map View"**
2. See where you spend money geographically
3. Use heatmap to see spending density

### PDF Export

Create reports:

1. Filter transactions as desired
2. Click **"Export to PDF"**
3. PDF includes filtered transactions and charts

### AI Categorization

For more intelligent categorization:

1. Go to **"Workflows"**
2. Create a workflow with AI nodes
3. See [Workflows Guide](./workflows-guide.md) for details

**Note**: Requires AI API key (OpenAI, Anthropic, etc.)

---

## Common Tasks

### How to: Review Monthly Spending

1. Go to **Dashboard**
2. Filter to **"This Month"**
3. Review pie chart for category breakdown
4. Compare to last month using trend chart

### How to: Find Specific Transaction

1. Go to **Transactions**
2. Use search box to search description
3. Or use filters (date, category, account)

### How to: Edit a Transaction

1. Find the transaction
2. Click **Edit** (pencil icon)
3. Change any field
4. Click **Save**

### How to: Delete a Transaction

1. Find the transaction
2. Click **Delete** (trash icon)
3. Confirm deletion

**Warning**: Deletion is permanent!

### How to: Add Another Account

1. Go to **Accounts**
2. Click **Add Account**
3. Follow same process as Step 2

### How to: Change Account Balance

1. Go to **Accounts**
2. Click **Edit** on the account
3. Update balance
4. Click **Save**

**Tip**: Balance updates automatically as you add/remove transactions.

---

## Tips for Success

### 1. Import Regularly

- Set a monthly reminder to import transactions
- Or import weekly for more frequent updates
- More data = better insights

### 2. Categorize Consistently

- Use the same category for same types of expenses
- Create rules for recurring transactions
- Review uncategorized transactions weekly

### 3. Start Simple

- Don't create too many categories at first
- Start with broad categories, add detail later
- 10-15 categories is plenty to start

### 4. Review Monthly

- Set aside 15 minutes monthly
- Review spending by category
- Identify surprises or anomalies
- Adjust rules as needed

### 5. Use Rules, Not Manual

- If you categorize something twice manually, create a rule
- Rules save time in the long run
- Start with obvious patterns (specific merchants)

### 6. Keep Notes

- Add notes to unusual transactions
- Helps you remember context later
- Useful for tax time

---

## Troubleshooting

### Can't Log In

- Check email and password are correct
- Try "Forgot Password" if needed
- Make sure email is verified
- Check for typos

### CSV Import Not Working

- Make sure file is true CSV (not Excel)
- Check that required columns exist (date, amount, description)
- Try smaller date range if file is very large
- See [Limitations](./limitations.md) for format requirements

### Transactions Not Categorizing

- Check that rules are created and active
- Verify pattern matches description exactly
- Check rule priority (higher = runs first)
- Test rule on sample transactions

### Balance Seems Wrong

- Account balance = starting balance + income - expenses
- Check all transactions imported
- Verify transaction types (income vs expense)
- Manually adjust balance if needed

### Categories Not Showing in Charts

- Need at least a few transactions in category
- Check date filter on dashboard
- Ensure transactions are categorized

---

## Next Steps

You're all set up! Here's what to do next:

### Week 1
- ✅ Import your transactions
- ✅ Create categories
- ✅ Set up basic rules
- ✅ Categorize transactions

### Week 2
- Review your first dashboard
- Identify top spending categories
- Create more rules for common merchants
- Add any missing transactions

### Month 1
- Import next month of transactions
- Review month-over-month changes
- Adjust categories if needed
- Fine-tune rules

### Ongoing
- Monthly transaction imports
- Monthly spending review
- Quarterly financial check-ins
- Annual review for taxes

---

## Learn More

### Documentation

- [Features Overview](./features.md) - Explore all features
- [Workflows Guide](./workflows-guide.md) - Build advanced workflows
- [Use Cases](./use-cases.md) - See real examples
- [User Stories](./user-stories.md) - Find your persona
- [FAQ](./faq.md) - Common questions

### Need Help?

- Check the [FAQ](./faq.md) first
- Search existing GitHub issues
- Open a new issue for bugs
- Join discussions for questions

---

## Welcome to Finance Tracker! 🎉

You're now ready to take control of your finances. Remember:

- Start simple, add complexity later
- Consistency beats perfection
- Small insights lead to big savings
- You've got this! 💪

**Happy tracking!**

---

**Questions?** See the [FAQ](./faq.md) or reach out on GitHub.

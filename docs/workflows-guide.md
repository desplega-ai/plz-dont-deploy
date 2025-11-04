# Workflows Guide

Master the visual workflow builder to create sophisticated transaction categorization logic.

## Table of Contents

- [What Are Workflows?](#what-are-workflows)
- [When to Use Workflows](#when-to-use-workflows)
- [Workflow Components](#workflow-components)
- [Building Your First Workflow](#building-your-first-workflow)
- [Advanced Workflows](#advanced-workflows)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## What Are Workflows?

Workflows are visual representations of your transaction categorization logic. Instead of writing code, you drag and drop nodes onto a canvas and connect them to define how transactions should be processed.

**Think of workflows as a flowchart for your finances.**

### Why Use Workflows?

**Traditional approach**:
- Create individual rules one by one
- Hard to see the big picture
- Difficult to combine different logic types
- Limited to simple pattern matching

**Workflow approach**:
- Visual representation of all logic
- Combine AI and rules in one flow
- See the entire process at a glance
- Powerful, yet no coding required

---

## When to Use Workflows

### Use Simple Rules When:
- ✅ You have straightforward categorization needs
- ✅ Few categories (less than 10)
- ✅ Clear patterns (e.g., "Starbucks" = Coffee)
- ✅ You're new to Finance Tracker

### Use Workflows When:
- ✅ Complex categorization logic
- ✅ Multiple decision points
- ✅ Combining AI and rules
- ✅ Need output actions (webhooks, notifications)
- ✅ 10+ categories with nuanced differences
- ✅ Context-dependent categorization

### Example: When Workflows Shine

**Scenario**: Categorize food expenses
- Coffee shops (amount < $10, morning hours) → Coffee
- Fast food (chains, amount < $25) → Fast Food
- Restaurants (evening, amount > $25) → Dining Out
- Groceries (specific stores) → Groceries
- Food delivery (Uber Eats, DoorDash) → Delivery
- Unknown food transactions → AI decides

**With simple rules**: Need 15+ individual rules, priority conflicts, no fallback
**With workflow**: One visual flow with clear logic paths and AI fallback

---

## Workflow Components

### Node Types

#### 1. Input Node
**Purpose**: Entry point for transactions

**Configuration**:
- None required
- Automatically receives transaction data
- Every workflow must have exactly one

**Output data**:
```json
{
  "date": "2024-11-04",
  "amount": 45.50,
  "description": "STARBUCKS #12345",
  "type": "DEBIT",
  "accountId": "acc_123"
}
```

---

#### 2. AI Categorization Node
**Purpose**: Use artificial intelligence to categorize transactions

**Configuration**:
- **Model Selection**: Choose from 20+ AI models
  - GPT-4: Most accurate, slower, more expensive
  - GPT-3.5: Fast, good balance
  - Claude: Great for context understanding
  - Gemini: Good for patterns
  - Llama: Free (via Groq), fast

- **Prompt**: Instructions for the AI
  ```
  Example prompts:
  "Categorize this transaction based on the merchant name"
  "Look at the amount and description to determine the category"
  "Use context: morning coffee purchases under $10 are Coffee category"
  ```

- **Categories**: List of possible output categories
  - Must be predefined in your category list
  - AI will choose the best match
  - Can include subcategories

**Best for**:
- Transactions with unclear patterns
- Merchant name variations
- Context-dependent categorization
- Fallback when rules don't match

**Example configuration**:
```
Model: GPT-3.5 Turbo
Prompt: "Categorize based on merchant name. Coffee shops → Coffee,
         Restaurants → Dining, Supermarkets → Groceries"
Categories: [Coffee, Dining, Groceries, Shopping, Other]
```

---

#### 3. Rules Categorization Node
**Purpose**: Apply predefined rules for categorization

**Configuration**:
- **Rule Set**: Select which rules to apply
- **Match Mode**:
  - First match: Stop at first matching rule
  - All matches: Apply all matching rules
  - Highest priority: Use priority ordering

**Best for**:
- Known patterns
- Consistent merchants
- Fast categorization
- No API costs

**Example rules in node**:
```
Priority 1: Description contains "STARBUCKS" → Coffee
Priority 2: Description matches "^WHOLE FOODS" → Groceries
Priority 3: Amount between $100-$300 AND date = 1st → Rent
```

---

#### 4. Output Node
**Purpose**: Define what happens after categorization

**Configuration**:
- **Save to Database**: Store categorized transaction
- **Webhook**: Send to external URL
- **Email**: Send notification
- **Slack**: Post to channel

**Webhook example**:
```json
POST https://your-api.com/transactions
{
  "transaction": {
    "id": "tx_123",
    "category": "Coffee",
    "confidence": 0.95
  }
}
```

**Email example**:
```
Subject: Large Transaction Categorized
Body: A transaction of $450.00 was categorized as "Rent"
```

---

### Connecting Nodes

**Edges** connect nodes to define flow:

```
[Input] → [AI Category] → [Output]
```

**Rules**:
- Input node must be first
- Output node must be last
- Nodes can connect to multiple nodes
- No circular connections
- All nodes must be connected

**Branch example**:
```
         [Input]
            ↓
      [AI Category]
         ↙   ↘
   [Rules]  [Rules]
     ↓         ↓
    ↘         ↙
      [Output]
```

---

## Building Your First Workflow

### Simple Workflow: AI Categorization

**Goal**: Use AI to categorize all transactions

**Steps**:

1. **Open Workflow Builder**
   - Navigate to Workflows page
   - Click "Create New Workflow"
   - Name it "AI Categorization"

2. **Add Input Node**
   - Automatically added
   - No configuration needed

3. **Add AI Node**
   - Drag "AI Categorization" from sidebar
   - Place to the right of Input node
   - Click to configure:
     - Model: GPT-3.5 Turbo
     - Prompt: "Categorize this transaction based on the merchant name and amount. Use common sense categories."
     - Categories: Select your categories (Food, Transport, Shopping, etc.)
   - Click Save

4. **Add Output Node**
   - Drag "Output" from sidebar
   - Place to the right of AI node
   - Configure:
     - ✅ Save to Database
     - ❌ Webhook (optional)
   - Click Save

5. **Connect Nodes**
   - Click and drag from Input's right handle
   - Connect to AI node's left handle
   - Repeat: AI node → Output node

6. **Save & Activate**
   - Click "Save Workflow"
   - Toggle "Active" switch
   - Note: Only one workflow can be active

**Result**: All new transactions automatically categorized by AI!

---

### Intermediate Workflow: Rules + AI Fallback

**Goal**: Use rules for common patterns, AI for everything else

**Flow**:
```
[Input] → [Rules] → [AI] → [Output]
                      ↓
                  [Output]
```

**Steps**:

1. **Add Input Node** (automatic)

2. **Add Rules Node**
   - Configure with common patterns:
     - "STARBUCKS" → Coffee
     - "UBER|LYFT" → Transportation
     - "AMAZON" → Shopping
   - Select "First match" mode

3. **Add AI Node**
   - Model: GPT-3.5 Turbo
   - Prompt: "Categorize transactions that don't match common patterns"
   - Categories: [All categories]

4. **Add Output Nodes** (need 2)
   - One after Rules (for matched)
   - One after AI (for fallback)

5. **Connect**:
   - Input → Rules
   - Rules → Output (when matched)
   - Rules → AI (when not matched)
   - AI → Output

6. **Configure Logic**:
   - Rules node: "If match, go to Output; if no match, go to AI"
   - This requires node configuration settings

**Result**: Fast rule-based categorization for common transactions, AI for edge cases!

---

## Advanced Workflows

### Multi-Stage AI Processing

**Goal**: Use different AI models for different purposes

**Flow**:
```
[Input] → [AI: Detect Type] → ┬→ [AI: Food Details] → [Output]
                               ├→ [AI: Transport] → [Output]
                               └→ [Rules: Other] → [Output]
```

**Use case**: First AI determines broad category, then specialized AI/rules handle subcategorization

**Configuration**:

1. **First AI Node**: Category detection
   - Model: Fast model (GPT-3.5)
   - Prompt: "Determine if this is: Food, Transport, Shopping, or Other"
   - Categories: [Food, Transport, Shopping, Other]

2. **Branch by Result**:
   - If Food → Food specialist AI
   - If Transport → Transport rules
   - If Shopping → Shopping rules
   - If Other → General AI

3. **Food Specialist AI**:
   - Model: Claude (better context)
   - Prompt: "Subcategorize food: Coffee, Fast Food, Restaurants, Groceries, or Delivery"
   - Categories: [Coffee, Fast Food, Restaurants, Groceries, Delivery]

4. **All paths → Output**

**Benefits**:
- More accurate subcategorization
- Optimized model selection
- Cost-effective (cheap model first, expensive only when needed)

---

### Conditional Routing with Amount Thresholds

**Goal**: Different handling for small vs large transactions

**Flow**:
```
[Input] → [Amount Check] → ┬→ [Small: Auto-categorize] → [Output]
                           └→ [Large: AI + Review] → [Email Alert] → [Output]
```

**Logic**:
- Transactions < $100: Auto-categorize with rules
- Transactions ≥ $100: Use AI + send email notification

**Benefits**:
- Fast processing for small transactions
- Human review for significant expenses
- Cost optimization (fewer AI calls)

---

### Time-Based Routing

**Goal**: Different categorization based on time of day

**Flow**:
```
[Input] → [Time Check] → ┬→ [Morning: Coffee shops] → [Output]
                         ├→ [Lunch: Restaurants] → [Output]
                         ├→ [Evening: Dining] → [Output]
                         └→ [Night: Entertainment] → [Output]
```

**Use case**: Same merchant (e.g., café) but different purposes based on time

---

## Best Practices

### 1. Start Simple
- Begin with basic workflow (Input → AI → Output)
- Add complexity only when needed
- Test with sample transactions first

### 2. Use Rules for Known Patterns
- Rules are fast and free
- Save AI for uncertain transactions
- Build rule library over time

### 3. Choose the Right AI Model
- **GPT-4**: Complex categorization, high accuracy needed
- **GPT-3.5**: General purpose, good balance
- **Claude**: Great for context and nuance
- **Gemini**: Fast, pattern recognition
- **Llama**: Free option, good for simple tasks

### 4. Write Clear Prompts
**Bad prompt**:
```
"Categorize this"
```

**Good prompt**:
```
"Analyze the merchant name and transaction amount.
Categorize as:
- Coffee: Coffee shops and cafés (Starbucks, local cafes)
- Dining: Restaurants and bars
- Groceries: Supermarkets and grocery stores
- Other: Everything else"
```

### 5. Test Before Activating
- Use "Test" mode with sample transactions
- Verify categorization accuracy
- Check for unexpected results
- Iterate on prompts and rules

### 6. Monitor Performance
- Review miscategorizations weekly
- Adjust rules and prompts
- Track AI costs (if using paid models)
- Optimize for accuracy vs speed vs cost

### 7. One Active Workflow
- Only one workflow can be active
- Deactivate old workflow before activating new
- Keep old workflows for reference
- Document workflow purpose in description

### 8. Use Descriptive Names
**Bad**: "Workflow 1", "Test", "New"
**Good**: "AI + Rules Hybrid", "Food Categorization", "Business Expenses"

### 9. Version Control
- Save workflow before major changes
- Create new workflow for experiments
- Document what each version does
- Keep production workflow stable

### 10. Handle Fallbacks
Always have a fallback path:
```
[Rules] → [AI if no match] → [Default category if still no match]
```

---

## Common Workflow Patterns

### Pattern 1: Fast Rules + AI Fallback
**Best for**: Most users
**Efficiency**: High
**Cost**: Low (AI only for unknowns)

```
[Input] → [Rules: Common patterns] → [AI: Everything else] → [Output]
```

---

### Pattern 2: AI First
**Best for**: New users, learning phase
**Efficiency**: Medium
**Cost**: Higher (AI for everything)

```
[Input] → [AI: Categorize all] → [Output]
```

---

### Pattern 3: Multi-Tier Rules
**Best for**: Power users, complex categories
**Efficiency**: Very high
**Cost**: Free (no AI)

```
[Input] → [Rules: Tier 1] → [Rules: Tier 2] → [Rules: Tier 3] → [Output]
```

---

### Pattern 4: AI Consensus
**Best for**: High accuracy needs
**Efficiency**: Low
**Cost**: High (multiple AI calls)

```
[Input] → ┬→ [AI Model 1] ┐
          ├→ [AI Model 2] ┼→ [Consensus Logic] → [Output]
          └→ [AI Model 3] ┘
```

---

## Troubleshooting

### Workflow Not Running

**Symptoms**: New transactions not being categorized

**Solutions**:
1. Check workflow is marked as "Active"
2. Verify all nodes are connected
3. Check for error messages in workflow editor
4. Ensure Input and Output nodes present
5. Test workflow with sample transaction

---

### Incorrect Categorization

**Symptoms**: Transactions categorized wrong

**Solutions**:
1. **Review AI prompt**: Is it clear and specific?
2. **Check rule patterns**: Do they match correctly?
3. **Test individual nodes**: Isolate problem node
4. **Adjust model**: Try different AI model
5. **Add examples to prompt**: Show AI what you want

**Example fix**:
```
Before: "Categorize this transaction"

After: "Categorize this transaction:
- If description contains coffee shop names → Coffee
- If description contains restaurant names → Dining
- If amount > $100 and groceries → Groceries
Examples:
- 'STARBUCKS' → Coffee
- 'CHIPOTLE' → Dining
- 'WHOLE FOODS $150' → Groceries"
```

---

### Workflow Too Slow

**Symptoms**: Long delay before categorization

**Solutions**:
1. **Use faster AI model**: GPT-3.5 instead of GPT-4
2. **More rules, less AI**: Rules are instant
3. **Remove unnecessary nodes**: Simplify flow
4. **Batch processing**: Process multiple at once
5. **Optimize AI prompts**: Shorter prompts = faster

---

### High AI Costs

**Symptoms**: Expensive API bills

**Solutions**:
1. **Add more rules**: Reduce AI calls
2. **Use cheaper model**: Llama (free) or GPT-3.5
3. **Cache results**: Don't re-process same patterns
4. **Batch processing**: More efficient
5. **Conditional AI**: Only for uncertain transactions

**Cost optimization**:
```
Before: All 1000 transactions → GPT-4 ($20)

After:
- 800 transactions → Rules (free)
- 200 transactions → GPT-3.5 ($2)
- Total: $2 (90% savings)
```

---

### Node Configuration Lost

**Symptoms**: Node settings reset or missing

**Solutions**:
1. **Save often**: Click Save after each change
2. **Browser refresh**: May lose unsaved changes
3. **Export workflow**: Backup important workflows
4. **Check autosave**: Verify autosave is enabled

---

## Examples Library

### Example 1: Personal Finance Starter
```
[Input]
  ↓
[Rules: Common merchants]
  ├→ Match: [Output]
  └→ No match: [AI: General categorization]
      ↓
    [Output]
```

**Rules**:
- "RENT|LEASE" → Housing
- "ELECTRIC|GAS|WATER" → Utilities
- "SAFEWAY|KROGER|TRADER" → Groceries
- "NETFLIX|SPOTIFY|HULU" → Entertainment

**AI**: GPT-3.5 with all categories

---

### Example 2: Small Business Expense Tracking
```
[Input]
  ↓
[AI: Detect expense type]
  ├→ Software: [Rules: Known vendors]
  ├→ Travel: [Rules: By amount]
  ├→ Meals: [AI: Client vs Personal]
  └→ Other: [Rules: Default categories]
      ↓
    [Output + Webhook to accounting system]
```

---

### Example 3: Receipt Categorization
```
[Input]
  ↓
[AI: Extract merchant and amount]
  ↓
[Rules: Merchant database lookup]
  ├→ Match: [Output]
  └→ No match: [AI: Infer from description]
      ↓
    [Email: Request manual review]
      ↓
    [Output]
```

---

## Related Documentation

- [Features Overview](./features.md) - Learn about workflow features
- [Use Cases](./use-cases.md) - See workflows in real scenarios
- [Getting Started](./getting-started.md) - Begin using workflows
- [FAQ](./faq.md) - Common workflow questions

---

**Ready to build your first workflow?** Head to the Workflows page in Finance Tracker and start experimenting!

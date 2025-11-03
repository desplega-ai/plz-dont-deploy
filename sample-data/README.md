# Sample CSV Files for Transaction Import Testing

This directory contains sample CSV files to test the transaction import functionality.

## Files

### 1. `basic-transactions.csv`
- **Transactions**: 15 mixed credits/debits
- **Format**: Simple format with `date`, `amount`, `description`
- **Use case**: Basic import testing with positive and negative amounts
- **Features**: Mix of income and expenses

### 2. `transactions-with-location.csv`
- **Transactions**: 14 transactions with location data
- **Format**: Includes `merchantName`, `latitude`, `longitude` columns
- **Use case**: Testing location data import
- **Features**: Real merchant names and San Francisco area coordinates

### 3. `various-merchants.csv`
- **Transactions**: 16 common recurring expenses
- **Format**: Simple format with typical monthly bills
- **Use case**: Testing common expense categories (utilities, subscriptions, bills)
- **Features**: Realistic merchant names (PG&E, Comcast, Verizon, etc.)

### 4. `large-dataset.csv`
- **Transactions**: 20 transactions (maximum for QA)
- **Format**: Mix of income and expenses
- **Use case**: Testing pagination with larger datasets
- **Features**: Full month of transactions

### 5. `mixed-types.csv`
- **Transactions**: 15 transactions with explicit type column
- **Format**: Includes `type` column (deposit/withdrawal/debit/credit)
- **Use case**: Testing type detection and mapping
- **Features**: Various transaction types to test type parsing

## Import Instructions

1. Navigate to the Transactions page
2. Click "Import from CSV" button
3. Select a bank account
4. Upload one of the sample CSV files
5. Map columns (if needed):
   - Date → date
   - Amount → amount
   - Description → description
   - Type → type (for mixed-types.csv)
6. Click "Import Transactions"

## Expected Column Formats

### Required Columns
- `date`: Date in various formats (YYYY-MM-DD, MM/DD/YYYY, etc.)
- `amount`: Numeric value (positive for income, negative for expense)
- `description`: Text description

### Optional Columns
- `type`: Transaction type (credit/debit/deposit/withdrawal)
- `merchantName`: Name of merchant
- `latitude`: Latitude coordinate
- `longitude`: Longitude coordinate

## Testing Scenarios

1. **Basic Import**: Use `basic-transactions.csv` to test standard import
2. **Location Data**: Use `transactions-with-location.csv` to verify location display
3. **Type Mapping**: Use `mixed-types.csv` to test type detection
4. **Large Dataset**: Use `large-dataset.csv` to test pagination (20 items)
5. **Recurring Bills**: Use `various-merchants.csv` to test categorization rules

## Notes

- All files contain less than 20 transactions as requested
- Dates are set to January 2025
- Amounts use realistic values for typical expenses
- Files can be imported multiple times for testing
- Each import will create new transactions (no duplicate detection)

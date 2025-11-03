import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // PRODUCTION SAFETY CHECK
  // Prevent accidental seed execution in production
  if (process.env.NODE_ENV === "production") {
    console.error("❌ ERROR: Cannot run seed in production environment!");
    console.error("   Seeding is only allowed in development and test environments.");
    console.error("   This prevents accidental data corruption in production.");
    process.exit(1);
  }

  console.log("⚠️  WARNING: This will create test users with default passwords.");
  console.log("   Only run this in development/test environments!");
  console.log("");

  // Hash password for both test users
  const passwordHash = await bcrypt.hash("password123", 10);

  // Create test regular user
  const testUser = await db.user.upsert({
    where: { email: "user@test.com" },
    update: {
      magicLinkEnabled: true,
      emailVerified: true,
    },
    create: {
      email: "user@test.com",
      passwordHash,
      role: "USER",
      emailVerified: true,
      magicLinkEnabled: true,
    },
  });

  console.log("✅ Created test user:", testUser.email);

  // Create test admin user
  const testAdmin = await db.user.upsert({
    where: { email: "admin@test.com" },
    update: {
      magicLinkEnabled: true,
      emailVerified: true,
    },
    create: {
      email: "admin@test.com",
      passwordHash,
      role: "ADMIN",
      emailVerified: true,
      magicLinkEnabled: true,
    },
  });

  console.log("✅ Created test admin:", testAdmin.email);

  // Create sample bank accounts for the regular user
  const checkingAccount = await db.bankAccount.create({
    data: {
      userId: testUser.id,
      name: "My Checking Account",
      type: "checking",
      currency: "USD",
      balance: 5000.0,
    },
  });

  const savingsAccount = await db.bankAccount.create({
    data: {
      userId: testUser.id,
      name: "Savings Account",
      type: "savings",
      currency: "USD",
      balance: 15000.0,
    },
  });

  console.log("✅ Created sample bank accounts");

  // Create sample categories
  const groceriesCategory = await db.category.create({
    data: {
      userId: testUser.id,
      name: "Groceries",
      color: "#10b981",
    },
  });

  const restaurantsCategory = await db.category.create({
    data: {
      userId: testUser.id,
      name: "Restaurants",
      color: "#f59e0b",
    },
  });

  const transportationCategory = await db.category.create({
    data: {
      userId: testUser.id,
      name: "Transportation",
      color: "#3b82f6",
    },
  });

  const salaryCategory = await db.category.create({
    data: {
      userId: testUser.id,
      name: "Salary",
      color: "#8b5cf6",
    },
  });

  // Create more sample categories for better categorization
  const entertainmentCategory = await db.category.create({
    data: {
      userId: testUser.id,
      name: "Entertainment",
      color: "#ec4899",
    },
  });

  const utilitiesCategory = await db.category.create({
    data: {
      userId: testUser.id,
      name: "Utilities",
      color: "#6366f1",
    },
  });

  const healthcareCategory = await db.category.create({
    data: {
      userId: testUser.id,
      name: "Healthcare",
      color: "#ef4444",
    },
  });

  const shoppingCategory = await db.category.create({
    data: {
      userId: testUser.id,
      name: "Shopping",
      color: "#14b8a6",
    },
  });

  console.log("✅ Created sample categories");

  // Read transactions from CSV
  const csvPath = path.join(__dirname, "seed-transactions.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const lines = csvContent.split("\n").slice(1); // Skip header

  // Function to determine category based on description
  const getCategoryId = (description: string, merchantName: string): string | null => {
    const text = `${description} ${merchantName}`.toLowerCase();

    if (text.includes("grocery") || text.includes("whole foods") || text.includes("safeway") ||
      text.includes("trader joe") || text.includes("sprouts")) {
      return groceriesCategory.id;
    }
    if (text.includes("restaurant") || text.includes("pizza") || text.includes("cafe") ||
      text.includes("coffee") || text.includes("chipotle") || text.includes("starbucks") ||
      text.includes("food") || text.includes("lunch") || text.includes("dinner") || text.includes("breakfast")) {
      return restaurantsCategory.id;
    }
    if (text.includes("gas") || text.includes("uber") || text.includes("lyft") ||
      text.includes("parking") || text.includes("toll")) {
      return transportationCategory.id;
    }
    if (text.includes("salary") || text.includes("payment") || text.includes("refund") ||
      text.includes("bonus") || text.includes("freelance") || text.includes("dividend")) {
      return salaryCategory.id;
    }
    if (text.includes("movie") || text.includes("theater") || text.includes("netflix") ||
      text.includes("spotify") || text.includes("prime") || text.includes("streaming") ||
      text.includes("game")) {
      return entertainmentCategory.id;
    }
    if (text.includes("electric") || text.includes("pg&e") || text.includes("utilities") ||
      text.includes("insurance") || text.includes("rent")) {
      return utilitiesCategory.id;
    }
    if (text.includes("pharmacy") || text.includes("doctor") || text.includes("dentist") ||
      text.includes("hospital") || text.includes("vet") || text.includes("medical") ||
      text.includes("urgent care")) {
      return healthcareCategory.id;
    }
    if (text.includes("store") || text.includes("shop") || text.includes("target") ||
      text.includes("walmart") || text.includes("amazon") || text.includes("clothing") ||
      text.includes("electronics") || text.includes("best buy")) {
      return shoppingCategory.id;
    }

    return null;
  };

  // Parse CSV and create transactions
  const csvTransactions: any[] = [];
  const accounts = [checkingAccount, savingsAccount];

  for (const line of lines) {
    if (!line.trim()) continue;

    const [dateStr, type, amountStr, description, merchantName, latStr, lonStr] = line.split(",");

    const amount = parseFloat(amountStr);
    const transactionType = type.toUpperCase() as "CREDIT" | "DEBIT";
    const accountId = accounts[Math.floor(Math.random() * accounts.length)].id;
    const categoryId = getCategoryId(description, merchantName);

    const transaction: any = {
      bankAccountId: accountId,
      amount: transactionType === "DEBIT" ? -Math.abs(amount) : Math.abs(amount),
      type: transactionType,
      date: new Date(dateStr),
      description: description,
      isRecurring: false,
    };

    if (categoryId) {
      transaction.categoryId = categoryId;
    }

    if (latStr && lonStr && latStr.trim() && lonStr.trim()) {
      transaction.latitude = parseFloat(latStr);
      transaction.longitude = parseFloat(lonStr);
      transaction.locationName = `${merchantName}, San Francisco`;
    }

    csvTransactions.push(transaction);
  }

  // Create transactions in batches
  console.log(`📝 Creating ${csvTransactions.length} transactions from CSV...`);

  for (const transaction of csvTransactions) {
    await db.transaction.create({
      data: transaction,
    });
  }

  console.log(`✅ Created ${csvTransactions.length} transactions from CSV`);

  // Generate additional transactions for Aug 1 - Nov 5, 2025
  console.log("📝 Generating additional transactions for Aug 1 - Nov 5...");

  const merchants = [
    { name: "Whole Foods", category: groceriesCategory.id, minAmount: 40, maxAmount: 200, type: "DEBIT", lat: 37.7833, lon: -122.4167 },
    { name: "Safeway", category: groceriesCategory.id, minAmount: 30, maxAmount: 150, type: "DEBIT", lat: 37.7695, lon: -122.4156 },
    { name: "Trader Joe's", category: groceriesCategory.id, minAmount: 25, maxAmount: 120, type: "DEBIT", lat: 37.7858, lon: -122.4064 },
    { name: "Starbucks", category: restaurantsCategory.id, minAmount: 4, maxAmount: 15, type: "DEBIT", lat: 37.7749, lon: -122.4194 },
    { name: "Blue Bottle Coffee", category: restaurantsCategory.id, minAmount: 5, maxAmount: 20, type: "DEBIT", lat: 37.7749, lon: -122.4194 },
    { name: "Chipotle", category: restaurantsCategory.id, minAmount: 10, maxAmount: 25, type: "DEBIT", lat: 37.7705, lon: -122.4025 },
    { name: "The Italian Homemade", category: restaurantsCategory.id, minAmount: 30, maxAmount: 80, type: "DEBIT", lat: 37.7885, lon: -122.4075 },
    { name: "Shell Gas Station", category: transportationCategory.id, minAmount: 35, maxAmount: 75, type: "DEBIT", lat: 37.7695, lon: -122.4156 },
    { name: "Uber", category: transportationCategory.id, minAmount: 8, maxAmount: 40, type: "DEBIT", lat: null, lon: null },
    { name: "BART", category: transportationCategory.id, minAmount: 3, maxAmount: 12, type: "DEBIT", lat: null, lon: null },
    { name: "Netflix", category: entertainmentCategory.id, minAmount: 15.99, maxAmount: 15.99, type: "DEBIT", lat: null, lon: null },
    { name: "Spotify", category: entertainmentCategory.id, minAmount: 10.99, maxAmount: 10.99, type: "DEBIT", lat: null, lon: null },
    { name: "AMC Theaters", category: entertainmentCategory.id, minAmount: 12, maxAmount: 45, type: "DEBIT", lat: 37.7858, lon: -122.4064 },
    { name: "PG&E", category: utilitiesCategory.id, minAmount: 80, maxAmount: 150, type: "DEBIT", lat: null, lon: null },
    { name: "AT&T", category: utilitiesCategory.id, minAmount: 60, maxAmount: 100, type: "DEBIT", lat: null, lon: null },
    { name: "Comcast", category: utilitiesCategory.id, minAmount: 90, maxAmount: 120, type: "DEBIT", lat: null, lon: null },
    { name: "Walgreens Pharmacy", category: healthcareCategory.id, minAmount: 15, maxAmount: 80, type: "DEBIT", lat: 37.7833, lon: -122.4167 },
    { name: "SF Dental", category: healthcareCategory.id, minAmount: 100, maxAmount: 400, type: "DEBIT", lat: 37.7858, lon: -122.4064 },
    { name: "Target", category: shoppingCategory.id, minAmount: 20, maxAmount: 200, type: "DEBIT", lat: 37.7833, lon: -122.4167 },
    { name: "Amazon", category: shoppingCategory.id, minAmount: 15, maxAmount: 150, type: "DEBIT", lat: null, lon: null },
    { name: "Best Buy", category: shoppingCategory.id, minAmount: 30, maxAmount: 500, type: "DEBIT", lat: 37.7705, lon: -122.4025 },
    { name: "H&M", category: shoppingCategory.id, minAmount: 25, maxAmount: 120, type: "DEBIT", lat: 37.7885, lon: -122.4075 },
    { name: "Acme Corp Salary", category: salaryCategory.id, minAmount: 3500, maxAmount: 3500, type: "CREDIT", lat: null, lon: null },
    { name: "Freelance Payment", category: salaryCategory.id, minAmount: 200, maxAmount: 800, type: "CREDIT", lat: null, lon: null },
    { name: "Bonus Payment", category: salaryCategory.id, minAmount: 500, maxAmount: 1500, type: "CREDIT", lat: null, lon: null },
  ];

  const startDate = new Date("2025-08-01");
  const endDate = new Date("2025-11-05");
  const generatedTransactions: any[] = [];

  // Generate ~200 transactions
  for (let i = 0; i < 200; i++) {
    // Random date between startDate and endDate
    const randomDate = new Date(
      startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
    );

    // Pick a random merchant
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];

    // Random amount within merchant's range
    const amount = parseFloat(
      (merchant.minAmount + Math.random() * (merchant.maxAmount - merchant.minAmount)).toFixed(2)
    );

    // Random account
    const accountId = accounts[Math.floor(Math.random() * accounts.length)].id;

    const transaction: any = {
      bankAccountId: accountId,
      amount: merchant.type === "DEBIT" ? -Math.abs(amount) : Math.abs(amount),
      type: merchant.type as "CREDIT" | "DEBIT",
      date: randomDate,
      description: merchant.name,
      categoryId: merchant.category,
      isRecurring: false,
    };

    if (merchant.lat && merchant.lon) {
      transaction.latitude = merchant.lat;
      transaction.longitude = merchant.lon;
      transaction.locationName = `${merchant.name}, San Francisco`;
    }

    generatedTransactions.push(transaction);
  }

  // Create generated transactions
  for (const transaction of generatedTransactions) {
    await db.transaction.create({
      data: transaction,
    });
  }

  console.log(`✅ Created ${generatedTransactions.length} generated transactions`);

  // Create sample categorization rules
  const sampleRules = [
    {
      userId: testUser.id,
      categoryId: groceriesCategory.id,
      name: "Grocery Stores",
      matchField: "DESCRIPTION" as const,
      matchPattern: "whole foods,costco,safeway,trader joe",
      priority: 10,
      isActive: true,
    },
    {
      userId: testUser.id,
      categoryId: restaurantsCategory.id,
      name: "Restaurants",
      matchField: "DESCRIPTION" as const,
      matchPattern: "restaurant,cafe,diner,pizzeria",
      priority: 8,
      isActive: true,
    },
    {
      userId: testUser.id,
      categoryId: transportationCategory.id,
      name: "Transportation",
      matchField: "DESCRIPTION" as const,
      matchPattern: "uber,lyft,taxi,gas station",
      priority: 9,
      isActive: true,
    },
    {
      userId: testUser.id,
      categoryId: salaryCategory.id,
      name: "Monthly Income",
      matchField: "DESCRIPTION" as const,
      matchPattern: "salary,paycheck,income",
      minAmount: 1000.0,
      priority: 5,
      isActive: true,
    },
  ];

  await db.categoryRule.createMany({
    data: sampleRules,
  });

  console.log(`✅ Created ${sampleRules.length} sample categorization rules`);

  console.log("\n🎉 Database seed completed successfully!");
  console.log("\n📋 Test Credentials:");
  console.log("   Regular User:");
  console.log("   Email: user@test.com");
  console.log("   Password: password123");
  console.log("\n   Admin User:");
  console.log("   Email: admin@test.com");
  console.log("   Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

-- Habesha Tracker ERP - PostgreSQL & Supabase Database Schema
-- Run these commands in your Supabase SQL Editor to provision the tables with RLS and policies.

-- IMPORTANT: DROP existing tables to prevent schema conflicts and ensure correct camelCase column names
DROP TABLE IF EXISTS products, sales, expenses, receivables, payables, tasks, memos, goals, business_settings CASCADE;

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    "id" TEXT PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    "nameEn" TEXT NOT NULL,
    "nameAm" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "purchasePrice" NUMERIC NOT NULL DEFAULT 0.00,
    "sellingPrice" NUMERIC NOT NULL DEFAULT 0.00,
    "currentStock" NUMERIC NOT NULL DEFAULT 0.00,
    "minStock" NUMERIC NOT NULL DEFAULT 0.00,
    "supplier" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. Sales Table (with items stored as JSONB for direct local state compatibility)
CREATE TABLE IF NOT EXISTS sales (
    "id" TEXT PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    "customerName" TEXT DEFAULT 'Walk-in Customer',
    "paymentMethod" TEXT NOT NULL DEFAULT 'Cash',
    "date" TEXT NOT NULL,
    "notes" TEXT,
    "grossSale" NUMERIC NOT NULL DEFAULT 0.00,
    "cost" NUMERIC NOT NULL DEFAULT 0.00,
    "profit" NUMERIC NOT NULL DEFAULT 0.00,
    "items" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    "id" TEXT PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" NUMERIC NOT NULL DEFAULT 0.00,
    "paymentMethod" TEXT NOT NULL DEFAULT 'Cash',
    "date" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. Receivables Table (Customer Loans)
CREATE TABLE IF NOT EXISTS receivables (
    "id" TEXT PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    "customer" TEXT NOT NULL,
    "phone" TEXT,
    "amount" NUMERIC NOT NULL DEFAULT 0.00,
    "dueDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. Payables Table (Supplier Credit)
CREATE TABLE IF NOT EXISTS payables (
    "id" TEXT PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    "supplier" TEXT NOT NULL,
    "amount" NUMERIC NOT NULL DEFAULT 0.00,
    "dueDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 6. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    "id" TEXT PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    "text" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 7. Memos Table
CREATE TABLE IF NOT EXISTS memos (
    "id" TEXT PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    "title" TEXT NOT NULL,
    "content" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT FALSE,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 8. Daily Goals Table
CREATE TABLE IF NOT EXISTS goals (
    "id" TEXT PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    "text" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 9. Business Settings Table
CREATE TABLE IF NOT EXISTS business_settings (
    "userId" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    "businessName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "ownerName" TEXT,
    "bankAdjust" NUMERIC NOT NULL DEFAULT 0.00,
    "cashAdjust" NUMERIC NOT NULL DEFAULT 0.00,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 10. Enable Row Level Security (RLS) on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE payables ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- 11. Create Security Policies scoped to authenticated users
CREATE POLICY "Users can manage their own products" ON products 
    FOR ALL TO authenticated USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can manage their own sales" ON sales 
    FOR ALL TO authenticated USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can manage their own expenses" ON expenses 
    FOR ALL TO authenticated USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can manage their own receivables" ON receivables 
    FOR ALL TO authenticated USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can manage their own payables" ON payables 
    FOR ALL TO authenticated USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can manage their own tasks" ON tasks 
    FOR ALL TO authenticated USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can manage their own memos" ON memos 
    FOR ALL TO authenticated USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can manage their own goals" ON goals 
    FOR ALL TO authenticated USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can manage their own business_settings" ON business_settings 
    FOR ALL TO authenticated USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

-- 12. Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_products_userId ON products("userId");
CREATE INDEX IF NOT EXISTS idx_sales_userId ON sales("userId");
CREATE INDEX IF NOT EXISTS idx_expenses_userId ON expenses("userId");
CREATE INDEX IF NOT EXISTS idx_receivables_userId ON receivables("userId");
CREATE INDEX IF NOT EXISTS idx_payables_userId ON payables("userId");
CREATE INDEX IF NOT EXISTS idx_tasks_userId ON tasks("userId");
CREATE INDEX IF NOT EXISTS idx_memos_userId ON memos("userId");
CREATE INDEX IF NOT EXISTS idx_goals_userId ON goals("userId");


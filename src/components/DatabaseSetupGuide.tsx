import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Database, 
  Terminal, 
  Copy, 
  Check, 
  RefreshCw, 
  WifiOff, 
  ExternalLink, 
  HelpCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface DatabaseSetupGuideProps {
  errorMessage: string;
  onRefresh: () => void;
  onContinueOffline: () => void;
}

export default function DatabaseSetupGuide({ errorMessage, onRefresh, onContinueOffline }: DatabaseSetupGuideProps) {
  const [copied, setCopied] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const sqlCode = `-- Habesha Tracker ERP - PostgreSQL & Supabase Database Schema
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
    FOR ALL TO authenticated USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    onRefresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6"
      >
        {/* Title Block */}
        <div className="flex items-start gap-4 border-b border-slate-800 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Database className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Supabase Tables Missing
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
              Your Supabase database does not have the required tables yet. Let's fix this in 1 minute so you can start!
            </p>
          </div>
        </div>

        {/* Dynamic Error Detail */}
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block uppercase tracking-wide text-[10px] text-rose-500">System Log:</span>
            <span>{errorMessage}</span>
          </div>
        </div>

        {/* Interactive Steps */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Simple 3-Step Setup
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-850 space-y-2">
              <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-emerald-400 mb-1">1</span>
              <p className="text-xs font-extrabold text-white">Copy SQL Script</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Copy the complete schema script below containing table setups & security rules.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-850 space-y-2">
              <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-emerald-400 mb-1">2</span>
              <p className="text-xs font-extrabold text-white flex items-center gap-1">
                Paste in Supabase
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Supabase SQL Editor</a>, paste the script, and click "Run".
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-850 space-y-2">
              <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-emerald-400 mb-1">3</span>
              <p className="text-xs font-extrabold text-white">Refresh and Play!</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Come back here and click refresh. You are ready to start with a fresh ERP database!
              </p>
            </div>
          </div>
        </div>

        {/* Copy Box & SQL Code */}
        <div className="border border-slate-800 rounded-2xl bg-slate-900/30 overflow-hidden">
          <div className="flex items-center justify-between p-3.5 bg-slate-900/90 border-b border-slate-800">
            <button
              onClick={() => setShowSql(!showSql)}
              className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition"
              id="btn-toggle-sql-code"
            >
              {showSql ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>{showSql ? 'Hide SQL Script' : 'View SQL Script'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold transition border border-emerald-500/20 cursor-pointer"
              id="btn-copy-sql-code"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL Code</span>
                </>
              )}
            </button>
          </div>

          {(showSql || copied) && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="p-4 font-mono text-[11px] text-slate-300 max-h-[220px] overflow-y-auto bg-slate-950 border-t border-slate-900 whitespace-pre scrollbar-thin"
            >
              {sqlCode}
            </motion.div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onContinueOffline}
            className="w-full sm:w-1/2 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-bold rounded-xl transition duration-150 text-xs flex items-center justify-center gap-2 cursor-pointer"
            id="btn-setup-offline"
          >
            <WifiOff className="w-4 h-4 text-slate-400" />
            <span>Try Offline / Local Mode</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full sm:w-1/2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition duration-150 flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
            id="btn-setup-refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>I have run the SQL - Refresh</span>
          </button>
        </div>

        {/* Support Help info */}
        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Need help? Ensure you click "Run" in your Supabase SQL editor to execute the script.</span>
        </div>
      </motion.div>
    </div>
  );
}

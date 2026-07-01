export interface Product {
  id: string;
  nameEn: string;
  nameAm: string;
  category: string;
  sku: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
  supplier: string;
  description: string;
}

export interface SaleItem {
  productId: string;
  productNameEn: string;
  productNameAm: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  customerName: string;
  paymentMethod: string;
  date: string;
  notes: string;
  grossSale: number;
  cost: number;
  profit: number;
}

export interface Expense {
  id: string;
  name: string;
  category: string;
  amount: number;
  paymentMethod: string;
  date: string;
  description: string;
}

export interface Receivable {
  id: string;
  customer: string;
  phone: string;
  amount: number;
  dueDate: string;
  status: 'Pending' | 'Overdue' | 'Paid';
}

export interface Payable {
  id: string;
  supplier: string;
  amount: number;
  dueDate: string;
  status: 'Pending' | 'Overdue' | 'Paid';
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface Memo {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  date: string;
}

export interface DailyGoal {
  id: string;
  text: string;
  completed: boolean;
}

export interface AppNotification {
  id: string;
  type: 'info' | 'warning' | 'success';
  text: string;
  time: string;
}

export interface BusinessSettings {
  userId?: string;
  businessName: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  language: 'en' | 'am';
  theme: 'light' | 'dark';
  bankAdjust?: number;
  cashAdjust?: number;
  ownerName?: string;
  preferCBE?: boolean;
  preferTelebirr?: boolean;
  preferEBirr?: boolean;
  preferSinqee?: boolean;
  preferOther?: boolean;
  startingCBE?: number;
  startingTelebirr?: number;
  startingEBirr?: number;
  startingSinqee?: number;
  startingOther?: number;
  startingCash?: number;
}

export type ERPTab =
  | 'dashboard'
  | 'inventory'
  | 'sales'
  | 'expenses'
  | 'loans'
  | 'tasks'
  | 'reports'
  | 'settings';

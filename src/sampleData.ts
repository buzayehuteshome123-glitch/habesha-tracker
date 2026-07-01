import { Product, Sale, Expense, Receivable, Payable, Task, Memo, DailyGoal } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    nameEn: 'White Teff (Qenna)',
    nameAm: 'ነጭ ጤፍ (ቀና)',
    category: 'Grains & Cereals',
    sku: 'TEFF-WHT-001',
    unit: 'Quintal',
    purchasePrice: 7500,
    sellingPrice: 8900,
    currentStock: 25,
    minStock: 5,
    supplier: 'Almaz Grain Wholesalers',
    description: 'Premium quality white teff sourced directly from Ada\'a area.'
  },
  {
    id: 'prod-2',
    nameEn: 'Red Teff',
    nameAm: 'ቀይ ጤፍ',
    category: 'Grains & Cereals',
    sku: 'TEFF-RED-002',
    unit: 'Quintal',
    purchasePrice: 6200,
    sellingPrice: 7300,
    currentStock: 12,
    minStock: 4,
    supplier: 'Almaz Grain Wholesalers',
    description: 'High-iron content red teff perfect for traditional mix.'
  },
  {
    id: 'prod-3',
    nameEn: 'Harar Coffee Beans (Roasted)',
    nameAm: 'የሐረር ቡና (የተቆላ)',
    category: 'Beverages',
    sku: 'COF-HAR-003',
    unit: 'Kg',
    purchasePrice: 420,
    sellingPrice: 580,
    currentStock: 150,
    minStock: 20,
    supplier: 'Oromia Coffee Union',
    description: 'Grade 1 roasted Harar coffee beans with rich blueberry aroma.'
  },
  {
    id: 'prod-4',
    nameEn: 'Sidamo Coffee Beans (Green)',
    nameAm: 'የሲዳማ ቡና (ጥሬ)',
    category: 'Beverages',
    sku: 'COF-SID-004',
    unit: 'Kg',
    purchasePrice: 280,
    sellingPrice: 380,
    currentStock: 4, // Trigger Low Stock Alert (minStock is 10)
    minStock: 10,
    supplier: 'Oromia Coffee Union',
    description: 'Premium organic Sidama green coffee beans.'
  },
  {
    id: 'prod-5',
    nameEn: 'Sunflower Cooking Oil (5L)',
    nameAm: 'ሱፍ የምግብ ዘይት (5 ሊትር)',
    category: 'Cooking Essentials',
    sku: 'OIL-SUN-005',
    unit: 'Bottle',
    purchasePrice: 850,
    sellingPrice: 1100,
    currentStock: 0, // Trigger Out of Stock Alert!
    minStock: 15,
    supplier: 'Sheger Oil Importers',
    description: 'Refined sunflower cooking oil, light and cholesterol free.'
  },
  {
    id: 'prod-6',
    nameEn: 'Shola Powdered Milk (400g)',
    nameAm: 'ሾላ የዱቄት ወተት (400ግ)',
    category: 'Dairy Products',
    sku: 'MILK-SHO-006',
    unit: 'Sachet',
    purchasePrice: 380,
    sellingPrice: 490,
    currentStock: 45,
    minStock: 10,
    supplier: 'Shola Dairy Farm',
    description: 'Full cream instant powdered milk fortified with vitamins.'
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-1',
    items: [
      {
        productId: 'prod-1',
        productNameEn: 'White Teff (Qenna)',
        productNameAm: 'ነጭ ጤፍ (ቀና)',
        quantity: 2,
        purchasePrice: 7500,
        sellingPrice: 8900
      },
      {
        productId: 'prod-3',
        productNameEn: 'Harar Coffee Beans (Roasted)',
        productNameAm: 'የሐረር ቡና (የተቆላ)',
        quantity: 5,
        purchasePrice: 420,
        sellingPrice: 580
      }
    ],
    customerName: 'Kebede Alula',
    paymentMethod: 'Bank',
    date: '2026-06-29T10:30:00.000Z',
    notes: 'Paid via CBE Mobile Banking. Confirmed tx ID: FT26180X99.',
    grossSale: 20700,
    cost: 17100,
    profit: 3600
  },
  {
    id: 'sale-2',
    items: [
      {
        productId: 'prod-2',
        productNameEn: 'Red Teff',
        productNameAm: 'ቀይ ጤፍ',
        quantity: 1,
        purchasePrice: 6200,
        sellingPrice: 7300
      }
    ],
    customerName: 'Tigist Hailu',
    paymentMethod: 'Cash',
    date: '2026-06-28T14:15:00.000Z',
    notes: 'In-store retail cash payment.',
    grossSale: 7300,
    cost: 6200,
    profit: 1100
  },
  {
    id: 'sale-3',
    items: [
      {
        productId: 'prod-6',
        productNameEn: 'Shola Powdered Milk (400g)',
        productNameAm: 'ሾላ የዱቄት ወተት (400ግ)',
        quantity: 10,
        purchasePrice: 380,
        sellingPrice: 490
      }
    ],
    customerName: 'Abeba Sheger Cafe',
    paymentMethod: 'Bank',
    date: '2026-06-27T09:00:00.000Z',
    notes: 'Telebirr merchant payment verified.',
    grossSale: 4900,
    cost: 3800,
    profit: 1100
  }
];

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_RECEIVABLES: Receivable[] = [
  {
    id: 'rec-1',
    customer: 'Girma Wolde',
    phone: '+251-911-234567',
    amount: 8500,
    dueDate: '2026-07-05',
    status: 'Pending'
  },
  {
    id: 'rec-2',
    customer: 'Selam Grocery & Cafe',
    phone: '+251-920-987654',
    amount: 14000,
    dueDate: '2026-06-20',
    status: 'Overdue'
  },
  {
    id: 'rec-3',
    customer: 'Mulugeta Bekele',
    phone: '+251-912-555666',
    amount: 3500,
    dueDate: '2026-06-29',
    status: 'Pending'
  }
];

export const INITIAL_PAYABLES: Payable[] = [
  {
    id: 'pay-1',
    supplier: 'Almaz Grain Wholesalers',
    amount: 22000,
    dueDate: '2026-07-10',
    status: 'Pending'
  },
  {
    id: 'pay-2',
    supplier: 'Sheger Oil Importers',
    amount: 18500,
    dueDate: '2026-06-15',
    status: 'Overdue'
  }
];

export const INITIAL_TASKS: Task[] = [
  { id: 'task-1', text: 'Call Almaz Wholesalers for Teff delivery schedule', completed: false },
  { id: 'task-2', text: 'Confirm Sheger Oil Import bank deposit clear status', completed: true },
  { id: 'task-3', text: 'Check refrigerator stock in beverages section', completed: false }
];

export const INITIAL_MEMOS: Memo[] = [
  {
    id: 'memo-1',
    title: 'Merkato Branch Supplier List',
    content: '1. Almaz Grains: +251911445566\n2. Sheger Oils: +251912889900\n3. Oromia Coffee Union: +251910112233\nAlways call 2 days in advance for bulk grain items.',
    isPinned: true,
    date: '2026-06-28'
  },
  {
    id: 'memo-2',
    title: 'Telebirr Merchant Info',
    content: 'Merchant Shortcode: 881234\nAccount Name: Habesha Grains & Grocery ERP.\nKeep logs of every SMS transaction reference code.',
    isPinned: false,
    date: '2026-06-25'
  }
];

export const INITIAL_GOALS: DailyGoal[] = [
  { id: 'goal-1', text: 'Collect overdue payment from Selam Grocery', completed: false },
  { id: 'goal-2', text: 'Reorder sunflower cooking oil (5L)', completed: true },
  { id: 'goal-3', text: 'Reach 35,000 ETB in sales today', completed: false }
];

// Translations dictionary for bilingual Amharic and English support
export const TRANSLATIONS = {
  en: {
    dashboard: 'Dashboard',
    inventory: 'Inventory',
    sales: 'Sales Tracker',
    expenses: 'Expenses',
    loans: 'Loans & Credit',
    tasks: 'Personal Tasks',
    reports: 'Reports',
    settings: 'Settings',
    search: 'Search...',
    all: 'All',
    totalBank: 'Total in Bank',
    cashOnHand: 'Cash on Hand',
    stockValuation: 'Stock Valuation (Cost)',
    receivables: 'Total Receivables',
    payables: 'Total Payables',
    todayProfit: "Today's Net Profit",
    todaySales: "Today's Sales",
    quickActions: 'Quick Actions',
    recordSale: 'Record Sale',
    restockInv: 'Restock Inventory',
    recordExpense: 'Record Expense',
    depositBank: 'Deposit to Bank',
    withdrawBank: 'Withdraw from Bank',
    addProduct: 'Add New Product',
    analytics: 'Dashboard Analytics',
    weeklyPerformance: 'Weekly Sales Performance',
    weeklyReportPdf: 'Weekly Sales Report PDF',
    revenueDist: 'Revenue Distribution',
    paymentDist: 'Payment Distribution',
    amount: 'Amount',
    percentage: 'Percentage',
    legend: 'Color Legend',
    outOfStock: 'Out of Stock',
    lowStock: 'Low Stock',
    criticalStock: 'Critical Stock',
    stockAlerts: 'Real-Time Stock Alerts',
    noAlerts: 'All products are sufficiently stocked.',
    currencySymbol: 'ETB',
    loading: 'Loading system assets...',
    addProdTitle: 'Add Product',
    editProdTitle: 'Edit Product',
    prodNameEn: 'Product Name (English)',
    prodNameAm: 'Product Name (Amharic)',
    category: 'Category',
    sku: 'SKU',
    unit: 'Unit',
    purchasePrice: 'Purchase Price',
    sellingPrice: 'Selling Price',
    currentStock: 'Current Stock',
    minStock: 'Minimum Stock Level',
    supplier: 'Supplier',
    description: 'Description',
    save: 'Save',
    cancel: 'Cancel',
    actions: 'Actions',
    exportExcel: 'Export Excel',
    importExcel: 'Import Excel',
    searchProdPlaceholder: 'Search by SKU, English or Amharic name...',
    notAvailable: 'N/A',
    
    // Sales Tracker localization
    recordNewSale: 'Record New Sale',
    customerName: 'Customer Name',
    paymentMethod: 'Payment Method',
    saleDate: 'Sale Date',
    notes: 'Notes',
    addItem: 'Add Item',
    remove: 'Remove',
    grossSale: 'Gross Sale',
    cost: 'Cost',
    profit: 'Profit',
    netProfit: 'Net Profit',
    salesTable: 'Sales Records',
    qty: 'Quantity',
    status: 'Status',
    filters: 'Filters',
    stats: 'Statistics',
    filteredGross: 'Filtered Gross Revenue',
    cashCollected: 'Cash Collected',
    bankCollected: 'Bank Collected',
    avgSale: 'Average Sale Value',
    transactionsCount: 'Transactions Count',
    exportPdf: 'Export PDF',
    exportCsv: 'Export CSV',
    
    // Expenses
    expenseName: 'Expense Name',
    expenseCategory: 'Expense Category',
    expenseList: 'Expense List',
    todayExpenses: "Today's Expenses",
    monthlyExpenses: "Monthly Expenses",
    expenseBreakdown: "Expense Breakdown",
    expenseTrend: "Expense Trend",
    
    // Credit & Loans
    creditLoans: 'Loans & Credit',
    receivablesTitle: 'Customer Receivables (Money to Collect)',
    payablesTitle: 'Supplier Payables (Money We Owe)',
    dueDate: 'Due Date',
    phone: 'Phone',
    addLoan: 'Add Loan / Credit Account',
    upcomingDue: 'Upcoming Due Payments',
    overdueAccounts: 'Overdue Accounts',
    
    // Personal Tasks
    checklist: 'Checklist',
    memos: 'Memo Notepad',
    dailyGoals: 'Daily Goals',
    pinnedNotes: 'Pinned Notes',
    searchNotes: 'Search Notes',
    addNote: 'Add New Note',
    addGoal: 'Add Goal',
    addTask: 'Add Task',
    
    // Reports
    reportsEngine: 'Reports Engine',
    genReports: 'Generate ERP Reports',
    repDailySales: 'Daily Sales',
    repWeeklySales: 'Weekly Sales',
    repMonthlySales: 'Monthly Sales',
    repAnnualSales: 'Annual Sales',
    repInventory: 'Inventory Valuation',
    repProfit: 'Profitability Report',
    repExpenses: 'Expenses Breakdown',
    repCashFlow: 'Cash Flow',
    
    // Settings
    settingsTitle: 'ERP Administration Settings',
    businessDetails: 'Business Details',
    address: 'Address',
    email: 'Email',
    langAndTheme: 'Language & Theme Settings',
    theme: 'Theme',
    backupDb: 'Backup Local Database',
    restoreDb: 'Restore Local Database',
    sqlSchema: 'PostgreSQL & Supabase Setup SQL'
  },
  am: {
    dashboard: 'ዳሽቦርድ (ማጠቃለያ)',
    inventory: 'ዕቃዎች ቁጥጥር (ኢንቬንቶሪ)',
    sales: 'የሽያጭ መከታተያ',
    expenses: 'ወጪዎች',
    loans: 'ብድርና ዕዳዎች',
    tasks: 'የዕለት ተግባራት',
    reports: 'ሪፖርቶች',
    settings: 'ማስተካከያ (ሴቲንግ)',
    search: 'ፈልግ...',
    all: 'ሁሉም',
    totalBank: 'በባንክ ያለው አጠቃላይ ገንዘብ',
    cashOnHand: 'በእጅ ላይ ያለ ጥሬ ገንዘብ',
    stockValuation: 'የዕቃዎች ጠቅላላ ዋጋ (በግዢ)',
    receivables: 'የሚሰበሰብ ብድር (receivables)',
    payables: 'ሊከፈል የሚገባው ዕዳ (payables)',
    todayProfit: 'የዛሬ የተጣራ ትርፍ',
    todaySales: 'የዛሬ ጠቅላላ ሽያጭ',
    quickActions: 'ፈጣን ተግባራት',
    recordSale: 'ሽያጭ መዝግብ',
    restockInv: 'ዕቃ ጨምር (Restock)',
    recordExpense: 'ወጪ መዝግብ',
    depositBank: 'በባንክ አስቀምጥ',
    withdrawBank: 'ከባንክ አውጣ',
    addProduct: 'አዲስ ዕቃ መዝግብ',
    analytics: 'የዳሽቦርድ ትንተናዎች',
    weeklyPerformance: 'የሳምንታዊ ሽያጭ አፈጻጸም',
    weeklyReportPdf: 'የሳምንታዊ ሽያጭ ሪፖርት PDF',
    revenueDist: 'የገቢ ምንጮች ስርጭት',
    paymentDist: 'የአከፋፈል ሁኔታዎች',
    amount: 'የገንዘብ መጠን',
    percentage: 'ፐርሰንት',
    legend: 'የቀለም መግለጫ',
    outOfStock: 'ያለቀባቸው ዕቃዎች',
    lowStock: 'ያለቁ የቀረቡ ዕቃዎች',
    criticalStock: 'ለማለቅ የተቃረቡ (Critical)',
    stockAlerts: 'ወቅታዊ የክምችት ማስጠንቀቂያዎች',
    noAlerts: 'ሁሉም ዕቃዎች በበቂ ክምችት ላይ ይገኛሉ።',
    currencySymbol: 'ብር',
    loading: 'ስርዓቱ በመጫን ላይ ነው...',
    addProdTitle: 'አዲስ ዕቃ መመዝገቢያ',
    editProdTitle: 'ዕቃ ማስተካከያ',
    prodNameEn: 'የዕቃው ስም (በእንግሊዝኛ)',
    prodNameAm: 'የዕቃው ስም (በአማርኛ)',
    category: 'ዘርፍ (ካቴጎሪ)',
    sku: 'የዕቃ መለያ ቁጥር (SKU)',
    unit: 'መለኪያ (Unit)',
    purchasePrice: 'የግዢ ዋጋ',
    sellingPrice: 'የመሸጫ ዋጋ',
    currentStock: 'አሁን ያለው ክምችት',
    minStock: 'አነስተኛው የክምችት መጠን',
    supplier: 'አቅራቢ ድርጅት',
    description: 'ዝርዝር መግለጫ',
    save: 'አስቀምጥ',
    cancel: 'ሰርዝ',
    actions: 'ተግባራት',
    exportExcel: 'ወደ ኤክሴል ላክ (Excel)',
    importExcel: 'ከኤክሴል አስገባ (Excel)',
    searchProdPlaceholder: 'በመለያ ቁጥር፣ በእንግሊዝኛ ወይም በአማርኛ ስም ፈልግ...',
    notAvailable: 'የለም',
    
    // Sales Tracker localization
    recordNewSale: 'አዲስ ሽያጭ መመዝገቢያ',
    customerName: 'የደንበኛ ስም',
    paymentMethod: 'የክፍያ መንገድ',
    saleDate: 'የተሸጠበት ቀን',
    notes: 'ማስታወሻ',
    addItem: 'ዕቃ ጨምር',
    remove: 'ቀንስ',
    grossSale: 'አጠቃላይ ሽያጭ',
    cost: 'ዋጋ (ግዢ)',
    profit: 'ትርፍ',
    netProfit: 'የተጣራ ትርፍ',
    salesTable: 'የሽያጭ መዝገብ',
    qty: 'ብዛት',
    status: 'ሁኔታ',
    filters: 'ማጣሪያዎች',
    stats: 'ስታቲስቲክስ',
    filteredGross: 'የተጣራ ጠቅላላ ገቢ',
    cashCollected: 'በእጅ የተሰበሰበ ጥሬ ገንዘብ',
    bankCollected: 'በባንክ የተሰበሰበ',
    avgSale: 'የአንድ ሽያጭ አማካይ ዋጋ',
    transactionsCount: 'የግብይቶች ብዛት',
    exportPdf: 'ወደ PDF ላክ',
    exportCsv: 'ወደ CSV ላክ',
    
    // Expenses
    expenseName: 'የወጪው ስም/ዓይነት',
    expenseCategory: 'የወጪው ዘርፍ',
    expenseList: 'የወጪዎች ዝርዝር',
    todayExpenses: 'የዛሬ ጠቅላላ ወጪ',
    monthlyExpenses: 'የዚህ ወር ጠቅላላ ወጪ',
    expenseBreakdown: 'የወጪዎች ስርጭት',
    expenseTrend: 'የወጪዎች ሁኔታ',
    
    // Credit & Loans
    creditLoans: 'ብድርና ዕዳዎች',
    receivablesTitle: 'ደንበኞች ያሉባቸው የሚሰበሰቡ ብድሮች (Receivables)',
    payablesTitle: 'ለአቅራቢዎች የሚከፈሉ እዳዎች (Payables)',
    dueDate: 'መክፈያ ቀን',
    phone: 'ስልክ',
    addLoan: 'አዲስ ብድር/ዕዳ መዝግብ',
    upcomingDue: 'የቀረቡ መክፈያ ቀናት',
    overdueAccounts: 'ቀናቸው ያለፈባቸው ሂሳቦች',
    
    // Personal Tasks
    checklist: 'የሥራዎች ዝርዝር (Checklist)',
    memos: 'አጫጭር ማስታወሻዎች (Memos)',
    dailyGoals: 'የዕለት ግቦች (Goals)',
    pinnedNotes: 'የተሰኩ ማስታወሻዎች',
    searchNotes: 'ማስታወሻዎችን ፈልግ',
    addNote: 'አዲስ ማስታወሻ ጻፍ',
    addGoal: 'ግብ ጨምር',
    addTask: 'ተግባር ጨምር',
    
    // Reports
    reportsEngine: 'የሪፖርት ማውጫ',
    genReports: 'አጠቃላይ የንግድ ሪፖርቶች',
    repDailySales: 'የዕለት ሽያጭ',
    repWeeklySales: 'የሳምንት ሽያጭ',
    repMonthlySales: 'የወር ሽያጭ',
    repAnnualSales: 'የዓመት ሽያጭ',
    repInventory: 'የዕቃዎች ጠቅላላ ግምት',
    repProfit: 'የትርፋማነት ሪፖርት',
    repExpenses: 'የወጪዎች ዝርዝር ሪፖርት',
    repCashFlow: 'የገንዘብ ፍሰት (Cash Flow)',
    
    // Settings
    settingsTitle: 'የስርዓቱ ማስተካከያዎች',
    businessDetails: 'የድርጅቱ መረጃ',
    address: 'አድራሻ',
    email: 'ኢሜይል',
    langAndTheme: 'የቋንቋ እና ገጽታ ማስተካከያዎች',
    theme: 'ገጽታ (Theme)',
    backupDb: 'የአካባቢ መረጃ አስቀምጥ (Backup)',
    restoreDb: 'መረጃ መልስ (Restore)',
    sqlSchema: 'PostgreSQL እና Supabase መዋቅር (SQL)'
  }
};

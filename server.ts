import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import type { 
  Book, 
  Sale, 
  Purchase, 
  Customer, 
  CustomerTransaction, 
  Supplier, 
  SupplierTransaction, 
  WebsiteOrder, 
  StockMovement, 
  AuditLog, 
  ShopSettings,
  PaymentMethod,
  OrderStatus,
  DashboardStats
} from "./src/types.ts";

const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "urdu_bazars_db.json");

interface DatabaseSchema {
  version: number;
  books: Book[];
  sales: Sale[];
  purchases: Purchase[];
  customers: Customer[];
  customerTransactions: CustomerTransaction[];
  suppliers: Supplier[];
  supplierTransactions: SupplierTransaction[];
  orders: WebsiteOrder[];
  stockMovements: StockMovement[];
  auditLogs: AuditLog[];
  settings: ShopSettings;
}

const DEFAULT_SETTINGS: ShopSettings = {
  shopName: "Urdu Bazars",
  shopUrduName: "اردو بازارز",
  tagline: "کتاب سے دنیا تک",
  shopLogo: "/logo.svg",
  phone: "+92 300 1234567",
  whatsappNumber: "+92 300 1234567",
  email: "info@urdubazars.pk",
  address: "Shop # 14-18, Urdu Bazar, Anarkali, Lahore, Pakistan",
  city: "Lahore",
  currency: "Rs.",
  receiptHeader: "Welcome to Urdu Bazars - Your Ultimate Book Destination!",
  receiptFooter: "Thank you for shopping with Urdu Bazars!\nBooks once sold can be exchanged within 3 days with receipt.\n'کتاب سے دنیا تک'",
  defaultLowStockThreshold: 5,
  deliveryCharge: 200,
  freeDeliveryThreshold: 2500,
  bankDetails: {
    bankName: "Meezan Bank Limited",
    accountTitle: "Urdu Bazars Bookstore",
    accountNumber: "01020304050607",
    iban: "PK82MEZN0001020304050607"
  },
  jazzCashNumber: "03001234567 (Urdu Bazars)",
  easypaisaNumber: "03001234567 (Urdu Bazars)"
};

const INITIAL_BOOKS: Book[] = [
  {
    id: "book-1",
    title: "12th Class Physics (Punjab Textbook Board)",
    urduTitle: "فزکس برائے بارہویں جماعت",
    class: "12th",
    subject: "Physics",
    author: "Prof. Dr. M. Rafiq & Team",
    publisher: "Punjab Curriculum and Textbook Board",
    isbn: "978-969-456-121-1",
    barcode: "896400012011",
    purchasePrice: 420,
    salePrice: 500,
    physicalStock: 35,
    reservedStock: 0,
    availableStock: 35,
    minStockAlert: 5,
    rackShelf: "R-12/A",
    sessionYear: "2026",
    image: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd3?w=500&auto=format&fit=crop&q=80",
    category: "Textbook",
    description: "Complete updated syllabus book for F.Sc Pre-Engineering and ICS Part-II students with solved examples, review questions and numerical problems.",
    language: "English",
    edition: "2026 Edition",
    websiteVisible: true,
    featured: true,
    bestSeller: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "book-2",
    title: "12th Class Chemistry (Punjab Textbook Board)",
    urduTitle: "کیمسٹری برائے بارہویں جماعت",
    class: "12th",
    subject: "Chemistry",
    author: "Dr. Jalil Ahmad & Team",
    publisher: "Punjab Curriculum and Textbook Board",
    isbn: "978-969-456-122-8",
    barcode: "896400012012",
    purchasePrice: 380,
    salePrice: 460,
    physicalStock: 28,
    reservedStock: 0,
    availableStock: 28,
    minStockAlert: 5,
    rackShelf: "R-12/B",
    sessionYear: "2026",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80",
    category: "Textbook",
    description: "Official F.Sc Part-II Chemistry covering Organic and Inorganic chapters with reaction mechanisms and comprehensive summaries.",
    language: "English",
    edition: "2026 Edition",
    websiteVisible: true,
    featured: true,
    bestSeller: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "book-3",
    title: "10th Class Mathematics (Science Group)",
    urduTitle: "ریاضی برائے دسویں جماعت (سائنس)",
    class: "10th",
    subject: "Mathematics",
    author: "Prof. Muhammad Habib & Team",
    publisher: "Punjab Curriculum and Textbook Board",
    isbn: "978-969-456-103-7",
    barcode: "896400010013",
    purchasePrice: 280,
    salePrice: 350,
    physicalStock: 42,
    reservedStock: 0,
    availableStock: 42,
    minStockAlert: 8,
    rackShelf: "R-10/A",
    sessionYear: "2026",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=80",
    category: "Textbook",
    description: "Standard matriculation textbook for Science Group covering Quadratic Equations, Theory of Quadratic Equations, Variations, Matrices and Geometry.",
    language: "English",
    edition: "2026 Edition",
    websiteVisible: true,
    featured: true,
    bestSeller: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "book-4",
    title: "9th Class Biology (PCTB Latest)",
    urduTitle: "بیالوجی برائے نویں جماعت",
    class: "9th",
    subject: "Biology",
    author: "Dr. Zahid Hussain & Team",
    publisher: "Punjab Curriculum and Textbook Board",
    isbn: "978-969-456-094-1",
    barcode: "896400009014",
    purchasePrice: 260,
    salePrice: 320,
    physicalStock: 30,
    reservedStock: 0,
    availableStock: 30,
    minStockAlert: 5,
    rackShelf: "R-9/B",
    sessionYear: "2026",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500&auto=format&fit=crop&q=80",
    category: "Textbook",
    description: "9th matric biology syllabus with colored diagrams, cellular biology, biodiversity and human physiology chapters.",
    language: "English",
    edition: "2026 Edition",
    websiteVisible: true,
    featured: false,
    bestSeller: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "book-5",
    title: "11th Class Tarjuma-tul-Quran Majeed",
    urduTitle: "ترجمۃ القرآن المجید برائے گیارہویں جماعت",
    class: "11th",
    subject: "Tarjuma-tul-Quran",
    author: "Board of Islamic Studies PCTB",
    publisher: "Punjab Curriculum and Textbook Board",
    isbn: "978-969-456-115-0",
    barcode: "896400011015",
    purchasePrice: 180,
    salePrice: 240,
    physicalStock: 25,
    reservedStock: 0,
    availableStock: 25,
    minStockAlert: 5,
    rackShelf: "R-11/C",
    sessionYear: "2026",
    image: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=500&auto=format&fit=crop&q=80",
    category: "Textbook",
    description: "Compulsory Subject Textbook for First Year Intermediate students across Punjab Boards.",
    language: "Urdu",
    edition: "Latest Edition",
    websiteVisible: true,
    featured: true,
    bestSeller: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "book-6",
    title: "10th Physics Scholar All-in-One Keybook & Notes",
    urduTitle: "سکالر فزکس گائیڈ و حل شدہ پرچہ جات دسویں",
    class: "10th",
    subject: "Physics",
    author: "Prof. M. Akram & Scholars",
    publisher: "Ilmi Kitab Khana",
    isbn: "978-969-500-210-4",
    barcode: "896400010099",
    purchasePrice: 450,
    salePrice: 600,
    physicalStock: 18,
    reservedStock: 0,
    availableStock: 18,
    minStockAlert: 4,
    rackShelf: "G-10/P",
    sessionYear: "2026",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=80",
    category: "Notes",
    description: "Comprehensive notes, short answers, long question patterns, MCQs bank and 5-year past board papers with solutions.",
    language: "English",
    edition: "2026 Board Edition",
    websiteVisible: true,
    featured: true,
    bestSeller: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "book-7",
    title: "Pir-e-Kamil (پیر کامل) by Umera Ahmed",
    urduTitle: "پیرِ کامل (صلی اللہ علیہ وآلہ وسلم) - عمیرہ احمد",
    class: "General",
    subject: "Urdu Literature",
    author: "Umera Ahmed",
    publisher: "Alif Publishers",
    isbn: "978-969-900-101-5",
    barcode: "896400099001",
    purchasePrice: 900,
    salePrice: 1200,
    physicalStock: 15,
    reservedStock: 0,
    availableStock: 15,
    minStockAlert: 3,
    rackShelf: "LIT-01",
    sessionYear: "Special Edition",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=80",
    category: "Novel",
    description: "The timeless Urdu masterpiece novel detailing the spiritual awakening and life journeys of Imama and Salar. Original hardcover printing.",
    language: "Urdu",
    edition: "Original Hardcover",
    websiteVisible: true,
    featured: true,
    bestSeller: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "book-8",
    title: "Kulliyat-e-Iqbal (کلیاتِ اقبال) with Sharah",
    urduTitle: "کلیاتِ اقبال اردو مع فرہنگ و شرح",
    class: "General",
    subject: "Poetry",
    author: "Allama Muhammad Iqbal",
    publisher: "Iqbal Academy Pakistan",
    isbn: "978-969-416-012-4",
    barcode: "896400099002",
    purchasePrice: 1100,
    salePrice: 1500,
    physicalStock: 10,
    reservedStock: 0,
    availableStock: 10,
    minStockAlert: 2,
    rackShelf: "LIT-02",
    sessionYear: "Deluxe Edition",
    image: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500&auto=format&fit=crop&q=80",
    category: "Urdu Literature",
    description: "Complete poetic works of Allama Iqbal including Bang-e-Dra, Bal-e-Jibril, Zarb-e-Kaleem and Armaghan-e-Hijaz with dictionary and word meanings.",
    language: "Urdu",
    edition: "Gold Embossed Deluxe",
    websiteVisible: true,
    featured: true,
    bestSeller: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "book-9",
    title: "Oxford Student Geometry Box & Math Set",
    urduTitle: "آکسفورڈ اسٹوڈنٹ جیومیٹری باکس",
    class: "General",
    subject: "Stationery",
    author: "Oxford Stationery",
    publisher: "Oxford University Press Stationery",
    isbn: "ST-GEO-001",
    barcode: "896400088001",
    purchasePrice: 320,
    salePrice: 450,
    physicalStock: 40,
    reservedStock: 0,
    availableStock: 40,
    minStockAlert: 10,
    rackShelf: "STAT-01",
    sessionYear: "2026",
    image: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=500&auto=format&fit=crop&q=80",
    category: "Stationery",
    description: "High precision metal compass, divider, protractor, set squares, 15cm ruler, eraser and stencil set in sturdy tin case.",
    language: "Other",
    edition: "Pro Metal",
    websiteVisible: true,
    featured: false,
    bestSeller: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "book-10",
    title: "Dux Executive Hardbound Register (300 Pages)",
    urduTitle: "ڈکس ایگزیکٹو رجسٹر (۳۰۰ صفحات)",
    class: "General",
    subject: "Stationery",
    author: "Dux Paper Mills",
    publisher: "Dux Stationery",
    isbn: "ST-REG-300",
    barcode: "896400088002",
    purchasePrice: 220,
    salePrice: 300,
    physicalStock: 50,
    reservedStock: 0,
    availableStock: 50,
    minStockAlert: 12,
    rackShelf: "STAT-02",
    sessionYear: "2026",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=500&auto=format&fit=crop&q=80",
    category: "Stationery",
    description: "Smooth 75gsm paper, narrow ruled, hardbound laminated cover perfect for college, university and academy lectures.",
    language: "Other",
    edition: "Standard",
    websiteVisible: true,
    featured: false,
    bestSeller: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    name: "Hafiz Muhammad Tariq (Al-Huda Academy)",
    phone: "0321-4567890",
    address: "Model Town, Lahore",
    notes: "Academy owner, regular credit purchaser for matric & inter students",
    totalPurchases: 45000,
    totalPaid: 33000,
    totalUdhaar: 12000,
    remainingBalance: 12000,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "cust-2",
    name: "Prof. Kamran Siddiqui",
    phone: "0302-8765432",
    address: "Faisal Town, Lahore",
    notes: "Physics Lecturer at Government College",
    totalPurchases: 18500,
    totalPaid: 18500,
    totalUdhaar: 0,
    remainingBalance: 0,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "cust-3",
    name: "Zainab Bibi",
    phone: "0333-1122334",
    address: "Anarkali, Lahore",
    notes: "Parent of 10th & 12th class students",
    totalPurchases: 6200,
    totalPaid: 4000,
    totalUdhaar: 2200,
    remainingBalance: 2200,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "supp-1",
    name: "Punjab Curriculum and Textbook Board Depo",
    company: "PCTB Official Distribution",
    phone: "042-99230688",
    address: "Gulberg-II, Lahore",
    notes: "Primary publisher of compulsory syllabus textbooks for 9th-12th classes",
    totalPurchases: 180000,
    totalPaid: 140000,
    remainingPayable: 40000,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "supp-2",
    name: "Ilmi Kitab Khana Distributors",
    company: "Ilmi Kitab Khana & Book Sellers",
    phone: "042-37353510",
    address: "Kabir Street, Urdu Bazar, Lahore",
    notes: "Scholar series guides, solved past papers and model papers",
    totalPurchases: 95000,
    totalPaid: 80000,
    remainingPayable: 15000,
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "supp-3",
    name: "Dux & Oxford Stationery Wholesalers",
    company: "National Paper & Stationery Traders",
    phone: "042-37229988",
    address: "Paisa Akhbar, Urdu Bazar, Lahore",
    notes: "Stationery, geometry sets, registers and art supplies",
    totalPurchases: 45000,
    totalPaid: 45000,
    remainingPayable: 0,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Initialize in-memory state and load from disk if present
let db: DatabaseSchema = {
  version: 1,
  books: INITIAL_BOOKS,
  sales: [],
  purchases: [],
  customers: INITIAL_CUSTOMERS,
  customerTransactions: [
    {
      id: "ctx-1",
      customerId: "cust-1",
      date: new Date(Date.now() - 10 * 86400000).toISOString(),
      description: "Credit purchase of 12th class books package",
      type: "Debit",
      debit: 20000,
      credit: 0,
      balanceAfter: 20000,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: "ctx-2",
      customerId: "cust-1",
      date: new Date(Date.now() - 3 * 86400000).toISOString(),
      description: "Partial cash payment received",
      type: "Credit",
      debit: 0,
      credit: 8000,
      balanceAfter: 12000,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
    }
  ],
  suppliers: INITIAL_SUPPLIERS,
  supplierTransactions: [
    {
      id: "stx-1",
      supplierId: "supp-1",
      date: new Date(Date.now() - 20 * 86400000).toISOString(),
      description: "Stock consignment order #PCTB-998",
      type: "Credit",
      debit: 0,
      credit: 80000,
      balanceAfter: 80000,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
    },
    {
      id: "stx-2",
      supplierId: "supp-1",
      date: new Date(Date.now() - 8 * 86400000).toISOString(),
      description: "Bank transfer payment via Meezan Bank",
      type: "Debit",
      debit: 40000,
      credit: 0,
      balanceAfter: 40000,
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
    }
  ],
  orders: [
    {
      id: "ord-1",
      orderNumber: "UB-ORD-1001",
      customerName: "Muhammad Bilal",
      customerPhone: "0312-3456789",
      customerEmail: "bilal@gmail.com",
      shippingAddress: "House 45, Street 4, Sector G-9/1",
      city: "Islamabad",
      items: [
        {
          bookId: "book-1",
          title: "12th Class Physics (Punjab Textbook Board)",
          image: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd3?w=500&auto=format&fit=crop&q=80",
          quantity: 2,
          unitPrice: 500,
          subtotal: 1000
        },
        {
          bookId: "book-7",
          title: "Pir-e-Kamil (پیر کامل) by Umera Ahmed",
          image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=80",
          quantity: 1,
          unitPrice: 1200,
          subtotal: 1200
        }
      ],
      subtotal: 2200,
      shippingFee: 200,
      totalAmount: 2400,
      paymentMethod: "COD",
      paymentStatus: "Pending",
      orderStatus: "New",
      notes: "Please call before delivery",
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 3600000).toISOString()
    }
  ],
  stockMovements: [
    {
      id: "sm-init-1",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString(),
      bookId: "book-1",
      bookTitle: "12th Class Physics (Punjab Textbook Board)",
      previousPhysicalStock: 0,
      change: 35,
      newPhysicalStock: 35,
      previousAvailableStock: 0,
      newAvailableStock: 35,
      reason: "Initial Stock",
      userName: "System Admin",
      referenceType: "Manual",
      createdAt: new Date().toISOString()
    }
  ],
  auditLogs: [
    {
      id: "log-1",
      timestamp: new Date().toISOString(),
      userName: "System Admin",
      action: "System Initialized",
      entityType: "Settings",
      details: "Urdu Bazars centralized database initialized with Pakistani curriculum catalog."
    }
  ],
  settings: DEFAULT_SETTINGS
};

// Ensure data folder and load disk db if available
function loadDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      const loaded = JSON.parse(content);
      if (loaded && Array.isArray(loaded.books)) {
        db = loaded;
        console.log(`[DB] Successfully loaded database with ${db.books.length} books.`);
        return;
      }
    }
    saveDatabase();
  } catch (err) {
    console.error("[DB] Error loading database, using default in-memory state:", err);
  }
}

function saveDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    db.version = (db.version || 0) + 1;
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("[DB] Error saving database to disk:", err);
  }
}

loadDatabase();

function logAudit(userName: string, action: string, entityType: AuditLog["entityType"], entityId: string | undefined, details: string) {
  const log: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    userName: userName || "System Admin",
    action,
    entityType,
    entityId,
    details
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 500) {
    db.auditLogs.pop();
  }
}

function recordStockMovement(
  bookId: string,
  bookTitle: string,
  change: number,
  prevPhysical: number,
  newPhysical: number,
  prevAvailable: number,
  newAvailable: number,
  reason: StockMovement["reason"],
  userName: string,
  referenceType?: StockMovement["referenceType"],
  referenceId?: string,
  notes?: string
) {
  const movement: StockMovement = {
    id: `sm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString(),
    bookId,
    bookTitle,
    previousPhysicalStock: prevPhysical,
    change,
    newPhysicalStock: newPhysical,
    previousAvailableStock: prevAvailable,
    newAvailableStock: newAvailable,
    reason,
    userName: userName || "Admin",
    referenceType,
    referenceId,
    notes,
    createdAt: new Date().toISOString()
  };
  db.stockMovements.unshift(movement);
  if (db.stockMovements.length > 1000) {
    db.stockMovements.pop();
  }
}

// ---------------- API ROUTES ----------------

// Health & DB Sync Version
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", version: db.version, timestamp: new Date().toISOString() });
});

app.get("/api/sync/version", (req, res) => {
  res.json({ version: db.version, updatedAt: new Date().toISOString() });
});

// Dashboard Stats Calculation
app.get("/api/stats/dashboard", (req, res) => {
  try {
    const filter = (req.query.filter as string) || "today"; // 'today', 'yesterday', 'this_week', 'this_month', 'all'
    const now = new Date();
    
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (filter === "yesterday") {
      startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (filter === "this_week") {
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Monday
      startDate.setDate(diff);
    } else if (filter === "this_month") {
      startDate.setDate(1);
    } else if (filter === "all") {
      startDate = new Date(0);
    }

    const filteredSales = db.sales.filter(s => {
      if (s.status === "Cancelled") return false;
      const sDate = new Date(s.date);
      if (filter === "yesterday") {
        const yDate = new Date();
        yDate.setDate(yDate.getDate() - 1);
        return sDate.toDateString() === yDate.toDateString();
      }
      return sDate >= startDate;
    });

    const todaySalesTotal = filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
    const todaySalesCount = filteredSales.length;
    const todayCashSales = filteredSales.filter(s => s.paymentMethod === "Cash").reduce((acc, s) => acc + s.paidAmount, 0);
    const todayOnlineSales = filteredSales.filter(s => ["Bank", "JazzCash", "Easypaisa"].includes(s.paymentMethod)).reduce((acc, s) => acc + s.paidAmount, 0);
    const todayUdhaarSales = filteredSales.filter(s => s.paymentMethod === "Udhaar" || s.remainingAmount > 0).reduce((acc, s) => acc + s.remainingAmount, 0);

    const todayEstimatedProfit = filteredSales.reduce((acc, s) => {
      const saleProfit = s.items.reduce((itemAcc, item) => itemAcc + (item.profit || (item.salePrice - item.purchasePrice) * item.quantity), 0);
      return acc + (saleProfit - (s.billDiscount || 0));
    }, 0);

    const lowStockBooks = db.books.filter(b => b.isActive && b.availableStock <= b.minStockAlert);
    const lowStockCount = lowStockBooks.length;
    const totalStockItems = db.books.reduce((acc, b) => acc + (b.physicalStock || 0), 0);
    const totalStockValuation = db.books.reduce((acc, b) => acc + (b.purchasePrice * (b.physicalStock || 0)), 0);

    const totalCustomerUdhaar = db.customers.reduce((acc, c) => acc + Math.max(0, c.remainingBalance || 0), 0);
    const totalSupplierPayables = db.suppliers.reduce((acc, s) => acc + Math.max(0, s.remainingPayable || 0), 0);

    const totalWebsiteOrders = db.orders.length;
    const pendingWebsiteOrders = db.orders.filter(o => ["New", "Confirmed", "Processing"].includes(o.orderStatus)).length;

    // Payment method breakdown
    const paymentMethods: Record<PaymentMethod, { amount: number; count: number }> = {
      Cash: { amount: 0, count: 0 },
      Bank: { amount: 0, count: 0 },
      JazzCash: { amount: 0, count: 0 },
      Easypaisa: { amount: 0, count: 0 },
      Udhaar: { amount: 0, count: 0 },
      COD: { amount: 0, count: 0 }
    };

    filteredSales.forEach(s => {
      if (paymentMethods[s.paymentMethod]) {
        paymentMethods[s.paymentMethod].amount += s.grandTotal;
        paymentMethods[s.paymentMethod].count += 1;
      }
    });

    const salesByPaymentMethod = Object.entries(paymentMethods)
      .map(([method, data]) => ({
        method: method as PaymentMethod,
        amount: data.amount,
        count: data.count
      }))
      .filter(item => item.count > 0 || ["Cash", "Online", "Udhaar"].some(x => item.method.includes(x)));

    // 7 Days Trend
    const salesTrendLast7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const daySales = db.sales.filter(s => s.status !== "Cancelled" && s.date.startsWith(dateStr));
      const dayTotal = daySales.reduce((acc, s) => acc + s.grandTotal, 0);
      const dayProfit = daySales.reduce((acc, s) => {
        const p = s.items.reduce((itemAcc, item) => itemAcc + ((item.salePrice - item.purchasePrice) * item.quantity), 0);
        return acc + (p - (s.billDiscount || 0));
      }, 0);

      salesTrendLast7Days.push({
        date: d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" }),
        total: dayTotal,
        profit: dayProfit
      });
    }

    const stats: DashboardStats = {
      todaySalesTotal,
      todaySalesCount,
      todayCashSales,
      todayOnlineSales,
      todayUdhaarSales,
      todayEstimatedProfit,
      lowStockCount,
      totalStockItems,
      totalStockValuation,
      totalCustomerUdhaar,
      totalSupplierPayables,
      totalWebsiteOrders,
      pendingWebsiteOrders,
      recentSales: db.sales.slice(0, 5),
      recentWebsiteOrders: db.orders.slice(0, 5),
      lowStockBooks: lowStockBooks.slice(0, 8),
      salesByPaymentMethod,
      salesTrendLast7Days
    };

    res.json(stats);
  } catch (err) {
    console.error("[API] Error generating dashboard stats:", err);
    res.status(500).json({ error: "Failed to load dashboard metrics" });
  }
});

// Books CRUD & Search
app.get("/api/books", (req, res) => {
  let result = [...db.books];
  const { search, class: bookClass, category, websiteVisible, featured, bestSeller, lowStock } = req.query;

  if (websiteVisible === "true") {
    result = result.filter(b => b.isActive && b.websiteVisible);
  }
  if (featured === "true") {
    result = result.filter(b => b.featured);
  }
  if (bestSeller === "true") {
    result = result.filter(b => b.bestSeller);
  }
  if (lowStock === "true") {
    result = result.filter(b => b.availableStock <= b.minStockAlert);
  }
  if (bookClass && bookClass !== "All") {
    result = result.filter(b => b.class === bookClass);
  }
  if (category && category !== "All") {
    result = result.filter(b => b.category === category);
  }
  if (search && typeof search === "string" && search.trim() !== "") {
    const q = search.toLowerCase().trim();
    result = result.filter(b => 
      b.title.toLowerCase().includes(q) ||
      (b.urduTitle && b.urduTitle.toLowerCase().includes(q)) ||
      b.author.toLowerCase().includes(q) ||
      b.subject.toLowerCase().includes(q) ||
      b.publisher.toLowerCase().includes(q) ||
      b.isbn.toLowerCase().includes(q) ||
      b.barcode.toLowerCase().includes(q) ||
      b.rackShelf.toLowerCase().includes(q)
    );
  }

  res.json(result);
});

app.get("/api/books/:id", (req, res) => {
  const book = db.books.find(b => b.id === req.params.id || b.barcode === req.params.id || b.isbn === req.params.id);
  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }
  res.json(book);
});

app.post("/api/books", (req, res) => {
  try {
    const data = req.body;
    const newBook: Book = {
      id: `book-${Date.now()}`,
      title: data.title || "Untitled Book",
      urduTitle: data.urduTitle || "",
      class: data.class || "12th",
      subject: data.subject || "General",
      author: data.author || "Unknown",
      publisher: data.publisher || "General Publisher",
      isbn: data.isbn || `978-969-${Math.floor(100000 + Math.random() * 900000)}`,
      barcode: data.barcode || `${Math.floor(896400000000 + Math.random() * 9999999)}`,
      purchasePrice: Number(data.purchasePrice) || 0,
      salePrice: Number(data.salePrice) || 0,
      physicalStock: Number(data.physicalStock) || 0,
      reservedStock: 0,
      availableStock: Number(data.physicalStock) || 0,
      minStockAlert: Number(data.minStockAlert) || db.settings.defaultLowStockThreshold || 5,
      rackShelf: data.rackShelf || "A-1",
      sessionYear: data.sessionYear || "2026",
      image: data.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80",
      category: data.category || "Textbook",
      description: data.description || "",
      language: data.language || "Urdu",
      edition: data.edition || "Latest Edition",
      websiteVisible: data.websiteVisible !== false,
      featured: Boolean(data.featured),
      bestSeller: Boolean(data.bestSeller),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.books.unshift(newBook);

    if (newBook.physicalStock > 0) {
      recordStockMovement(
        newBook.id,
        newBook.title,
        newBook.physicalStock,
        0,
        newBook.physicalStock,
        0,
        newBook.availableStock,
        "Initial Stock",
        data.userName || "Admin",
        "Manual",
        newBook.id,
        "New book added to inventory catalog"
      );
    }

    logAudit(data.userName || "Admin", "Added Book", "Book", newBook.id, `Created book: ${newBook.title} with initial stock: ${newBook.physicalStock}`);
    saveDatabase();
    res.status(201).json(newBook);
  } catch (err) {
    console.error("[API] Error adding book:", err);
    res.status(500).json({ error: "Failed to add book" });
  }
});

app.put("/api/books/:id", (req, res) => {
  const index = db.books.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Book not found" });
  }
  const current = db.books[index];
  const data = req.body;

  const prevPhysical = current.physicalStock;
  const prevAvailable = current.availableStock;
  const newPhysical = data.physicalStock !== undefined ? Number(data.physicalStock) : current.physicalStock;
  const reserved = current.reservedStock || 0;
  const newAvailable = Math.max(0, newPhysical - reserved);

  const updated: Book = {
    ...current,
    ...data,
    physicalStock: newPhysical,
    reservedStock: reserved,
    availableStock: newAvailable,
    purchasePrice: Number(data.purchasePrice !== undefined ? data.purchasePrice : current.purchasePrice),
    salePrice: Number(data.salePrice !== undefined ? data.salePrice : current.salePrice),
    minStockAlert: Number(data.minStockAlert !== undefined ? data.minStockAlert : current.minStockAlert),
    updatedAt: new Date().toISOString()
  };

  db.books[index] = updated;

  if (newPhysical !== prevPhysical) {
    const diff = newPhysical - prevPhysical;
    recordStockMovement(
      updated.id,
      updated.title,
      diff,
      prevPhysical,
      newPhysical,
      prevAvailable,
      newAvailable,
      "Manual Adjustment",
      data.userName || "Admin",
      "Manual",
      updated.id,
      data.adjustmentReason || "Stock edited from Book Management"
    );
  }

  logAudit(data.userName || "Admin", "Updated Book", "Book", updated.id, `Updated details for ${updated.title}`);
  saveDatabase();
  res.json(updated);
});

app.delete("/api/books/:id", (req, res) => {
  const index = db.books.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Book not found" });
  }
  const deleted = db.books[index];
  db.books.splice(index, 1);
  logAudit(req.body?.userName || "Admin", "Deleted Book", "Book", deleted.id, `Deleted book: ${deleted.title}`);
  saveDatabase();
  res.json({ success: true, message: `Book ${deleted.title} removed` });
});

// Manual Stock Adjustment
app.post("/api/inventory/adjust", (req, res) => {
  try {
    const { bookId, newStock, reason, notes, userName } = req.body;
    const book = db.books.find(b => b.id === bookId);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const prevPhysical = book.physicalStock;
    const prevAvailable = book.availableStock;
    const targetPhysical = Number(newStock);
    const diff = targetPhysical - prevPhysical;
    const newAvailable = Math.max(0, targetPhysical - (book.reservedStock || 0));

    book.physicalStock = targetPhysical;
    book.availableStock = newAvailable;
    book.updatedAt = new Date().toISOString();

    recordStockMovement(
      book.id,
      book.title,
      diff,
      prevPhysical,
      targetPhysical,
      prevAvailable,
      newAvailable,
      reason || "Manual Adjustment",
      userName || "Admin",
      "Manual",
      book.id,
      notes || `Stock adjusted from ${prevPhysical} to ${targetPhysical}`
    );

    logAudit(userName || "Admin", "Adjusted Stock", "Stock", book.id, `Stock of ${book.title} changed from ${prevPhysical} to ${targetPhysical} (Reason: ${reason})`);
    saveDatabase();
    res.json({ success: true, book });
  } catch (err) {
    console.error("[API] Error adjusting stock:", err);
    res.status(500).json({ error: "Failed to adjust stock" });
  }
});

app.get("/api/inventory/movements", (req, res) => {
  res.json(db.stockMovements);
});

// ---------------- SALES & POS ----------------
app.get("/api/sales", (req, res) => {
  res.json(db.sales);
});

app.post("/api/sales", (req, res) => {
  try {
    const {
      customerId,
      customerName,
      customerPhone,
      items,
      subtotal,
      itemDiscount,
      billDiscount,
      grandTotal,
      paidAmount,
      remainingAmount,
      paymentMethod,
      notes,
      cashierName
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Sale must contain at least one item." });
    }

    // 1. Stock Validation
    for (const item of items) {
      const book = db.books.find(b => b.id === item.bookId);
      if (!book) {
        return res.status(400).json({ error: `Book '${item.title}' not found in inventory.` });
      }
      if (book.availableStock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for '${book.title}'. Requested: ${item.quantity}, Available: ${book.availableStock}`
        });
      }
    }

    // 2. Decrement Stock Atomically
    for (const item of items) {
      const book = db.books.find(b => b.id === item.bookId)!;
      const prevPhysical = book.physicalStock;
      const prevAvailable = book.availableStock;

      book.physicalStock -= item.quantity;
      book.availableStock -= item.quantity;
      book.updatedAt = new Date().toISOString();

      recordStockMovement(
        book.id,
        book.title,
        -item.quantity,
        prevPhysical,
        book.physicalStock,
        prevAvailable,
        book.availableStock,
        "Shop Sale",
        cashierName || "Cashier",
        "POS Sale",
        `INV-${Date.now()}`
      );
    }

    // 3. Create Sale Record
    const invoiceNo = `UB-POS-${Date.now().toString().slice(-6)}`;
    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNo,
      date: new Date().toISOString(),
      customerId: customerId || undefined,
      customerName: customerName || "Walk-in Customer",
      customerPhone: customerPhone || "",
      items: items.map(it => ({
        bookId: it.bookId,
        title: it.title,
        isbn: it.isbn,
        barcode: it.barcode,
        purchasePrice: it.purchasePrice || 0,
        salePrice: it.salePrice,
        quantity: it.quantity,
        discount: it.discount || 0,
        subtotal: it.subtotal,
        profit: (it.salePrice - (it.purchasePrice || 0)) * it.quantity - (it.discount || 0)
      })),
      subtotal: Number(subtotal) || 0,
      itemDiscount: Number(itemDiscount) || 0,
      billDiscount: Number(billDiscount) || 0,
      grandTotal: Number(grandTotal) || 0,
      paidAmount: Number(paidAmount) || 0,
      remainingAmount: Number(remainingAmount) || 0,
      paymentMethod: paymentMethod || "Cash",
      notes: notes || "",
      cashierName: cashierName || "Cashier",
      status: "Completed",
      createdAt: new Date().toISOString()
    };

    db.sales.unshift(newSale);

    // 4. Update Customer Khata / Udhaar if credit
    if (customerId && (paymentMethod === "Udhaar" || remainingAmount > 0)) {
      const customer = db.customers.find(c => c.id === customerId);
      if (customer) {
        const creditOwed = Number(remainingAmount) || Number(grandTotal);
        customer.totalPurchases += newSale.grandTotal;
        customer.totalPaid += newSale.paidAmount;
        customer.totalUdhaar += creditOwed;
        customer.remainingBalance += creditOwed;
        customer.updatedAt = new Date().toISOString();

        const ctx: CustomerTransaction = {
          id: `ctx-${Date.now()}`,
          customerId: customer.id,
          date: newSale.date,
          description: `Credit Sale Invoice #${invoiceNo}`,
          type: "Debit",
          debit: creditOwed,
          credit: 0,
          balanceAfter: customer.remainingBalance,
          referenceType: "Sale",
          referenceId: newSale.id,
          createdAt: new Date().toISOString()
        };
        db.customerTransactions.unshift(ctx);
      }
    } else if (customerId) {
      const customer = db.customers.find(c => c.id === customerId);
      if (customer) {
        customer.totalPurchases += newSale.grandTotal;
        customer.totalPaid += newSale.paidAmount;
        customer.updatedAt = new Date().toISOString();
      }
    }

    logAudit(cashierName || "Cashier", "Completed POS Sale", "Sale", newSale.id, `Invoice #${invoiceNo} for Rs. ${newSale.grandTotal} (${newSale.paymentMethod})`);
    saveDatabase();
    res.status(201).json(newSale);
  } catch (err) {
    console.error("[API] Error in POS sale:", err);
    res.status(500).json({ error: "Failed to process sale" });
  }
});

// Sale Cancellation / Return
app.post("/api/sales/:id/cancel", (req, res) => {
  try {
    const sale = db.sales.find(s => s.id === req.params.id);
    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    if (sale.status === "Cancelled") {
      return res.status(400).json({ error: "Sale is already cancelled" });
    }

    // Restore stock
    for (const item of sale.items) {
      const book = db.books.find(b => b.id === item.bookId);
      if (book) {
        const prevPhysical = book.physicalStock;
        const prevAvailable = book.availableStock;
        book.physicalStock += item.quantity;
        book.availableStock += item.quantity;
        book.updatedAt = new Date().toISOString();

        recordStockMovement(
          book.id,
          book.title,
          item.quantity,
          prevPhysical,
          book.physicalStock,
          prevAvailable,
          book.availableStock,
          "Sale Cancelled",
          req.body.userName || "Admin",
          "Return",
          sale.id,
          `Cancelled sale invoice #${sale.invoiceNo}`
        );
      }
    }

    sale.status = "Cancelled";

    // Reverse customer balance if Udhaar
    if (sale.customerId && sale.remainingAmount > 0) {
      const customer = db.customers.find(c => c.id === sale.customerId);
      if (customer) {
        customer.remainingBalance = Math.max(0, customer.remainingBalance - sale.remainingAmount);
        customer.totalUdhaar = Math.max(0, customer.totalUdhaar - sale.remainingAmount);
        customer.updatedAt = new Date().toISOString();

        const ctx: CustomerTransaction = {
          id: `ctx-${Date.now()}`,
          customerId: customer.id,
          date: new Date().toISOString(),
          description: `Reversal of Cancelled Invoice #${sale.invoiceNo}`,
          type: "Credit",
          debit: 0,
          credit: sale.remainingAmount,
          balanceAfter: customer.remainingBalance,
          referenceType: "Adjustment",
          referenceId: sale.id,
          createdAt: new Date().toISOString()
        };
        db.customerTransactions.unshift(ctx);
      }
    }

    logAudit(req.body.userName || "Admin", "Cancelled Sale", "Sale", sale.id, `Cancelled invoice #${sale.invoiceNo} and restored stock.`);
    saveDatabase();
    res.json({ success: true, sale });
  } catch (err) {
    console.error("[API] Error cancelling sale:", err);
    res.status(500).json({ error: "Failed to cancel sale" });
  }
});

// ---------------- PURCHASES FROM SUPPLIERS ----------------
app.get("/api/purchases", (req, res) => {
  res.json(db.purchases);
});

app.post("/api/purchases", (req, res) => {
  try {
    const {
      supplierId,
      supplierName,
      items,
      subtotal,
      discount,
      grandTotal,
      paidAmount,
      remainingAmount,
      paymentMethod,
      notes,
      userName
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Purchase must contain at least one item." });
    }

    const purchaseInvoiceNo = `UB-PUR-${Date.now().toString().slice(-6)}`;

    // 1. Increase Stock Atomically
    for (const item of items) {
      let book = db.books.find(b => b.id === item.bookId);
      if (book) {
        const prevPhysical = book.physicalStock;
        const prevAvailable = book.availableStock;

        book.physicalStock += item.quantity;
        book.availableStock += item.quantity;
        if (item.purchasePrice > 0) {
          book.purchasePrice = Number(item.purchasePrice);
        }
        book.updatedAt = new Date().toISOString();

        recordStockMovement(
          book.id,
          book.title,
          item.quantity,
          prevPhysical,
          book.physicalStock,
          prevAvailable,
          book.availableStock,
          "Purchase",
          userName || "Admin",
          "Purchase",
          purchaseInvoiceNo,
          `Stock received from supplier: ${supplierName}`
        );
      }
    }

    // 2. Save Purchase Record
    const newPurchase: Purchase = {
      id: `pur-${Date.now()}`,
      purchaseInvoiceNo,
      supplierId,
      supplierName: supplierName || "Unknown Supplier",
      date: new Date().toISOString(),
      items: items.map(it => ({
        bookId: it.bookId,
        title: it.title,
        quantity: Number(it.quantity),
        purchasePrice: Number(it.purchasePrice),
        discount: Number(it.discount) || 0,
        subtotal: Number(it.subtotal)
      })),
      subtotal: Number(subtotal) || 0,
      discount: Number(discount) || 0,
      grandTotal: Number(grandTotal) || 0,
      paidAmount: Number(paidAmount) || 0,
      remainingAmount: Number(remainingAmount) || 0,
      paymentMethod: paymentMethod || "Cash",
      notes: notes || "",
      createdAt: new Date().toISOString()
    };

    db.purchases.unshift(newPurchase);

    // 3. Update Supplier Ledger
    if (supplierId) {
      const supplier = db.suppliers.find(s => s.id === supplierId);
      if (supplier) {
        const creditPayable = Number(remainingAmount) || (Number(grandTotal) - Number(paidAmount));
        supplier.totalPurchases += newPurchase.grandTotal;
        supplier.totalPaid += newPurchase.paidAmount;
        supplier.remainingPayable += creditPayable;
        supplier.updatedAt = new Date().toISOString();

        const stx: SupplierTransaction = {
          id: `stx-${Date.now()}`,
          supplierId: supplier.id,
          date: newPurchase.date,
          description: `Stock Purchase Invoice #${purchaseInvoiceNo}`,
          type: "Credit",
          debit: 0,
          credit: creditPayable,
          balanceAfter: supplier.remainingPayable,
          referenceType: "Purchase",
          referenceId: newPurchase.id,
          createdAt: new Date().toISOString()
        };
        db.supplierTransactions.unshift(stx);
      }
    }

    logAudit(userName || "Admin", "Created Purchase", "Purchase", newPurchase.id, `Recorded stock purchase #${purchaseInvoiceNo} for Rs. ${newPurchase.grandTotal}`);
    saveDatabase();
    res.status(201).json(newPurchase);
  } catch (err) {
    console.error("[API] Error recording purchase:", err);
    res.status(500).json({ error: "Failed to record purchase" });
  }
});

// ---------------- CUSTOMERS & KHATA ----------------
app.get("/api/customers", (req, res) => {
  res.json(db.customers);
});

app.post("/api/customers", (req, res) => {
  try {
    const data = req.body;
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: data.name || "Customer",
      phone: data.phone || "",
      address: data.address || "",
      notes: data.notes || "",
      totalPurchases: 0,
      totalPaid: 0,
      totalUdhaar: Number(data.openingBalance) || 0,
      remainingBalance: Number(data.openingBalance) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.customers.unshift(newCustomer);

    if (newCustomer.remainingBalance > 0) {
      const ctx: CustomerTransaction = {
        id: `ctx-${Date.now()}`,
        customerId: newCustomer.id,
        date: new Date().toISOString(),
        description: "Opening Udhaar Balance",
        type: "Debit",
        debit: newCustomer.remainingBalance,
        credit: 0,
        balanceAfter: newCustomer.remainingBalance,
        referenceType: "Adjustment",
        createdAt: new Date().toISOString()
      };
      db.customerTransactions.unshift(ctx);
    }

    logAudit(data.userName || "Admin", "Added Customer", "Customer", newCustomer.id, `Created customer: ${newCustomer.name} (${newCustomer.phone})`);
    saveDatabase();
    res.status(201).json(newCustomer);
  } catch (err) {
    console.error("[API] Error adding customer:", err);
    res.status(500).json({ error: "Failed to add customer" });
  }
});

app.put("/api/customers/:id", (req, res) => {
  const index = db.customers.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Customer not found" });
  }
  db.customers[index] = {
    ...db.customers[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  saveDatabase();
  res.json(db.customers[index]);
});

app.get("/api/customers/:id/ledger", (req, res) => {
  const txs = db.customerTransactions.filter(t => t.customerId === req.params.id);
  res.json(txs);
});

app.post("/api/customers/:id/payments", (req, res) => {
  try {
    const customer = db.customers.find(c => c.id === req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    const { amount, paymentMethod, notes, userName } = req.body;
    const payAmount = Number(amount);
    if (payAmount <= 0) {
      return res.status(400).json({ error: "Payment amount must be greater than 0" });
    }

    customer.totalPaid += payAmount;
    customer.remainingBalance = Math.max(0, customer.remainingBalance - payAmount);
    customer.updatedAt = new Date().toISOString();

    const ctx: CustomerTransaction = {
      id: `ctx-${Date.now()}`,
      customerId: customer.id,
      date: new Date().toISOString(),
      description: `Payment Received (${paymentMethod || "Cash"}) ${notes ? `- ${notes}` : ""}`,
      type: "Credit",
      debit: 0,
      credit: payAmount,
      balanceAfter: customer.remainingBalance,
      referenceType: "Payment",
      createdAt: new Date().toISOString()
    };

    db.customerTransactions.unshift(ctx);
    logAudit(userName || "Admin", "Received Customer Payment", "Customer", customer.id, `Received payment of Rs. ${payAmount} from ${customer.name}. New balance: Rs. ${customer.remainingBalance}`);
    saveDatabase();
    res.json({ success: true, customer, transaction: ctx });
  } catch (err) {
    console.error("[API] Error recording customer payment:", err);
    res.status(500).json({ error: "Failed to record payment" });
  }
});

// ---------------- SUPPLIERS & PAYABLES ----------------
app.get("/api/suppliers", (req, res) => {
  res.json(db.suppliers);
});

app.post("/api/suppliers", (req, res) => {
  try {
    const data = req.body;
    const newSupplier: Supplier = {
      id: `supp-${Date.now()}`,
      name: data.name || "Supplier",
      company: data.company || "",
      phone: data.phone || "",
      address: data.address || "",
      notes: data.notes || "",
      totalPurchases: 0,
      totalPaid: 0,
      remainingPayable: Number(data.openingBalance) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.suppliers.unshift(newSupplier);

    if (newSupplier.remainingPayable > 0) {
      const stx: SupplierTransaction = {
        id: `stx-${Date.now()}`,
        supplierId: newSupplier.id,
        date: new Date().toISOString(),
        description: "Opening Payable Balance",
        type: "Credit",
        debit: 0,
        credit: newSupplier.remainingPayable,
        balanceAfter: newSupplier.remainingPayable,
        referenceType: "Adjustment",
        createdAt: new Date().toISOString()
      };
      db.supplierTransactions.unshift(stx);
    }

    logAudit(data.userName || "Admin", "Added Supplier", "Supplier", newSupplier.id, `Created supplier: ${newSupplier.name} (${newSupplier.company})`);
    saveDatabase();
    res.status(201).json(newSupplier);
  } catch (err) {
    console.error("[API] Error adding supplier:", err);
    res.status(500).json({ error: "Failed to add supplier" });
  }
});

app.get("/api/suppliers/:id/ledger", (req, res) => {
  const txs = db.supplierTransactions.filter(t => t.supplierId === req.params.id);
  res.json(txs);
});

app.post("/api/suppliers/:id/payments", (req, res) => {
  try {
    const supplier = db.suppliers.find(s => s.id === req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    const { amount, paymentMethod, notes, userName } = req.body;
    const payAmount = Number(amount);
    if (payAmount <= 0) {
      return res.status(400).json({ error: "Payment amount must be greater than 0" });
    }

    supplier.totalPaid += payAmount;
    supplier.remainingPayable = Math.max(0, supplier.remainingPayable - payAmount);
    supplier.updatedAt = new Date().toISOString();

    const stx: SupplierTransaction = {
      id: `stx-${Date.now()}`,
      supplierId: supplier.id,
      date: new Date().toISOString(),
      description: `Payment Sent (${paymentMethod || "Bank"}) ${notes ? `- ${notes}` : ""}`,
      type: "Debit",
      debit: payAmount,
      credit: 0,
      balanceAfter: supplier.remainingPayable,
      referenceType: "Payment",
      createdAt: new Date().toISOString()
    };

    db.supplierTransactions.unshift(stx);
    logAudit(userName || "Admin", "Recorded Supplier Payment", "Supplier", supplier.id, `Paid Rs. ${payAmount} to ${supplier.name}. Remaining payable: Rs. ${supplier.remainingPayable}`);
    saveDatabase();
    res.json({ success: true, supplier, transaction: stx });
  } catch (err) {
    console.error("[API] Error recording supplier payment:", err);
    res.status(500).json({ error: "Failed to record payment" });
  }
});

// ---------------- ONLINE WEBSITE ORDERS ----------------
app.get("/api/orders", (req, res) => {
  res.json(db.orders);
});

app.post("/api/orders", (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      city,
      items,
      subtotal,
      shippingFee,
      totalAmount,
      paymentMethod,
      notes
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty. Please select books to order." });
    }

    // 1. Stock verification: check availableStock
    for (const item of items) {
      const book = db.books.find(b => b.id === item.bookId);
      if (!book) {
        return res.status(400).json({ error: `Book '${item.title}' is no longer available in store.` });
      }
      if (book.availableStock < item.quantity) {
        return res.status(400).json({
          error: `Sorry, '${book.title}' only has ${book.availableStock} copy(ies) available in stock.`
        });
      }
    }

    const orderNumber = `UB-ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Reserve Stock Atomically (Available stock decreases immediately!)
    for (const item of items) {
      const book = db.books.find(b => b.id === item.bookId)!;
      const prevPhysical = book.physicalStock;
      const prevAvailable = book.availableStock;

      book.reservedStock = (book.reservedStock || 0) + item.quantity;
      book.availableStock = Math.max(0, book.physicalStock - book.reservedStock);
      book.updatedAt = new Date().toISOString();

      recordStockMovement(
        book.id,
        book.title,
        -item.quantity,
        prevPhysical,
        book.physicalStock,
        prevAvailable,
        book.availableStock,
        "Website Order",
        "Website Customer",
        "Website Order",
        orderNumber,
        `Stock reserved for online order #${orderNumber}`
      );
    }

    const newOrder: WebsiteOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: customerName || "Customer",
      customerPhone: customerPhone || "",
      customerEmail: customerEmail || "",
      shippingAddress: shippingAddress || "",
      city: city || "Lahore",
      items: items.map(it => ({
        bookId: it.bookId,
        title: it.title,
        image: it.image || "",
        quantity: it.quantity,
        unitPrice: it.unitPrice || it.salePrice,
        subtotal: it.subtotal || (it.unitPrice * it.quantity)
      })),
      subtotal: Number(subtotal) || 0,
      shippingFee: Number(shippingFee) || 0,
      totalAmount: Number(totalAmount) || 0,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Pending",
      orderStatus: "New",
      notes: notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.unshift(newOrder);

    logAudit("Website Customer", "Placed Online Order", "Order", newOrder.id, `Order #${orderNumber} placed for Rs. ${newOrder.totalAmount} by ${newOrder.customerName}`);
    saveDatabase();
    res.status(201).json(newOrder);
  } catch (err) {
    console.error("[API] Error placing order:", err);
    res.status(500).json({ error: "Failed to place order" });
  }
});

// Update Order Status (Handles stock reservation vs deduction vs release)
app.patch("/api/orders/:id/status", (req, res) => {
  try {
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const { status, paymentStatus, userName } = req.body;
    const oldStatus = order.orderStatus;
    const newStatus = (status as OrderStatus) || oldStatus;

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (oldStatus !== newStatus) {
      // 1. If transitioning to CANCELLED: Release the reserved stock!
      if (newStatus === "Cancelled" && oldStatus !== "Cancelled" && oldStatus !== "Delivered") {
        for (const item of order.items) {
          const book = db.books.find(b => b.id === item.bookId);
          if (book) {
            const prevPhysical = book.physicalStock;
            const prevAvailable = book.availableStock;

            book.reservedStock = Math.max(0, (book.reservedStock || 0) - item.quantity);
            book.availableStock = Math.max(0, book.physicalStock - book.reservedStock);
            book.updatedAt = new Date().toISOString();

            recordStockMovement(
              book.id,
              book.title,
              item.quantity,
              prevPhysical,
              book.physicalStock,
              prevAvailable,
              book.availableStock,
              "Website Order Cancelled",
              userName || "Admin",
              "Website Order",
              order.orderNumber,
              `Order #${order.orderNumber} cancelled. Reserved stock released back to available inventory.`
            );
          }
        }
      }

      // 2. If transitioning to DELIVERED: Finalize physical stock deduction!
      if (newStatus === "Delivered" && oldStatus !== "Delivered" && oldStatus !== "Cancelled") {
        for (const item of order.items) {
          const book = db.books.find(b => b.id === item.bookId);
          if (book) {
            const prevPhysical = book.physicalStock;
            const prevAvailable = book.availableStock;

            book.reservedStock = Math.max(0, (book.reservedStock || 0) - item.quantity);
            book.physicalStock = Math.max(0, book.physicalStock - item.quantity);
            book.availableStock = Math.max(0, book.physicalStock - book.reservedStock);
            book.updatedAt = new Date().toISOString();

            recordStockMovement(
              book.id,
              book.title,
              -item.quantity,
              prevPhysical,
              book.physicalStock,
              prevAvailable,
              book.availableStock,
              "Website Order Delivered",
              userName || "Admin",
              "Website Order",
              order.orderNumber,
              `Order #${order.orderNumber} delivered. Physical stock finalized.`
            );
          }
        }
        order.paymentStatus = "Paid";
      }

      // 3. If transitioning from Cancelled back to Confirmed / New (unlikely but safe)
      if (oldStatus === "Cancelled" && newStatus !== "Cancelled") {
        for (const item of order.items) {
          const book = db.books.find(b => b.id === item.bookId);
          if (book) {
            book.reservedStock = (book.reservedStock || 0) + item.quantity;
            book.availableStock = Math.max(0, book.physicalStock - book.reservedStock);
            book.updatedAt = new Date().toISOString();
          }
        }
      }

      order.orderStatus = newStatus;
      order.updatedAt = new Date().toISOString();

      logAudit(userName || "Admin", "Updated Order Status", "Order", order.id, `Order #${order.orderNumber} status changed: ${oldStatus} -> ${newStatus}`);
    }

    saveDatabase();
    res.json({ success: true, order });
  } catch (err) {
    console.error("[API] Error updating order status:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// ---------------- REPORTS ----------------
app.get("/api/reports", (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let filteredSales = db.sales.filter(s => s.status !== "Cancelled");
    let filteredPurchases = db.purchases;

    if (startDate && typeof startDate === "string") {
      filteredSales = filteredSales.filter(s => s.date >= startDate);
      filteredPurchases = filteredPurchases.filter(p => p.date >= startDate);
    }
    if (endDate && typeof endDate === "string") {
      filteredSales = filteredSales.filter(s => s.date <= endDate);
      filteredPurchases = filteredPurchases.filter(p => p.date <= endDate);
    }

    const totalRevenue = filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
    const totalDiscounts = filteredSales.reduce((acc, s) => acc + (s.itemDiscount || 0) + (s.billDiscount || 0), 0);
    
    let totalCost = 0;
    const bookSaleQuantities: Record<string, { title: string; quantity: number; revenue: number; profit: number }> = {};

    filteredSales.forEach(s => {
      s.items.forEach(it => {
        totalCost += (it.purchasePrice || 0) * it.quantity;
        if (!bookSaleQuantities[it.bookId]) {
          bookSaleQuantities[it.bookId] = {
            title: it.title,
            quantity: 0,
            revenue: 0,
            profit: 0
          };
        }
        bookSaleQuantities[it.bookId].quantity += it.quantity;
        bookSaleQuantities[it.bookId].revenue += it.subtotal;
        bookSaleQuantities[it.bookId].profit += (it.salePrice - (it.purchasePrice || 0)) * it.quantity;
      });
    });

    const grossProfit = totalRevenue - totalCost;
    const netProfit = grossProfit - totalDiscounts;

    const topSellingBooks = Object.entries(bookSaleQuantities)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const totalPurchaseCost = filteredPurchases.reduce((acc, p) => acc + p.grandTotal, 0);
    const totalStockValue = db.books.reduce((acc, b) => acc + (b.purchasePrice * (b.physicalStock || 0)), 0);
    const totalRetailStockValue = db.books.reduce((acc, b) => acc + (b.salePrice * (b.physicalStock || 0)), 0);

    res.json({
      totalSalesCount: filteredSales.length,
      totalRevenue,
      totalCost,
      totalDiscounts,
      grossProfit,
      netProfit,
      totalPurchaseCost,
      totalPurchasesCount: filteredPurchases.length,
      totalStockValue,
      totalRetailStockValue,
      topSellingBooks,
      sales: filteredSales,
      purchases: filteredPurchases
    });
  } catch (err) {
    console.error("[API] Error generating reports:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// ---------------- SETTINGS & AUDIT ----------------
app.get("/api/settings", (req, res) => {
  res.json(db.settings);
});

app.put("/api/settings", (req, res) => {
  db.settings = {
    ...db.settings,
    ...req.body
  };
  logAudit(req.body.userName || "Admin", "Updated Settings", "Settings", undefined, "Updated shop profile & business preferences");
  saveDatabase();
  res.json(db.settings);
});

app.get("/api/audit-logs", (req, res) => {
  res.json(db.auditLogs);
});

// Reset / Seed for testing
app.post("/api/database/reset", (req, res) => {
  db = {
    version: (db.version || 0) + 1,
    books: JSON.parse(JSON.stringify(INITIAL_BOOKS)),
    sales: [],
    purchases: [],
    customers: JSON.parse(JSON.stringify(INITIAL_CUSTOMERS)),
    customerTransactions: [],
    suppliers: JSON.parse(JSON.stringify(INITIAL_SUPPLIERS)),
    supplierTransactions: [],
    orders: [],
    stockMovements: [],
    auditLogs: [],
    settings: DEFAULT_SETTINGS
  };
  saveDatabase();
  res.json({ success: true, message: "Database reset to clean catalog baseline." });
});

// Vite Middleware for dev and static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Urdu Bazars Server] Listening on http://localhost:${PORT}`);
  });
}

startServer();

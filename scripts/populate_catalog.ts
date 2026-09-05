import fs from 'fs';
import path from 'path';
import type { Book, Supplier } from '../src/types.ts';

// Helper to normalize class
function normClass(cls: string): string {
  const c = cls.trim();
  if (['Playgroup', 'Play Group', 'PG'].includes(c)) return 'Playgroup';
  if (['Nursery', 'Nur'].includes(c)) return 'Nursery';
  if (['Prep', 'KG'].includes(c)) return 'Prep';
  if (c === 'Pre 1') return 'Pre 1';
  if (['1', '1st'].includes(c)) return '1st';
  if (['2', '2nd'].includes(c)) return '2nd';
  if (['3', '3rd'].includes(c)) return '3rd';
  if (['4', '4th'].includes(c)) return '4th';
  if (['5', '5th'].includes(c)) return '5th';
  if (['6', '6th', 'ششم'].includes(c)) return '6th';
  if (['7', '7th', 'ہفتم'].includes(c)) return '7th';
  if (['8', '8th', 'ہشتم'].includes(c)) return '8th';
  if (['9', '9th'].includes(c)) return '9th';
  if (['10', '10th'].includes(c)) return '10th';
  if (['11', '11th'].includes(c)) return '11th';
  if (['12', '12th'].includes(c)) return '12th';
  return c;
}

let barcodeCounter = 896500100000;
function nextBarcode(): string {
  barcodeCounter += 1;
  return barcodeCounter.toString();
}

let bookIdCounter = 100;
function nextBookId(): string {
  bookIdCounter += 1;
  return `book-${bookIdCounter}`;
}

const createdBooks: Book[] = [];

function addBook(params: {
  title: string;
  urduTitle?: string;
  subject: string;
  class: string;
  series?: string;
  publisher: string;
  price: number;
  category?: any;
  edition?: string;
  pages?: number;
  rackShelf?: string;
  language?: 'Urdu' | 'English' | 'Bilingual';
  description?: string;
}) {
  const normCls = normClass(params.class);
  const purchasePrice = Math.round(params.price * 0.8); // 20% trade margin
  const isbn = `978-969-${Math.floor(100 + Math.random() * 899)}-${Math.floor(1000 + Math.random() * 8999)}-${Math.floor(1 + Math.random() * 9)}`;
  const barcode = nextBarcode();
  const id = nextBookId();

  let defaultImg = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80";
  if (params.subject.toLowerCase().includes('math')) {
    defaultImg = "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=80";
  } else if (params.subject.toLowerCase().includes('science')) {
    defaultImg = "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500&auto=format&fit=crop&q=80";
  } else if (params.subject.toLowerCase().includes('computer')) {
    defaultImg = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=80";
  } else if (params.subject.toLowerCase().includes('islam') || params.subject.toLowerCase().includes('quran')) {
    defaultImg = "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=500&auto=format&fit=crop&q=80";
  } else if (params.subject.toLowerCase().includes('urdu') || params.subject.toLowerCase().includes('literature')) {
    defaultImg = "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&auto=format&fit=crop&q=80";
  } else if (params.subject.toLowerCase().includes('art') || params.subject.toLowerCase().includes('drawing')) {
    defaultImg = "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&auto=format&fit=crop&q=80";
  }

  const book: Book = {
    id,
    title: params.title,
    urduTitle: params.urduTitle || "",
    class: normCls,
    subject: params.subject,
    author: params.publisher,
    publisher: params.publisher,
    isbn,
    barcode,
    purchasePrice,
    salePrice: params.price,
    physicalStock: 25,
    reservedStock: 0,
    availableStock: 25,
    minStockAlert: 5,
    rackShelf: params.rackShelf || "AZ-RACK-1",
    sessionYear: "2025-26",
    image: defaultImg,
    category: params.category || "Textbook",
    description: params.description || `${params.title} by ${params.publisher} (${params.series || ''}). Official curriculum syllabus book.`,
    language: params.language || "English",
    edition: params.edition || "2025-26 Edition",
    websiteVisible: true,
    featured: false,
    bestSeller: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  createdBooks.push(book);
}

console.log("Starting book catalog population from price lists...");

// ==========================================
// DOCUMENT 1: AZ INTERNATIONAL - Price List - CAMBRIDGE SNC SERIES
// ==========================================
const AZ_PUB = "AZ International";

// Doc 1 Table 1: Math (Playgroup to 5)
const doc1MathClasses = ["Playgroup", "Nursery", "Prep", "1", "2", "3", "4", "5"];
const doc1MathStdPrices = [310, 310, 310, 430, 430, 430, 460, 460];
const doc1MathSupPrices = [370, 370, 370, 490, 490, 490, 550, 550];

doc1MathClasses.forEach((cls, i) => {
  addBook({
    title: `AZ Cambridge SNC Math - ${normClass(cls)} (Standard Series)`,
    urduTitle: `اے زیڈ کیمبرج ریاضی برائے ${normClass(cls)} (سٹینڈرڈ)`,
    subject: "Mathematics",
    class: cls,
    series: "Cambridge SNC - Standard Series",
    publisher: AZ_PUB,
    price: doc1MathStdPrices[i],
    rackShelf: "AZ-MTH-1",
    category: "Textbook"
  });
  addBook({
    title: `AZ Cambridge SNC Math - ${normClass(cls)} (Supreme Series)`,
    urduTitle: `اے زیڈ کیمبرج ریاضی برائے ${normClass(cls)} (سپریم)`,
    subject: "Mathematics",
    class: cls,
    series: "Cambridge SNC - Supreme Series",
    publisher: AZ_PUB,
    price: doc1MathSupPrices[i],
    rackShelf: "AZ-MTH-1",
    category: "Textbook"
  });
});

// Doc 1 Table 1: Urdu (Playgroup to 5)
const doc1UrduClasses = ["Playgroup", "Nursery", "Prep", "1", "2", "3", "4", "5"];
const doc1UrduStdPrices = [310, 310, 310, 430, 430, 430, 430, 430];
const doc1UrduSupPrices = [370, 370, 370, 490, 490, 490, 490, 490];

doc1UrduClasses.forEach((cls, i) => {
  addBook({
    title: `AZ Cambridge SNC Urdu - ${normClass(cls)} (Standard Series)`,
    urduTitle: `اے زیڈ کیمبرج اردو برائے ${normClass(cls)} (سٹینڈرڈ)`,
    subject: "Urdu",
    class: cls,
    series: "Cambridge SNC - Standard Series",
    publisher: AZ_PUB,
    price: doc1UrduStdPrices[i],
    rackShelf: "AZ-URD-1",
    language: "Urdu",
    category: "Textbook"
  });
  addBook({
    title: `AZ Cambridge SNC Urdu - ${normClass(cls)} (Supreme Series)`,
    urduTitle: `اے زیڈ کیمبرج اردو برائے ${normClass(cls)} (سپریم)`,
    subject: "Urdu",
    class: cls,
    series: "Cambridge SNC - Supreme Series",
    publisher: AZ_PUB,
    price: doc1UrduSupPrices[i],
    rackShelf: "AZ-URD-1",
    language: "Urdu",
    category: "Textbook"
  });
});

// Doc 1 Table 1: English (Playgroup to 5)
const doc1EngClasses = ["Playgroup", "Nursery", "Prep", "1", "2", "3", "4", "5"];
const doc1EngStdPrices = [310, 310, 310, 370, 390, 420, 390, 390];
const doc1EngSupPrices = [370, 370, 370, 420, 440, 470, 440, 440];

doc1EngClasses.forEach((cls, i) => {
  addBook({
    title: `AZ Cambridge SNC English - ${normClass(cls)} (Standard Series)`,
    urduTitle: `اے زیڈ کیمبرج انگریزی برائے ${normClass(cls)} (سٹینڈرڈ)`,
    subject: "English",
    class: cls,
    series: "Cambridge SNC - Standard Series",
    publisher: AZ_PUB,
    price: doc1EngStdPrices[i],
    rackShelf: "AZ-ENG-1",
    category: "Textbook"
  });
  addBook({
    title: `AZ Cambridge SNC English - ${normClass(cls)} (Supreme Series)`,
    urduTitle: `اے زیڈ کیمبرج انگریزی برائے ${normClass(cls)} (سپریم)`,
    subject: "English",
    class: cls,
    series: "Cambridge SNC - Supreme Series",
    publisher: AZ_PUB,
    price: doc1EngSupPrices[i],
    rackShelf: "AZ-ENG-1",
    category: "Textbook"
  });
});

// Doc 1 Table 1: Drawing (Playgroup, Nursery, Prep) - Supreme only
const doc1DrawClasses = ["Playgroup", "Nursery", "Prep"];
doc1DrawClasses.forEach(cls => {
  addBook({
    title: `AZ Cambridge SNC Drawing - ${normClass(cls)} (Supreme Series)`,
    urduTitle: `اے زیڈ کیمبرج ڈرائنگ برائے ${normClass(cls)}`,
    subject: "Drawing",
    class: cls,
    series: "Cambridge SNC - Supreme Series",
    publisher: AZ_PUB,
    price: 200,
    rackShelf: "AZ-ART-1",
    category: "Activity Book"
  });
});

// Doc 1 Table 2: Science (4, 5)
const doc1SciClasses = ["4", "5"];
const doc1SciStdPrices = [580, 580];
const doc1SciSupPrices = [640, 640];
doc1SciClasses.forEach((cls, i) => {
  addBook({
    title: `AZ Cambridge SNC Science - ${normClass(cls)} (Standard Series)`,
    urduTitle: `اے زیڈ کیمبرج سائنس برائے ${normClass(cls)} (سٹینڈرڈ)`,
    subject: "Science",
    class: cls,
    series: "Cambridge SNC - Standard Series",
    publisher: AZ_PUB,
    price: doc1SciStdPrices[i],
    rackShelf: "AZ-SCI-1",
    category: "Textbook"
  });
  addBook({
    title: `AZ Cambridge SNC Science - ${normClass(cls)} (Supreme Series)`,
    urduTitle: `اے زیڈ کیمبرج سائنس برائے ${normClass(cls)} (سپریم)`,
    subject: "Science",
    class: cls,
    series: "Cambridge SNC - Supreme Series",
    publisher: AZ_PUB,
    price: doc1SciSupPrices[i],
    rackShelf: "AZ-SCI-1",
    category: "Textbook"
  });
});

// Doc 1 Table 2: Computer (1 to 5)
const doc1CompClasses = ["1", "2", "3", "4", "5"];
const doc1CompStdPrices = [200, 200, 200, 230, 230];
const doc1CompSupPrices = [250, 250, 250, 280, 280];
doc1CompClasses.forEach((cls, i) => {
  addBook({
    title: `AZ Cambridge SNC Computer - ${normClass(cls)} (Standard Series)`,
    urduTitle: `اے زیڈ کیمبرج کمپیوٹر برائے ${normClass(cls)} (سٹینڈرڈ)`,
    subject: "Computer",
    class: cls,
    series: "Cambridge SNC - Standard Series",
    publisher: AZ_PUB,
    price: doc1CompStdPrices[i],
    rackShelf: "AZ-CMP-1",
    category: "Textbook"
  });
  addBook({
    title: `AZ Cambridge SNC Computer - ${normClass(cls)} (Supreme Series)`,
    urduTitle: `اے زیڈ کیمبرج کمپیوٹر برائے ${normClass(cls)} (سپریم)`,
    subject: "Computer",
    class: cls,
    series: "Cambridge SNC - Supreme Series",
    publisher: AZ_PUB,
    price: doc1CompSupPrices[i],
    rackShelf: "AZ-CMP-1",
    category: "Textbook"
  });
});

// Doc 1 Table 2: Islamiat (1 to 5)
const doc1IslClasses = ["1", "2", "3", "4", "5"];
const doc1IslStdPrices = [200, 210, 250, 310, 310];
const doc1IslSupPrices = [250, 270, 310, 370, 370];
doc1IslClasses.forEach((cls, i) => {
  addBook({
    title: `AZ Cambridge SNC Islamiat - ${normClass(cls)} (Standard Series)`,
    urduTitle: `اے زیڈ کیمبرج اسلامیات برائے ${normClass(cls)} (سٹینڈرڈ)`,
    subject: "Islamiat",
    class: cls,
    series: "Cambridge SNC - Standard Series",
    publisher: AZ_PUB,
    price: doc1IslStdPrices[i],
    rackShelf: "AZ-ISL-1",
    language: "Urdu",
    category: "Islamic"
  });
  addBook({
    title: `AZ Cambridge SNC Islamiat - ${normClass(cls)} (Supreme Series)`,
    urduTitle: `اے زیڈ کیمبرج اسلامیات برائے ${normClass(cls)} (سپریم)`,
    subject: "Islamiat",
    class: cls,
    series: "Cambridge SNC - Supreme Series",
    publisher: AZ_PUB,
    price: doc1IslSupPrices[i],
    rackShelf: "AZ-ISL-1",
    language: "Urdu",
    category: "Islamic"
  });
});

// Doc 1 Table 2: Social Study UM (4, 5)
const doc1SSClasses = ["4", "5"];
const doc1SSStdPrices = [360, 390];
const doc1SSSupPrices = [450, 490];
doc1SSClasses.forEach((cls, i) => {
  addBook({
    title: `AZ Cambridge SNC Social Studies (Urdu Medium) - ${normClass(cls)} (Standard Series)`,
    urduTitle: `معاشرتی علوم اردو میڈیم برائے ${normClass(cls)} (سٹینڈرڈ)`,
    subject: "Social Studies",
    class: cls,
    series: "Cambridge SNC - Standard Series",
    publisher: AZ_PUB,
    price: doc1SSStdPrices[i],
    rackShelf: "AZ-SS-1",
    language: "Urdu",
    category: "Textbook"
  });
  addBook({
    title: `AZ Cambridge SNC Social Studies (Urdu Medium) - ${normClass(cls)} (Supreme Series)`,
    urduTitle: `معاشرتی علوم اردو میڈیم برائے ${normClass(cls)} (سپریم)`,
    subject: "Social Studies",
    class: cls,
    series: "Cambridge SNC - Supreme Series",
    publisher: AZ_PUB,
    price: doc1SSSupPrices[i],
    rackShelf: "AZ-SS-1",
    language: "Urdu",
    category: "Textbook"
  });
});

// Doc 1 Table 2: Gk (Playgroup to 3)
const doc1GkClasses = ["Playgroup", "Nursery", "Prep", "1", "2", "3"];
const doc1GkStdPrices = [260, 260, 260, 310, 310, 430];
const doc1GkSupPrices = [310, 310, 310, 370, 370, 490];
doc1GkClasses.forEach((cls, i) => {
  addBook({
    title: `AZ Cambridge SNC General Knowledge - ${normClass(cls)} (Standard Series)`,
    urduTitle: `جنرل نالج برائے ${normClass(cls)} (سٹینڈرڈ)`,
    subject: "General Knowledge",
    class: cls,
    series: "Cambridge SNC - Standard Series",
    publisher: AZ_PUB,
    price: doc1GkStdPrices[i],
    rackShelf: "AZ-GK-1",
    category: "Textbook"
  });
  addBook({
    title: `AZ Cambridge SNC General Knowledge - ${normClass(cls)} (Supreme Series)`,
    urduTitle: `جنرل نالج برائے ${normClass(cls)} (سپریم)`,
    subject: "General Knowledge",
    class: cls,
    series: "Cambridge SNC - Supreme Series",
    publisher: AZ_PUB,
    price: doc1GkSupPrices[i],
    rackShelf: "AZ-GK-1",
    category: "Textbook"
  });
});

// ==========================================
// DOCUMENT 2: AZ INTERNATIONAL - Capital Series - Price List 2025
// ==========================================
// Hybrid Series:
const doc2Hybrid = [
  { sr: 1, sub: "General Knowledge", cls: "1", stdPrice: 520, supPrice: 620 },
  { sr: 2, sub: "General Knowledge", cls: "2", stdPrice: 690, supPrice: 880 },
  { sr: 3, sub: "General Knowledge", cls: "3", stdPrice: 690, supPrice: 880 },
  { sr: 4, sub: "Social Studies", cls: "4", stdPrice: 580, supPrice: 700 },
  { sr: 5, sub: "Social Studies", cls: "5", stdPrice: 580, supPrice: 700 }
];

doc2Hybrid.forEach(item => {
  addBook({
    title: `AZ Capital Hybrid Series ${item.sub} - ${normClass(item.cls)} (Standard Series)`,
    urduTitle: `اے زیڈ کیپیٹل ہائبرڈ ${item.sub} برائے ${normClass(item.cls)} (سٹینڈرڈ)`,
    subject: item.sub,
    class: item.cls,
    series: "Capital Hybrid Series",
    publisher: AZ_PUB,
    price: item.stdPrice,
    rackShelf: "AZ-HYB-1",
    category: "Textbook"
  });
  addBook({
    title: `AZ Capital Hybrid Series ${item.sub} - ${normClass(item.cls)} (Supreme Series)`,
    urduTitle: `اے زیڈ کیپیٹل ہائبرڈ ${item.sub} برائے ${normClass(item.cls)} (سپریم)`,
    subject: item.sub,
    class: item.cls,
    series: "Capital Hybrid Series",
    publisher: AZ_PUB,
    price: item.supPrice,
    rackShelf: "AZ-HYB-1",
    category: "Textbook"
  });
});

// Islamiyat (1 to 5):
const doc2Isl = [
  { sr: 6, cls: "1", price: 490 },
  { sr: 7, cls: "2", price: 520 },
  { sr: 8, cls: "3", price: 560 },
  { sr: 9, cls: "4", price: 590 },
  { sr: 10, cls: "5", price: 680 }
];
doc2Isl.forEach(item => {
  addBook({
    title: `AZ Capital Series Islamiyat - ${normClass(item.cls)}`,
    urduTitle: `اے زیڈ کیپیٹل اسلامیات برائے ${normClass(item.cls)}`,
    subject: "Islamiat",
    class: item.cls,
    series: "Capital Series",
    publisher: AZ_PUB,
    price: item.price,
    rackShelf: "AZ-ISL-2",
    language: "Urdu",
    category: "Islamic"
  });
});

// Tarjuma Tul Quran (Prime Edition) (6 to 12):
const doc2Quran = [
  { sr: 11, cls: "6", price: 275 },
  { sr: 12, cls: "7", price: 480 },
  { sr: 13, cls: "8", price: 480 },
  { sr: 14, cls: "9", price: 460 },
  { sr: 15, cls: "10", price: 660 },
  { sr: 16, cls: "11", price: 370 },
  { sr: 17, cls: "12", price: 500 }
];
doc2Quran.forEach(item => {
  addBook({
    title: `AZ Capital Tarjuma Tul Quran (Prime Edition) - ${normClass(item.cls)}`,
    urduTitle: `ترجمۃ القرآن المجید (پرائم ایڈیشن) برائے جماعت ${normClass(item.cls)}`,
    subject: "Tarjuma Tul Quran",
    class: item.cls,
    series: "Capital Prime Edition",
    publisher: AZ_PUB,
    price: item.price,
    rackShelf: "AZ-QRN-1",
    language: "Urdu",
    category: "Islamic"
  });
});

// ==========================================
// DOCUMENT 3: AZ INTERNATIONAL - New Price List From 1st Sep 2025 - CAMBRIDGE
// ==========================================
// ENGLISH (Playgroup to 5)
const doc3EngClasses = ["Playgroup", "Nursery", "Prep", "1", "2", "3", "4", "5"];
const doc3EngStd = [480, 480, 480, 550, 600, 650, 600, 600];
const doc3EngSup = [580, 580, 580, 660, 720, 780, 680, 700];
doc3EngClasses.forEach((cls, i) => {
  addBook({
    title: `AZ Cambridge English [Sep 2025] - ${normClass(cls)} (Standard Series)`,
    urduTitle: `اے زیڈ کیمبرج انگریزی [ستمبر 2025] برائے ${normClass(cls)} (سٹینڈرڈ)`,
    subject: "English",
    class: cls,
    series: "Cambridge (Sep 2025) - Standard",
    publisher: AZ_PUB,
    price: doc3EngStd[i],
    edition: "1st Sep 2025 Edition",
    rackShelf: "AZ-ENG-SEP",
    category: "Textbook"
  });
  addBook({
    title: `AZ Cambridge English [Sep 2025] - ${normClass(cls)} (Supreme Series)`,
    urduTitle: `اے زیڈ کیمبرج انگریزی [ستمبر 2025] برائے ${normClass(cls)} (سپریم)`,
    subject: "English",
    class: cls,
    series: "Cambridge (Sep 2025) - Supreme",
    publisher: AZ_PUB,
    price: doc3EngSup[i],
    edition: "1st Sep 2025 Edition",
    rackShelf: "AZ-ENG-SEP",
    category: "Textbook"
  });
});

// URDU (Playgroup to 8)
const doc3UrduClasses = ["Playgroup", "Nursery", "Prep", "1", "2", "3", "4", "5"];
const doc3UrduStd = [480, 480, 480, 690, 690, 690, 690, 690];
const doc3UrduSup = [580, 580, 580, 880, 880, 880, 880, 880];
doc3UrduClasses.forEach((cls, i) => {
  addBook({
    title: `AZ Cambridge Urdu [Sep 2025] - ${normClass(cls)} (Standard Series)`,
    urduTitle: `اے زیڈ کیمبرج اردو [ستمبر 2025] برائے ${normClass(cls)} (سٹینڈرڈ)`,
    subject: "Urdu",
    class: cls,
    series: "Cambridge (Sep 2025) - Standard",
    publisher: AZ_PUB,
    price: doc3UrduStd[i],
    edition: "1st Sep 2025 Edition",
    rackShelf: "AZ-URD-SEP",
    language: "Urdu",
    category: "Textbook"
  });
  addBook({
    title: `AZ Cambridge Urdu [Sep 2025] - ${normClass(cls)} (Supreme Series)`,
    urduTitle: `اے زیڈ کیمبرج اردو [ستمبر 2025] برائے ${normClass(cls)} (سپریم)`,
    subject: "Urdu",
    class: cls,
    series: "Cambridge (Sep 2025) - Supreme",
    publisher: AZ_PUB,
    price: doc3UrduSup[i],
    edition: "1st Sep 2025 Edition",
    rackShelf: "AZ-URD-SEP",
    language: "Urdu",
    category: "Textbook"
  });
});
// Urdu 6, 7, 8 (Supreme only)
const doc3UrduUpper = [
  { cls: "6", price: 780 },
  { cls: "7", price: 760 },
  { cls: "8", price: 760 }
];
doc3UrduUpper.forEach(item => {
  addBook({
    title: `AZ Cambridge Urdu [Sep 2025] - ${normClass(item.cls)} (Supreme Series)`,
    urduTitle: `اے زیڈ کیمبرج اردو [ستمبر 2025] برائے ${normClass(item.cls)} (سپریم)`,
    subject: "Urdu",
    class: item.cls,
    series: "Cambridge (Sep 2025) - Supreme",
    publisher: AZ_PUB,
    price: item.price,
    edition: "1st Sep 2025 Edition",
    rackShelf: "AZ-URD-SEP",
    language: "Urdu",
    category: "Textbook"
  });
});

// MATH (Playgroup to 7)
const doc3MathClasses = ["Playgroup", "Nursery", "Prep", "1", "2", "3", "4", "5"];
const doc3MathStd = [480, 480, 480, 690, 690, 690, 750, 750];
const doc3MathSup = [580, 580, 580, 880, 880, 880, 990, 950];
doc3MathClasses.forEach((cls, i) => {
  addBook({
    title: `AZ Cambridge Math [Sep 2025] - ${normClass(cls)} (Standard Series)`,
    urduTitle: `اے زیڈ کیمبرج ریاضی [ستمبر 2025] برائے ${normClass(cls)} (سٹینڈرڈ)`,
    subject: "Mathematics",
    class: cls,
    series: "Cambridge (Sep 2025) - Standard",
    publisher: AZ_PUB,
    price: doc3MathStd[i],
    edition: "1st Sep 2025 Edition",
    rackShelf: "AZ-MTH-SEP",
    category: "Textbook"
  });
  addBook({
    title: `AZ Cambridge Math [Sep 2025] - ${normClass(cls)} (Supreme Series)`,
    urduTitle: `اے زیڈ کیمبرج ریاضی [ستمبر 2025] برائے ${normClass(cls)} (سپریم)`,
    subject: "Mathematics",
    class: cls,
    series: "Cambridge (Sep 2025) - Supreme",
    publisher: AZ_PUB,
    price: doc3MathSup[i],
    edition: "1st Sep 2025 Edition",
    rackShelf: "AZ-MTH-SEP",
    category: "Textbook"
  });
});
// Math 6, 7 (Supreme)
const doc3MathUpper = [
  { cls: "6", price: 790 },
  { cls: "7", price: 1050 }
];
doc3MathUpper.forEach(item => {
  addBook({
    title: `AZ Cambridge Math [Sep 2025] - ${normClass(item.cls)} (Supreme Series)`,
    urduTitle: `اے زیڈ کیمبرج ریاضی [ستمبر 2025] برائے ${normClass(item.cls)} (سپریم)`,
    subject: "Mathematics",
    class: item.cls,
    series: "Cambridge (Sep 2025) - Supreme",
    publisher: AZ_PUB,
    price: item.price,
    edition: "1st Sep 2025 Edition",
    rackShelf: "AZ-MTH-SEP",
    category: "Textbook"
  });
});

// DRAWING (Playgroup, Nursery, Prep) - Supreme 350
["Playgroup", "Nursery", "Prep"].forEach(cls => {
  addBook({
    title: `AZ Cambridge Drawing [Sep 2025] - ${normClass(cls)} (Supreme Series)`,
    urduTitle: `اے زیڈ کیمبرج ڈرائنگ [ستمبر 2025] برائے ${normClass(cls)}`,
    subject: "Drawing",
    class: cls,
    series: "Cambridge (Sep 2025) - Supreme",
    publisher: AZ_PUB,
    price: 350,
    edition: "1st Sep 2025 Edition",
    rackShelf: "AZ-ART-SEP",
    category: "Activity Book"
  });
});

// COMPUTER (Pre 1, 1 to 8) - Supreme only
const doc3Comp = [
  { cls: "Pre 1", price: 350 },
  { cls: "1", price: 490 },
  { cls: "2", price: 490 },
  { cls: "3", price: 490 },
  { cls: "4", price: 490 },
  { cls: "5", price: 490 },
  { cls: "6", price: 520 },
  { cls: "7", price: 540 },
  { cls: "8", price: 590 }
];
doc3Comp.forEach(item => {
  addBook({
    title: `AZ Cambridge Computer [Sep 2025] - ${normClass(item.cls)} (Supreme Series)`,
    urduTitle: `اے زیڈ کیمبرج کمپیوٹر [ستمبر 2025] برائے ${normClass(item.cls)} (سپریم)`,
    subject: "Computer",
    class: item.cls,
    series: "Cambridge (Sep 2025) - Supreme",
    publisher: AZ_PUB,
    price: item.price,
    edition: "1st Sep 2025 Edition",
    rackShelf: "AZ-CMP-SEP",
    category: "Textbook"
  });
});

// ISLAMIYAT (1 to 7)
const doc3IslClasses = ["1", "2", "3", "4", "5"];
const doc3IslStd = [400, 420, 480, 520, 550];
const doc3IslSup = [490, 520, 560, 590, 680];
doc3IslClasses.forEach((cls, i) => {
  addBook({
    title: `AZ Cambridge Islamiyat [Sep 2025] - ${normClass(cls)} (Standard Series)`,
    urduTitle: `اے زیڈ کیمبرج اسلامیات [ستمبر 2025] برائے ${normClass(cls)} (سٹینڈرڈ)`,
    subject: "Islamiat",
    class: cls,
    series: "Cambridge (Sep 2025) - Standard",
    publisher: AZ_PUB,
    price: doc3IslStd[i],
    edition: "1st Sep 2025 Edition",
    rackShelf: "AZ-ISL-SEP",
    language: "Urdu",
    category: "Islamic"
  });
  addBook({
    title: `AZ Cambridge Islamiyat [Sep 2025] - ${normClass(cls)} (Supreme Series)`,
    urduTitle: `اے زیڈ کیمبرج اسلامیات [ستمبر 2025] برائے ${normClass(cls)} (سپریم)`,
    subject: "Islamiat",
    class: cls,
    series: "Cambridge (Sep 2025) - Supreme",
    publisher: AZ_PUB,
    price: doc3IslSup[i],
    edition: "1st Sep 2025 Edition",
    rackShelf: "AZ-ISL-SEP",
    language: "Urdu",
    category: "Islamic"
  });
});
// Islamiyat 6, 7 (Supreme)
const doc3IslUpper = [
  { cls: "6", price: 690 },
  { cls: "7", price: 790 }
];
doc3IslUpper.forEach(item => {
  addBook({
    title: `AZ Cambridge Islamiyat [Sep 2025] - ${normClass(item.cls)} (Supreme Series)`,
    urduTitle: `اے زیڈ کیمبرج اسلامیات [ستمبر 2025] برائے ${normClass(item.cls)} (سپریم)`,
    subject: "Islamiat",
    class: item.cls,
    series: "Cambridge (Sep 2025) - Supreme",
    publisher: AZ_PUB,
    price: item.price,
    edition: "1st Sep 2025 Edition",
    rackShelf: "AZ-ISL-SEP",
    language: "Urdu",
    category: "Islamic"
  });
});

// HAMARI DUNIYA (Playgroup to 3)
const doc3HamariClasses = ["Playgroup", "Nursery", "Prep", "1", "2", "3"];
const doc3HamariStd = [420, 420, 420, 490, 520, 690];
const doc3HamariSup = [490, 490, 490, 590, 620, 880];
doc3HamariClasses.forEach((cls, i) => {
  addBook({
    title: `AZ Cambridge Hamari Duniya [Sep 2025] - ${normClass(cls)} (Standard Series)`,
    urduTitle: `ہماری دنیا [ستمبر 2025] برائے ${normClass(cls)} (سٹینڈرڈ)`,
    subject: "General Knowledge",
    class: cls,
    series: "Cambridge (Sep 2025) - Standard",
    publisher: AZ_PUB,
    price: doc3HamariStd[i],
    edition: "1st Sep 2025 Edition",
    rackShelf: "AZ-HD-SEP",
    language: "Urdu",
    category: "Textbook"
  });
  addBook({
    title: `AZ Cambridge Hamari Duniya [Sep 2025] - ${normClass(cls)} (Supreme Series)`,
    urduTitle: `ہماری دنیا [ستمبر 2025] برائے ${normClass(cls)} (سپریم)`,
    subject: "General Knowledge",
    class: cls,
    series: "Cambridge (Sep 2025) - Supreme",
    publisher: AZ_PUB,
    price: doc3HamariSup[i],
    edition: "1st Sep 2025 Edition",
    rackShelf: "AZ-HD-SEP",
    language: "Urdu",
    category: "Textbook"
  });
});

// SOCIAL STUDY (4, 5)
const doc3SSClasses = ["4", "5"];
const doc3SSStd = [560, 650];
const doc3SSSup = [700, 780];
doc3SSClasses.forEach((cls, i) => {
  addBook({
    title: `AZ Cambridge Social Studies [Sep 2025] - ${normClass(cls)} (Standard Series)`,
    urduTitle: `معاشرتی علوم [ستمبر 2025] برائے ${normClass(cls)} (سٹینڈرڈ)`,
    subject: "Social Studies",
    class: cls,
    series: "Cambridge (Sep 2025) - Standard",
    publisher: AZ_PUB,
    price: doc3SSStd[i],
    edition: "1st Sep 2025 Edition",
    rackShelf: "AZ-SS-SEP",
    category: "Textbook"
  });
  addBook({
    title: `AZ Cambridge Social Studies [Sep 2025] - ${normClass(cls)} (Supreme Series)`,
    urduTitle: `معاشرتی علوم [ستمبر 2025] برائے ${normClass(cls)} (سپریم)`,
    subject: "Social Studies",
    class: cls,
    series: "Cambridge (Sep 2025) - Supreme",
    publisher: AZ_PUB,
    price: doc3SSSup[i],
    edition: "1st Sep 2025 Edition",
    rackShelf: "AZ-SS-SEP",
    category: "Textbook"
  });
});

// SCIENCE 4 (Standard & Supreme)
addBook({
  title: `AZ Cambridge Science [Sep 2025] - 4th (Standard Series)`,
  urduTitle: `اے زیڈ کیمبرج سائنس [ستمبر 2025] برائے چہارم (سٹینڈرڈ)`,
  subject: "Science",
  class: "4",
  series: "Cambridge (Sep 2025) - Standard",
  publisher: AZ_PUB,
  price: 950,
  edition: "1st Sep 2025 Edition",
  rackShelf: "AZ-SCI-SEP",
  category: "Textbook"
});
addBook({
  title: `AZ Cambridge Science [Sep 2025] - 4th (Supreme Series)`,
  urduTitle: `اے زیڈ کیمبرج سائنس [ستمبر 2025] برائے چہارم (سپریم)`,
  subject: "Science",
  class: "4",
  series: "Cambridge (Sep 2025) - Supreme",
  publisher: AZ_PUB,
  price: 1140,
  edition: "1st Sep 2025 Edition",
  rackShelf: "AZ-SCI-SEP",
  category: "Textbook"
});

// GEOGRAPHY (6, 7, 8) - Supreme only 560
["6", "7", "8"].forEach(cls => {
  addBook({
    title: `AZ Cambridge Geography [Sep 2025] - ${normClass(cls)} (Supreme Series)`,
    urduTitle: `اے زیڈ کیمبرج جغرافیہ برائے ${normClass(cls)} (سپریم)`,
    subject: "Geography",
    class: cls,
    series: "Cambridge (Sep 2025) - Supreme",
    publisher: AZ_PUB,
    price: 560,
    edition: "1st Sep 2025 Edition",
    rackShelf: "AZ-GEO-SEP",
    category: "Textbook"
  });
});

// HISTORY (6, 7, 8) - Supreme
const doc3Hist = [
  { cls: "6", price: 520 },
  { cls: "7", price: 630 },
  { cls: "8", price: 630 }
];
doc3Hist.forEach(item => {
  addBook({
    title: `AZ Cambridge History [Sep 2025] - ${normClass(item.cls)} (Supreme Series)`,
    urduTitle: `اے زیڈ کیمبرج تاریخ برائے ${normClass(item.cls)} (سپریم)`,
    subject: "History",
    class: item.cls,
    series: "Cambridge (Sep 2025) - Supreme",
    publisher: AZ_PUB,
    price: item.price,
    edition: "1st Sep 2025 Edition",
    rackShelf: "AZ-HST-SEP",
    category: "Textbook"
  });
});

// ترجمتہ القرآن المجید (6, 7, 8)
const doc3Quran = [
  { cls: "6", urdu: "ششم", price: 400 },
  { cls: "7", urdu: "ہفتم", price: 630 },
  { cls: "8", urdu: "ہشتم", price: 630 }
];
doc3Quran.forEach(item => {
  addBook({
    title: `Tarjuma Tul Quran Majeed [Sep 2025] - ${normClass(item.cls)}`,
    urduTitle: `ترجمۃ القرآن المجید برائے جماعت ${item.urdu} (${normClass(item.cls)})`,
    subject: "Tarjuma Tul Quran",
    class: item.cls,
    series: "Cambridge (Sep 2025)",
    publisher: AZ_PUB,
    price: item.price,
    edition: "1st Sep 2025 Edition",
    rackShelf: "AZ-QRN-SEP",
    language: "Urdu",
    category: "Islamic"
  });
});

// ==========================================
// DOCUMENT 4: AZ INTERNATIONAL - Exploring Capital Series - Price List 2025-26
// ==========================================
// Page 1:
// Exploring English (Playgroup to 5)
const doc4Eng = [
  { cls: "Playgroup", price: 650 },
  { cls: "Nursery", price: 650 },
  { cls: "Prep", price: 650 },
  { cls: "1", price: 690 },
  { cls: "2", price: 690 },
  { cls: "3", price: 690 },
  { cls: "4", price: 690 },
  { cls: "5", price: 690 }
];
doc4Eng.forEach(item => {
  addBook({
    title: `Exploring English - ${normClass(item.cls)}`,
    urduTitle: `ایکسپلورنگ انگریزی برائے ${normClass(item.cls)}`,
    subject: "English",
    class: item.cls,
    series: "Exploring Capital Series 2025-26",
    publisher: AZ_PUB,
    price: item.price,
    rackShelf: "AZ-EXP-ENG",
    category: "Textbook"
  });
});

// Exploring Urdu (Playgroup to 5)
const doc4Urdu = [
  { cls: "Playgroup", price: 670 },
  { cls: "Nursery", price: 680 },
  { cls: "Prep", price: 690 },
  { cls: "1", price: 650 },
  { cls: "2", price: 670 },
  { cls: "3", price: 690 },
  { cls: "4", price: 690 },
  { cls: "5", price: 750 }
];
doc4Urdu.forEach(item => {
  addBook({
    title: `Exploring Urdu - ${normClass(item.cls)}`,
    urduTitle: `ایکسپلورنگ اردو برائے ${normClass(item.cls)}`,
    subject: "Urdu",
    class: item.cls,
    series: "Exploring Capital Series 2025-26",
    publisher: AZ_PUB,
    price: item.price,
    rackShelf: "AZ-EXP-URD",
    language: "Urdu",
    category: "Textbook"
  });
});

// Exploring Mathematics (Playgroup to 5)
const doc4Math = [
  { cls: "Playgroup", price: 650 },
  { cls: "Nursery", price: 650 },
  { cls: "Prep", price: 670 },
  { cls: "1", price: 790 },
  { cls: "2", price: 790 },
  { cls: "3", price: 790 },
  { cls: "4", price: 840 },
  { cls: "5", price: 860 }
];
doc4Math.forEach(item => {
  addBook({
    title: `Exploring Mathematics - ${normClass(item.cls)}`,
    urduTitle: `ایکسپلورنگ ریاضی برائے ${normClass(item.cls)}`,
    subject: "Mathematics",
    class: item.cls,
    series: "Exploring Capital Series 2025-26",
    publisher: AZ_PUB,
    price: item.price,
    rackShelf: "AZ-EXP-MTH",
    category: "Textbook"
  });
});

// Page 2:
// Exploring Islamiat(SRM) (Playgroup, Nursery, Prep) - 330
["Playgroup", "Nursery", "Prep"].forEach(cls => {
  addBook({
    title: `Exploring Islamiat (SRM) - ${normClass(cls)}`,
    urduTitle: `ایکسپلورنگ اسلامیات (ایس آر ایم) برائے ${normClass(cls)}`,
    subject: "Islamiat",
    class: cls,
    series: "Exploring Capital Series 2025-26",
    publisher: AZ_PUB,
    price: 330,
    rackShelf: "AZ-EXP-ISL",
    language: "Urdu",
    category: "Islamic"
  });
});

// Exploring Islamiat (1 to 5)
const doc4Isl = [
  { cls: "1", price: 450 },
  { cls: "2", price: 490 },
  { cls: "3", price: 550 },
  { cls: "4", price: 580 },
  { cls: "5", price: 595 }
];
doc4Isl.forEach(item => {
  addBook({
    title: `Exploring Islamiat - ${normClass(item.cls)}`,
    urduTitle: `ایکسپلورنگ اسلامیات برائے ${normClass(item.cls)}`,
    subject: "Islamiat",
    class: item.cls,
    series: "Exploring Capital Series 2025-26",
    publisher: AZ_PUB,
    price: item.price,
    rackShelf: "AZ-EXP-ISL",
    language: "Urdu",
    category: "Islamic"
  });
});

// Exploring G.K (Playgroup, Nursery, Prep)
const doc4GK = [
  { cls: "Playgroup", price: 460 },
  { cls: "Nursery", price: 460 },
  { cls: "Prep", price: 520 }
];
doc4GK.forEach(item => {
  addBook({
    title: `Exploring G.K - ${normClass(item.cls)}`,
    urduTitle: `ایکسپلورنگ جنرل نالج برائے ${normClass(item.cls)}`,
    subject: "General Knowledge",
    class: item.cls,
    series: "Exploring Capital Series 2025-26",
    publisher: AZ_PUB,
    price: item.price,
    rackShelf: "AZ-EXP-GK",
    category: "Textbook"
  });
});

// Exploring Science (1 to 5)
const doc4Sci = [
  { cls: "1", price: 550 },
  { cls: "2", price: 550 },
  { cls: "3", price: 580 },
  { cls: "4", price: 620 },
  { cls: "5", price: 620 }
];
doc4Sci.forEach(item => {
  addBook({
    title: `Exploring Science - ${normClass(item.cls)}`,
    urduTitle: `ایکسپلورنگ سائنس برائے ${normClass(item.cls)}`,
    subject: "Science",
    class: item.cls,
    series: "Exploring Capital Series 2025-26",
    publisher: AZ_PUB,
    price: item.price,
    rackShelf: "AZ-EXP-SCI",
    category: "Textbook"
  });
});

// Exploring Social Studies (1 to 5)
const doc4SS = [
  { cls: "1", price: 560 },
  { cls: "2", price: 560 },
  { cls: "3", price: 560 },
  { cls: "4", price: 680 },
  { cls: "5", price: 680 }
];
doc4SS.forEach(item => {
  addBook({
    title: `Exploring Social Studies - ${normClass(item.cls)}`,
    urduTitle: `ایکسپلورنگ معاشرتی علوم برائے ${normClass(item.cls)}`,
    subject: "Social Studies",
    class: item.cls,
    series: "Exploring Capital Series 2025-26",
    publisher: AZ_PUB,
    price: item.price,
    rackShelf: "AZ-EXP-SS",
    category: "Textbook"
  });
});

// Rhymes (Playgroup, Nursery, Prep) - 330
["Playgroup", "Nursery", "Prep"].forEach(cls => {
  addBook({
    title: `Rhymes - ${normClass(cls)}`,
    urduTitle: `نظمیں و ترانے برائے ${normClass(cls)}`,
    subject: "Rhymes & Poems",
    class: cls,
    series: "Exploring Capital Series 2025-26",
    publisher: AZ_PUB,
    price: 330,
    rackShelf: "AZ-EXP-RHY",
    category: "Activity Book"
  });
});

// Page 3: Exploring Art & Craft (A, B, C, 1 to 5)
const doc4Art = [
  { cls: "Playgroup", grade: "A", price: 450 },
  { cls: "Nursery", grade: "B", price: 450 },
  { cls: "Prep", grade: "C", price: 450 },
  { cls: "1", grade: "1", price: 490 },
  { cls: "2", grade: "2", price: 490 },
  { cls: "3", grade: "3", price: 490 },
  { cls: "4", grade: "4", price: 490 },
  { cls: "5", grade: "5", price: 490 }
];
doc4Art.forEach(item => {
  addBook({
    title: `Exploring Art & Craft Grade ${item.grade} (${normClass(item.cls)})`,
    urduTitle: `ایکسپلورنگ آرٹ اینڈ کرافٹ گریڈ ${item.grade}`,
    subject: "Art & Craft",
    class: item.cls,
    series: "Exploring Capital Series 2025-26",
    publisher: AZ_PUB,
    price: item.price,
    rackShelf: "AZ-EXP-ART",
    category: "Activity Book"
  });
});


// ==========================================
// DOCUMENT 5: BOOKTIME PUBLICATION - Price List 1-Sep-25
// ==========================================
const BT_PUB = "Booktime Publication";

// English (Playgroup to 5)
const doc5Eng = [
  { cls: "Playgroup", price: 520, pages: 44 },
  { cls: "Nursery", price: 520, pages: 48 },
  { cls: "Prep", price: 550, pages: 48 },
  { cls: "1", price: 560, pages: 72 },
  { cls: "2", price: 560, pages: 72 },
  { cls: "3", price: 580, pages: 64 },
  { cls: "4", price: 580, pages: 64 },
  { cls: "5", price: 580, pages: 64 }
];
doc5Eng.forEach(item => {
  addBook({
    title: `Booktime English - ${normClass(item.cls)}`,
    urduTitle: `بک ٹائم انگریزی برائے ${normClass(item.cls)}`,
    subject: "English",
    class: item.cls,
    publisher: BT_PUB,
    price: item.price,
    pages: item.pages,
    rackShelf: "BT-ENG-1",
    category: "Textbook",
    description: `Booktime English for ${normClass(item.cls)} (${item.pages} Pages). Single National Curriculum compliant.`
  });
});

// Urdu (Playgroup to 7)
const doc5Urdu = [
  { cls: "Playgroup", price: 550, pages: 48 },
  { cls: "Nursery", price: 550, pages: 48 },
  { cls: "Prep", price: 550, pages: 48 },
  { cls: "1", price: 560, pages: 72 },
  { cls: "2", price: 580, pages: 76 },
  { cls: "3", price: 580, pages: 80 },
  { cls: "4", price: 560, pages: 76 },
  { cls: "5", price: 590, pages: 80 },
  { cls: "6", price: 590 },
  { cls: "7", price: 590 }
];
doc5Urdu.forEach(item => {
  addBook({
    title: `Booktime Urdu - ${normClass(item.cls)}`,
    urduTitle: `بک ٹائم اردو برائے ${normClass(item.cls)}`,
    subject: "Urdu",
    class: item.cls,
    publisher: BT_PUB,
    price: item.price,
    pages: item.pages,
    rackShelf: "BT-URD-1",
    language: "Urdu",
    category: "Textbook",
    description: `Booktime Urdu for ${normClass(item.cls)}${item.pages ? ` (${item.pages} Pages)` : ''}. Single National Curriculum.`
  });
});

// Math (Playgroup to 5)
const doc5Math = [
  { cls: "Playgroup", price: 480, pages: 32 },
  { cls: "Nursery", price: 550, pages: 52 },
  { cls: "Prep", price: 520, pages: 48 },
  { cls: "1", price: 560, pages: 72 },
  { cls: "2", price: 580, pages: 80 },
  { cls: "3", price: 580, pages: 80 },
  { cls: "4", price: 600, pages: 88 },
  { cls: "5", price: 600, pages: 88 }
];
doc5Math.forEach(item => {
  addBook({
    title: `Booktime Mathematics - ${normClass(item.cls)}`,
    urduTitle: `بک ٹائم ریاضی برائے ${normClass(item.cls)}`,
    subject: "Mathematics",
    class: item.cls,
    publisher: BT_PUB,
    price: item.price,
    pages: item.pages,
    rackShelf: "BT-MTH-1",
    category: "Textbook",
    description: `Booktime Mathematics for ${normClass(item.cls)} (${item.pages} Pages). Single National Curriculum.`
  });
});

// Social Study (4, 5)
const doc5SS = [
  { cls: "4", price: 560, pages: 72 },
  { cls: "5", price: 580, pages: 80 }
];
doc5SS.forEach(item => {
  addBook({
    title: `Booktime Social Studies - ${normClass(item.cls)}`,
    urduTitle: `بک ٹائم معاشرتی علوم برائے ${normClass(item.cls)}`,
    subject: "Social Studies",
    class: item.cls,
    publisher: BT_PUB,
    price: item.price,
    pages: item.pages,
    rackShelf: "BT-SS-1",
    category: "Textbook",
    description: `Booktime Social Studies for ${normClass(item.cls)} (${item.pages} Pages).`
  });
});

// Islamiat (1 to 7)
const doc5Isl = [
  { cls: "1", price: 420, pages: 36 },
  { cls: "2", price: 460, pages: 48 },
  { cls: "3", price: 500, pages: 56 },
  { cls: "4", price: 560, pages: 72 },
  { cls: "5", price: 590, pages: 84 },
  { cls: "6", price: 580, pages: 76 },
  { cls: "7", price: 590, pages: 84 }
];
doc5Isl.forEach(item => {
  addBook({
    title: `Booktime Islamiat - ${normClass(item.cls)}`,
    urduTitle: `بک ٹائم اسلامیات برائے ${normClass(item.cls)}`,
    subject: "Islamiat",
    class: item.cls,
    publisher: BT_PUB,
    price: item.price,
    pages: item.pages,
    rackShelf: "BT-ISL-1",
    language: "Urdu",
    category: "Islamic",
    description: `Booktime Islamiat for ${normClass(item.cls)} (${item.pages} Pages).`
  });
});

// Waqfiyat e Aama (1, 2, 3)
const doc5Waqf = [
  { cls: "1", price: 530, pages: 64 },
  { cls: "2", price: 560, pages: 72 },
  { cls: "3", price: 610, pages: 92 }
];
doc5Waqf.forEach(item => {
  addBook({
    title: `Booktime Waqfiyat-e-Aama - ${normClass(item.cls)}`,
    urduTitle: `بک ٹائم واقفیت عامہ برائے ${normClass(item.cls)}`,
    subject: "General Knowledge",
    class: item.cls,
    publisher: BT_PUB,
    price: item.price,
    pages: item.pages,
    rackShelf: "BT-WQF-1",
    language: "Urdu",
    category: "Textbook",
    description: `Booktime Waqfiyat-e-Aama for ${normClass(item.cls)} (${item.pages} Pages).`
  });
});

// Computer (6, 7)
const doc5Comp = [
  { cls: "6", price: 580, pages: 64 },
  { cls: "7", price: 590, pages: 76 }
];
doc5Comp.forEach(item => {
  addBook({
    title: `Booktime Computer Science - ${normClass(item.cls)}`,
    urduTitle: `بک ٹائم کمپیوٹر سائنس برائے ${normClass(item.cls)}`,
    subject: "Computer",
    class: item.cls,
    publisher: BT_PUB,
    price: item.price,
    pages: item.pages,
    rackShelf: "BT-CMP-1",
    category: "Textbook",
    description: `Booktime Computer Science for ${normClass(item.cls)} (${item.pages} Pages).`
  });
});

// Activity Books
const doc5Activity = [
  { name: "Activity Eng", cls: "Playgroup", price: 540, pages: 72, sub: "English Activity" },
  { name: "Activity Eng", cls: "Nursery", price: 540, pages: 72, sub: "English Activity" },
  { name: "Activity Eng", cls: "Prep", price: 540, pages: 72, sub: "English Activity" },
  { name: "Activity Urdu", cls: "Playgroup", price: 580, pages: 88, sub: "Urdu Activity" },
  { name: "Activity Urdu", cls: "Nursery", price: 580, pages: 88, sub: "Urdu Activity" },
  { name: "Activity Urdu", cls: "Prep", price: 560, pages: 72, sub: "Urdu Activity" },
  { name: "Activity Math", cls: "Playgroup", price: 460, pages: 48, sub: "Math Activity" },
  { name: "Activity Math", cls: "Nursery", price: 530, pages: 80, sub: "Math Activity" },
  { name: "Activity Math", cls: "Prep", price: 530, pages: 72, sub: "Math Activity" }
];
doc5Activity.forEach(item => {
  addBook({
    title: `Booktime ${item.name} - ${normClass(item.cls)}`,
    urduTitle: `بک ٹائم ${item.name} برائے ${normClass(item.cls)}`,
    subject: item.sub,
    class: item.cls,
    publisher: BT_PUB,
    price: item.price,
    pages: item.pages,
    rackShelf: "BT-ACT-1",
    category: "Activity Book",
    description: `Booktime ${item.name} for ${normClass(item.cls)} (${item.pages} Pages). Early childhood workbook.`
  });
});

// Science (4, 5)
const doc5Sci = [
  { cls: "4", price: 600, pages: 92 },
  { cls: "5", price: 680, pages: 112 }
];
doc5Sci.forEach(item => {
  addBook({
    title: `Booktime General Science - ${normClass(item.cls)}`,
    urduTitle: `بک ٹائم جنرل سائنس برائے ${normClass(item.cls)}`,
    subject: "Science",
    class: item.cls,
    publisher: BT_PUB,
    price: item.price,
    pages: item.pages,
    rackShelf: "BT-SCI-1",
    category: "Textbook",
    description: `Booktime General Science for ${normClass(item.cls)} (${item.pages} Pages).`
  });
});

console.log(`Generated ${createdBooks.length} books in exact sequence with original prices!`);

// Load existing database
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "urdu_bazars_db.json");

let currentDb: any = {};
if (fs.existsSync(DB_FILE)) {
  currentDb = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

// Preserve initial books or place existing books together
const existingBooks: Book[] = currentDb.books || [];
// We keep existing books that don't conflict, and append the new books in exact sequence
const allBooks = [...createdBooks, ...existingBooks.filter((b: Book) => !b.title.includes("AZ ") && !b.title.includes("Exploring ") && !b.title.includes("Booktime"))];

// Add suppliers if missing
const suppliers: Supplier[] = currentDb.suppliers || [];
if (!suppliers.some(s => s.name.includes("AZ International"))) {
  suppliers.push({
    id: "supp-az",
    name: "AZ International Publishing House",
    company: "AZ International",
    phone: "042-37163413 / 0321-4441022",
    address: "Shop # 1 Al Noor Center, 38 Ghazni Street, Urdu Bazar, Lahore",
    notes: "Cambridge SNC Series, Capital Series, Exploring Capital Series, Hybrid Series & Quran editions",
    totalPurchases: 125000,
    totalPaid: 95000,
    remainingPayable: 30000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}
if (!suppliers.some(s => s.name.includes("Booktime"))) {
  suppliers.push({
    id: "supp-bt",
    name: "Booktime Publication",
    company: "Booktime Publication Lahore",
    phone: "042-37123456",
    address: "Urdu Bazar, Lahore",
    notes: "English, Urdu, Mathematics, Islamiat, Activity Books, Science for Pre-School & Primary",
    totalPurchases: 85000,
    totalPaid: 65000,
    remainingPayable: 20000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}

currentDb.books = allBooks;
currentDb.suppliers = suppliers;
currentDb.version = (currentDb.version || 1) + 1;

fs.writeFileSync(DB_FILE, JSON.stringify(currentDb, null, 2), "utf-8");
console.log(`Successfully updated ${DB_FILE} with ${allBooks.length} total books!`);

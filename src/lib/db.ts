import fs from 'fs';
import path from 'path';
import { 
  FoodItem, 
  DayMenu, 
  Order, 
  KitchenSettings, 
  DashboardOverview, 
  OrderStatus,
  DayMenuItem,
  ItemStatus
} from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'kitchen_db.json');

interface DatabaseSchema {
  foodItems: FoodItem[];
  menus: Record<string, DayMenu>; // key is 'YYYY-MM-DD'
  orders: Order[];
  categories: string[];
  units: string[];
  settings: KitchenSettings;
  adminCredentials: {
    username: string;
    passwordHash: string; // pre-hashed or plain check for demo
    name: string;
    role: string;
  };
}

// Initial default settings
const defaultSettings: KitchenSettings = {
  kitchenName: 'Vindu Ruchulu',
  tagline: 'Authentic Telangana & Andhra Home-Style Feasts • Made Fresh Tomorrow',
  phone: '+91 98765 43210',
  email: 'orders@vinduruchulu.com',
  address: 'Plot 42, Jubilee Hills Road No. 36, Hyderabad, Telangana 500033',
  currency: '₹',
  deliveryFee: 40,
  freeDeliveryThreshold: 600,
  packagingFee: 20,
  taxRate: 0.05,
  deliverySlots: [
    'Lunch (12:30 PM - 2:00 PM)',
    'Dinner (7:30 PM - 9:00 PM)',
    'Early Evening Tiffins (5:00 PM - 6:30 PM)'
  ],
  isKitchenOpen: true,
  orderingNotice: 'We prepare all curries, biryanis & tiffins from scratch every morning using cold-pressed oils & freshly ground Guntur spices. Orders close at 11:00 PM tonight for tomorrow.',
  allowGuestCheckout: true,
};

const defaultCategories: string[] = [
  'Biryani',
  'Curries',
  'Meals',
  'Tiffins',
  'Snacks',
  'Rice',
  'Pachadi & Podi',
  'Desserts',
  'Beverages',
];

const defaultUnits: string[] = [
  '500 g',
  '1 kg',
  '250 g',
  '1 plate',
  '4 pcs',
  '3 pcs',
  '8 pcs',
  '1 box',
  '1 serving',
  '300 ml',
  '500 ml',
  '1 litre',
  'dozen',
];

// Rich Curated Seed Data with Authentic Visuals
const seedFoodItems: FoodItem[] = [
  {
    id: 'item-1',
    name: 'Andhra Special Kodi Kura (Chicken Curry)',
    teluguName: 'ఆంధ్రా కోడి కూర',
    description: 'Tender chicken slow-cooked with roasted Guntur red chillies, poppy seeds (Gasa Gasaalu), freshly ground garam masala, and fragrant curry leaves.',
    price: 250,
    unit: '500 g',
    category: 'Curries',
    isVeg: false,
    spiceLevel: 4,
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    availableQuantity: 25,
    remainingStock: 25,
    maxOrderQty: 4,
    status: 'AVAILABLE',
    isFeatured: true,
    tags: ['Best Seller', 'Traditional', 'Spicy'],
  },
  {
    id: 'item-2',
    name: 'Nawabi Hyderabadi Mutton Dum Biryani',
    teluguName: 'హైదరాబాదీ మటన్ దమ్ బిర్యానీ',
    description: 'Long grain aged basmati rice layered with succulent marinated mutton chunks, saffron milk, fried onions (birista), and slow-cooked over wood embers on dum.',
    price: 380,
    unit: '750 g',
    category: 'Biryani',
    isVeg: false,
    spiceLevel: 3,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    availableQuantity: 30,
    remainingStock: 28,
    maxOrderQty: 5,
    status: 'AVAILABLE',
    isFeatured: true,
    tags: ['Signature', 'Claypot Dum', 'Weekend Special'],
  },
  {
    id: 'item-3',
    name: 'Gongura Mutton Curry',
    teluguName: 'గోంగూర మటన్',
    description: 'Iconic Andhra sour-spicy curry made with fresh red-stem gongura (sorrel leaves), tender goat meat, garlic, and crushed red chillies in cold-pressed sesame oil.',
    price: 360,
    unit: '450 g',
    category: 'Curries',
    isVeg: false,
    spiceLevel: 4,
    imageUrl: 'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=800&q=80',
    availableQuantity: 20,
    remainingStock: 18,
    maxOrderQty: 3,
    status: 'AVAILABLE',
    isFeatured: true,
    tags: ['Authentic Andhra', 'Must Try'],
  },
  {
    id: 'item-4',
    name: 'Telangana Bagara Rice with Natukodi Pulusu',
    teluguName: 'బగారా రైస్ & నాటుకోడి పులుసు',
    description: 'Aromatic cumin and whole-spice tempered bagara rice paired with country-chicken (Natukodi) simmered in a robust peppery shallot broth.',
    price: 320,
    unit: '1 plate',
    category: 'Meals',
    isVeg: false,
    spiceLevel: 5,
    imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
    availableQuantity: 20,
    remainingStock: 15,
    maxOrderQty: 4,
    status: 'AVAILABLE',
    isFeatured: true,
    tags: ['Telangana Feast', 'Fiery'],
  },
  {
    id: 'item-5',
    name: 'Gutti Vankaya Kura (Stuffed Brinjal)',
    teluguName: 'గుత్తి వంకాయ కూర',
    description: 'Baby purple brinjals stuffed with roasted peanut, sesame seeds, dry coconut, and tamarind paste, simmered gently in rich spiced gravy.',
    price: 190,
    unit: '450 g',
    category: 'Curries',
    isVeg: true,
    spiceLevel: 3,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    availableQuantity: 25,
    remainingStock: 22,
    maxOrderQty: 4,
    status: 'AVAILABLE',
    isFeatured: true,
    tags: ['Vegetarian Delight', 'Traditional'],
  },
  {
    id: 'item-6',
    name: 'Nellore Chepala Pulusu (Fish Curry)',
    teluguName: 'నెల్లూరు చేపల పులుసు',
    description: 'Fresh Korameenu (Murrel fish) cooked in tangy aged tamarind gravy with fenugreek, green chillies, and clay-pot seasoning. Tastes heavenly the next day!',
    price: 290,
    unit: '400 g',
    category: 'Curries',
    isVeg: false,
    spiceLevel: 4,
    imageUrl: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=800&q=80',
    availableQuantity: 15,
    remainingStock: 12,
    maxOrderQty: 3,
    status: 'AVAILABLE',
    isFeatured: true,
    tags: ['Claypot Special', 'Nellore Recipe'],
  },
  {
    id: 'item-7',
    name: 'Andhra Tomato Pappu with Ghee Tadka',
    teluguName: 'టమోటా పప్పు & నెయ్యి తాలింపు',
    description: 'Thick toor dal cooked with ripe country tomatoes, green chillies, and finished with sizzling desi ghee, garlic, mustard seeds, and asafoetida.',
    price: 130,
    unit: '450 g',
    category: 'Curries',
    isVeg: true,
    spiceLevel: 2,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    availableQuantity: 35,
    remainingStock: 30,
    maxOrderQty: 6,
    status: 'AVAILABLE',
    isFeatured: false,
    tags: ['Comfort Food', 'Desi Ghee'],
  },
  {
    id: 'item-8',
    name: 'Temple Style Pulihora (Tamarind Rice)',
    teluguName: 'గుడి ప్రసాదం పులిహోర',
    description: 'Authentic temple-style tamarind rice spiced with roasted peanuts, curry leaves, ginger juliennes, green chillies, mustard, and a hint of hing.',
    price: 90,
    unit: '400 g',
    category: 'Rice',
    isVeg: true,
    spiceLevel: 2,
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    availableQuantity: 30,
    remainingStock: 25,
    maxOrderQty: 5,
    status: 'AVAILABLE',
    isFeatured: false,
    tags: ['Prasadam Style', 'Traditional'],
  },
  {
    id: 'item-9',
    name: 'Guntur Mirchi Bajji with Onion Masala',
    teluguName: 'గుంటూరు మిర్చి బజ్జి',
    description: 'Plump Bhavnagri chillies dipped in spiced chickpea batter, golden fried, slit open and stuffed with seasoned diced onions, cilantro, and lemon juice.',
    price: 60,
    unit: '4 pcs',
    category: 'Snacks',
    isVeg: true,
    spiceLevel: 5,
    imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
    availableQuantity: 40,
    remainingStock: 35,
    maxOrderQty: 6,
    status: 'AVAILABLE',
    isFeatured: true,
    tags: ['Hot Snack', 'Street Food'],
  },
  {
    id: 'item-10',
    name: 'Crispy Hot Punugulu with Spicy Chutney',
    teluguName: 'కరకరలాడే పునుగులు',
    description: 'Golden deep-fried batter dumplings made of fermented rice & urad dal with crushed peppercorns and onions, served with red tomato-peanut chutney.',
    price: 70,
    unit: '8 pcs',
    category: 'Snacks',
    isVeg: true,
    spiceLevel: 3,
    imageUrl: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80',
    availableQuantity: 30,
    remainingStock: 28,
    maxOrderQty: 6,
    status: 'AVAILABLE',
    isFeatured: false,
    tags: ['Crispy Snack', 'Popular'],
  },
  {
    id: 'item-11',
    name: 'Bezawada Boneless Chicken Biryani',
    teluguName: 'బెజవాడ చికెన్ బిర్యానీ',
    description: 'Spiced tender chicken fry pieces tossed in green chilli masala layered over spiced basmati biryani rice with boiled egg & raita.',
    price: 280,
    unit: '600 g',
    category: 'Biryani',
    isVeg: false,
    spiceLevel: 4,
    imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
    availableQuantity: 25,
    remainingStock: 20,
    maxOrderQty: 4,
    status: 'AVAILABLE',
    isFeatured: true,
    tags: ['Vijayawada Special', 'Boneless'],
  },
  {
    id: 'item-12',
    name: 'Pesarattu with Allam Pachadi (2 Pcs)',
    teluguName: 'పెసరట్టు & అల్లం పచ్చడి',
    description: 'Whole green gram crisp crepe topped with finely chopped onions, ginger, and green chillies, accompanied by tangy home-style allam pachadi.',
    price: 110,
    unit: '2 pcs',
    category: 'Tiffins',
    isVeg: true,
    spiceLevel: 2,
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
    availableQuantity: 20,
    remainingStock: 18,
    maxOrderQty: 4,
    status: 'AVAILABLE',
    isFeatured: false,
    tags: ['Healthy Breakfast', 'Traditional'],
  },
  {
    id: 'item-13',
    name: 'Steamed Button Ghee Podi Idli',
    teluguName: 'నెయ్యి కారం పొడి ఇడ్లీ',
    description: 'Fluffy mini button idlis tossed generously in pure cow ghee and freshly pounded Gunpowder (Kandi Podi & Nalla Karam).',
    price: 95,
    unit: '1 plate',
    category: 'Tiffins',
    isVeg: true,
    spiceLevel: 3,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    availableQuantity: 30,
    remainingStock: 25,
    maxOrderQty: 5,
    status: 'AVAILABLE',
    isFeatured: false,
    tags: ['Desi Ghee', 'Gunpowder'],
  },
  {
    id: 'item-14',
    name: 'Karivepaku Kodi Vepudu (Curry Leaf Chicken Fry)',
    teluguName: 'కరివేపాకు కోడి వేపుడు',
    description: 'Dry roasted chicken chunks tossed with aromatic roasted fresh curry leaves powder, black pepper, and crushed garlic.',
    price: 260,
    unit: '300 g',
    category: 'Snacks',
    isVeg: false,
    spiceLevel: 4,
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    availableQuantity: 20,
    remainingStock: 15,
    maxOrderQty: 4,
    status: 'AVAILABLE',
    isFeatured: true,
    tags: ['Curry Leaf Special', 'Appetizer'],
  },
  {
    id: 'item-15',
    name: 'Authentic Gongura Pachadi (Jar)',
    teluguName: 'గోంగూర పచ్చడి',
    description: 'Stone-ground authentic Andhra Gongura chutney preserved with garlic, roasted red chillies, and mustard oil.',
    price: 120,
    unit: '250 g',
    category: 'Pachadi & Podi',
    isVeg: true,
    spiceLevel: 4,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    availableQuantity: 40,
    remainingStock: 35,
    maxOrderQty: 6,
    status: 'AVAILABLE',
    isFeatured: false,
    tags: ['Stone Ground', 'Preservative Free'],
  },
  {
    id: 'item-16',
    name: 'Nethi Bobbatlu (Puran Poli with Desi Ghee)',
    teluguName: 'నెయ్యి బొబ్బట్లు',
    description: 'Thin delicate sweet flatbreads stuffed with sweetened chana dal & organic jaggery, drenched in golden melted ghee.',
    price: 130,
    unit: '3 pcs',
    category: 'Desserts',
    isVeg: true,
    spiceLevel: 1,
    imageUrl: 'https://images.unsplash.com/photo-1605197148560-ef024fe3c809?auto=format&fit=crop&w=800&q=80',
    availableQuantity: 25,
    remainingStock: 20,
    maxOrderQty: 5,
    status: 'AVAILABLE',
    isFeatured: true,
    tags: ['Festival Sweet', 'Desi Ghee'],
  },
  {
    id: 'item-17',
    name: 'Pootharekulu (Paper Sweet with Dry Fruits)',
    teluguName: 'ఆత్రేయపురం పూతరేకులు',
    description: 'Famous Atreyapuram paper-thin rice starch sweet rolls filled with roasted almonds, cashews, cardamom, and palm jaggery.',
    price: 160,
    unit: '4 pcs',
    category: 'Desserts',
    isVeg: true,
    spiceLevel: 1,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    availableQuantity: 15,
    remainingStock: 12,
    maxOrderQty: 4,
    status: 'AVAILABLE',
    isFeatured: false,
    tags: ['Royal Sweet', 'Traditional Heritage'],
  },
  {
    id: 'item-18',
    name: 'Bellam Majjiga (Spiced Buttermilk)',
    teluguName: 'చల్లని మజ్జిగ',
    description: 'Churned cooling curd blended with crushed ginger, green chillies, curry leaves, roasted cumin, and black salt.',
    price: 45,
    unit: '350 ml',
    category: 'Beverages',
    isVeg: true,
    spiceLevel: 1,
    imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80',
    availableQuantity: 50,
    remainingStock: 45,
    maxOrderQty: 6,
    status: 'AVAILABLE',
    isFeatured: false,
    tags: ['Refreshing', 'Digestive'],
  },
  {
    id: 'item-19',
    name: 'Royyala Vepudu (Spicy Prawn Pepper Fry)',
    teluguName: 'రొయ్యల వేపుడు',
    description: 'Juicy coastal prawns pan-roasted with freshly crushed tellicherry black pepper, shallots, curry leaves, and green chillies.',
    price: 330,
    unit: '300 g',
    category: 'Snacks',
    isVeg: false,
    spiceLevel: 4,
    imageUrl: 'https://images.unsplash.com/photo-1559742811-822863ccbaee?auto=format&fit=crop&w=800&q=80',
    availableQuantity: 15,
    remainingStock: 10,
    maxOrderQty: 3,
    status: 'AVAILABLE',
    isFeatured: true,
    tags: ['Coastal Seafood', 'Chef Special'],
  },
  {
    id: 'item-20',
    name: 'Traditional Perugu Annam (Curd Rice) with Anar',
    teluguName: 'కమ్మని పెరుగు అన్నం',
    description: 'Soft home-style rice mixed with rich set curd, tempered with mustard seeds, urad dal, ginger, green chillies, and fresh pomegranate jewels.',
    price: 85,
    unit: '400 g',
    category: 'Rice',
    isVeg: true,
    spiceLevel: 1,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    availableQuantity: 30,
    remainingStock: 26,
    maxOrderQty: 5,
    status: 'AVAILABLE',
    isFeatured: false,
    tags: ['Comfort Food', 'Cooling'],
  }
];

// Helper to format Date to 'YYYY-MM-DD'
export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDateKey(d);
}

export function getTodayDate(): string {
  return formatDateKey(new Date());
}

export function getDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return formatDateKey(d);
}

// Generate Initial Sample Menus for Today, Tomorrow and Next 5 days
function generateSeedMenus(foodItems: FoodItem[]): Record<string, DayMenu> {
  const menus: Record<string, DayMenu> = {};
  
  // Dates: Today (0), Tomorrow (+1), Day After (+2), +3, +4
  for (let offset = 0; offset <= 4; offset++) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dateKey = formatDateKey(d);
    
    // Choose selected items for the day's special menu
    const dayItems: DayMenuItem[] = foodItems.map((item, idx) => {
      // Pick varying items or all items
      let status: ItemStatus = 'AVAILABLE';
      let rem = item.availableQuantity;
      
      // Simulate low stock or sold out on some items for realism
      if (idx === 1 && offset === 1) {
        rem = 3;
        status = 'LOW_STOCK';
      } else if (idx === 5 && offset === 1) {
        rem = 0;
        status = 'SOLD_OUT';
      }

      return {
        foodItemId: item.id,
        availableQuantity: item.availableQuantity,
        remainingStock: rem,
        maxOrderQty: item.maxOrderQty,
        status: status,
        sortOrder: idx,
      };
    });

    const isTomorrow = offset === 1;
    const isToday = offset === 0;
    const title = isTomorrow 
      ? "Tomorrow's Grand Feast Menu" 
      : isToday 
      ? "Today's Fresh Kitchen Menu" 
      : `Chef's Special Menu for ${d.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}`;

    menus[dateKey] = {
      id: `menu-${dateKey}`,
      date: dateKey,
      displayDate: d.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      title,
      note: 'Handcrafted in brass vessels with stone-ground masalas.',
      isPublished: true,
      isAcceptingOrders: true,
      cutoffTime: '11:00 PM',
      items: dayItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return menus;
}

// Generate Initial Sample Orders
function generateSeedOrders(): Order[] {
  const today = getTodayDate();
  const tomorrow = getTomorrowDate();

  return [
    {
      id: 'ord-1',
      orderNumber: 'TEL-10482',
      customer: {
        name: 'Rahul Varma',
        phone: '9876543210',
        email: 'rahul.varma@gmail.com',
      },
      deliveryAddress: {
        fullName: 'Rahul Varma',
        phone: '9876543210',
        email: 'rahul.varma@gmail.com',
        addressLine1: 'Flat 402, Sai Krupa Towers, Road No 10',
        addressLine2: 'Banjara Hills',
        landmark: 'Opposite City Center Mall',
        pincode: '500034',
        city: 'Hyderabad',
        deliverySlot: 'Lunch (12:30 PM - 2:00 PM)',
        cookingInstructions: 'Please make the biryani with extra mirchi ka salan. Thanks!',
      },
      items: [
        {
          foodItemId: 'item-2',
          name: 'Nawabi Hyderabadi Mutton Dum Biryani',
          teluguName: 'హైదరాబాదీ మటన్ దమ్ బిర్యానీ',
          price: 380,
          unit: '750 g',
          quantity: 2,
          itemTotal: 760,
          imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
          isVeg: false,
          spiceLevel: 3,
        },
        {
          foodItemId: 'item-1',
          name: 'Andhra Special Kodi Kura (Chicken Curry)',
          teluguName: 'ఆంధ్రా కోడి కూర',
          price: 250,
          unit: '500 g',
          quantity: 1,
          itemTotal: 250,
          imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
          isVeg: false,
          spiceLevel: 4,
        }
      ],
      subtotal: 1010,
      deliveryFee: 0, // Free above 600
      packagingFee: 20,
      discount: 0,
      total: 1030,
      menuDate: tomorrow,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      razorpayPaymentId: 'pay_MOK_987654321',
      orderStatus: 'PREPARING',
      statusHistory: [
        { status: 'PENDING', timestamp: new Date(Date.now() - 3600000).toISOString(), note: 'Order placed by customer' },
        { status: 'CONFIRMED', timestamp: new Date(Date.now() - 3000000).toISOString(), note: 'Payment verified via Razorpay UPI' },
        { status: 'PREPARING', timestamp: new Date(Date.now() - 1500000).toISOString(), note: 'Ingredients prepped in kitchen handis' },
      ],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 1500000).toISOString(),
    },
    {
      id: 'ord-2',
      orderNumber: 'TEL-10483',
      customer: {
        name: 'Sowmya Reddy',
        phone: '9848022338',
        email: 'sowmya.reddy@techhub.in',
      },
      deliveryAddress: {
        fullName: 'Sowmya Reddy',
        phone: '9848022338',
        addressLine1: 'Villa 18, Green Meadows Gated Community',
        addressLine2: 'Madhapur',
        landmark: 'Near Inorbit Mall back gate',
        pincode: '500081',
        city: 'Hyderabad',
        deliverySlot: 'Dinner (7:30 PM - 9:00 PM)',
        cookingInstructions: 'Medium spice for Gutti Vankaya please.',
      },
      items: [
        {
          foodItemId: 'item-5',
          name: 'Gutti Vankaya Kura (Stuffed Brinjal)',
          teluguName: 'గుత్తి వంకాయ కూర',
          price: 190,
          unit: '450 g',
          quantity: 1,
          itemTotal: 190,
          imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
          isVeg: true,
          spiceLevel: 3,
        },
        {
          foodItemId: 'item-8',
          name: 'Temple Style Pulihora (Tamarind Rice)',
          teluguName: 'గుడి ప్రసాదం పులిహోర',
          price: 90,
          unit: '400 g',
          quantity: 2,
          itemTotal: 180,
          imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
          isVeg: true,
          spiceLevel: 2,
        },
        {
          foodItemId: 'item-16',
          name: 'Nethi Bobbatlu (Puran Poli with Desi Ghee)',
          teluguName: 'నెయ్యి బొబ్బట్లు',
          price: 130,
          unit: '3 pcs',
          quantity: 1,
          itemTotal: 130,
          imageUrl: 'https://images.unsplash.com/photo-1605197148560-ef024fe3c809?auto=format&fit=crop&w=800&q=80',
          isVeg: true,
          spiceLevel: 1,
        }
      ],
      subtotal: 500,
      deliveryFee: 40,
      packagingFee: 20,
      discount: 0,
      total: 560,
      menuDate: tomorrow,
      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      razorpayPaymentId: 'pay_MOK_987654322',
      orderStatus: 'CONFIRMED',
      statusHistory: [
        { status: 'PENDING', timestamp: new Date(Date.now() - 7200000).toISOString(), note: 'Order placed' },
        { status: 'CONFIRMED', timestamp: new Date(Date.now() - 6800000).toISOString(), note: 'Order confirmed by kitchen staff' },
      ],
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date(Date.now() - 6800000).toISOString(),
    },
    {
      id: 'ord-3',
      orderNumber: 'TEL-10480',
      customer: {
        name: 'Kiran Kumar Raju',
        phone: '9988776655',
      },
      deliveryAddress: {
        fullName: 'Kiran Kumar Raju',
        phone: '9988776655',
        addressLine1: 'House 12-2-417, Mehdipatnam',
        pincode: '500028',
        city: 'Hyderabad',
        deliverySlot: 'Lunch (12:30 PM - 2:00 PM)',
      },
      items: [
        {
          foodItemId: 'item-4',
          name: 'Telangana Bagara Rice with Natukodi Pulusu',
          teluguName: 'బగారా రైస్ & నాటుకోడి పులుసు',
          price: 320,
          unit: '1 plate',
          quantity: 2,
          itemTotal: 640,
          imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
          isVeg: false,
          spiceLevel: 5,
        }
      ],
      subtotal: 640,
      deliveryFee: 0,
      packagingFee: 20,
      discount: 0,
      total: 660,
      menuDate: today,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      razorpayPaymentId: 'pay_MOK_987654323',
      orderStatus: 'OUT_FOR_DELIVERY',
      statusHistory: [
        { status: 'PENDING', timestamp: new Date(Date.now() - 14400000).toISOString() },
        { status: 'CONFIRMED', timestamp: new Date(Date.now() - 14000000).toISOString() },
        { status: 'PREPARING', timestamp: new Date(Date.now() - 10000000).toISOString() },
        { status: 'READY', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { status: 'OUT_FOR_DELIVERY', timestamp: new Date(Date.now() - 1200000).toISOString(), note: 'Assigned to delivery executive Venkatesh (+91 91234 56789)' },
      ],
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      updatedAt: new Date(Date.now() - 1200000).toISOString(),
    }
  ];
}

// Database Engine Class
class KitchenDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return parsed;
      }
    } catch (err) {
      console.error('Error reading kitchen DB, initializing fresh:', err);
    }

    // Default seeded database
    const initialDb: DatabaseSchema = {
      foodItems: seedFoodItems,
      menus: generateSeedMenus(seedFoodItems),
      orders: generateSeedOrders(),
      categories: defaultCategories,
      units: defaultUnits,
      settings: defaultSettings,
      adminCredentials: {
        username: 'admin',
        passwordHash: 'admin123', // Demo credentials: user 'admin', pass 'admin123'
        name: 'Amma Chef & Kitchen Admin',
        role: 'superadmin',
      },
    };

    this.saveData(initialDb);
    return initialDb;
  }

  private saveData(dataToSave: DatabaseSchema = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving kitchen DB:', err);
    }
  }

  // --- FOOD ITEMS ---
  public getFoodItems(): FoodItem[] {
    return this.data.foodItems;
  }

  public getFoodItemById(id: string): FoodItem | undefined {
    return this.data.foodItems.find(item => item.id === id);
  }

  public createFoodItem(item: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>): FoodItem {
    const newItem: FoodItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      remainingStock: item.availableQuantity,
      status: item.availableQuantity <= 0 ? 'SOLD_OUT' : (item.status || 'AVAILABLE'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.foodItems.unshift(newItem);
    this.saveData();
    return newItem;
  }

  public updateFoodItem(id: string, updates: Partial<FoodItem>): FoodItem | null {
    const index = this.data.foodItems.findIndex(i => i.id === id);
    if (index === -1) return null;

    const current = this.data.foodItems[index];
    const updated: FoodItem = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Auto calculate stock status if quantity changed
    if (updated.remainingStock <= 0) {
      updated.status = 'SOLD_OUT';
    } else if (updated.remainingStock <= 5 && updated.status !== 'HIDDEN') {
      updated.status = 'LOW_STOCK';
    } else if (updated.remainingStock > 5 && updated.status === 'SOLD_OUT') {
      updated.status = 'AVAILABLE';
    }

    this.data.foodItems[index] = updated;
    this.saveData();
    return updated;
  }

  public deleteFoodItem(id: string): boolean {
    const prevLen = this.data.foodItems.length;
    this.data.foodItems = this.data.foodItems.filter(i => i.id !== id);
    if (this.data.foodItems.length !== prevLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- MENU MANAGEMENT ---
  public getMenuByDate(dateStr: string): DayMenu {
    if (!this.data.menus[dateStr]) {
      // Create empty/default menu for this date automatically
      const d = new Date(dateStr + 'T00:00:00');
      const isTomorrow = dateStr === getTomorrowDate();
      const isToday = dateStr === getTodayDate();

      const newMenu: DayMenu = {
        id: `menu-${dateStr}`,
        date: dateStr,
        displayDate: isNaN(d.getTime()) 
          ? dateStr 
          : d.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        title: isTomorrow 
          ? "Tomorrow's Grand Feast Menu" 
          : isToday 
          ? "Today's Fresh Kitchen Menu" 
          : `Special Menu for ${dateStr}`,
        note: 'Freshly prepared tomorrow morning.',
        isPublished: true,
        isAcceptingOrders: true,
        cutoffTime: '11:00 PM',
        items: this.data.foodItems.map((item, idx) => ({
          foodItemId: item.id,
          availableQuantity: item.availableQuantity,
          remainingStock: item.availableQuantity,
          maxOrderQty: item.maxOrderQty,
          status: item.status,
          sortOrder: idx,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.data.menus[dateStr] = newMenu;
      this.saveData();
    }
    return this.data.menus[dateStr];
  }

  public saveMenu(dateStr: string, menuUpdates: Partial<DayMenu>): DayMenu {
    const existing = this.getMenuByDate(dateStr);
    const updated: DayMenu = {
      ...existing,
      ...menuUpdates,
      date: dateStr,
      updatedAt: new Date().toISOString(),
    };
    this.data.menus[dateStr] = updated;
    this.saveData();
    return updated;
  }

  public duplicateMenu(sourceDateStr: string, targetDateStr: string): DayMenu {
    const sourceMenu = this.getMenuByDate(sourceDateStr);
    const targetD = new Date(targetDateStr + 'T00:00:00');

    const duplicated: DayMenu = {
      id: `menu-${targetDateStr}`,
      date: targetDateStr,
      displayDate: targetD.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      title: `Special Menu for ${targetD.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}`,
      note: sourceMenu.note,
      isPublished: true,
      isAcceptingOrders: true,
      cutoffTime: sourceMenu.cutoffTime || '11:00 PM',
      items: sourceMenu.items.map(item => ({
        ...item,
        remainingStock: item.availableQuantity,
        status: item.availableQuantity > 0 ? 'AVAILABLE' : 'SOLD_OUT',
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.menus[targetDateStr] = duplicated;
    this.saveData();
    return duplicated;
  }

  public getAllMenus(): DayMenu[] {
    return Object.values(this.data.menus).sort((a, b) => a.date.localeCompare(b.date));
  }

  // --- ORDERS ---
  public getOrders(filters?: { date?: string; status?: OrderStatus; phone?: string }): Order[] {
    let list = this.data.orders;

    if (filters?.date) {
      list = list.filter(o => o.menuDate === filters.date);
    }
    if (filters?.status) {
      list = list.filter(o => o.orderStatus === filters.status);
    }
    if (filters?.phone) {
      list = list.filter(o => o.customer.phone.includes(filters.phone!));
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id || o.orderNumber === id);
  }

  public createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'statusHistory'>): Order {
    // Generate unique order number e.g. TEL-10484
    const seq = 10480 + this.data.orders.length + Math.floor(Math.random() * 10) + 1;
    const orderNumber = `TEL-${seq}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      orderStatus: orderData.orderStatus || 'CONFIRMED',
      statusHistory: [
        {
          status: orderData.orderStatus || 'CONFIRMED',
          timestamp: now,
          note: `Order created via ${orderData.paymentMethod} (${orderData.paymentStatus})`,
        }
      ],
      createdAt: now,
      updatedAt: now,
    };

    // Deduct stock from the day's menu and master items
    const menuDate = newOrder.menuDate;
    const targetMenu = this.data.menus[menuDate];

    for (const item of newOrder.items) {
      // 1. Deduct from master item
      const masterItem = this.data.foodItems.find(f => f.id === item.foodItemId);
      if (masterItem) {
        masterItem.remainingStock = Math.max(0, masterItem.remainingStock - item.quantity);
        if (masterItem.remainingStock <= 0) {
          masterItem.status = 'SOLD_OUT';
        } else if (masterItem.remainingStock <= 5) {
          masterItem.status = 'LOW_STOCK';
        }
      }

      // 2. Deduct from day's menu if present
      if (targetMenu && targetMenu.items) {
        const menuItem = targetMenu.items.find(m => m.foodItemId === item.foodItemId);
        if (menuItem) {
          menuItem.remainingStock = Math.max(0, menuItem.remainingStock - item.quantity);
          if (menuItem.remainingStock <= 0) {
            menuItem.status = 'SOLD_OUT';
          } else if (menuItem.remainingStock <= 5) {
            menuItem.status = 'LOW_STOCK';
          }
        }
      }
    }

    this.data.orders.unshift(newOrder);
    this.saveData();
    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: OrderStatus, note?: string, updatedBy: string = 'Admin'): Order | null {
    const order = this.data.orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${status}`,
      updatedBy,
    });

    this.saveData();
    return order;
  }

  // --- DASHBOARD OVERVIEW STATS ---
  public getDashboardStats(): DashboardOverview {
    const today = getTodayDate();
    const tomorrow = getTomorrowDate();

    const todayOrders = this.data.orders.filter(o => o.menuDate === today && o.orderStatus !== 'CANCELLED');
    const tomorrowOrders = this.data.orders.filter(o => o.menuDate === tomorrow && o.orderStatus !== 'CANCELLED');

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const tomorrowRevenue = tomorrowOrders.reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = this.data.orders.filter(o => o.orderStatus === 'PENDING' || o.orderStatus === 'PAYMENT_PENDING').length;
    const preparingOrders = this.data.orders.filter(o => o.orderStatus === 'PREPARING' || o.orderStatus === 'CONFIRMED').length;
    const completedOrders = this.data.orders.filter(o => o.orderStatus === 'DELIVERED').length;

    const soldOutCount = this.data.foodItems.filter(i => i.status === 'SOLD_OUT' || i.remainingStock <= 0).length;
    const lowStockCount = this.data.foodItems.filter(i => i.status === 'LOW_STOCK' || (i.remainingStock > 0 && i.remainingStock <= 5)).length;

    // Item popularity calculation
    const itemMap = new Map<string, { name: string; count: number; revenue: number }>();
    for (const order of this.data.orders) {
      if (order.orderStatus === 'CANCELLED') continue;
      for (const it of order.items) {
        const curr = itemMap.get(it.name) || { name: it.name, count: 0, revenue: 0 };
        curr.count += it.quantity;
        curr.revenue += it.itemTotal;
        itemMap.set(it.name, curr);
      }
    }

    const topItems = Array.from(itemMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      todayOrdersCount: todayOrders.length,
      tomorrowOrdersCount: tomorrowOrders.length,
      todayRevenue,
      tomorrowRevenue,
      pendingOrdersCount: pendingOrders,
      preparingOrdersCount: preparingOrders,
      completedOrdersCount: completedOrders,
      soldOutItemsCount: soldOutCount,
      lowStockItemsCount: lowStockCount,
      recentOrders: this.data.orders.slice(0, 8),
      topItems,
    };
  }

  // --- SETTINGS ---
  public getSettings(): KitchenSettings {
    return this.data.settings;
  }

  public updateSettings(settingsUpdates: Partial<KitchenSettings>): KitchenSettings {
    this.data.settings = {
      ...this.data.settings,
      ...settingsUpdates,
    };
    this.saveData();
    return this.data.settings;
  }

  // --- CATEGORIES & UNITS ---
  public getCategories(): string[] {
    return this.data.categories;
  }

  public addCategory(cat: string): string[] {
    if (!this.data.categories.includes(cat.trim())) {
      this.data.categories.push(cat.trim());
      this.saveData();
    }
    return this.data.categories;
  }

  public getUnits(): string[] {
    return this.data.units;
  }

  public addUnit(unit: string): string[] {
    if (!this.data.units.includes(unit.trim())) {
      this.data.units.push(unit.trim());
      this.saveData();
    }
    return this.data.units;
  }

  // --- ADMIN AUTH ---
  public verifyAdmin(username: string, pass: string) {
    if (
      username === this.data.adminCredentials.username &&
      pass === this.data.adminCredentials.passwordHash
    ) {
      return {
        id: 'adm-1',
        username: this.data.adminCredentials.username,
        name: this.data.adminCredentials.name,
        role: this.data.adminCredentials.role,
        token: `admin_session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      };
    }
    return null;
  }
}

// Global Singleton pattern to avoid re-init during Next.js hot reloads
const globalForDb = globalThis as unknown as { kitchenDb?: KitchenDatabase };
export const db = globalForDb.kitchenDb ?? new KitchenDatabase();
if (process.env.NODE_ENV !== 'production') globalForDb.kitchenDb = db;

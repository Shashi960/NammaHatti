import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';
import { ShopModel } from '../models/Shop';
import { CategoryModel } from '../models/Category';
import { ProductModel } from '../models/Product';
import { TravellerTripModel } from '../models/TravellerTrip';
import { RoutePoolModel } from '../models/RoutePool';
import { OrderModel } from '../models/Order';
import { KYCVerificationModel } from '../models/KYCVerification';
import { PartnerLocalityModel } from '../models/PartnerLocality';
import { BusinessRulesModel } from '../models/BusinessRules';
import { createLocation } from '../types/location';
import { INITIAL_CATEGORIES } from '../lib/categories';
import { DEFAULT_BUSINESS_RULES } from '../types/businessRules';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/localmesh';

async function seed() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  console.log('Clearing existing collections...');
  await Promise.all([
    UserModel.deleteMany({}),
    ShopModel.deleteMany({}),
    CategoryModel.deleteMany({}),
    ProductModel.deleteMany({}),
    TravellerTripModel.deleteMany({}),
    RoutePoolModel.deleteMany({}),
    OrderModel.deleteMany({}),
    KYCVerificationModel.deleteMany({}),
    PartnerLocalityModel.deleteMany({}),
    BusinessRulesModel.deleteMany({}),
  ]);

  console.log('Seeding Business Rules...');
  await BusinessRulesModel.create(DEFAULT_BUSINESS_RULES);

  console.log('Seeding Categories...');
  const categoryDocs = await CategoryModel.insertMany(INITIAL_CATEGORIES);
  const catMap = new Map<string, string>(categoryDocs.map((c) => [c.slug, c.name]));

  const passwordHash = await bcrypt.hash('demo1234', 10);

  console.log('Seeding Standard Demo Users...');
  // 1. Admin
  const adminUser = await UserModel.create({
    name: 'Admin Supervisor',
    email: 'admin@demo.local',
    passwordHash,
    phone: '+91 9000000001',
    role: 'ADMIN',
    status: 'ACTIVE',
  });

  // 2. Primary Demo Customer
  const primaryCustomer = await UserModel.create({
    name: 'Sarah Jenkins',
    email: 'customer@demo.local',
    passwordHash,
    phone: '+91 9000000002',
    role: 'CUSTOMER',
    status: 'ACTIVE',
  });

  // 9 additional fictional customers
  const customers = [primaryCustomer];
  const customerNames = [
    'Arun Kumar',
    'Priya Sharma',
    'David Miller',
    'Anita Patel',
    'Marcus Chen',
    'Fatima Al-Mansoor',
    'Rohan Nair',
    'Elena Rostova',
    'Vikram Seth',
  ];

  for (let i = 0; i < customerNames.length; i++) {
    const cust = await UserModel.create({
      name: customerNames[i],
      email: `customer${i + 2}@demo.local`,
      passwordHash,
      phone: `+91 900000001${i}`,
      role: 'CUSTOMER',
      status: 'ACTIVE',
    });
    customers.push(cust);
  }

  // 3. Primary Demo Shop Owner
  const primaryShopOwner = await UserModel.create({
    name: 'Rajesh Hardware Owner',
    email: 'shop@demo.local',
    passwordHash,
    phone: '+91 9000000003',
    role: 'SHOP',
    status: 'ACTIVE',
  });

  // 9 additional fictional shop owners
  const shopOwners = [primaryShopOwner];
  for (let i = 2; i <= 10; i++) {
    const owner = await UserModel.create({
      name: `Merchant Owner ${i}`,
      email: `shop${i}@demo.local`,
      passwordHash,
      phone: `+91 900000020${i}`,
      role: 'SHOP',
      status: 'ACTIVE',
    });
    shopOwners.push(owner);
  }

  // 4. Primary Demo Traveller
  const primaryTraveller = await UserModel.create({
    name: 'Karthik Traveller',
    email: 'traveller@demo.local',
    passwordHash,
    phone: '+91 9000000004',
    role: 'TRAVELLER',
    status: 'ACTIVE',
  });

  // 4 additional fictional travellers
  const travellers = [primaryTraveller];
  const travellerNames = ['Suresh Commuter', 'Meera Route Rider', 'John Transit', 'Deepak Courier'];
  for (let i = 0; i < travellerNames.length; i++) {
    const trav = await UserModel.create({
      name: travellerNames[i],
      email: `traveller${i + 2}@demo.local`,
      passwordHash,
      phone: `+91 900000030${i}`,
      role: 'TRAVELLER',
      status: 'ACTIVE',
    });
    travellers.push(trav);
  }

  console.log('Seeding Traveller KYC and Locality Verifications...');
  for (let i = 0; i < travellers.length; i++) {
    const trav = travellers[i];
    await KYCVerificationModel.create({
      partnerId: trav._id.toString(),
      status: 'VERIFIED',
      providerName: 'MockKYCProvider',
      providerReferenceId: `KYC-VERIF-${1000 + i}`,
      documentType: 'GOVERNMENT_ID',
      verifiedAt: new Date(),
      reviewedBy: 'admin@demo.local',
    });

    const lat = 12.9716 + (i * 0.005);
    const lng = 77.5946 + (i * 0.006);

    await PartnerLocalityModel.create({
      partnerId: trav._id.toString(),
      localityName: `Sector ${i + 1} Residential Zone`,
      city: 'Metro Alpha',
      district: 'Central District',
      state: 'State Alpha',
      postalCode: `56000${i + 1}`,
      centroid: {
        latitude: lat,
        longitude: lng,
        geoJSON: { type: 'Point', coordinates: [lng, lat] },
      },
      radiusKm: 5, // Default 5km, capped at 7km
      verifiedAt: new Date(),
      verifiedBy: 'admin@demo.local',
      history: [],
    });
  }

  console.log('Seeding 10 Fictional Local Shops...');
  const shopDataList = [
    {
      name: 'Apex Tools & Electricals',
      category: 'Electrical Supplies',
      desc: 'High grade electrical switches, cables, capacitors and submersible pumps',
      lat: 12.9720,
      lng: 77.5950,
      city: 'Metro Alpha',
      address: 'Shop 12, Main Bazaar, Sector 1',
    },
    {
      name: 'Green Field Agro Provisions',
      category: 'Agriculture & Farm',
      desc: 'Organic farm seeds, bio-fertilizers, sprinkler valves and small farm tools',
      lat: 12.9740,
      lng: 77.5980,
      city: 'Metro Alpha',
      address: 'Plot 4, Market Yard, Sector 2',
    },
    {
      name: 'Sunrise Daily Supermarket',
      category: 'Grocery & Essentials',
      desc: 'Fresh pulses, edible oils, whole spices, flour and daily household provisions',
      lat: 12.9690,
      lng: 77.5910,
      city: 'Metro Alpha',
      address: '22 Cross Road, West Block, Sector 3',
    },
    {
      name: 'Pioneer Hardware & Plumbing',
      category: 'Hardware & Tools',
      desc: 'Heavy duty drill bits, galvanized pipes, ball valves and pipe sealants',
      lat: 12.9780,
      lng: 77.6020,
      city: 'Metro Alpha',
      address: '88 Industrial Hub, North Corridor',
    },
    {
      name: 'Artisan Oven Bakery',
      category: 'Bakery & Snacks',
      desc: 'Freshly baked whole wheat breads, cookies, tea rusks and tea-time snacks',
      lat: 12.9660,
      lng: 77.5880,
      city: 'Metro Alpha',
      address: 'Corner Street 5, Old Market',
    },
    {
      name: 'Speedy Auto Parts & Spares',
      category: 'Automobile & Spares',
      desc: 'Spark plugs, drive belts, engine oils, LED indicators and mirrors',
      lat: 12.9750,
      lng: 77.6090,
      city: 'Town Beta',
      address: 'Auto Complex, Highway Junction, Sector 5',
    },
    {
      name: 'Modern Electronic Components',
      category: 'Mobile & Electronics',
      desc: 'Multi-pin adapters, high speed cables, testing meters and soldering accessories',
      lat: 12.9620,
      lng: 77.5850,
      city: 'Metro Alpha',
      address: 'Tech Plaza, Ground Floor, Sector 2',
    },
    {
      name: 'Shree Krishna Textiles & Fabrics',
      category: 'Clothing & Textiles',
      desc: 'Cotton bedsheets, handloom towels, work uniforms and tailor materials',
      lat: 12.9810,
      lng: 77.6150,
      city: 'Town Beta',
      address: 'Cloth Market Gate 2, Central Town',
    },
    {
      name: 'Vikas Books & Office Stationery',
      category: 'Stationery & Books',
      desc: 'Engineering notebooks, drawing sheets, marker pens and office files',
      lat: 12.9705,
      lng: 77.5930,
      city: 'Metro Alpha',
      address: 'College Road, Opposite Campus Gate',
    },
    {
      name: 'Comfort Home Appliance Repairs',
      category: 'Household Goods',
      desc: 'Mixer jars, water filter cartridges, electric kettle elements and fan spares',
      lat: 12.9735,
      lng: 77.5975,
      city: 'Metro Alpha',
      address: 'Utility Lane, Commercial Complex',
    },
  ];

  const shops: any[] = [];
  for (let i = 0; i < shopDataList.length; i++) {
    const s = shopDataList[i];
    const loc = createLocation({
      formattedAddress: s.address,
      latitude: s.lat,
      longitude: s.lng,
      city: s.city,
      district: 'Central District',
      state: 'State Alpha',
      postalCode: `56000${i + 1}`,
      landmark: 'Near City Landmark',
    });

    const shop = await ShopModel.create({
      ownerId: shopOwners[i]._id.toString(),
      businessName: s.name,
      contactName: shopOwners[i].name,
      phone: shopOwners[i].phone,
      email: shopOwners[i].email,
      category: s.category,
      description: s.desc,
      address: s.address,
      openingTime: '08:00',
      closingTime: '21:00',
      minOrderAmount: i % 2 === 0 ? 0 : 50,
      location: loc,
      verificationStatus: 'VERIFIED',
      rating: 4.6 + (i % 4) * 0.1,
      reviewCount: 12 + i * 3,
    });

    await UserModel.findByIdAndUpdate(shopOwners[i]._id, { shopId: shop._id.toString() });
    shops.push(shop);
  }

  console.log('Seeding 35+ Physical Products across shops...');
  const sampleProducts = [
    // Shop 0: Apex Tools & Electricals
    { shopIdx: 0, name: '0.5 HP Submersible Water Pump', cat: 'electrical', price: 2850, discount: 2650, stock: 8, unit: 'piece', weight: 4.5, sku: 'ELEC-PUMP-05' },
    { shopIdx: 0, name: 'Copper Submersible Cable 3-Core (10m)', cat: 'electrical', price: 650, stock: 25, unit: 'bundle', weight: 1.8, sku: 'ELEC-CBL-10M' },
    { shopIdx: 0, name: 'Heavy Duty Modular MCB 32A', cat: 'electrical', price: 240, stock: 40, unit: 'piece', weight: 0.3, sku: 'ELEC-MCB-32A' },
    { shopIdx: 0, name: 'Multi-outlet Surge Extension Cord', cat: 'electrical', price: 420, stock: 15, unit: 'piece', weight: 0.6, sku: 'ELEC-EXT-4WAY' },

    // Shop 1: Green Field Agro Provisions
    { shopIdx: 1, name: 'High Yield Tomato Hybrid Seeds (50g)', cat: 'agriculture', price: 180, stock: 50, unit: 'packet', weight: 0.1, sku: 'AGRO-SD-TOM50' },
    { shopIdx: 1, name: 'Organic Vermicompost Soil Fertilizer (5kg)', cat: 'agriculture', price: 220, stock: 30, unit: 'bag', weight: 5.0, sku: 'AGRO-FERT-5KG' },
    { shopIdx: 1, name: 'Brass Drip Irrigation Micro Sprinkler Set', cat: 'agriculture', price: 340, stock: 20, unit: 'set', weight: 0.8, sku: 'AGRO-SPRNK-10' },
    { shopIdx: 1, name: 'Garden Pruning & Branch Shears', cat: 'agriculture', price: 390, stock: 12, unit: 'piece', weight: 0.5, sku: 'AGRO-PRUNE-01' },

    // Shop 2: Sunrise Daily Supermarket
    { shopIdx: 2, name: 'Premium Toor Dal Unpolished (1kg)', cat: 'grocery', price: 175, stock: 45, unit: 'packet', weight: 1.0, sku: 'GROC-DAL-1KG' },
    { shopIdx: 2, name: 'Stone Ground Whole Wheat Atta (5kg)', cat: 'grocery', price: 260, stock: 35, unit: 'bag', weight: 5.0, sku: 'GROC-ATTA-5KG' },
    { shopIdx: 2, name: 'Pure Cold Pressed Mustard Oil (1L)', cat: 'grocery', price: 195, stock: 28, unit: 'bottle', weight: 1.0, sku: 'GROC-OIL-1L' },
    { shopIdx: 2, name: 'Organic Raw Jaggery Cubes (1kg)', cat: 'grocery', price: 120, stock: 22, unit: 'packet', weight: 1.0, sku: 'GROC-JAG-1KG' },

    // Shop 3: Pioneer Hardware & Plumbing
    { shopIdx: 3, name: 'PVC Brass Threaded Elbow Connector 1-inch', cat: 'hardware', price: 85, stock: 60, unit: 'piece', weight: 0.2, sku: 'PLUMB-ELB-1IN' },
    { shopIdx: 3, name: 'Heavy Duty 5-Meter Measuring Tape', cat: 'hardware', price: 150, stock: 30, unit: 'piece', weight: 0.3, sku: 'HARD-TAPE-5M' },
    { shopIdx: 3, name: 'Waterproof Thread Seal Teflon Tape (Pack of 5)', cat: 'hardware', price: 95, stock: 80, unit: 'pack', weight: 0.1, sku: 'PLUMB-TEFLON-5' },
    { shopIdx: 3, name: 'Cast Iron Pipe Wrench 12-inch', cat: 'hardware', price: 480, stock: 10, unit: 'piece', weight: 1.4, sku: 'HARD-WRNCH-12' },

    // Shop 4: Artisan Oven Bakery
    { shopIdx: 4, name: 'Traditional Handcrafted Milk Rusk (400g)', cat: 'bakery', price: 85, stock: 25, unit: 'pack', weight: 0.4, sku: 'BAKE-RUSK-400' },
    { shopIdx: 4, name: 'Pure Honey Almond Butter Cookies (250g)', cat: 'bakery', price: 160, stock: 18, unit: 'box', weight: 0.3, sku: 'BAKE-ALM-250' },
    { shopIdx: 4, name: 'Multigrain Artisan Toast Bread (400g)', cat: 'bakery', price: 55, stock: 15, unit: 'loaf', weight: 0.4, sku: 'BAKE-BRD-MULTI' },

    // Shop 5: Speedy Auto Parts
    { shopIdx: 5, name: '4T 10W-30 Motorcycle Engine Oil (1L)', cat: 'automobile', price: 420, stock: 20, unit: 'bottle', weight: 1.0, sku: 'AUTO-OIL-1L' },
    { shopIdx: 5, name: 'Universal Dual USB Bike Charger with Mount', cat: 'automobile', price: 290, stock: 14, unit: 'piece', weight: 0.2, sku: 'AUTO-CHRG-MNT' },
    { shopIdx: 5, name: 'Two-Wheeler Disc Brake Pad Set', cat: 'automobile', price: 310, stock: 16, unit: 'set', weight: 0.3, sku: 'AUTO-BRK-PAD' },

    // Shop 6: Modern Electronic Components
    { shopIdx: 6, name: '65W Fast GaN Type-C Charger Adapter', cat: 'electronics', price: 890, discount: 799, stock: 15, unit: 'piece', weight: 0.3, sku: 'ELEC-GAN-65W' },
    { shopIdx: 6, name: 'Braided 100W PD Type-C Cable (2m)', cat: 'electronics', price: 240, stock: 35, unit: 'piece', weight: 0.1, sku: 'ELEC-CBL-2M' },
    { shopIdx: 6, name: 'Digital Multimeter Voltage Tester', cat: 'electronics', price: 460, stock: 12, unit: 'piece', weight: 0.4, sku: 'ELEC-MTR-DGT' },

    // Shop 7: Shree Krishna Textiles
    { shopIdx: 7, name: '100% Pure Cotton Queen Bedsheet with 2 Pillows', cat: 'clothing', price: 680, stock: 14, unit: 'set', weight: 1.2, sku: 'TEXT-BED-QN' },
    { shopIdx: 7, name: 'Quick Dry Woven Bath Towels (Pack of 2)', cat: 'clothing', price: 380, stock: 22, unit: 'pack', weight: 0.7, sku: 'TEXT-TWL-2PK' },

    // Shop 8: Vikas Books & Office Stationery
    { shopIdx: 8, name: 'Hardbound Ruled Register Notebook (300 pgs)', cat: 'stationery', price: 140, stock: 40, unit: 'piece', weight: 0.5, sku: 'STAT-REG-300' },
    { shopIdx: 8, name: 'Liquid Gel Roller Pens Assorted (Pack of 10)', cat: 'stationery', price: 190, stock: 50, unit: 'pack', weight: 0.2, sku: 'STAT-PEN-10' },

    // Shop 9: Comfort Home Appliance Repairs
    { shopIdx: 9, name: 'Universal Blender Mixer Coupling & Blade Set', cat: 'household', price: 210, stock: 20, unit: 'set', weight: 0.3, sku: 'HOME-BLD-SET' },
    { shopIdx: 9, name: 'Multi-layer Sediment Water Purifier Candle', cat: 'household', price: 165, stock: 30, unit: 'piece', weight: 0.4, sku: 'HOME-WTR-FLTR' },
  ];

  const products: any[] = [];
  for (const item of sampleProducts) {
    const shop = shops[item.shopIdx];
    const catName = catMap.get(item.cat) || 'General & Others';

    const p = await ProductModel.create({
      shopId: shop._id.toString(),
      name: item.name,
      description: `Authentic local product supplied directly by ${shop.businessName}. Fully certified stock.`,
      categoryId: item.cat,
      categoryName: catName,
      price: item.price,
      discountPrice: item.discount,
      stock: item.stock,
      unit: item.unit,
      sku: item.sku,
      images: ['/placeholder-product.svg'],
      weightKg: item.weight,
      availability: 'IN_STOCK',
    });
    products.push(p);
  }

  console.log('Seeding 20+ Realistically Distributed Customer Orders in Various Lifecycle States...');
  const orderStatuses = [
    'PENDING',
    'SHOP_CONFIRMED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'READY_FOR_PICKUP',
    'READY_FOR_PICKUP', // orders ready for traveller route matching!
    'TRAVELLER_ASSIGNED',
    'PICKED_UP',
    'OUT_FOR_DELIVERY',
    'COMPLETED',
    'COMPLETED',
    'COMPLETED',
  ];

  for (let i = 0; i < 22; i++) {
    const cust = customers[i % customers.length];
    const shop = shops[i % shops.length];
    const prod = products.filter((p) => p.shopId === shop._id.toString())[0] || products[0];

    const destLat = 12.9350 + (i * 0.002);
    const destLng = 77.6240 + (i * 0.003);

    const deliveryLoc = createLocation({
      formattedAddress: `Residential Tower Block ${i + 1}, Sector 7`,
      latitude: destLat,
      longitude: destLng,
      city: 'Town Beta',
      district: 'Outer District',
      state: 'State Alpha',
      postalCode: `56000${(i % 5) + 1}`,
      landmark: 'Near Garden Circle',
    });

    const status = orderStatuses[i % orderStatuses.length];
    const subtotal = prod.price * (1 + (i % 2));
    const deliveryFee = 35;
    const platformFee = Math.round(subtotal * 0.05);
    const travellerEarnings = Math.round(deliveryFee * 0.8);
    const total = subtotal + deliveryFee + platformFee;
    const otp = (100000 + (i * 38291) % 900000).toString();

    const isAssigned = ['TRAVELLER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'COMPLETED'].includes(status);
    const trav = isAssigned ? travellers[i % travellers.length] : null;

    await OrderModel.create({
      orderNumber: `ORD-2026-${1000 + i}`,
      customerId: cust._id.toString(),
      customerName: cust.name,
      customerPhone: cust.phone,
      shopId: shop._id.toString(),
      shopName: shop.businessName,
      shopLocation: shop.location,
      items: [
        {
          productId: prod._id.toString(),
          name: prod.name,
          price: prod.price,
          quantity: 1 + (i % 2),
          unit: prod.unit,
          weightKg: prod.weightKg,
          subtotal,
          imageUrl: '/placeholder-product.svg',
        },
      ],
      subtotal,
      deliveryFee,
      platformFee,
      travellerEarnings,
      total,
      deliveryLocation: deliveryLoc,
      deliveryType: i % 3 === 0 ? 'EXPRESS' : 'STANDARD',
      orderStatus: status,
      paymentStatus: status === 'COMPLETED' ? 'PAID' : 'PENDING',
      paymentMethod: i % 2 === 0 ? 'COD' : 'DEMO_ONLINE',
      deliveryOtp: otp,
      otpAttempts: 0,
      travellerId: trav ? trav._id.toString() : undefined,
      travellerName: trav ? trav.name : undefined,
      isPickedUp: ['PICKED_UP', 'OUT_FOR_DELIVERY', 'COMPLETED'].includes(status),
      deliveredAt: status === 'COMPLETED' ? new Date() : undefined,
      statusHistory: [
        { status: 'PENDING', timestamp: new Date(Date.now() - 3600000 * 4), updatedBy: cust.name, note: 'Order placed' },
        ...(status !== 'PENDING' ? [{ status, timestamp: new Date(), updatedBy: 'system', note: `Updated to ${status}` }] : []),
      ],
    });
  }

  console.log('Seeding Sample Route Pool for Traveller Demonstration...');
  const poolOrigin = shops[0].location;
  const poolDest = createLocation({
    formattedAddress: 'Outer Ring Highway Terminal, Hub Beta',
    latitude: 12.9350,
    longitude: 77.6240,
    city: 'Town Beta',
    district: 'Outer District',
  });

  const readyOrders: any[] = await OrderModel.find({ orderStatus: 'READY_FOR_PICKUP' }).limit(3).lean();
  const poolOrderIds = readyOrders.map((o: any) => o._id.toString());

  await RoutePoolModel.create({
    poolCode: 'POOL-DEMO-01',
    travellerId: primaryTraveller._id.toString(),
    travellerName: primaryTraveller.name,
    origin: poolOrigin,
    destination: poolDest,
    orderIds: poolOrderIds,
    pickupStops: [
      {
        shopId: shops[0]._id.toString(),
        shopName: shops[0].businessName,
        shopAddress: shops[0].address,
        location: shops[0].location,
        orderIds: poolOrderIds.slice(0, 2),
        packageCount: 2,
        isPickedUp: false,
      },
    ],
    packageCount: poolOrderIds.length,
    totalWeightKg: 4.5,
    status: 'OPEN',
    estimatedExtraTimeMinutes: 18,
    estimatedEarnings: 84,
  });

  console.log('================================================================');
  console.log('✅ SEEDING COMPLETE SUCCESSFULLY!');
  console.log('Fictional Entities Created:');
  console.log('- 10 Shops (100% verified, geographic locations in Metro Alpha & Town Beta)');
  console.log('- 35+ Physical Products with stock, weights, SKUs');
  console.log('- 10 Customers (primary: customer@demo.local)');
  console.log('- 5 KYC Verified Travellers (primary: traveller@demo.local, bound to locality centroid)');
  console.log('- 22 Orders in varied lifecycle states (PENDING -> READY_FOR_PICKUP -> COMPLETED)');
  console.log('- 1 Demonstration Route Pool (POOL-DEMO-01)');
  console.log('Credentials for all demo accounts: password = "demo1234"');
  console.log('================================================================');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST() {
  try {
    // Clean up all existing data (in reverse dependency order)
    await db.salarySlip.deleteMany()
    await db.leave.deleteMany()
    await db.attendance.deleteMany()
    await db.task.deleteMany()
    await db.serviceRequest.deleteMany()
    await db.amcContract.deleteMany()
    await db.quotation.deleteMany()
    await db.lead.deleteMany()
    await db.orderItem.deleteMany()
    await db.order.deleteMany()
    await db.cartItem.deleteMany()
    await db.wishlistItem.deleteMany()
    await db.productImage.deleteMany()
    await db.product.deleteMany()
    await db.category.deleteMany()
    await db.inquiry.deleteMany()
    await db.activityLog.deleteMany()
    await db.employee.deleteMany()
    await db.user.deleteMany()
    await db.setting.deleteMany()
    await db.role.deleteMany()

    // ── Roles ──
    const roles = await Promise.all([
      db.role.create({ data: { roleName: 'admin', permissions: JSON.stringify(['all']) } }),
      db.role.create({ data: { roleName: 'manager', permissions: JSON.stringify(['products', 'orders', 'leads', 'quotations', 'employees', 'reports']) } }),
      db.role.create({ data: { roleName: 'employee', permissions: JSON.stringify(['tasks', 'attendance', 'leaves']) } }),
      db.role.create({ data: { roleName: 'customer', permissions: JSON.stringify(['orders', 'cart', 'wishlist', 'service_requests']) } }),
    ])

    const [adminRole, managerRole, employeeRole, customerRole] = roles

    // ── Users ──
    const adminPwd = await hashPassword('admin123')
    const managerPwd = await hashPassword('manager123')
    const employeePwd = await hashPassword('employee123')
    const customerPwd = await hashPassword('customer123')

    const admin = await db.user.create({
      data: { name: 'Rajesh Kumar', email: 'admin@urbankitchens.com', phone: '+91-9876543210', password: adminPwd, roleId: adminRole.id, status: 'active', emailVerified: true },
    })

    const managers = await Promise.all([
      db.user.create({ data: { name: 'Priya Sharma', email: 'priya@urbankitchens.com', phone: '+91-9876543211', password: managerPwd, roleId: managerRole.id, status: 'active', emailVerified: true } }),
      db.user.create({ data: { name: 'Amit Patel', email: 'amit@urbankitchens.com', phone: '+91-9876543212', password: managerPwd, roleId: managerRole.id, status: 'active', emailVerified: true } }),
    ])

    const employees = await Promise.all([
      db.user.create({ data: { name: 'Suresh Reddy', email: 'suresh@urbankitchens.com', phone: '+91-9876543213', password: employeePwd, roleId: employeeRole.id, status: 'active', emailVerified: true } }),
      db.user.create({ data: { name: 'Kavita Nair', email: 'kavita@urbankitchens.com', phone: '+91-9876543214', password: employeePwd, roleId: employeeRole.id, status: 'active', emailVerified: true } }),
      db.user.create({ data: { name: 'Ravi Singh', email: 'ravi@urbankitchens.com', phone: '+91-9876543215', password: employeePwd, roleId: employeeRole.id, status: 'active', emailVerified: true } }),
    ])

    const customers = await Promise.all([
      db.user.create({ data: { name: 'Anand Restaurant', email: 'anand@restaurant.com', phone: '+91-9123456701', password: customerPwd, roleId: customerRole.id, status: 'active', emailVerified: true } }),
      db.user.create({ data: { name: 'Hotel Sunrise', email: 'info@hotelsunrise.com', phone: '+91-9123456702', password: customerPwd, roleId: customerRole.id, status: 'active', emailVerified: true } }),
      db.user.create({ data: { name: 'Spice Garden Catering', email: 'orders@spicegarden.com', phone: '+91-9123456703', password: customerPwd, roleId: customerRole.id, status: 'active', emailVerified: true } }),
      db.user.create({ data: { name: 'Grand Palace Hotel', email: 'purchase@grandpalace.com', phone: '+91-9123456704', password: customerPwd, roleId: customerRole.id, status: 'active', emailVerified: true } }),
      db.user.create({ data: { name: 'Quick Bites Cafe', email: 'hello@quickbites.com', phone: '+91-9123456705', password: customerPwd, roleId: customerRole.id, status: 'active', emailVerified: true } }),
    ])

    // ── Categories ──
    const categories = await Promise.all([
      db.category.create({ data: { name: 'Commercial Burners', slug: 'commercial-burners' } }),
      db.category.create({ data: { name: 'Cooking Ranges', slug: 'cooking-ranges' } }),
      db.category.create({ data: { name: 'Refrigeration', slug: 'refrigeration' } }),
      db.category.create({ data: { name: 'Food Preparation', slug: 'food-preparation' } }),
      db.category.create({ data: { name: 'Dishwashing', slug: 'dishwashing' } }),
      db.category.create({ data: { name: 'Display Counters', slug: 'display-counters' } }),
    ])

    const [catBurners, catRanges, catRefrigeration, catPrep, catDishwash, catDisplay] = categories

    // ── Products (4 per category = 24 total) ──
    const productsData = [
      // Commercial Burners
      { categoryId: catBurners.id, name: 'Ultra Flame 4-Burner Commercial Range', slug: 'ultra-flame-4-burner', description: 'High-efficiency 4-burner commercial gas range with heavy-duty cast iron grates and pilotless ignition system. Ideal for busy restaurant kitchens requiring consistent heat output.', shortDescription: '4-burner commercial gas range with cast iron grates', price: 45000, steelGrade: 'SS304', capacity: '4 Burners', dimensions: '1200 x 700 x 850 mm', stock: 15, leadTime: '5-7 days', featured: true },
      { categoryId: catBurners.id, name: 'Inferno Pro 6-Burner Heavy Duty Range', slug: 'inferno-pro-6-burner', description: 'Industrial-grade 6-burner range with individual flame control, stainless steel body, and heat-resistant knobs. Built for continuous high-volume cooking operations.', shortDescription: '6-burner heavy duty gas range for high volume', price: 78000, steelGrade: 'SS316', capacity: '6 Burners', dimensions: '1800 x 700 x 850 mm', stock: 8, leadTime: '7-10 days', featured: true },
      { categoryId: catBurners.id, name: 'Blaze 2-Burner Table Top Range', slug: 'blaze-2-burner-tabletop', description: 'Compact 2-burner table top range perfect for small kitchens, food trucks, and takeaway counters. Features durable SS202 body and easy-clean drip trays.', shortDescription: 'Compact 2-burner tabletop range', price: 18500, steelGrade: 'SS202', capacity: '2 Burners', dimensions: '600 x 500 x 300 mm', stock: 25, leadTime: '3-5 days', featured: false },
      { categoryId: catBurners.id, name: 'Dragon Fire Chinese Wok Burner', slug: 'dragon-fire-wok-burner', description: 'High-pressure wok burner designed for Chinese and Asian cooking. Delivers intense heat for stir-frying with a specially designed wok cradle and wind guard.', shortDescription: 'High-pressure wok burner for Asian cooking', price: 32000, steelGrade: 'SS304', capacity: 'Single Wok', dimensions: '500 x 500 x 900 mm', stock: 12, leadTime: '5-7 days', featured: false },

      // Cooking Ranges
      { categoryId: catRanges.id, name: 'Chef Master 4-Burner with Oven', slug: 'chef-master-4-burner-oven', description: 'Versatile 4-burner cooking range with built-in oven for baking and roasting. Features thermostat-controlled oven, heavy-duty grates, and splash guard.', shortDescription: '4-burner range with built-in oven', price: 95000, steelGrade: 'SS304', capacity: '4 Burners + Oven', dimensions: '1200 x 700 x 900 mm', stock: 6, leadTime: '10-14 days', featured: true },
      { categoryId: catRanges.id, name: 'Titan 6-Burner with Griddle & Oven', slug: 'titan-6-burner-griddle-oven', description: 'Premium 6-burner range featuring a smooth griddle plate and convection oven. Designed for hotels and large catering operations requiring multi-zone cooking.', shortDescription: '6-burner with griddle and convection oven', price: 165000, steelGrade: 'SS316', capacity: '6 Burners + Griddle + Oven', dimensions: '2100 x 750 x 900 mm', stock: 4, leadTime: '14-21 days', featured: true },
      { categoryId: catRanges.id, name: 'Steam Pro Commercial Steamer Range', slug: 'steam-pro-steamer', description: 'Multi-tier steaming range for idli, momo, and dim sum preparation. Stainless steel tiers with individual steam control and efficient boiler system.', shortDescription: 'Multi-tier commercial steamer range', price: 52000, steelGrade: 'SS304', capacity: '6 Tiers', dimensions: '600 x 600 x 1200 mm', stock: 10, leadTime: '7-10 days', featured: false },
      { categoryId: catRanges.id, name: 'Tandoor King Gas Tandoor', slug: 'tandoor-king-gas', description: 'Stainless steel gas tandoor for authentic Indian cooking. Features insulated body, clay lining, and temperature control for perfect naan and tandoori items.', shortDescription: 'Gas tandoor for authentic Indian cooking', price: 38000, steelGrade: 'SS304', capacity: '20 Naan Capacity', dimensions: '500 x 500 x 1000 mm', stock: 9, leadTime: '7-10 days', featured: false },

      // Refrigeration
      { categoryId: catRefrigeration.id, name: 'Arctic Pro 3-Door Refrigerator', slug: 'arctic-pro-3-door-fridge', description: '3-door commercial upright refrigerator with digital temperature control and forced air cooling. 600L capacity with adjustable shelves and self-closing doors.', shortDescription: '3-door commercial upright refrigerator', price: 125000, steelGrade: 'SS304', capacity: '600 Liters', dimensions: '1800 x 700 x 2000 mm', stock: 7, leadTime: '7-10 days', featured: true },
      { categoryId: catRefrigeration.id, name: 'Frost King Walk-In Cold Room', slug: 'frost-king-cold-room', description: 'Modular walk-in cold room with PUF insulated panels and energy-efficient compressor. Customizable size with temperature range from -5°C to +10°C.', shortDescription: 'Modular walk-in cold room', price: 350000, steelGrade: 'SS304', capacity: 'Custom Size', dimensions: 'Customizable', stock: 2, leadTime: '21-30 days', featured: true },
      { categoryId: catRefrigeration.id, name: 'Chill Zone Under-Counter Fridge', slug: 'chill-zone-undercounter', description: 'Compact under-counter refrigerator perfect for bar and café setups. Features 2-door design, 200L capacity, and CFC-free refrigerant.', shortDescription: 'Under-counter refrigerator for bars', price: 48000, steelGrade: 'SS430', capacity: '200 Liters', dimensions: '600 x 600 x 850 mm', stock: 14, leadTime: '5-7 days', featured: false },
      { categoryId: catRefrigeration.id, name: 'Polar Blast Chest Freezer', slug: 'polar-blast-chest-freezer', description: 'Deep chest freezer for bulk storage of frozen foods. Features heavy-duty compressor, lockable lid, and temperature range down to -25°C.', shortDescription: 'Deep chest freezer for bulk storage', price: 55000, steelGrade: 'SS202', capacity: '500 Liters', dimensions: '1500 x 700 x 900 mm', stock: 11, leadTime: '5-7 days', featured: false },

      // Food Preparation
      { categoryId: catPrep.id, name: 'Swift Cut 10L Commercial Mixer', slug: 'swift-cut-10l-mixer', description: '10-liter planetary mixer with 3-speed settings for dough, batter, and whipping. Includes stainless steel bowl, dough hook, beater, and whisk attachments.', shortDescription: '10L planetary mixer with 3 speeds', price: 42000, steelGrade: 'SS304', capacity: '10 Liters', dimensions: '450 x 450 x 750 mm', stock: 10, leadTime: '5-7 days', featured: false },
      { categoryId: catPrep.id, name: 'Precision Cut Meat Slicer', slug: 'precision-cut-meat-slicer', description: 'Professional-grade meat slicer with adjustable thickness from 0-15mm. Features 370W motor, stainless steel blade, and safety guard for commercial use.', shortDescription: 'Professional meat slicer with adjustable thickness', price: 28000, steelGrade: 'SS304', capacity: '250mm Blade', dimensions: '550 x 400 x 400 mm', stock: 13, leadTime: '5-7 days', featured: false },
      { categoryId: catPrep.id, name: 'Power Grind 5HP Commercial Grinder', slug: 'power-grind-5hp-grinder', description: 'Heavy-duty 5HP wet grinder for idli/dosa batter and spice grinding. Features granite stones, overload protection, and easy-tilt mechanism.', shortDescription: '5HP commercial wet grinder', price: 35000, steelGrade: 'SS304', capacity: '20 Liters', dimensions: '600 x 500 x 1000 mm', stock: 8, leadTime: '7-10 days', featured: true },
      { categoryId: catPrep.id, name: 'VegePro 30L Vegetable Cutter', slug: 'vegepro-30l-cutter', description: 'High-capacity vegetable cutter with multiple blade options for slicing, dicing, and shredding. 30L bowl capacity with powerful 1.5HP motor.', shortDescription: '30L vegetable cutter with multiple blades', price: 62000, steelGrade: 'SS304', capacity: '30 Liters', dimensions: '500 x 500 x 900 mm', stock: 6, leadTime: '7-10 days', featured: true },

      // Dishwashing
      { categoryId: catDishwash.id, name: 'Aqua Clean Under-Counter Dishwasher', slug: 'aqua-clean-undercounter-dishwasher', description: 'Compact under-counter commercial dishwasher with 500 racks/hour capacity. Features 2-minute wash cycle, built-in detergent dispenser, and rinse aid injection.', shortDescription: 'Under-counter commercial dishwasher', price: 85000, steelGrade: 'SS304', capacity: '500 Racks/Hr', dimensions: '600 x 600 x 850 mm', stock: 5, leadTime: '7-10 days', featured: false },
      { categoryId: catDishwash.id, name: 'Sparkle Pro Pot & Pan Washer', slug: 'sparkle-pro-pot-washer', description: 'Heavy-duty pot and pan washer designed for large utensils. Features high-pressure wash arms, 4-minute cycle, and built-in water softener.', shortDescription: 'Heavy-duty pot and pan washer', price: 145000, steelGrade: 'SS316', capacity: '30 Baskets/Hr', dimensions: '800 x 750 x 1400 mm', stock: 3, leadTime: '10-14 days', featured: false },
      { categoryId: catDishwash.id, name: 'Fresh Wash 3-Tank Sink Unit', slug: 'fresh-wash-3-tank-sink', description: '3-compartment stainless steel sink unit for manual washing, rinsing, and sanitizing. Features deep bowls, splash back, and adjustable feet.', shortDescription: '3-compartment stainless steel sink unit', price: 22000, steelGrade: 'SS304', capacity: '3 Tanks', dimensions: '1800 x 600 x 850 mm', stock: 20, leadTime: '3-5 days', featured: false },
      { categoryId: catDishwash.id, name: 'Glass Shine Glass Washer', slug: 'glass-shine-glass-washer', description: 'Specialized glass washer for bars and restaurants with gentle wash cycle. Features low-water consumption, rotating wash arms, and quick 90-second cycle.', shortDescription: 'Specialized glass washer for bars', price: 55000, steelGrade: 'SS304', capacity: '800 Glasses/Hr', dimensions: '450 x 500 x 700 mm', stock: 9, leadTime: '5-7 days', featured: false },

      // Display Counters
      { categoryId: catDisplay.id, name: 'Showcase Pro Dry Display Counter', slug: 'showcase-pro-dry-display', description: 'Elegant dry display counter with curved glass and LED lighting. Perfect for showcasing cakes, pastries, and snacks. Features adjustable shelves and temperature control.', shortDescription: 'Dry display counter with LED lighting', price: 68000, steelGrade: 'SS304', capacity: '4 Shelves', dimensions: '1500 x 500 x 1300 mm', stock: 7, leadTime: '7-10 days', featured: true },
      { categoryId: catDisplay.id, name: 'Chill Display 4-Door Refrigerated Counter', slug: 'chill-display-4-door', description: '4-door refrigerated display counter for kebabs, desserts, and cold items. Digital thermostat, forced air cooling, and energy-efficient LED interior lighting.', shortDescription: '4-door refrigerated display counter', price: 155000, steelGrade: 'SS304', capacity: '400 Liters', dimensions: '2000 x 600 x 1300 mm', stock: 4, leadTime: '10-14 days', featured: true },
      { categoryId: catDisplay.id, name: 'Hot Hold Curved Display Counter', slug: 'hot-hold-curved-display', description: 'Heated display counter with curved glass for keeping food warm. Features adjustable temperature, humidifier, and energy-efficient heating elements.', shortDescription: 'Heated display counter with humidifier', price: 82000, steelGrade: 'SS304', capacity: '3 Shelves', dimensions: '1200 x 500 x 1300 mm', stock: 6, leadTime: '7-10 days', featured: false },
      { categoryId: catDisplay.id, name: 'Baker Pride Cake Display Counter', slug: 'baker-pride-cake-display', description: 'Premium cake display counter with 360° visibility, marble base, and refrigerated interior. Perfect for bakeries and patisseries.', shortDescription: 'Premium cake display with marble base', price: 98000, steelGrade: 'SS316', capacity: '3 Tier', dimensions: '1200 x 600 x 1500 mm', stock: 5, leadTime: '10-14 days', featured: false },
    ]

    const products = []
    for (const pData of productsData) {
      const product = await db.product.create({ data: pData })
      products.push(product)
    }

    // ── Orders (8) ──
    const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'delivered', 'cancelled', 'pending']
    const paymentStatuses = ['pending', 'paid', 'paid', 'paid', 'paid', 'paid', 'refunded', 'pending']

    const orders = []
    for (let i = 0; i < 8; i++) {
      const customer = customers[i % customers.length]
      const product1 = products[i * 3 % products.length]
      const product2 = products[(i * 3 + 1) % products.length]
      const qty1 = Math.floor(Math.random() * 3) + 1
      const qty2 = Math.floor(Math.random() * 2) + 1
      const subtotal = product1.price * qty1 + product2.price * qty2
      const tax = Math.round(subtotal * 0.18)
      const shipping = subtotal > 50000 ? 0 : 2500
      const total = subtotal + tax + shipping

      const order = await db.order.create({
        data: {
          customerId: customer.id,
          orderNumber: `ORD-2024-${String(1001 + i)}`,
          subtotal,
          tax,
          shipping,
          total,
          paymentStatus: paymentStatuses[i],
          paymentMethod: i % 3 === 0 ? 'bank_transfer' : i % 3 === 1 ? 'razorpay' : 'cod',
          orderStatus: orderStatuses[i],
          shippingAddress: `${customer.name}, ${['123 MG Road, Mumbai', '456 Brigade Road, Bangalore', '789 Park Street, Kolkata', '321 Anna Salai, Chennai', '654 Sector 18, Noida'][i % 5]}`,
          notes: i === 6 ? 'Customer requested cancellation' : undefined,
          createdAt: new Date(2024, 11 - i, 10 + i),
          items: {
            create: [
              { productId: product1.id, qty: qty1, price: product1.price },
              { productId: product2.id, qty: qty2, price: product2.price },
            ],
          },
        },
      })
      orders.push(order)
    }

    // ── Leads (6) ──
    const leadsData = [
      { name: 'Hotel Royal Orchid', company: 'Royal Orchid Hotels Ltd', phone: '+91-9812345678', email: 'procurement@royalorchid.com', city: 'Bangalore', requirement: 'Complete kitchen setup for 200-room hotel', message: 'Looking for a turnkey kitchen solution including burners, refrigeration, and dishwashing', status: 'negotiation', source: 'referral', assignedTo: managers[0].id },
      { name: 'ITC Grand Chola', company: 'ITC Hotels', phone: '+91-9823456789', email: 'kitchen@itcgrandchola.com', city: 'Chennai', requirement: 'Commercial burners and tandoors', message: 'Need 10 heavy-duty burners and 4 gas tandoors for our new restaurant wing', status: 'quotation_sent', source: 'direct', assignedTo: managers[1].id },
      { name: 'Taj Palace Catering', company: 'Indian Hotels Company', phone: '+91-9834567890', email: 'supply@tajpalace.com', city: 'Mumbai', requirement: 'Walk-in cold room and display counters', message: 'Requirement for 2 walk-in cold rooms and 6 display counters for banquet kitchen', status: 'contacted', source: 'website', assignedTo: managers[0].id },
      { name: 'Café Coffee Day', company: 'Coffee Day Enterprises', phone: '+91-9845678901', email: 'ops@ccd.com', city: 'Bangalore', requirement: 'Under-counter refrigerators', message: 'Bulk order for 50 under-counter fridges across our new outlets', status: 'new', source: 'website' },
      { name: 'Haldiram Foods', company: 'Haldiram Manufacturing', phone: '+91-9856789012', email: 'purchase@haldirams.com', city: 'Delhi', requirement: 'Industrial mixers and grinders', message: 'Need industrial-grade mixers (20L) and wet grinders for our production facility', status: 'won', source: 'referral', assignedTo: managers[1].id },
      { name: 'Biryani House Chain', company: 'Biryani House Pvt Ltd', phone: '+91-9867890123', email: 'setup@biryanihouse.com', city: 'Hyderabad', requirement: 'Dum cooking equipment', message: 'Looking for specialized dum cooking ranges and display counters for 5 new outlets', status: 'lost', source: 'social', assignedTo: managers[0].id },
    ]

    const leads = []
    for (const ld of leadsData) {
      const lead = await db.lead.create({ data: ld })
      leads.push(lead)
    }

    // ── Quotations (3) ──
    const quotationsData = [
      { leadId: leads[0].id, quotationNumber: 'QUO-2024-001', amount: 1850000, items: JSON.stringify([{ item: '6-Burner Heavy Duty Range x4', qty: 4, rate: 78000, total: 312000 }, { item: 'Walk-In Cold Room x2', qty: 2, rate: 350000, total: 700000 }, { item: '3-Door Refrigerator x3', qty: 3, rate: 125000, total: 375000 }, { item: 'Pot & Pan Washer x2', qty: 2, rate: 145000, total: 290000 }, { item: 'Installation & Commissioning', qty: 1, rate: 173000, total: 173000 }]), status: 'sent', validUntil: new Date(2025, 2, 15) },
      { leadId: leads[1].id, quotationNumber: 'QUO-2024-002', amount: 720000, items: JSON.stringify([{ item: '6-Burner Heavy Duty Range x5', qty: 5, rate: 78000, total: 390000 }, { item: 'Gas Tandoor x4', qty: 4, rate: 38000, total: 152000 }, { item: 'Wok Burner x4', qty: 4, rate: 32000, total: 128000 }, { item: 'Delivery & Installation', qty: 1, rate: 50000, total: 50000 }]), status: 'draft', validUntil: new Date(2025, 2, 28) },
      { leadId: leads[4].id, quotationNumber: 'QUO-2024-003', amount: 560000, items: JSON.stringify([{ item: '10L Commercial Mixer x8', qty: 8, rate: 42000, total: 336000 }, { item: '5HP Commercial Grinder x6', qty: 6, rate: 35000, total: 210000 }, { item: 'Service & Support (1 year)', qty: 1, rate: 14000, total: 14000 }]), status: 'accepted', validUntil: new Date(2025, 1, 31) },
    ]

    for (const qd of quotationsData) {
      await db.quotation.create({ data: qd })
    }

    // ── Employees ──
    const employeesData = [
      { userId: employees[0].id, department: 'Production', designation: 'Senior Welder', salary: 28000, joiningDate: new Date(2022, 2, 15), status: 'active' },
      { userId: employees[1].id, department: 'Quality Control', designation: 'QC Inspector', salary: 32000, joiningDate: new Date(2021, 5, 1), status: 'active' },
      { userId: employees[2].id, department: 'Service', designation: 'Field Technician', salary: 25000, joiningDate: new Date(2023, 0, 10), status: 'active' },
    ]
    // Also add employee records for managers
    const managerEmployees = [
      { userId: managers[0].id, department: 'Sales', designation: 'Sales Manager', salary: 55000, joiningDate: new Date(2020, 3, 1), status: 'active' },
      { userId: managers[1].id, department: 'Operations', designation: 'Operations Manager', salary: 52000, joiningDate: new Date(2020, 7, 15), status: 'active' },
    ]

    const empRecords = []
    for (const ed of [...employeesData, ...managerEmployees]) {
      const emp = await db.employee.create({ data: ed })
      empRecords.push(emp)
    }

    // ── AMC Contracts (4) ──
    const amcData = [
      { customerId: customers[0].id, plan: 'Premium', startDate: new Date(2024, 0, 1), endDate: new Date(2025, 5, 30), amount: 75000, status: 'active', coverage: JSON.stringify(['All burners', 'Refrigeration units', 'Dishwashers']) },
      { customerId: customers[1].id, plan: 'Standard', startDate: new Date(2024, 3, 1), endDate: new Date(2025, 2, 31), amount: 45000, status: 'active', coverage: JSON.stringify(['Cooking ranges', 'Display counters']) },
      { customerId: customers[2].id, plan: 'Premium', startDate: new Date(2024, 5, 1), endDate: new Date(2025, 4, 30), amount: 60000, status: 'active', coverage: JSON.stringify(['Complete kitchen equipment', 'Annual deep service']) },
      { customerId: customers[3].id, plan: 'Basic', startDate: new Date(2023, 0, 1), endDate: new Date(2024, 11, 31), amount: 25000, status: 'expired', coverage: JSON.stringify(['Burners only']) },
    ]

    const amcContracts = []
    for (const ad of amcData) {
      const amc = await db.amcContract.create({ data: ad })
      amcContracts.push(amc)
    }

    // ── Service Requests (5) ──
    const serviceData = [
      { customerId: customers[0].id, contractId: amcContracts[0].id, issue: 'Burner flame uneven on 4-burner range', priority: 'medium', assignedTechnician: employees[2].id, status: 'in_progress', resolution: null },
      { customerId: customers[1].id, contractId: amcContracts[1].id, issue: 'Refrigerator compressor making noise', priority: 'high', assignedTechnician: employees[2].id, status: 'open' },
      { customerId: customers[2].id, contractId: amcContracts[2].id, issue: 'Display counter LED lights not working', priority: 'low', status: 'resolved', resolution: 'Replaced LED strip and power supply' },
      { customerId: customers[3].id, contractId: null, issue: 'Grinder motor overheating', priority: 'high', status: 'open' },
      { customerId: customers[4].id, contractId: null, issue: 'Dishwasher not draining properly', priority: 'medium', assignedTechnician: employees[2].id, status: 'in_progress' },
    ]

    for (const sd of serviceData) {
      await db.serviceRequest.create({ data: sd })
    }

    // ── Attendance records ──
    const today = new Date()
    for (const emp of empRecords.slice(0, 3)) {
      for (let d = 0; d < 7; d++) {
        const date = new Date(today)
        date.setDate(date.getDate() - d)
        if (date.getDay() === 0) continue // Skip Sunday
        const checkin = new Date(date)
        checkin.setHours(9, Math.floor(Math.random() * 15), 0)
        const checkout = new Date(date)
        checkout.setHours(18, Math.floor(Math.random() * 30), 0)
        await db.attendance.create({
          data: {
            employeeId: emp.id,
            date,
            checkin,
            checkout: d === 0 ? null : checkout, // Today might not have checkout yet
            status: d === 0 ? 'present' : 'present',
          },
        })
      }
    }

    // ── Tasks ──
    const tasksData = [
      { employeeId: empRecords[0].id, title: 'Fabricate SS304 range body for Order #ORD-2024-1003', description: 'Use 2mm SS304 sheets, follow drawing UK-R-204 standard', priority: 'high', status: 'in_progress', dueDate: new Date(today.getTime() + 3 * 86400000) },
      { employeeId: empRecords[0].id, title: 'Weld burner brackets for 6-burner assembly', description: 'MIG weld with argon shielding, 3 passes minimum', priority: 'medium', status: 'pending', dueDate: new Date(today.getTime() + 5 * 86400000) },
      { employeeId: empRecords[1].id, title: 'Quality check on refrigeration units batch', description: 'Check compressor performance, door seals, and temperature uniformity', priority: 'high', status: 'pending', dueDate: new Date(today.getTime() + 2 * 86400000) },
      { employeeId: empRecords[2].id, title: 'Service visit - Hotel Sunrise burner issue', description: 'Customer reported uneven flame. Carry spare nozzles and regulator kit', priority: 'urgent', status: 'in_progress', dueDate: new Date(today.getTime() + 86400000) },
      { employeeId: empRecords[2].id, title: 'Install display counter at Spice Garden', description: 'Deliver and install Chill Display 4-Door unit, test cooling and lighting', priority: 'medium', status: 'completed', dueDate: new Date(today.getTime() - 86400000) },
    ]

    for (const td of tasksData) {
      await db.task.create({ data: td })
    }

    // ── Salary Slips ──
    for (const emp of empRecords.slice(0, 3)) {
      for (let m = 0; m < 3; m++) {
        const month = new Date(today.getFullYear(), today.getMonth() - 1 - m, 1)
        const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
        const basic = emp.salary * 0.5
        const hra = emp.salary * 0.2
        const allowance = emp.salary * 0.15
        const deduction = emp.salary * 0.1
        const netPay = basic + hra + allowance - deduction
        await db.salarySlip.create({
          data: { employeeId: emp.id, month: monthStr, basic, hra, allowance, deduction, netPay },
        })
      }
    }

    // ── Leaves ──
    await db.leave.create({ data: { employeeId: empRecords[0].id, type: 'casual', startDate: new Date(today.getFullYear(), today.getMonth(), 5), endDate: new Date(today.getFullYear(), today.getMonth(), 6), reason: 'Personal work', status: 'approved' } })
    await db.leave.create({ data: { employeeId: empRecords[1].id, type: 'sick', startDate: new Date(today.getFullYear(), today.getMonth(), 12), endDate: new Date(today.getFullYear(), today.getMonth(), 13), reason: 'Medical appointment', status: 'approved' } })
    await db.leave.create({ data: { employeeId: empRecords[2].id, type: 'earned', startDate: new Date(today.getFullYear(), today.getMonth() + 1, 1), endDate: new Date(today.getFullYear(), today.getMonth() + 1, 5), reason: 'Vacation', status: 'pending' } })

    // ── Inquiries ──
    await db.inquiry.create({ data: { name: 'Rahul Mehta', email: 'rahul@hotel.com', phone: '+91-9901234567', subject: 'Bulk order inquiry', message: 'We are setting up a new restaurant in Pune and need a complete kitchen setup. Please share your catalog and best prices.', status: 'new' } })
    await db.inquiry.create({ data: { name: 'Sunita Joshi', email: 'sunita@catering.com', phone: '+91-9901234568', subject: 'AMC contract details', message: 'Can you share details about your annual maintenance contracts for commercial kitchen equipment?', productId: products[0].id, status: 'read' } })

    // ── Settings ──
    await db.setting.createMany({
      data: [
        { key: 'company_name', value: 'Urban Kitchens Manufacturing & Solutions' },
        { key: 'company_email', value: 'info@urbankitchens.com' },
        { key: 'company_phone', value: '+91-11-45678900' },
        { key: 'company_address', value: 'Plot No. 45, Sector 12, Industrial Area, New Delhi - 110020' },
        { key: 'gst_number', value: '07AABCU9603R1ZM' },
        { key: 'currency', value: 'INR' },
      ],
    })

    return NextResponse.json({
      status: true,
      message: 'Database seeded successfully with comprehensive sample data',
      data: {
        roles: roles.length,
        users: 1 + managers.length + employees.length + customers.length,
        categories: categories.length,
        products: products.length,
        orders: orders.length,
        leads: leads.length,
        quotations: quotationsData.length,
        employees: empRecords.length,
        amcContracts: amcContracts.length,
        serviceRequests: serviceData.length,
        settings: 6,
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to seed database: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: true,
    message: 'Seed endpoint is ready. Send a POST request to seed the database.',
    data: null,
  })
}

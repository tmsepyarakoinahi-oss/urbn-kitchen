import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

async function seedDatabase() {
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
  await db.productVariant.deleteMany()
  await db.product.deleteMany()
  await db.category.deleteMany()
  await db.inquiry.deleteMany()
  await db.activityLog.deleteMany()
  await db.employee.deleteMany()
  // HRM models
  await db.performanceReview.deleteMany()
  await db.appraisal.deleteMany()
  await db.workReport.deleteMany()
  await db.asset.deleteMany()
  await db.trainingProgram.deleteMany()
  await db.shift.deleteMany()
  await db.team.deleteMany()
  await db.jobOpening.deleteMany()
  await db.interview.deleteMany()
  await db.notice.deleteMany()
  await db.holiday.deleteMany()
  await db.designation.deleteMany()
  await db.department.deleteMany()
  // CRM models
  await db.conversationMessage.deleteMany()
  await db.conversation.deleteMany()
  await db.emailSequenceStep.deleteMany()
  await db.emailSequenceEnrollment.deleteMany()
  await db.emailSequence.deleteMany()
  await db.emailTemplate.deleteMany()
  await db.pipelineDeal.deleteMany()
  await db.pipeline.deleteMany()
  await db.company.deleteMany()
  await db.leadSource.deleteMany()
  await db.integration.deleteMany()
  await db.crmForm.deleteMany()
  await db.crmImport.deleteMany()
  await db.user.deleteMany()
  await db.setting.deleteMany()
  await db.role.deleteMany()
  await db.amcQuote.deleteMany()

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
    { categoryId: catBurners.id, name: 'Ultra Flame 4-Burner Commercial Range', slug: 'ultra-flame-4-burner', description: 'High-efficiency 4-burner commercial gas range with heavy-duty cast iron grates and pilotless ignition system.', shortDescription: '4-burner commercial gas range with cast iron grates', price: 45000, steelGrade: 'SS304', capacity: '4 Burners', dimensions: '1200 x 700 x 850 mm', stock: 15, leadTime: '5-7 days', featured: true },
    { categoryId: catBurners.id, name: 'Inferno Pro 6-Burner Heavy Duty Range', slug: 'inferno-pro-6-burner', description: 'Industrial-grade 6-burner range with individual flame control, stainless steel body, and heat-resistant knobs.', shortDescription: '6-burner heavy duty gas range for high volume', price: 78000, steelGrade: 'SS316', capacity: '6 Burners', dimensions: '1800 x 700 x 850 mm', stock: 8, leadTime: '7-10 days', featured: true },
    { categoryId: catBurners.id, name: 'Blaze 2-Burner Table Top Range', slug: 'blaze-2-burner-tabletop', description: 'Compact 2-burner table top range perfect for small kitchens, food trucks, and takeaway counters.', shortDescription: 'Compact 2-burner tabletop range', price: 18500, steelGrade: 'SS202', capacity: '2 Burners', dimensions: '600 x 500 x 300 mm', stock: 25, leadTime: '3-5 days', featured: false },
    { categoryId: catBurners.id, name: 'Dragon Fire Chinese Wok Burner', slug: 'dragon-fire-wok-burner', description: 'High-pressure wok burner designed for Chinese and Asian cooking.', shortDescription: 'High-pressure wok burner for Asian cooking', price: 32000, steelGrade: 'SS304', capacity: 'Single Wok', dimensions: '500 x 500 x 900 mm', stock: 12, leadTime: '5-7 days', featured: false },
    { categoryId: catRanges.id, name: 'Chef Master 4-Burner with Oven', slug: 'chef-master-4-burner-oven', description: 'Versatile 4-burner cooking range with built-in oven for baking and roasting.', shortDescription: '4-burner range with built-in oven', price: 95000, steelGrade: 'SS304', capacity: '4 Burners + Oven', dimensions: '1200 x 700 x 900 mm', stock: 6, leadTime: '10-14 days', featured: true },
    { categoryId: catRanges.id, name: 'Titan 6-Burner with Griddle & Oven', slug: 'titan-6-burner-griddle-oven', description: 'Premium 6-burner range featuring a smooth griddle plate and convection oven.', shortDescription: '6-burner with griddle and convection oven', price: 165000, steelGrade: 'SS316', capacity: '6 Burners + Griddle + Oven', dimensions: '2100 x 750 x 900 mm', stock: 4, leadTime: '14-21 days', featured: true },
    { categoryId: catRanges.id, name: 'Steam Pro Commercial Steamer Range', slug: 'steam-pro-steamer', description: 'Multi-tier steaming range for idli, momo, and dim sum preparation.', shortDescription: 'Multi-tier commercial steamer range', price: 52000, steelGrade: 'SS304', capacity: '6 Tiers', dimensions: '600 x 600 x 1200 mm', stock: 10, leadTime: '7-10 days', featured: false },
    { categoryId: catRanges.id, name: 'Tandoor King Gas Tandoor', slug: 'tandoor-king-gas', description: 'Stainless steel gas tandoor for authentic Indian cooking.', shortDescription: 'Gas tandoor for authentic Indian cooking', price: 38000, steelGrade: 'SS304', capacity: '20 Naan Capacity', dimensions: '500 x 500 x 1000 mm', stock: 9, leadTime: '7-10 days', featured: false },
    { categoryId: catRefrigeration.id, name: 'Arctic Pro 3-Door Refrigerator', slug: 'arctic-pro-3-door-fridge', description: '3-door commercial upright refrigerator with digital temperature control.', shortDescription: '3-door commercial upright refrigerator', price: 125000, steelGrade: 'SS304', capacity: '600 Liters', dimensions: '1800 x 700 x 2000 mm', stock: 7, leadTime: '7-10 days', featured: true },
    { categoryId: catRefrigeration.id, name: 'Frost King Walk-In Cold Room', slug: 'frost-king-cold-room', description: 'Modular walk-in cold room with PUF insulated panels.', shortDescription: 'Modular walk-in cold room', price: 350000, steelGrade: 'SS304', capacity: 'Custom Size', dimensions: 'Customizable', stock: 2, leadTime: '21-30 days', featured: true },
    { categoryId: catRefrigeration.id, name: 'Chill Zone Under-Counter Fridge', slug: 'chill-zone-undercounter', description: 'Compact under-counter refrigerator perfect for bar and café setups.', shortDescription: 'Under-counter refrigerator for bars', price: 48000, steelGrade: 'SS430', capacity: '200 Liters', dimensions: '600 x 600 x 850 mm', stock: 14, leadTime: '5-7 days', featured: false },
    { categoryId: catRefrigeration.id, name: 'Polar Blast Chest Freezer', slug: 'polar-blast-chest-freezer', description: 'Deep chest freezer for bulk storage of frozen foods.', shortDescription: 'Deep chest freezer for bulk storage', price: 55000, steelGrade: 'SS202', capacity: '500 Liters', dimensions: '1500 x 700 x 900 mm', stock: 11, leadTime: '5-7 days', featured: false },
    { categoryId: catPrep.id, name: 'Swift Cut 10L Commercial Mixer', slug: 'swift-cut-10l-mixer', description: '10-liter planetary mixer with 3-speed settings.', shortDescription: '10L planetary mixer with 3 speeds', price: 42000, steelGrade: 'SS304', capacity: '10 Liters', dimensions: '450 x 450 x 750 mm', stock: 10, leadTime: '5-7 days', featured: false },
    { categoryId: catPrep.id, name: 'Precision Cut Meat Slicer', slug: 'precision-cut-meat-slicer', description: 'Professional-grade meat slicer with adjustable thickness.', shortDescription: 'Professional meat slicer with adjustable thickness', price: 28000, steelGrade: 'SS304', capacity: '250mm Blade', dimensions: '550 x 400 x 400 mm', stock: 13, leadTime: '5-7 days', featured: false },
    { categoryId: catPrep.id, name: 'Power Grind 5HP Commercial Grinder', slug: 'power-grind-5hp-grinder', description: 'Heavy-duty 5HP wet grinder for idli/dosa batter and spice grinding.', shortDescription: '5HP commercial wet grinder', price: 35000, steelGrade: 'SS304', capacity: '20 Liters', dimensions: '600 x 500 x 1000 mm', stock: 8, leadTime: '7-10 days', featured: true },
    { categoryId: catPrep.id, name: 'VegePro 30L Vegetable Cutter', slug: 'vegepro-30l-cutter', description: 'High-capacity vegetable cutter with multiple blade options.', shortDescription: '30L vegetable cutter with multiple blades', price: 62000, steelGrade: 'SS304', capacity: '30 Liters', dimensions: '500 x 500 x 900 mm', stock: 6, leadTime: '7-10 days', featured: true },
    { categoryId: catDishwash.id, name: 'Aqua Clean Under-Counter Dishwasher', slug: 'aqua-clean-undercounter-dishwasher', description: 'Compact under-counter commercial dishwasher.', shortDescription: 'Under-counter commercial dishwasher', price: 85000, steelGrade: 'SS304', capacity: '500 Racks/Hr', dimensions: '600 x 600 x 850 mm', stock: 5, leadTime: '7-10 days', featured: false },
    { categoryId: catDishwash.id, name: 'Sparkle Pro Pot & Pan Washer', slug: 'sparkle-pro-pot-washer', description: 'Heavy-duty pot and pan washer designed for large utensils.', shortDescription: 'Heavy-duty pot and pan washer', price: 145000, steelGrade: 'SS316', capacity: '30 Baskets/Hr', dimensions: '800 x 750 x 1400 mm', stock: 3, leadTime: '10-14 days', featured: false },
    { categoryId: catDishwash.id, name: 'Fresh Wash 3-Tank Sink Unit', slug: 'fresh-wash-3-tank-sink', description: '3-compartment stainless steel sink unit.', shortDescription: '3-compartment stainless steel sink unit', price: 22000, steelGrade: 'SS304', capacity: '3 Tanks', dimensions: '1800 x 600 x 850 mm', stock: 20, leadTime: '3-5 days', featured: false },
    { categoryId: catDishwash.id, name: 'Glass Shine Glass Washer', slug: 'glass-shine-glass-washer', description: 'Specialized glass washer for bars and restaurants.', shortDescription: 'Specialized glass washer for bars', price: 55000, steelGrade: 'SS304', capacity: '800 Glasses/Hr', dimensions: '450 x 500 x 700 mm', stock: 9, leadTime: '5-7 days', featured: false },
    { categoryId: catDisplay.id, name: 'Showcase Pro Dry Display Counter', slug: 'showcase-pro-dry-display', description: 'Elegant dry display counter with curved glass and LED lighting.', shortDescription: 'Dry display counter with LED lighting', price: 68000, steelGrade: 'SS304', capacity: '4 Shelves', dimensions: '1500 x 500 x 1300 mm', stock: 7, leadTime: '7-10 days', featured: true },
    { categoryId: catDisplay.id, name: 'Chill Display 4-Door Refrigerated Counter', slug: 'chill-display-4-door', description: '4-door refrigerated display counter for kebabs, desserts, and cold items.', shortDescription: '4-door refrigerated display counter', price: 155000, steelGrade: 'SS304', capacity: '400 Liters', dimensions: '2000 x 600 x 1300 mm', stock: 4, leadTime: '10-14 days', featured: true },
    { categoryId: catDisplay.id, name: 'Hot Hold Curved Display Counter', slug: 'hot-hold-curved-display', description: 'Heated display counter with curved glass for keeping food warm.', shortDescription: 'Heated display counter with humidifier', price: 82000, steelGrade: 'SS304', capacity: '3 Shelves', dimensions: '1200 x 500 x 1300 mm', stock: 6, leadTime: '7-10 days', featured: false },
    { categoryId: catDisplay.id, name: 'Baker Pride Cake Display Counter', slug: 'baker-pride-cake-display', description: 'Premium cake display counter with 360° visibility and marble base.', shortDescription: 'Premium cake display with marble base', price: 98000, steelGrade: 'SS316', capacity: '3 Tier', dimensions: '1200 x 600 x 1500 mm', stock: 5, leadTime: '10-14 days', featured: false },
  ]

  const products: any[] = []
  for (const pData of productsData) {
    const product = await db.product.create({ data: pData })
    products.push(product)
  }

  // ── Product Variants (size-based pricing for select products) ──
  const variantData = [
    // Ultra Flame 4-Burner - Small/Medium/Large sizes
    { productId: products[0].id, variants: [
      { name: 'Small (2 Burner)', sku: 'UF-2B', price: 32000, stock: 20, weight: '35kg', dimensions: '600x700x850mm', isDefault: false, sortOrder: 1 },
      { name: 'Medium (4 Burner)', sku: 'UF-4B', price: 45000, stock: 15, weight: '55kg', dimensions: '1200x700x850mm', isDefault: true, sortOrder: 2 },
      { name: 'Large (6 Burner)', sku: 'UF-6B', price: 68000, stock: 8, weight: '75kg', dimensions: '1800x700x850mm', isDefault: false, sortOrder: 3 },
    ]},
    // Inferno Pro 6-Burner
    { productId: products[1].id, variants: [
      { name: 'Standard', sku: 'IP-6B-STD', price: 78000, stock: 8, weight: '80kg', dimensions: '1800x700x850mm', isDefault: true, sortOrder: 1 },
      { name: 'With Oven', sku: 'IP-6B-OVN', price: 125000, stock: 4, weight: '120kg', dimensions: '1800x700x900mm', isDefault: false, sortOrder: 2 },
    ]},
    // Chef Master 4-Burner with Oven
    { productId: products[4].id, variants: [
      { name: 'Gas Oven', sku: 'CM-4BO-GAS', price: 95000, stock: 6, weight: '95kg', dimensions: '1200x700x900mm', isDefault: true, sortOrder: 1 },
      { name: 'Electric Oven', sku: 'CM-4BO-ELEC', price: 115000, stock: 3, weight: '100kg', dimensions: '1200x700x900mm', isDefault: false, sortOrder: 2 },
      { name: 'Convection Oven', sku: 'CM-4BO-CONV', price: 135000, stock: 2, weight: '105kg', dimensions: '1200x700x950mm', isDefault: false, sortOrder: 3 },
    ]},
    // Frost King Walk-In Cold Room
    { productId: products[9].id, variants: [
      { name: 'Small (6x6x8 ft)', sku: 'FK-CR-S', price: 250000, stock: 3, weight: '200kg', dimensions: '6x6x8 ft', isDefault: true, sortOrder: 1 },
      { name: 'Medium (8x8x10 ft)', sku: 'FK-CR-M', price: 350000, stock: 2, weight: '350kg', dimensions: '8x8x10 ft', isDefault: false, sortOrder: 2 },
      { name: 'Large (10x12x12 ft)', sku: 'FK-CR-L', price: 550000, stock: 1, weight: '500kg', dimensions: '10x12x12 ft', isDefault: false, sortOrder: 3 },
      { name: 'Extra Large (15x15x12 ft)', sku: 'FK-CR-XL', price: 780000, stock: 1, weight: '750kg', dimensions: '15x15x12 ft', isDefault: false, sortOrder: 4 },
    ]},
    // Showcase Pro Dry Display Counter
    { productId: products[20].id, variants: [
      { name: '3ft Counter', sku: 'SP-DC-3', price: 45000, stock: 10, weight: '30kg', dimensions: '900x500x1300mm', isDefault: false, sortOrder: 1 },
      { name: '5ft Counter', sku: 'SP-DC-5', price: 68000, stock: 7, weight: '45kg', dimensions: '1500x500x1300mm', isDefault: true, sortOrder: 2 },
      { name: '7ft Counter', sku: 'SP-DC-7', price: 92000, stock: 4, weight: '60kg', dimensions: '2100x500x1300mm', isDefault: false, sortOrder: 3 },
    ]},
    // Chill Display 4-Door
    { productId: products[21].id, variants: [
      { name: '2-Door', sku: 'CD-RC-2D', price: 98000, stock: 6, weight: '80kg', dimensions: '1200x600x1300mm', isDefault: false, sortOrder: 1 },
      { name: '4-Door', sku: 'CD-RC-4D', price: 155000, stock: 4, weight: '120kg', dimensions: '2000x600x1300mm', isDefault: true, sortOrder: 2 },
      { name: '6-Door', sku: 'CD-RC-6D', price: 210000, stock: 2, weight: '160kg', dimensions: '2800x600x1300mm', isDefault: false, sortOrder: 3 },
    ]},
  ]

  for (const vd of variantData) {
    for (const variant of vd.variants) {
      await db.productVariant.create({
        data: {
          productId: vd.productId,
          name: variant.name,
          sku: variant.sku,
          price: variant.price,
          stock: variant.stock,
          weight: variant.weight,
          dimensions: variant.dimensions,
          isDefault: variant.isDefault,
          sortOrder: variant.sortOrder,
        },
      })
    }
  }

  // ── Orders (8) ──
  const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'delivered', 'cancelled', 'pending']
  const paymentStatuses = ['pending', 'paid', 'paid', 'paid', 'paid', 'paid', 'refunded', 'pending']

  const orders: any[] = []
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
    { name: 'Hotel Royal Orchid', company: 'Royal Orchid Hotels Ltd', phone: '+91-9812345678', email: 'procurement@royalorchid.com', city: 'Bangalore', requirement: 'Complete kitchen setup for 200-room hotel', message: 'Looking for a turnkey kitchen solution', status: 'negotiation', source: 'referral', assignedTo: managers[0].id },
    { name: 'ITC Grand Chola', company: 'ITC Hotels', phone: '+91-9823456789', email: 'kitchen@itcgrandchola.com', city: 'Chennai', requirement: 'Commercial burners and tandoors', message: 'Need 10 heavy-duty burners and 4 gas tandoors', status: 'quotation_sent', source: 'direct', assignedTo: managers[1].id },
    { name: 'Taj Palace Catering', company: 'Indian Hotels Company', phone: '+91-9834567890', email: 'supply@tajpalace.com', city: 'Mumbai', requirement: 'Walk-in cold room and display counters', message: 'Requirement for 2 walk-in cold rooms', status: 'contacted', source: 'website', assignedTo: managers[0].id },
    { name: 'Café Coffee Day', company: 'Coffee Day Enterprises', phone: '+91-9845678901', email: 'ops@ccd.com', city: 'Bangalore', requirement: 'Under-counter refrigerators', message: 'Bulk order for 50 under-counter fridges', status: 'new', source: 'website' },
    { name: 'Haldiram Foods', company: 'Haldiram Manufacturing', phone: '+91-9856789012', email: 'purchase@haldirams.com', city: 'Delhi', requirement: 'Industrial mixers and grinders', message: 'Need industrial-grade mixers for production', status: 'won', source: 'referral', assignedTo: managers[1].id },
    { name: 'Biryani House Chain', company: 'Biryani House Pvt Ltd', phone: '+91-9867890123', email: 'setup@biryanihouse.com', city: 'Hyderabad', requirement: 'Dum cooking equipment', message: 'Specialized dum cooking ranges for 5 outlets', status: 'lost', source: 'social', assignedTo: managers[0].id },
  ]

  const leads: any[] = []
  for (const ld of leadsData) {
    const lead = await db.lead.create({ data: ld })
    leads.push(lead)
  }

  // ── Quotations (3) ──
  const quotationsData = [
    { leadId: leads[0].id, quotationNumber: 'QUO-2024-001', amount: 1850000, customerName: leads[0].name, customerCompany: leads[0].company || '', customerEmail: leads[0].email || '', customerPhone: leads[0].phone || '', customerAddress: leads[0].city ? `${leads[0].city}, India` : '', subtotal: 1566000, cgstAmount: 142000, sgstAmount: 142000, totalGst: 284000, items: JSON.stringify([{ desc: '6-Burner Heavy Duty Range', hsn: '8419', qty: '4', unit: 'Nos', rate: 78000, discount: '0', gstPercent: '18', amount: 366960 }, { desc: 'Walk-In Cold Room (8x8x10 ft)', hsn: '8418', qty: '2', unit: 'Nos', rate: 350000, discount: '0', gstPercent: '18', amount: 826000 }]), status: 'sent', validUntil: new Date(2025, 2, 15), deliveryPeriod: '3-4 weeks', installation: 'Included', warranty: '12 months against manufacturing defects', terms: JSON.stringify(['50% advance with order, balance before dispatch.', 'GST @18% as per government norms.', 'Delivery subject to confirmation.', 'Subject to Delhi jurisdiction.']), bankDetails: JSON.stringify({ bankName: 'HDFC Bank', accountName: 'Urban Kitchen Mfg & Solutions', accountNo: '50100XXXXX1234', ifsc: 'HDFC0001234', branch: 'Sector 12, New Delhi' }), emailSent: true, emailSentAt: new Date(2024, 10, 15) },
    { leadId: leads[1].id, quotationNumber: 'QUO-2024-002', amount: 720000, customerName: leads[1].name, customerCompany: leads[1].company || '', customerEmail: leads[1].email || '', customerPhone: leads[1].phone || '', customerAddress: leads[1].city ? `${leads[1].city}, India` : '', subtotal: 610170, cgstAmount: 54915, sgstAmount: 54915, totalGst: 109830, items: JSON.stringify([{ desc: '6-Burner Heavy Duty Range', hsn: '8419', qty: '5', unit: 'Nos', rate: 78000, discount: '0', gstPercent: '18', amount: 458700 }, { desc: 'Gas Tandoor', hsn: '8419', qty: '4', unit: 'Nos', rate: 38000, discount: '0', gstPercent: '18', amount: 179360 }]), status: 'draft', validUntil: new Date(2025, 2, 28), deliveryPeriod: '2-3 weeks', installation: 'Included', warranty: '12 months against manufacturing defects', terms: JSON.stringify(['50% advance with order, balance before dispatch.', 'GST @18% as per government norms.', 'Subject to Delhi jurisdiction.']), bankDetails: JSON.stringify({ bankName: 'HDFC Bank', accountName: 'Urban Kitchen Mfg & Solutions', accountNo: '50100XXXXX1234', ifsc: 'HDFC0001234', branch: 'Sector 12, New Delhi' }) },
    { leadId: leads[4].id, quotationNumber: 'QUO-2024-003', amount: 560000, customerName: leads[4].name, customerCompany: leads[4].company || '', customerEmail: leads[4].email || '', customerPhone: leads[4].phone || '', customerAddress: leads[4].city ? `${leads[4].city}, India` : '', subtotal: 474576, cgstAmount: 42712, sgstAmount: 42712, totalGst: 85424, items: JSON.stringify([{ desc: '10L Commercial Mixer', hsn: '8438', qty: '8', unit: 'Nos', rate: 42000, discount: '0', gstPercent: '18', amount: 396480 }, { desc: '5HP Commercial Grinder', hsn: '8438', qty: '6', unit: 'Nos', rate: 35000, discount: '0', gstPercent: '18', amount: 247800 }]), status: 'accepted', validUntil: new Date(2025, 1, 31), deliveryPeriod: '2-3 weeks', installation: 'Separate quotation', warranty: '12 months against manufacturing defects', terms: JSON.stringify(['50% advance with order, balance before dispatch.', 'GST @18% as per government norms.', 'Delivery subject to confirmation.', 'Subject to Delhi jurisdiction.']), bankDetails: JSON.stringify({ bankName: 'HDFC Bank', accountName: 'Urban Kitchen Mfg & Solutions', accountNo: '50100XXXXX1234', ifsc: 'HDFC0001234', branch: 'Sector 12, New Delhi' }) },
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
  const managerEmployees = [
    { userId: managers[0].id, department: 'Sales', designation: 'Sales Manager', salary: 55000, joiningDate: new Date(2020, 3, 1), status: 'active' },
    { userId: managers[1].id, department: 'Operations', designation: 'Operations Manager', salary: 52000, joiningDate: new Date(2020, 7, 15), status: 'active' },
  ]

  const empRecords: any[] = []
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

  const amcContracts: any[] = []
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

  // ── Attendance ──
  const today = new Date()
  for (const emp of empRecords.slice(0, 3)) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(today)
      date.setDate(date.getDate() - d)
      if (date.getDay() === 0) continue
      const checkin = new Date(date)
      checkin.setHours(9, Math.floor(Math.random() * 15), 0)
      const checkout = new Date(date)
      checkout.setHours(18, Math.floor(Math.random() * 30), 0)
      await db.attendance.create({
        data: { employeeId: emp.id, date, checkin, checkout: d === 0 ? null : checkout, status: 'present' },
      })
    }
  }

  // ── Tasks ──
  const tasksData = [
    { employeeId: empRecords[0].id, title: 'Fabricate SS304 range body', description: 'Use 2mm SS304 sheets, follow drawing UK-R-204', priority: 'high', status: 'in_progress', dueDate: new Date(today.getTime() + 3 * 86400000) },
    { employeeId: empRecords[0].id, title: 'Weld burner brackets for 6-burner', description: 'MIG weld with argon shielding', priority: 'medium', status: 'pending', dueDate: new Date(today.getTime() + 5 * 86400000) },
    { employeeId: empRecords[1].id, title: 'Quality check on refrigeration units', description: 'Check compressor performance and door seals', priority: 'high', status: 'pending', dueDate: new Date(today.getTime() + 2 * 86400000) },
    { employeeId: empRecords[2].id, title: 'Service visit - Hotel Sunrise', description: 'Customer reported uneven flame', priority: 'urgent', status: 'in_progress', dueDate: new Date(today.getTime() + 86400000) },
    { employeeId: empRecords[2].id, title: 'Install display counter at Spice Garden', description: 'Deliver and install Chill Display 4-Door unit', priority: 'medium', status: 'completed', dueDate: new Date(today.getTime() - 86400000) },
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
      await db.salarySlip.create({ data: { employeeId: emp.id, month: monthStr, basic, hra, allowance, deduction, netPay } })
    }
  }

  // ── Leaves ──
  await db.leave.create({ data: { employeeId: empRecords[0].id, type: 'casual', startDate: new Date(today.getFullYear(), today.getMonth(), 5), endDate: new Date(today.getFullYear(), today.getMonth(), 6), reason: 'Personal work', status: 'approved' } })
  await db.leave.create({ data: { employeeId: empRecords[1].id, type: 'sick', startDate: new Date(today.getFullYear(), today.getMonth(), 12), endDate: new Date(today.getFullYear(), today.getMonth(), 13), reason: 'Medical appointment', status: 'approved' } })
  await db.leave.create({ data: { employeeId: empRecords[2].id, type: 'earned', startDate: new Date(today.getFullYear(), today.getMonth() + 1, 1), endDate: new Date(today.getFullYear(), today.getMonth() + 1, 5), reason: 'Vacation', status: 'pending' } })

  // ── Inquiries ──
  await db.inquiry.create({ data: { name: 'Rahul Mehta', email: 'rahul@hotel.com', phone: '+91-9901234567', subject: 'Bulk order inquiry', message: 'We are setting up a new restaurant in Pune and need a complete kitchen setup.', status: 'new' } })
  await db.inquiry.create({ data: { name: 'Sunita Joshi', email: 'sunita@catering.com', phone: '+91-9901234568', subject: 'AMC contract details', message: 'Can you share details about your annual maintenance contracts?', productId: products[0].id, status: 'read' } })

  // ── Settings ──
  await db.setting.createMany({
    data: [
      { key: 'company_name', value: 'Urban Kitchen Manufacturing & Solutions' },
      { key: 'company_email', value: 'info@urbankitchens.com' },
      { key: 'company_phone', value: '+91-7080488840' },
      { key: 'company_address', value: 'Plot No. 45, Sector 12, Industrial Area, New Delhi - 110020' },
      { key: 'gst_number', value: '07AABCU9603R1ZM' },
      { key: 'currency', value: 'INR' },
    ],
  })

  // ── HRM: Departments ──
  const departments = await Promise.all([
    db.department.create({ data: { name: 'Production', head: managers[1].name, budget: 2500000, status: 'active' } }),
    db.department.create({ data: { name: 'Sales', head: managers[0].name, budget: 1800000, status: 'active' } }),
    db.department.create({ data: { name: 'Quality Control', head: employees[1].name, budget: 600000, status: 'active' } }),
    db.department.create({ data: { name: 'Service', head: employees[2].name, budget: 800000, status: 'active' } }),
    db.department.create({ data: { name: 'HR & Admin', head: managers[0].name, budget: 500000, status: 'active' } }),
  ])

  // ── HRM: Designations ──
  const designations = await Promise.all([
    db.designation.create({ data: { name: 'Senior Welder', level: 3, minSalary: 22000, maxSalary: 35000, status: 'active' } }),
    db.designation.create({ data: { name: 'QC Inspector', level: 3, minSalary: 25000, maxSalary: 40000, status: 'active' } }),
    db.designation.create({ data: { name: 'Field Technician', level: 2, minSalary: 18000, maxSalary: 30000, status: 'active' } }),
    db.designation.create({ data: { name: 'Sales Manager', level: 5, minSalary: 45000, maxSalary: 70000, status: 'active' } }),
    db.designation.create({ data: { name: 'Operations Manager', level: 5, minSalary: 42000, maxSalary: 65000, status: 'active' } }),
    db.designation.create({ data: { name: 'Junior Welder', level: 1, minSalary: 15000, maxSalary: 22000, status: 'active' } }),
  ])

  // ── HRM: Holidays ──
  const currentYear = new Date().getFullYear()
  await Promise.all([
    db.holiday.create({ data: { name: 'Republic Day', date: new Date(currentYear, 0, 26), type: 'public' } }),
    db.holiday.create({ data: { name: 'Holi', date: new Date(currentYear, 2, 14), type: 'public' } }),
    db.holiday.create({ data: { name: 'Good Friday', date: new Date(currentYear, 3, 18), type: 'public' } }),
    db.holiday.create({ data: { name: 'Independence Day', date: new Date(currentYear, 7, 15), type: 'public' } }),
    db.holiday.create({ data: { name: 'Gandhi Jayanti', date: new Date(currentYear, 9, 2), type: 'public' } }),
    db.holiday.create({ data: { name: 'Dussehra', date: new Date(currentYear, 9, 24), type: 'public' } }),
    db.holiday.create({ data: { name: 'Diwali', date: new Date(currentYear, 10, 12), type: 'public' } }),
    db.holiday.create({ data: { name: 'Christmas', date: new Date(currentYear, 11, 25), type: 'public' } }),
    db.holiday.create({ data: { name: 'Company Foundation Day', date: new Date(currentYear, 5, 15), type: 'company' } }),
  ])

  // ── HRM: Notices ──
  await Promise.all([
    db.notice.create({ data: { title: 'Annual Health Checkup', content: 'All employees are required to undergo annual health checkup between 10th-20th of this month. Schedule available at HR desk.', priority: 'high', postedBy: managers[0].name, status: 'active' } }),
    db.notice.create({ data: { title: 'Safety Training Mandatory', content: 'All production floor staff must attend the safety training session scheduled for next Monday.', priority: 'urgent', postedBy: managers[1].name, status: 'active' } }),
    db.notice.create({ data: { title: 'Holiday Schedule Update', content: 'Please check the updated holiday list for the current year on the notice board.', priority: 'normal', postedBy: managers[0].name, status: 'active' } }),
  ])

  // ── HRM: Job Openings ──
  await Promise.all([
    db.jobOpening.create({ data: { title: 'Senior Welder', department: 'Production', type: 'full-time', experience: '3-5 years', salaryRange: '₹22,000 - ₹35,000', description: 'Experienced welder with SS304/SS316 TIG and MIG welding skills.', requirements: 'ITI/Diploma in Welding, 3+ years experience', location: 'New Delhi', status: 'open', applications: 8 } }),
    db.jobOpening.create({ data: { title: 'Service Technician', department: 'Service', type: 'full-time', experience: '1-3 years', salaryRange: '₹18,000 - ₹28,000', description: 'Field technician for installation and maintenance of commercial kitchen equipment.', requirements: 'Diploma in Electrical/Mechanical, valid driving license', location: 'NCR Region', status: 'open', applications: 12 } }),
    db.jobOpening.create({ data: { title: 'Sales Executive', department: 'Sales', type: 'full-time', experience: '2-4 years', salaryRange: '₹25,000 - ₹40,000', description: 'B2B sales executive for commercial kitchen equipment.', requirements: 'Graduate with B2B sales experience in hospitality/F&B sector', location: 'Pan India', status: 'on_hold', applications: 5 } }),
  ])

  // ── HRM: Shifts ──
  await Promise.all([
    db.shift.create({ data: { name: 'General Shift', startTime: '09:00', endTime: '18:00', breakDuration: 30, employees: 8, supervisor: managers[1].name, status: 'active' } }),
    db.shift.create({ data: { name: 'Morning Shift', startTime: '06:00', endTime: '14:00', breakDuration: 30, employees: 4, status: 'active' } }),
    db.shift.create({ data: { name: 'Evening Shift', startTime: '14:00', endTime: '22:00', breakDuration: 30, employees: 3, status: 'active' } }),
  ])

  // ── HRM: Teams ──
  await Promise.all([
    db.team.create({ data: { name: 'Fabrication Team', leadId: employees[0].id, members: 5, department: 'Production', status: 'active' } }),
    db.team.create({ data: { name: 'Quality Team', leadId: employees[1].id, members: 3, department: 'Quality Control', status: 'active' } }),
    db.team.create({ data: { name: 'Service Team', leadId: employees[2].id, members: 4, department: 'Service', status: 'active' } }),
  ])

  // ── HRM: Assets ──
  await Promise.all([
    db.asset.create({ data: { name: 'MIG Welding Machine', type: 'equipment', serialNo: 'MW-2024-001', value: 185000, assignedTo: empRecords[0].id, purchaseDate: new Date(2024, 0, 15), status: 'assigned' } }),
    db.asset.create({ data: { name: 'Laptop - Dell Latitude', type: 'electronics', serialNo: 'DL-2024-015', value: 65000, assignedTo: empRecords[1].id, purchaseDate: new Date(2024, 2, 10), status: 'assigned' } }),
    db.asset.create({ data: { name: 'Service Van - Tata Ace', type: 'vehicle', serialNo: 'TV-2024-003', value: 550000, assignedTo: empRecords[2].id, purchaseDate: new Date(2023, 5, 20), status: 'assigned' } }),
    db.asset.create({ data: { name: 'TIG Welding Machine', type: 'equipment', serialNo: 'TW-2024-002', value: 210000, purchaseDate: new Date(2024, 1, 5), status: 'available' } }),
  ])

  // ── HRM: Training Programs ──
  await Promise.all([
    db.trainingProgram.create({ data: { name: 'Advanced TIG Welding', type: 'internal', duration: '5 days', trainer: 'External Expert', enrolled: 6, maxSeats: 10, startDate: new Date(currentYear, 5, 10), endDate: new Date(currentYear, 5, 14), status: 'upcoming' } }),
    db.trainingProgram.create({ data: { name: 'Safety & Compliance', type: 'internal', duration: '2 days', trainer: 'HR Team', enrolled: 15, maxSeats: 20, startDate: new Date(currentYear, 4, 1), endDate: new Date(currentYear, 4, 2), status: 'ongoing' } }),
    db.trainingProgram.create({ data: { name: 'Customer Service Excellence', type: 'online', duration: '4 hours', trainer: 'Online Course', enrolled: 8, maxSeats: 25, startDate: new Date(currentYear, 3, 15), status: 'completed' } }),
  ])

  // ── CRM: Companies ──
  await Promise.all([
    db.company.create({ data: { name: 'Royal Orchid Hotels Ltd', industry: 'Hospitality', website: 'royalorchidhotels.com', phone: '+91-80-42424242', email: 'info@royalorchid.com', address: 'Bangalore, India', revenue: 5000000, status: 'active', leads: { connect: { id: leads[0].id } } } }),
    db.company.create({ data: { name: 'ITC Hotels', industry: 'Hospitality', website: 'itchotels.com', phone: '+91-44-24342434', email: 'info@itchotels.com', address: 'Chennai, India', revenue: 15000000, status: 'active', leads: { connect: { id: leads[1].id } } } }),
    db.company.create({ data: { name: 'Haldiram Manufacturing', industry: 'Food Processing', website: 'haldirams.com', phone: '+91-11-23232323', email: 'info@haldirams.com', address: 'Delhi, India', revenue: 8000000, status: 'active', leads: { connect: { id: leads[4].id } } } }),
  ])

  // ── CRM: Pipelines ──
  const pipeline = await db.pipeline.create({ data: { name: 'Sales Pipeline', description: 'Main sales pipeline for all deals', isDefault: true, stages: JSON.stringify([{ id: '1', name: 'Qualification', order: 1, color: '#6366f1' }, { id: '2', name: 'Proposal', order: 2, color: '#f59e0b' }, { id: '3', name: 'Negotiation', order: 3, color: '#ef4444' }, { id: '4', name: 'Closed Won', order: 4, color: '#22c55e' }, { id: '5', name: 'Closed Lost', order: 5, color: '#94a3b8' }]) } })

  // ── CRM: Pipeline Deals ──
  await Promise.all([
    db.pipelineDeal.create({ data: { pipelineId: pipeline.id, leadId: leads[0].id, title: 'Royal Orchid Kitchen Setup', value: 1850000, stage: 'Negotiation', probability: 65, assigneeId: managers[0].id, closeDate: new Date(currentYear, 5, 30), status: 'open' } }),
    db.pipelineDeal.create({ data: { pipelineId: pipeline.id, leadId: leads[1].id, title: 'ITC Grand Chola Burners & Tandoors', value: 720000, stage: 'Proposal', probability: 45, assigneeId: managers[1].id, closeDate: new Date(currentYear, 4, 15), status: 'open' } }),
    db.pipelineDeal.create({ data: { pipelineId: pipeline.id, leadId: leads[4].id, title: 'Haldiram Mixers & Grinders', value: 560000, stage: 'Closed Won', probability: 100, assigneeId: managers[1].id, status: 'won' } }),
  ])

  // ── CRM: Email Templates ──
  await Promise.all([
    db.emailTemplate.create({ data: { name: 'Welcome Email', subject: 'Welcome to Urban Kitchen!', body: '<p>Dear {{name}},</p><p>Thank you for your interest in Urban Kitchen products.</p>', category: 'general', variables: JSON.stringify(['name', 'email']), usageCount: 15, status: 'active' } }),
    db.emailTemplate.create({ data: { name: 'Quotation Follow-up', subject: 'Following up on your quotation', body: '<p>Dear {{name}},</p><p>We wanted to follow up on quotation {{quotation_number}}.</p>', category: 'followup', variables: JSON.stringify(['name', 'quotation_number']), usageCount: 8, status: 'active' } }),
    db.emailTemplate.create({ data: { name: 'Lead Nurture', subject: 'Discover our latest products', body: '<p>Dear {{name}},</p><p>Check out our latest commercial kitchen solutions.</p>', category: 'nurture', variables: JSON.stringify(['name', 'company']), usageCount: 22, status: 'active' } }),
  ])

  // ── CRM: Lead Sources ──
  await Promise.all([
    db.leadSource.create({ data: { name: 'Google Ads', type: 'paid', cost: 50000, status: 'active' } }),
    db.leadSource.create({ data: { name: 'Website Contact Form', type: 'organic', cost: 0, status: 'active' } }),
    db.leadSource.create({ data: { name: 'Industry Referral', type: 'referral', cost: 5000, status: 'active' } }),
    db.leadSource.create({ data: { name: 'LinkedIn', type: 'social', cost: 15000, status: 'active' } }),
  ])

  return {
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
  }
}

// GET - Seed the database (easy: just visit in browser!)
export async function GET(request: Request) {
  try {
    // Verify secret token
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    const expectedSecret = process.env.SEED_SECRET

    // Allow seeding without secret in development, require secret in production
    const isDev = process.env.NODE_ENV === 'development'
    if (!isDev && (!expectedSecret || secret !== expectedSecret)) {
      return NextResponse.json(
        { status: false, message: 'Invalid or missing secret token. Add ?secret=YOUR_SEED_SECRET to the URL' },
        { status: 403 }
      )
    }

    const result = await seedDatabase()

    return NextResponse.json({
      status: true,
      message: '✅ Database seeded successfully! You can now login with admin@urbankitchens.com / admin123',
      data: result,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to seed database: ' + (error instanceof Error ? error.message : 'Unknown error'), stack: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    )
  }
}

// POST - Also seed on POST
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    const expectedSecret = process.env.SEED_SECRET
    const isDev = process.env.NODE_ENV === 'development'

    if (!isDev && (!expectedSecret || secret !== expectedSecret)) {
      return NextResponse.json(
        { status: false, message: 'Invalid or missing secret token. Add ?secret=YOUR_SEED_SECRET to the URL' },
        { status: 403 }
      )
    }

    const result = await seedDatabase()

    return NextResponse.json({
      status: true,
      message: '✅ Database seeded successfully! You can now login with admin@urbankitchens.com / admin123',
      data: result,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to seed database: ' + (error instanceof Error ? error.message : 'Unknown error'), stack: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    )
  }
}

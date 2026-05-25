import { db } from '../src/lib/db'

async function seed() {
  console.log('🌱 Seeding database...')

  // ─── Create Roles ───
  const adminRole = await db.role.upsert({
    where: { roleName: 'admin' },
    update: {},
    create: { roleName: 'admin', permissions: '["all"]' },
  })
  const managerRole = await db.role.upsert({
    where: { roleName: 'manager' },
    update: {},
    create: { roleName: 'manager', permissions: '["products","orders","leads","quotations"]' },
  })
  const employeeRole = await db.role.upsert({
    where: { roleName: 'employee' },
    update: {},
    create: { roleName: 'employee', permissions: '["attendance","tasks"]' },
  })
  const customerRole = await db.role.upsert({
    where: { roleName: 'customer' },
    update: {},
    create: { roleName: 'customer', permissions: '["orders","profile","wishlist"]' },
  })
  console.log('✅ Roles created')

  // ─── Create Admin User ───
  const existingAdmin = await db.user.findUnique({ where: { email: 'admin@urbankitchen.com' } })
  if (!existingAdmin) {
    await db.user.create({
      data: {
        name: 'Admin',
        email: 'admin@urbankitchen.com',
        phone: '+91-9876543210',
        password: '$2a$10$dummyhashforadmin1234567890abcdefghijklmnopqrstu',
        roleId: adminRole.id,
        status: 'active',
      },
    })
    console.log('✅ Admin user created')
  }

  // ─── Create Categories ───
  const categoriesData = [
    {
      name: 'Commercial Burners',
      slug: 'commercial-burners',
      description: 'Heavy-duty gas burners for commercial kitchens — single, double, triple and four-burner configurations in SS304.',
      menuOrder: 1,
      status: 'active',
    },
    {
      name: 'Cooking Ranges',
      slug: 'cooking-ranges',
      description: 'Complete cooking range solutions including gas, electric, and induction ranges for high-volume cooking.',
      menuOrder: 2,
      status: 'active',
    },
    {
      name: 'Refrigeration',
      slug: 'refrigeration',
      description: 'Walk-in cold rooms, deep freezers, commercial refrigerators, and display chillers for food preservation.',
      menuOrder: 3,
      status: 'active',
    },
    {
      name: 'Food Preparation',
      slug: 'food-preparation',
      description: 'Vegetable cutters, dough kneaders, meat mincers, potato peelers, and other prep equipment.',
      menuOrder: 4,
      status: 'active',
    },
    {
      name: 'Dishwashing',
      slug: 'dishwashing',
      description: 'Commercial dishwashers, glass washers, and pot washers for efficient kitchen cleaning.',
      menuOrder: 5,
      status: 'active',
    },
    {
      name: 'Display Counters',
      slug: 'display-counters',
      description: 'Refrigerated and heated display counters, bakery showcases, and buffet counters.',
      menuOrder: 6,
      status: 'active',
    },
  ]

  const categories: { id: string; name: string; slug: string }[] = []
  for (const cat of categoriesData) {
    const existing = await db.category.findUnique({ where: { slug: cat.slug } })
    if (existing) {
      categories.push(existing)
    } else {
      const created = await db.category.create({ data: cat })
      categories.push(created)
    }
  }
  console.log(`✅ ${categories.length} categories ready`)

  // ─── Create Dummy Products ───
  const productsData = [
    // Commercial Burners
    {
      name: 'Triple Burner Cooking Range – SS304',
      slug: 'triple-burner-cooking-range-ss304',
      description: 'Heavy-duty triple burner cooking range manufactured in SS304 stainless steel. Ideal for high-volume restaurants, hotels, and catering kitchens. Features cast iron burners with individual flame control, reinforced body, and easy-clean design.',
      shortDescription: 'SS304 triple burner range with cast iron burners',
      price: 28500,
      steelGrade: 'SS304',
      capacity: '3 Burners',
      dimensions: '900×600×850mm',
      stock: 25,
      featured: true,
      categoryId: categories[0].id,
      status: 'active',
    },
    {
      name: 'Four Burner Gas Stove – Heavy Duty',
      slug: 'four-burner-gas-stove-heavy-duty',
      description: 'Professional four-burner gas stove with heavy-gauge SS304 body. Equipped with high-BTU brass burners, sturdy pan supports, and flame failure safety device. Perfect for busy commercial kitchens.',
      shortDescription: '4-burner heavy duty gas stove with brass burners',
      price: 35000,
      steelGrade: 'SS304',
      capacity: '4 Burners',
      dimensions: '1200×600×850mm',
      stock: 18,
      featured: true,
      categoryId: categories[0].id,
      status: 'active',
    },
    {
      name: 'Double Burner Chinese Range',
      slug: 'double-burner-chinese-range',
      description: 'Specialized Chinese cooking range with two high-flame wok burners. Designed for Asian cuisine restaurants with reinforced wok cradle, water tap, and drain.',
      shortDescription: 'High-flame wok range for Asian cuisine',
      price: 42000,
      steelGrade: 'SS316',
      capacity: '2 Wok Burners',
      dimensions: '800×700×850mm',
      stock: 12,
      featured: false,
      categoryId: categories[0].id,
      status: 'active',
    },

    // Cooking Ranges
    {
      name: '6-Burner Gas Cooking Range – Restaurant Grade',
      slug: '6-burner-gas-cooking-range-restaurant',
      description: 'Full-size 6-burner restaurant cooking range with oven below. Built in SS304 with cast iron burner tops, stainless steel oven cavity, and heavy-duty legs. Industry standard for hotel kitchens.',
      shortDescription: '6-burner range with built-in oven',
      price: 89000,
      steelGrade: 'SS304',
      capacity: '6 Burners + Oven',
      dimensions: '1800×700×900mm',
      stock: 8,
      featured: true,
      categoryId: categories[1].id,
      status: 'active',
    },
    {
      name: 'Induction Cooking Range – 4 Zone',
      slug: 'induction-cooking-range-4-zone',
      description: 'Energy-efficient 4-zone induction cooking range. Features precise temperature control, auto-shutoff safety, and easy-clean ceramic glass top. Reduces kitchen heat and energy costs by 50%.',
      shortDescription: 'Energy-efficient 4-zone induction range',
      price: 125000,
      steelGrade: 'SS304 Frame',
      capacity: '4 Zones',
      dimensions: '1200×700×850mm',
      stock: 5,
      featured: true,
      categoryId: categories[1].id,
      status: 'active',
    },

    // Refrigeration
    {
      name: 'Walk-In Cold Room – 10×8×8 ft',
      slug: 'walk-in-cold-room-10x8x8',
      description: 'Modular walk-in cold room with PUF insulated panels, Bitzer compressor, and digital temperature controller. Maintains -2°C to +8°C. Suitable for hotels, restaurants, and food processing units.',
      shortDescription: 'Modular cold room with Bitzer compressor',
      price: 350000,
      steelGrade: 'SS304 Panels',
      capacity: '10×8×8 ft',
      dimensions: '3000×2400×2400mm',
      stock: 3,
      featured: true,
      categoryId: categories[2].id,
      status: 'active',
    },
    {
      name: 'Vertical Deep Freezer – 600L',
      slug: 'vertical-deep-freezer-600l',
      description: 'Commercial vertical deep freezer with 600L capacity. Features durable SS exterior, adjustable shelves, digital thermostat, and CFC-free refrigerant. Ideal for ice cream and frozen food storage.',
      shortDescription: '600L commercial vertical deep freezer',
      price: 78000,
      steelGrade: 'SS304 Exterior',
      capacity: '600 Litres',
      dimensions: '700×700×1900mm',
      stock: 10,
      featured: true,
      categoryId: categories[2].id,
      status: 'active',
    },
    {
      name: 'Under-Counter Refrigerator – 2 Door',
      slug: 'under-counter-refrigerator-2-door',
      description: 'Space-saving 2-door under-counter refrigerator for commercial kitchens. SS304 worktop, forced air cooling, and adjustable shelves. Perfect for prep areas.',
      shortDescription: '2-door under-counter fridge with SS worktop',
      price: 55000,
      steelGrade: 'SS304',
      capacity: '400 Litres',
      dimensions: '1300×700×850mm',
      stock: 14,
      featured: false,
      categoryId: categories[2].id,
      status: 'active',
    },

    // Food Preparation
    {
      name: 'Heavy Duty Vegetable Cutter – 550kg/hr',
      slug: 'heavy-duty-vegetable-cutter-550kg',
      description: 'Commercial vegetable cutter with 550kg/hr capacity. Features multiple blade attachments for slicing, dicing, grating, and julienne cutting. SS304 body with safety interlock system.',
      shortDescription: '550kg/hr commercial vegetable cutter',
      price: 42000,
      steelGrade: 'SS304',
      capacity: '550 kg/hr',
      dimensions: '500×350×550mm',
      stock: 20,
      featured: true,
      categoryId: categories[3].id,
      status: 'active',
    },
    {
      name: 'Dough Kneader – 20kg Capacity',
      slug: 'dough-kneader-20kg',
      description: 'Commercial dough kneader with 20kg flour capacity per batch. SS304 bowl, timer control, and safety guard. Produces consistent, smooth dough in 8-10 minutes.',
      shortDescription: '20kg commercial dough kneader',
      price: 38000,
      steelGrade: 'SS304',
      capacity: '20 kg/batch',
      dimensions: '650×500×1000mm',
      stock: 15,
      featured: false,
      categoryId: categories[3].id,
      status: 'active',
    },

    // Dishwashing
    {
      name: 'Under-Counter Dishwasher – 30 Racks/hr',
      slug: 'under-counter-dishwasher-30-racks',
      description: 'Commercial under-counter dishwasher processing 30 racks per hour. Features wash/rinse/sanitize cycles, built-in booster heater, and low-water indicator. Perfect for restaurants and cafés.',
      shortDescription: '30 racks/hr under-counter dishwasher',
      price: 95000,
      steelGrade: 'SS304',
      capacity: '30 Racks/hr',
      dimensions: '600×650×850mm',
      stock: 7,
      featured: true,
      categoryId: categories[4].id,
      status: 'active',
    },

    // Display Counters
    {
      name: 'Refrigerated Bakery Display Counter – 5ft',
      slug: 'refrigerated-bakery-display-counter-5ft',
      description: 'Elegant 5ft refrigerated display counter for bakeries and cafés. Curved glass front, LED lighting, adjustable temperature, and SS304 body. Displays pastries, cakes, and desserts beautifully.',
      shortDescription: '5ft curved glass bakery display counter',
      price: 65000,
      steelGrade: 'SS304',
      capacity: '5 ft Wide',
      dimensions: '1500×700×1300mm',
      stock: 9,
      featured: true,
      categoryId: categories[5].id,
      status: 'active',
    },
    {
      name: 'Heated Buffet Display Counter – 6ft',
      slug: 'heated-buffet-display-counter-6ft',
      description: '6ft heated buffet display counter for hotel breakfast and banquet setups. Infrared heating, sneeze guard, adjustable thermostat, and dry/wet well options.',
      shortDescription: '6ft heated buffet counter with sneeze guard',
      price: 72000,
      steelGrade: 'SS304',
      capacity: '6 ft Wide',
      dimensions: '1800×700×1350mm',
      stock: 6,
      featured: false,
      categoryId: categories[5].id,
      status: 'active',
    },
  ]

  let productsCreated = 0
  let productsSkipped = 0
  for (const prod of productsData) {
    const existing = await db.product.findUnique({ where: { slug: prod.slug } })
    if (existing) {
      productsSkipped++
    } else {
      await db.product.create({ data: prod })
      productsCreated++
    }
  }
  console.log(`✅ ${productsCreated} products created, ${productsSkipped} already existed`)

  console.log('🎉 Seeding complete!')
}

seed()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })

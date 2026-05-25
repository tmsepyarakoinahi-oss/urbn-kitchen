import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Create Roles ───
  const adminRole = await prisma.role.upsert({
    where: { roleName: 'admin' },
    update: {},
    create: { roleName: 'admin', permissions: JSON.stringify(['all']) },
  })
  const managerRole = await prisma.role.upsert({
    where: { roleName: 'manager' },
    update: {},
    create: { roleName: 'manager', permissions: JSON.stringify(['manage_products', 'manage_orders', 'manage_leads']) },
  })
  const employeeRole = await prisma.role.upsert({
    where: { roleName: 'employee' },
    update: {},
    create: { roleName: 'employee', permissions: JSON.stringify(['view_products', 'view_orders']) },
  })
  const customerRole = await prisma.role.upsert({
    where: { roleName: 'customer' },
    update: {},
    create: { roleName: 'customer', permissions: JSON.stringify(['place_orders', 'view_own_orders']) },
  })
  console.log('✅ Roles created')

  // ─── Create Admin User ───
  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@urbankitchens.com' } })
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@urbankitchens.com',
        password: 'admin123',
        roleId: adminRole.id,
        status: 'active',
      },
    })
    console.log('✅ Admin user created')
  } else {
    console.log('⏭️ Admin user already exists')
  }

  // ─── Create Categories ───
  const categoriesData = [
    { name: 'Commercial Burners', slug: 'commercial-burners', description: 'High-performance gas burners for commercial kitchens', status: 'active' },
    { name: 'Cooking Ranges', slug: 'cooking-ranges', description: 'Complete cooking range solutions for hotels and restaurants', status: 'active' },
    { name: 'Refrigeration', slug: 'refrigeration', description: 'Walk-in coolers, freezers, and display units', status: 'active' },
    { name: 'Food Preparation', slug: 'food-preparation', description: 'Mixers, grinders, slicers, and prep tables', status: 'active' },
    { name: 'Dishwashing', slug: 'dishwashing', description: 'Commercial dishwashers and glass washers', status: 'active' },
    { name: 'Display Counters', slug: 'display-counters', description: 'Refrigerated and heated display counters', status: 'active' },
  ]

  const categories: Record<string, string> = {}
  for (const cat of categoriesData) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } })
    if (!existing) {
      const created = await prisma.category.create({ data: cat })
      categories[cat.slug] = created.id
      console.log(`✅ Category: ${cat.name}`)
    } else {
      categories[cat.slug] = existing.id
      console.log(`⏭️ Category exists: ${cat.name}`)
    }
  }

  // ─── Create Products ───
  const productsData = [
    // Commercial Burners
    { name: '3-Burner Gas Range (Heavy Duty)', slug: '3-burner-gas-range-heavy-duty', categoryId: categories['commercial-burners'], description: 'Heavy-duty 3-burner gas range with cast iron grates, ideal for high-volume restaurants. Built with SS304 body and energy-efficient burners.', shortDescription: 'Heavy-duty 3-burner gas range with cast iron grates', price: 28500, steelGrade: 'SS304', capacity: '3 Burners', dimensions: '900x750x850mm', stock: 15, featured: true, status: 'active' },
    { name: '4-Burner Commercial Gas Stove', slug: '4-burner-commercial-gas-stove', categoryId: categories['commercial-burners'], description: 'Professional 4-burner gas stove with individual flame control and heavy-duty pan supports. Perfect for busy restaurant kitchens.', shortDescription: 'Professional 4-burner gas stove with flame control', price: 35000, steelGrade: 'SS304', capacity: '4 Burners', dimensions: '1200x750x850mm', stock: 12, featured: true, status: 'active' },
    { name: 'Single Burner Chinese Range', slug: 'single-burner-chinese-range', categoryId: categories['commercial-burners'], description: 'High-flame single burner Chinese range for wok cooking. Powerful jet burner with SS body.', shortDescription: 'High-flame Chinese range for wok cooking', price: 18500, steelGrade: 'SS304', capacity: '1 Burner', dimensions: '600x700x850mm', stock: 20, featured: false, status: 'active' },
    { name: '2-Burner Table Model Gas Stove', slug: '2-burner-table-model-gas-stove', categoryId: categories['commercial-burners'], description: 'Compact 2-burner gas stove ideal for small kitchens and food stalls. Lightweight yet durable.', shortDescription: 'Compact 2-burner gas stove for small kitchens', price: 12500, steelGrade: 'SS304', capacity: '2 Burners', dimensions: '600x600x300mm', stock: 25, featured: false, status: 'active' },

    // Cooking Ranges
    { name: '6-Burner Cooking Range with Oven', slug: '6-burner-cooking-range-oven', categoryId: categories['cooking-ranges'], description: 'Complete 6-burner cooking range with built-in oven. SS304 construction with heavy-duty cast iron grates and thermostat-controlled oven.', shortDescription: '6-burner cooking range with built-in oven', price: 85000, steelGrade: 'SS304', capacity: '6 Burners + Oven', dimensions: '1800x900x900mm', stock: 8, featured: true, status: 'active' },
    { name: '4-Burner Cooking Range with Griddle', slug: '4-burner-cooking-range-griddle', categoryId: categories['cooking-ranges'], description: 'Versatile 4-burner range with flat griddle plate. Ideal for restaurants serving both Indian and continental cuisine.', shortDescription: '4-burner range with flat griddle plate', price: 62000, steelGrade: 'SS304', capacity: '4 Burners + Griddle', dimensions: '1500x900x900mm', stock: 10, featured: true, status: 'active' },
    { name: 'Tandoor Cooking Range', slug: 'tandoor-cooking-range', categoryId: categories['cooking-ranges'], description: 'Heavy-duty tandoor range with clay pot and gas burner. Perfect for restaurants specializing in tandoori cuisine.', shortDescription: 'Heavy-duty tandoor range for restaurants', price: 45000, steelGrade: 'SS304', capacity: '1 Tandoor', dimensions: '800x800x1000mm', stock: 6, featured: false, status: 'active' },

    // Refrigeration
    { name: 'Walk-In Cold Room (10x10ft)', slug: 'walk-in-cold-room-10x10', categoryId: categories['refrigeration'], description: 'Modular walk-in cold room with PUF insulated panels and digital temperature controller. Temperature range: -5°C to +5°C.', shortDescription: 'Modular walk-in cold room with digital controller', price: 250000, steelGrade: 'SS304', capacity: '10x10ft', dimensions: '3000x3000x2400mm', stock: 3, featured: true, status: 'active' },
    { name: 'Double Door Upright Freezer', slug: 'double-door-upright-freezer', categoryId: categories['refrigeration'], description: 'Commercial double door upright freezer with -18°C capability. SS interior with adjustable shelves.', shortDescription: 'Double door upright freezer, -18°C', price: 78000, steelGrade: 'SS304', capacity: '600 Liters', dimensions: '700x800x1950mm', stock: 7, featured: true, status: 'active' },
    { name: 'Under-Counter Refrigerator', slug: 'under-counter-refrigerator', categoryId: categories['refrigeration'], description: 'Compact under-counter refrigerator with 2°C to 8°C range. Ideal for bar and prep areas.', shortDescription: 'Compact under-counter refrigerator for bars', price: 42000, steelGrade: 'SS304', capacity: '300 Liters', dimensions: '600x700x850mm', stock: 10, featured: false, status: 'active' },

    // Food Preparation
    { name: '20Ltr Planetary Mixer', slug: '20ltr-planetary-mixer', categoryId: categories['food-preparation'], description: 'Heavy-duty 20-liter planetary mixer with 3 speed settings. Bowl, whisk, dough hook, and beater attachments included.', shortDescription: '20-liter planetary mixer with 3 speeds', price: 55000, steelGrade: 'SS304', capacity: '20 Liters', dimensions: '500x650x1100mm', stock: 9, featured: true, status: 'active' },
    { name: 'Meat Mincer (Heavy Duty)', slug: 'meat-mincer-heavy-duty', categoryId: categories['food-preparation'], description: 'Industrial-grade meat mincer with 3mm and 8mm grinding plates. SS body with 1.5HP motor.', shortDescription: 'Industrial meat mincer with 1.5HP motor', price: 32000, steelGrade: 'SS304', capacity: '50 kg/hr', dimensions: '450x400x550mm', stock: 11, featured: true, status: 'active' },
    { name: 'Vegetable Cutting Machine', slug: 'vegetable-cutting-machine', categoryId: categories['food-preparation'], description: 'Multi-purpose vegetable cutter with different blade attachments for slicing, dicing, and grating.', shortDescription: 'Multi-purpose vegetable cutter with blade sets', price: 28000, steelGrade: 'SS304', capacity: '200 kg/hr', dimensions: '500x400x600mm', stock: 14, featured: false, status: 'active' },

    // Dishwashing
    { name: 'Under-Counter Dishwasher', slug: 'under-counter-dishwasher', categoryId: categories['dishwashing'], description: 'Commercial under-counter dishwasher with 2-minute wash cycle. Handles up to 30 racks per hour.', shortDescription: 'Under-counter dishwasher, 30 racks/hr', price: 95000, steelGrade: 'SS304', capacity: '30 Racks/hr', dimensions: '600x650x850mm', stock: 5, featured: true, status: 'active' },
    { name: 'Utensil Washing Sink (3 Compartment)', slug: 'utensil-washing-sink-3-compartment', categoryId: categories['dishwashing'], description: '3-compartment utensil washing sink with drain boards. SS304 construction with rounded corners for easy cleaning.', shortDescription: '3-compartment sink with drain boards', price: 22000, steelGrade: 'SS304', capacity: '3 Compartments', dimensions: '2100x700x900mm', stock: 12, featured: false, status: 'active' },

    // Display Counters
    { name: 'Refrigerated Display Counter (6ft)', slug: 'refrigerated-display-counter-6ft', categoryId: categories['display-counters'], description: '6-foot refrigerated display counter with curved glass. Digital temperature display, LED lighting, and adjustable shelves.', shortDescription: '6ft refrigerated display with curved glass', price: 120000, steelGrade: 'SS304', capacity: '6 Feet', dimensions: '1800x700x1300mm', stock: 4, featured: true, status: 'active' },
    { name: 'Hot Display Counter (4ft)', slug: 'hot-display-counter-4ft', categoryId: categories['display-counters'], description: '4-foot heated display counter for keeping food warm. Thermostat control with humidity adjustment.', shortDescription: '4ft heated display with humidity control', price: 65000, steelGrade: 'SS304', capacity: '4 Feet', dimensions: '1200x700x1300mm', stock: 6, featured: true, status: 'active' },
    { name: 'Bakery Display Counter (5ft)', slug: 'bakery-display-counter-5ft', categoryId: categories['display-counters'], description: 'Ambient bakery display counter with mirrored back and LED lighting. Perfect for bakeries and cafes.', shortDescription: '5ft bakery display with mirrored back', price: 48000, steelGrade: 'SS304', capacity: '5 Feet', dimensions: '1500x600x1400mm', stock: 8, featured: false, status: 'active' },
  ]

  for (const product of productsData) {
    const existing = await prisma.product.findUnique({ where: { slug: product.slug } })
    if (!existing) {
      await prisma.product.create({ data: product })
      console.log(`✅ Product: ${product.name}`)
    } else {
      console.log(`⏭️ Product exists: ${product.name}`)
    }
  }

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

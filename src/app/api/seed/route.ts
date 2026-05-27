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

  // ── Categories (Chefmate Catalogue - 9 categories) ──
  const categories = await Promise.all([
    db.category.create({ data: { name: 'Preparation Equipment', slug: 'preparation-equipment', image: '/categories/preparation-equipment.png', description: 'Commercial kitchen preparation equipment including work tables, mixer grinders, wet grinders, vegetable cutters, and more. Essential tools for efficient food preparation in professional kitchens, restaurants, hotels, and catering businesses.', seoTitle: 'Commercial Kitchen Preparation Equipment', status: 'active' } }),
    db.category.create({ data: { name: 'Cooking Equipment', slug: 'cooking-equipment', image: '/categories/cooking-equipment.png', description: 'Professional cooking equipment ranging from gas burners and cooking ranges to tandoors, shawarma machines, deep fat fryers, pizza ovens, and more. Designed for high-volume cooking in commercial kitchens, restaurants, and food service establishments.', seoTitle: 'Commercial Cooking Equipment & Ranges', status: 'active' } }),
    db.category.create({ data: { name: 'Serving Equipment', slug: 'serving-equipment', image: '/categories/serving-equipment.png', description: 'Food serving equipment including bain maries, pick up tables, trolleys, tea coffee dispensers, plate warmers, and hot food trolleys. Keep food at the perfect temperature and serve efficiently in buffets, banquets, and cafeterias.', seoTitle: 'Commercial Food Serving Equipment', status: 'active' } }),
    db.category.create({ data: { name: 'Washing Equipment', slug: 'washing-equipment', image: '/categories/washing-equipment.png', description: 'Commercial washing and dishwashing equipment including sink units, dishwashers, glass washers, and soiled dish trolleys. Maintain hygiene standards with efficient cleaning solutions for restaurants, hotels, and commercial kitchens.', seoTitle: 'Commercial Dishwashing & Washing Equipment', status: 'active' } }),
    db.category.create({ data: { name: 'Storage Equipment', slug: 'storage-equipment', image: '/categories/storage-equipment.png', description: 'Kitchen storage solutions including stainless steel racks, wall shelves, dunnage racks, storage bins, and cabinets. Organize your commercial kitchen efficiently with durable storage equipment designed for food service environments.', seoTitle: 'Commercial Kitchen Storage Equipment', status: 'active' } }),
    db.category.create({ data: { name: 'Refrigeration Equipment', slug: 'refrigeration-equipment', image: '/categories/refrigeration-equipment.png', description: 'Commercial refrigeration equipment including undercounter refrigerators, walk-in cold rooms, visi coolers, ice machines, and deep freezers. Reliable cooling solutions for restaurants, hotels, supermarkets, and food service businesses.', seoTitle: 'Commercial Refrigeration Equipment & Cold Rooms', status: 'active' } }),
    db.category.create({ data: { name: 'Bakery Equipment', slug: 'bakery-equipment', image: '/categories/bakery-equipment.png', description: 'Professional bakery equipment including deck ovens, spiral mixers, planetary mixers, rotary ovens, combi ovens, convection ovens, bread slicers, and dough sheeters. Complete solutions for bakeries, patisseries, and commercial baking operations.', seoTitle: 'Commercial Bakery Equipment & Ovens', status: 'active' } }),
    db.category.create({ data: { name: 'Display Equipment', slug: 'display-equipment', image: '/categories/display-equipment.png', description: 'Food display equipment including dry display counters, refrigerated display counters, hot display counters, and cake display counters. Showcase your food products attractively while maintaining optimal temperature and freshness.', seoTitle: 'Commercial Food Display Counters', status: 'active' } }),
    db.category.create({ data: { name: 'Food Carts', slug: 'food-carts', image: '/categories/food-carts.png', description: 'Mobile food service carts for catering, events, and street food service. Includes food service carts, chaat counter carts, and beverage carts. Portable and versatile solutions for on-the-go food service and outdoor catering.', seoTitle: 'Mobile Food Service Carts', status: 'active' } }),
  ])

  const [catPrep, catCooking, catServing, catWashing, catStorage, catRefrigeration, catBakery, catDisplay, catFoodCarts] = categories

  // ── Products (Chefmate Catalogue - 91 products across 9 categories) ──
  // All prices set to 0 — user will set pricing themselves
  const productsData = [
    // Preparation Equipment (12 products) — indices 0-11
    { categoryId: catPrep.id, name: 'Work Table', slug: 'work-table', featuredImage: '/products/work-table.png', description: 'Stainless steel work table for commercial kitchen prep areas, SS304 construction with undershelf. Provides a durable and hygienic surface for food preparation, built to withstand the demands of busy professional kitchens.', shortDescription: 'Stainless steel work table with undershelf', longDescription: '🔧 Premium Stainless Steel Work Table\n\n✅ Construction: Made from high-quality SS304 stainless steel for maximum durability and corrosion resistance\n✅ Undershelf: Built-in undershelf for convenient storage of utensils, ingredients, and equipment\n✅ Hygienic: Smooth surface ensures easy cleaning and meets food safety standards\n✅ Adjustable Feet: Bullet-style adjustable feet for stability on uneven floors\n✅ Load Capacity: Supports up to 200kg evenly distributed\n\nIdeal for restaurants, hotels, canteens, bakeries, and any commercial food preparation environment. The undershelf provides valuable storage space while the spacious top surface offers ample room for food prep tasks.', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catPrep.id, name: 'Work Table with Sink', slug: 'work-table-with-sink', featuredImage: '/products/work-table-sink.png', description: 'Combined work table with integrated sink bowl for efficient food preparation. Features a deep sink bowl alongside a spacious prep surface, allowing washing and prep in one convenient station.', shortDescription: 'Work table with integrated sink bowl', longDescription: '🔧 Stainless Steel Work Table with Integrated Sink\n\n✅ Dual Purpose: Combines prep surface and washing station in one unit\n✅ Deep Sink Bowl: Large capacity sink for washing vegetables, utensils, and equipment\n✅ SS304 Construction: Premium stainless steel for durability and hygiene\n✅ Undershelf Storage: Convenient storage space beneath the work surface\n✅ Faucet Ready: Pre-drilled holes for faucet installation\n✅ Easy Drainage: Integrated drainage system with waste pipe connection\n\nPerfect for commercial kitchens where space is at a premium. The combined design eliminates the need for a separate sink, saving valuable kitchen floor space while maintaining workflow efficiency.', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catPrep.id, name: 'Veggie Washer', slug: 'veggie-washer', featuredImage: '/products/veggie-washer.png', description: 'Commercial vegetable washing machine with spray system for bulk cleaning. Designed to thoroughly clean large quantities of vegetables quickly, saving time and ensuring food safety in commercial kitchens.', shortDescription: 'Commercial vegetable washing machine', longDescription: '🔪 Commercial Vegetable Washing Machine\n\n✅ High Capacity: Wash up to 50kg of vegetables per cycle\n✅ Spray System: Powerful water jets for thorough cleaning\n✅ Bubble Technology: Air bubble agitation for gentle yet effective washing\n✅ Stainless Steel Body: SS304 construction for durability and hygiene\n✅ Water Recycling: Built-in filtration system reduces water consumption\n✅ Timer Control: Adjustable wash cycles from 2-10 minutes\n\nEssential for large-scale food preparation in hotels, hospitals, canteens, and food processing units. Removes dirt, pesticides, and contaminants efficiently, ensuring food safety compliance.', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catPrep.id, name: 'Mixer Grinder', slug: 'mixer-grinder', featuredImage: '/products/mixer-grinder.png', description: 'Heavy-duty commercial mixer grinder for spices and batter preparation. Powerful motor with stainless steel jars, ideal for grinding spices, making chutneys, and preparing batter in commercial quantities.', shortDescription: 'Heavy-duty commercial mixer grinder', longDescription: '🔪 Heavy-Duty Commercial Mixer Grinder\n\n✅ Powerful Motor: 2HP motor for continuous heavy-duty grinding\n✅ Stainless Steel Jars: 3 jars of varying sizes for different tasks\n✅ Sharp Blades: Precision-engineered blades for consistent grinding\n✅ Overload Protection: Built-in safety mechanism prevents motor burnout\n✅ Multiple Speeds: 3-speed control with pulse function\n✅ Easy Clean: Detachable jars and blades for hassle-free cleaning\n\nThe go-to machine for Indian commercial kitchens. Perfect for grinding spices, making chutneys, preparing batter for idli/dosa, and processing large quantities of ingredients efficiently.', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catPrep.id, name: 'Juice Extractor', slug: 'juice-extractor', featuredImage: '/products/juice-extractor.png', description: 'Commercial juice extractor for high-volume juice preparation. Extracts maximum juice from fruits and vegetables with minimal waste, designed for continuous operation in juice bars, restaurants, and cafeterias.', shortDescription: 'Commercial juice extractor', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catPrep.id, name: 'Tilting Wet Grinder', slug: 'tilting-wet-grinder', featuredImage: '/products/tilting-wet-grinder.png', description: 'Tilting wet grinder for idli/dosa batter with easy discharge. The tilting mechanism allows easy pouring of batter, reducing spillage and labor. Ideal for South Indian restaurants and batter production units.', shortDescription: 'Tilting wet grinder for batter', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catPrep.id, name: 'Wet Grinder', slug: 'wet-grinder', featuredImage: '/products/wet-grinder.png', description: 'Commercial wet grinder for consistent batter preparation. Delivers smooth and uniform batter for idli, dosa, and vada, with heavy-duty grinding stones for reliable performance in high-volume kitchens.', shortDescription: 'Commercial wet grinder', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catPrep.id, name: 'Pulveriser', slug: 'pulveriser', featuredImage: '/products/pulveriser.png', description: 'Industrial pulveriser for grinding spices and dry ingredients to fine powder. High-speed grinding mechanism produces consistently fine powder, perfect for spice mills, masala manufacturers, and commercial kitchens.', shortDescription: 'Industrial pulveriser for spices', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catPrep.id, name: 'Vegetable Cutter', slug: 'vegetable-cutter', featuredImage: '/products/vegetable-cutter.png', description: 'Commercial vegetable cutter with multiple blade options for uniform cutting. Offers various cutting styles including slicing, dicing, shredding, and julienne, increasing prep speed and consistency in commercial kitchens.', shortDescription: 'Commercial vegetable cutter', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catPrep.id, name: 'Potato Peeler', slug: 'potato-peeler', featuredImage: '/products/potato-peeler.png', description: 'Electric potato peeler with abrasive disc for fast peeling. Removes potato skins quickly and efficiently with minimal waste, saving significant labor time in high-volume food preparation.', shortDescription: 'Electric potato peeler', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catPrep.id, name: 'Meat Mincer', slug: 'meat-mincer', featuredImage: '/products/meat-mincer.png', description: 'Commercial meat mincer with stainless steel blades for fresh mince. Produces consistently ground meat with adjustable grinding plates, ideal for restaurants, butchers, and meat processing units.', shortDescription: 'Commercial meat mincer', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catPrep.id, name: 'Meat Slicer', slug: 'meat-slicer', featuredImage: '/products/meat-slicer.png', description: 'Professional meat slicer with adjustable thickness control. Delivers uniform slices of cold cuts, roasted meats, and deli products with precision, essential for delis, sandwich shops, and commercial kitchens.', shortDescription: 'Professional meat slicer', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },

    // Cooking Equipment (24 products) — indices 12-35
    { categoryId: catCooking.id, name: 'Stock Pot Burner', slug: 'stock-pot-burner', featuredImage: '/products/stock-pot-burner.png', description: 'Heavy-duty stock pot burner for large volume boiling and simmering. Powerful flame output supports large stock pots, ideal for preparing stocks, soups, and boiling in commercial kitchens and catering operations.', shortDescription: 'Heavy-duty stock pot burner', longDescription: '🔥 Heavy-Duty Stock Pot Burner\n\n✅ Powerful Burner: High-BTU output for rapid boiling of large volumes\n✅ Heavy Gauge Body: Cast iron burner with SS body for durability\n✅ Large Pot Support: Extra-wide pot supports for stock pots up to 100L\n✅ Flame Control: Precise flame adjustment from simmer to full power\n✅ Pilot Light: Built-in pilot for instant ignition\n✅ Safety Valve: Flame failure device cuts gas supply if flame goes out\n\nEssential for any high-volume kitchen that prepares stocks, soups, curries, and boiled dishes.', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catCooking.id, name: 'Single Burner Range', slug: 'single-burner-range', featuredImage: '/products/four-burner-range.png', description: 'Single burner commercial gas range for targeted cooking. Compact design perfect for small kitchens, food stalls, and as an additional cooking station for specialized tasks.', shortDescription: 'Single burner commercial gas range', longDescription: '🔥 Single Burner Commercial Gas Range\n\n✅ Compact Design: Space-saving single burner for focused cooking\n✅ SS304 Body: Stainless steel construction for easy cleaning and durability\n✅ Powerful Flame: High-efficiency burner for fast cooking\n✅ Sturdy Grate: Cast iron pot support for stability\n✅ Flame Control: Adjustable flame from low simmer to high heat\n✅ Easy Installation: LPG/NG compatible with standard connections\n\nPerfect for small restaurants, food stalls, cloud kitchens, and as an additional cooking station.', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catCooking.id, name: 'Two Burner Range', slug: 'two-burner-range', featuredImage: '/products/four-burner-range.png', description: 'Two burner commercial gas range for medium-duty cooking. Ideal for small restaurants, cafes, and food service operations that require multiple cooking zones in a compact footprint.', shortDescription: 'Two burner commercial gas range', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catCooking.id, name: 'Three Burner Range', slug: 'three-burner-range', featuredImage: '/products/four-burner-range.png', description: 'Three burner commercial gas range for versatile cooking. Provides three independent cooking zones with individual flame control, suitable for medium-sized restaurants and kitchen lines.', shortDescription: 'Three burner commercial gas range', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catCooking.id, name: 'Four Burner Range', slug: 'four-burner-range', featuredImage: '/products/four-burner-range.png', description: 'Four burner commercial gas range for high-volume kitchens. Offers four powerful burners with robust construction, designed for continuous use in busy restaurants, hotels, and catering operations.', shortDescription: 'Four burner commercial gas range', longDescription: '🔥 Four Burner Commercial Gas Range\n\n✅ Four Burners: Independent burners for simultaneous multi-pot cooking\n✅ Heavy-Duty Construction: SS304 body with reinforced frame\n✅ Cast Iron Grates: Durable pot supports that withstand heavy cookware\n✅ Individual Controls: Separate flame control for each burner\n✅ Pilot Lights: Standing pilots for instant ignition\n✅ Easy Cleaning: Seamless top design with removable drip trays\n\nThe workhorse of any commercial kitchen. Four independent burners allow chefs to cook multiple dishes simultaneously, maximizing kitchen throughput during peak service hours.', price: 0, stock: 50, leadTime: '5-7 days', featured: true, status: 'active' },
    { categoryId: catCooking.id, name: 'Conti Burner Range with Griddle', slug: 'conti-burner-range-with-griddle', featuredImage: '/products/four-burner-range.png', description: 'Continental style burner range with integrated griddle plate. Combines open burners with a flat griddle surface, allowing simultaneous cooking of different dishes — perfect for diverse menus.', shortDescription: 'Continental burner range with griddle', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catCooking.id, name: 'Three Burner Chinese Range', slug: 'three-burner-chinese-range', featuredImage: '/products/chinese-range.png', description: 'Three burner Chinese cooking range with wok cradle. Designed specifically for high-heat wok cooking with reinforced wok cradles and powerful burners, essential for Chinese and Asian restaurants.', shortDescription: 'Three burner Chinese cooking range', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catCooking.id, name: 'Chapati Plate with Puffer', slug: 'chapati-plate-with-puffer', featuredImage: '/products/chapati-plate.png', description: 'Gas chapati plate with puffer for bulk chapati preparation. Features a flat cooking surface and integrated puffer for puffing chapatis, enabling high-volume production for restaurants and canteens.', shortDescription: 'Gas chapati plate with puffer', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catCooking.id, name: 'Dosa Plate', slug: 'dosa-plate', featuredImage: '/products/dosa-plate.png', description: 'Commercial dosa plate with griddle surface for perfect dosas. Precision-engineered flat surface ensures even heat distribution for crispy, golden dosas every time in high-volume South Indian kitchens.', shortDescription: 'Commercial dosa plate', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catCooking.id, name: 'SS Tandoor Charcoal', slug: 'ss-tandoor-charcoal', featuredImage: '/products/ss-tandoor.png', description: 'Stainless steel charcoal tandoor for authentic flavor. Traditional charcoal-fired tandoor oven in a modern stainless steel body, delivering authentic smoky flavor for naan, kebabs, and tandoori dishes.', shortDescription: 'Stainless steel charcoal tandoor', longDescription: '🔥 Stainless Steel Charcoal Tandoor\n\n✅ Authentic Flavor: Charcoal-fired for traditional smoky tandoori taste\n✅ SS Body: Modern stainless steel exterior for durability and easy cleaning\n✅ Clay Lining: Natural clay interior for heat retention and authentic cooking\n✅ Skewer Hooks: Built-in skewer support for kebabs and tikka\n✅ Temperature: Reaches up to 480°C for perfect naan and kebabs\n✅ Insulated: Double-wall insulation for safety and heat efficiency\n\nThe heart of any Indian restaurant. Produces perfectly charred naan, juicy kebabs, and flavorful tandoori chicken with that authentic smoky flavor that customers love.', price: 0, stock: 50, leadTime: '5-7 days', featured: true, status: 'active' },
    { categoryId: catCooking.id, name: 'SS Tandoor Gas', slug: 'ss-tandoor-gas', featuredImage: '/products/ss-tandoor.png', description: 'Stainless steel gas tandoor for convenient tandoori cooking. Gas-powered tandoor offers consistent temperature control without the hassle of charcoal, perfect for restaurants wanting authentic tandoori results.', shortDescription: 'Stainless steel gas tandoor', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catCooking.id, name: 'Shawarma Machine Gas', slug: 'shawarma-machine-gas', featuredImage: '/products/shawarma-machine.png', description: 'Gas shawarma machine with vertical spit for even roasting. Rotating vertical spit with gas burners ensures even cooking and browning, ideal for restaurants and street food vendors serving shawarma.', shortDescription: 'Gas shawarma machine', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catCooking.id, name: 'Shawarma Machine Electric', slug: 'shawarma-machine-electric', featuredImage: '/products/shawarma-machine.png', description: 'Electric shawarma machine with temperature control. Features adjustable heating elements and precise temperature control for consistent results, suitable for indoor kitchens without gas supply.', shortDescription: 'Electric shawarma machine', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catCooking.id, name: 'Rotesserie Grill', slug: 'rotesserie-grill', featuredImage: '/products/rotisserie-grill.png', description: 'Commercial rotisserie grill for chicken and meat roasting. Slow-rotating spit ensures even browning and juicy results, perfect for restaurants, delis, and takeaway outlets serving roasted chicken.', shortDescription: 'Commercial rotisserie grill', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catCooking.id, name: 'Bar-B-Que', slug: 'bar-b-que', featuredImage: '/products/bbq-grill.png', description: 'Commercial BBQ grill for outdoor and indoor grilling. Heavy-duty construction with adjustable grates and heat zones, designed for restaurants, catering events, and outdoor cooking stations.', shortDescription: 'Commercial BBQ grill', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catCooking.id, name: 'Idli Steamer', slug: 'idli-steamer', featuredImage: '/products/idli-steamer.png', description: 'Commercial idli steamer for bulk idli preparation. Multi-tier steaming system cooks large batches of idlis evenly and efficiently, essential for South Indian restaurants and canteens.', shortDescription: 'Commercial idli steamer', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catCooking.id, name: 'Deep Fat Fryer', slug: 'deep-fat-fryer', featuredImage: '/products/deep-fat-fryer.png', description: 'Gas deep fat fryer for crispy fried foods. Powerful gas heating ensures fast temperature recovery, ideal for frying samosas, pakoras, french fries, and other fried items in commercial kitchens.', shortDescription: 'Gas deep fat fryer', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catCooking.id, name: 'Electric Deep Fat Fryer', slug: 'electric-deep-fat-fryer', featuredImage: '/products/deep-fat-fryer.png', description: 'Electric deep fat fryer with temperature control. Precise thermostat control maintains consistent oil temperature for perfect frying results, suitable for restaurants, food courts, and snack bars.', shortDescription: 'Electric deep fat fryer', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catCooking.id, name: 'Salamander', slug: 'salamander', featuredImage: '/products/salamander.png', description: 'Salamander grill for browning, melting and finishing dishes. Overhead infrared heating element provides intense top heat for gratinating, browning, and finishing, essential in modern restaurant kitchens.', shortDescription: 'Salamander grill', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catCooking.id, name: 'Pressure Fryer', slug: 'pressure-fryer', featuredImage: '/products/pressure-fryer.png', description: 'Pressure fryer for fast and juicy fried chicken. Combines pressure cooking with deep frying for moisture-sealed, juicy results in less time — the secret behind perfect fried chicken.', shortDescription: 'Commercial pressure fryer', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catCooking.id, name: 'Sandwich Griller', slug: 'sandwich-griller', featuredImage: '/products/sandwich-griller.png', description: 'Commercial sandwich griller with ribbed plates. Ribbed cast iron plates create attractive grill marks while melting cheese and heating fillings, perfect for cafes, sandwich shops, and quick-service restaurants.', shortDescription: 'Commercial sandwich griller', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catCooking.id, name: 'Conveyor Pizza Oven', slug: 'conveyor-pizza-oven', featuredImage: '/products/pizza-oven.png', description: 'Conveyor pizza oven for consistent pizza baking. Continuous conveyor system ensures even baking with adjustable speed and temperature, ideal for high-volume pizza production in pizzerias and food chains.', shortDescription: 'Conveyor pizza oven', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catCooking.id, name: 'Conveyor Toaster', slug: 'conveyor-toaster', featuredImage: '/products/conveyor-toaster.png', description: 'Conveyor toaster for high-volume toast preparation. Continuous feed design with adjustable browning control, perfect for breakfast buffets, hotels, and cafeterias serving large numbers of guests.', shortDescription: 'Conveyor toaster', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catCooking.id, name: 'Pizza Oven Electric/Gas', slug: 'pizza-oven-electric-gas', featuredImage: '/products/pizza-oven-deck.png', description: 'Pizza oven available in electric and gas variants. Versatile pizza oven with deck-style baking for authentic pizza results, available in both electric and gas configurations to suit any kitchen setup.', shortDescription: 'Pizza oven electric/gas', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },

    // Serving Equipment (9 products) — indices 36-44
    { categoryId: catServing.id, name: 'Hot Bain Marie', slug: 'hot-bain-marie', featuredImage: '/products/bain-marie.png', description: 'Heated bain marie for keeping food warm during service. Multiple containers with precise temperature control keep prepared dishes at safe serving temperatures, essential for buffet lines and banquet service.', shortDescription: 'Heated bain marie', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catServing.id, name: 'Pick Up Table', slug: 'pick-up-table', featuredImage: '/categories/serving-equipment.png', description: 'Stainless steel pick up table for food service area. Provides an organized serving station where kitchen staff can place ready dishes for pickup, streamlining the flow between kitchen and dining area.', shortDescription: 'Stainless steel pick up table', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catServing.id, name: 'SS Trolley', slug: 'ss-trolley', featuredImage: '/products/ss-trolley.png', description: 'Stainless steel utility trolley for kitchen transport. Versatile trolley for transporting ingredients, equipment, and prepared food throughout the kitchen, built with durable SS construction for daily commercial use.', shortDescription: 'Stainless steel utility trolley', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catServing.id, name: 'Snacks Trolley', slug: 'snacks-trolley', featuredImage: '/products/ss-trolley.png', description: 'Mobile snacks trolley with display shelves. Features tiered display shelves for attractive presentation of snacks and small items, with wheels for easy mobility in hotel lobbies, events, and conferences.', shortDescription: 'Mobile snacks display trolley', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catServing.id, name: 'Tea Coffee Dispenser', slug: 'tea-coffee-dispenser', featuredImage: '/products/tea-coffee-dispenser.png', description: 'Commercial tea and coffee dispenser with multiple faucets. Dispenses hot tea and coffee simultaneously with insulated containers, ideal for breakfast buffets, offices, and banquet service.', shortDescription: 'Commercial tea coffee dispenser', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catServing.id, name: 'Plate Warmer', slug: 'plate-warmer', featuredImage: '/products/plate-warmer.png', description: 'Plate warming cabinet for hot plate service. Keeps stacks of plates at the perfect serving temperature, ensuring food stays hot from kitchen to table in fine dining and banquet settings.', shortDescription: 'Plate warming cabinet', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catServing.id, name: 'Hot Food Trolley', slug: 'hot-food-trolley', featuredImage: '/products/hot-food-trolley.png', description: 'Insulated hot food trolley for banquet service. Heated and insulated trolley keeps food at safe serving temperatures during transport, essential for room service, banquet halls, and hospital catering.', shortDescription: 'Insulated hot food trolley', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catServing.id, name: 'Food Trolley', slug: 'food-trolley', featuredImage: '/products/ss-trolley.png', description: 'General purpose food transport trolley. Rugged stainless steel construction for daily use in transporting food, dishes, and supplies between kitchen, storage, and service areas.', shortDescription: 'General purpose food trolley', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catServing.id, name: 'Tray Rack Trolley', slug: 'tray-rack-trolley', featuredImage: '/products/ss-trolley.png', description: 'Tray rack trolley for cafeteria and canteen service. Designed to hold and transport meal trays efficiently, with multiple rack levels for high-capacity tray handling in institutional dining settings.', shortDescription: 'Tray rack trolley for cafeterias', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },

    // Washing Equipment (9 products) — indices 45-53
    { categoryId: catWashing.id, name: 'Dirty Dish Landing Table', slug: 'dirty-dish-landing-table', featuredImage: '/categories/washing-equipment.png', description: 'Stainless steel dish landing table for soiled dishes. Provides a designated area for stacking used dishes before washing, keeping the dishwashing area organized and efficient.', shortDescription: 'Dish landing table for soiled dishes', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catWashing.id, name: 'Three Sink Unit', slug: 'three-sink-unit', featuredImage: '/products/three-sink-unit.png', description: 'Three-compartment sink unit for wash-rinse-sanitize. Meets health code requirements with separate compartments for washing, rinsing, and sanitizing, essential for food safety compliance.', shortDescription: 'Three-compartment sink unit', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catWashing.id, name: 'Soiled Dish Trolley', slug: 'soiled-dish-trolley', featuredImage: '/categories/washing-equipment.png', description: 'Mobile trolley for collecting soiled dishes. Rolls easily through dining areas to collect dirty dishes, reducing breakage and improving efficiency in restaurant and banquet operations.', shortDescription: 'Soiled dish collection trolley', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catWashing.id, name: 'Two Sink Unit', slug: 'two-sink-unit', featuredImage: '/products/three-sink-unit.png', description: 'Two-compartment stainless steel sink unit. Provides separate wash and rinse basins in a compact footprint, suitable for smaller kitchens and bar areas.', shortDescription: 'Two-compartment sink unit', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catWashing.id, name: 'Single Sink Unit', slug: 'single-sink-unit', featuredImage: '/products/three-sink-unit.png', description: 'Single compartment stainless steel sink unit. Compact and versatile sink for hand washing, food prep washing, or utility use in commercial kitchens with limited space.', shortDescription: 'Single compartment sink unit', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catWashing.id, name: 'Hood Type Dishwasher', slug: 'hood-type-dishwasher', featuredImage: '/products/dishwasher.png', description: 'Hood type commercial dishwasher for high-volume cleaning. Lift-style hood allows easy loading of dish racks, with powerful wash cycles for fast turnaround in busy restaurants and hotels.', shortDescription: 'Hood type commercial dishwasher', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catWashing.id, name: 'Undercounter Dishwasher', slug: 'undercounter-dishwasher', featuredImage: '/products/dishwasher.png', description: 'Compact undercounter dishwasher for small kitchens. Fits beneath the counter for space-saving installation, providing commercial-grade dishwashing in cafes, bars, and small restaurants.', shortDescription: 'Undercounter dishwasher', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catWashing.id, name: 'Glass Dishwasher', slug: 'glass-dishwasher', featuredImage: '/products/glass-washer.png', description: 'Specialized glass washer for bars and restaurants. Gentle wash cycle designed specifically for glassware, preventing breakage while ensuring spotless, sparkling results every time.', shortDescription: 'Specialized glass washer', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catWashing.id, name: 'Rack Conveyor Dishwasher', slug: 'rack-conveyor-dishwasher', featuredImage: '/products/conveyor-dishwasher.png', description: 'Rack conveyor dishwasher for continuous dishwashing. Conveyor system automatically moves dish racks through wash, rinse, and sanitize cycles, providing high-throughput cleaning for institutional kitchens.', shortDescription: 'Rack conveyor dishwasher', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },

    // Storage Equipment (9 products) — indices 54-62
    { categoryId: catStorage.id, name: 'Storage Rack', slug: 'storage-rack', featuredImage: '/products/storage-rack.png', description: 'Stainless steel storage rack for kitchen organization. Multi-tier shelving provides ample storage space for ingredients, supplies, and equipment, keeping the kitchen organized and accessible.', shortDescription: 'Stainless steel storage rack', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catStorage.id, name: 'Clean Dish Rack', slug: 'clean-dish-rack', featuredImage: '/products/storage-rack.png', description: 'Clean dish storage rack with drainage. Designed for air-drying and storing washed dishes, with integrated drainage to prevent water accumulation and maintain hygiene.', shortDescription: 'Clean dish storage rack', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catStorage.id, name: 'Pot Rack', slug: 'pot-rack', featuredImage: '/products/storage-rack.png', description: 'Heavy-duty pot storage rack. Robust construction supports the weight of large commercial pots and pans, keeping cookware organized and easily accessible in busy kitchens.', shortDescription: 'Heavy-duty pot storage rack', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catStorage.id, name: 'Wall Shelf', slug: 'wall-shelf', featuredImage: '/products/wall-shelf.png', description: 'Stainless steel wall shelf for additional storage. Wall-mounted design maximizes vertical space, providing extra storage without taking up valuable floor space in compact kitchens.', shortDescription: 'Stainless steel wall shelf', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catStorage.id, name: 'Dunnage Rack', slug: 'dunnage-rack', featuredImage: '/products/storage-rack.png', description: 'Dunnage rack for storing items off the floor. Elevates supplies and ingredients above the floor for hygiene compliance, with heavy-duty construction supporting substantial weight.', shortDescription: 'Dunnage storage rack', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catStorage.id, name: 'Potato Onion Bin', slug: 'potato-onion-bin', featuredImage: '/products/storage-cabinet.png', description: 'Ventilated storage bin for potatoes and onions. Designed with ventilation holes for proper air circulation, preventing spoilage and sprouting of bulk root vegetables in commercial kitchens.', shortDescription: 'Ventilated potato onion bin', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catStorage.id, name: 'Storage Bin', slug: 'storage-bin', featuredImage: '/products/storage-cabinet.png', description: 'Food-grade storage bin for dry ingredients. Airtight construction keeps dry ingredients fresh and protected from pests, with easy-access design for scooping and measuring.', shortDescription: 'Food-grade storage bin', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catStorage.id, name: 'Ingredients Bin', slug: 'ingredients-bin', featuredImage: '/products/storage-cabinet.png', description: 'Clear ingredients bin for easy identification. Transparent design allows quick visual identification of contents, perfect for organizing and accessing frequently used ingredients during cooking.', shortDescription: 'Clear ingredients storage bin', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catStorage.id, name: 'Storage Cabinet', slug: 'storage-cabinet', featuredImage: '/products/storage-cabinet.png', description: 'Lockable storage cabinet for valuable ingredients. Secure storage with locking doors protects high-value ingredients and supplies, with adjustable shelves for flexible organization.', shortDescription: 'Lockable storage cabinet', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },

    // Refrigeration Equipment (12 products) — indices 63-74
    { categoryId: catRefrigeration.id, name: 'Two Door Undercounter', slug: 'two-door-undercounter', featuredImage: '/products/undercounter-fridge.png', description: 'Two door undercounter refrigerator for compact storage. Fits beneath work surfaces to maximize kitchen space, providing convenient access to refrigerated ingredients at the point of preparation.', shortDescription: 'Two door undercounter refrigerator', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catRefrigeration.id, name: 'Three Door Undercounter', slug: 'three-door-undercounter', featuredImage: '/products/undercounter-fridge.png', description: 'Three door undercounter refrigerator with more capacity. Extended three-door design offers additional refrigerated storage while maintaining the convenient undercounter form factor.', shortDescription: 'Three door undercounter refrigerator', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catRefrigeration.id, name: 'Pizza Assembly Unit', slug: 'pizza-assembly-unit', featuredImage: '/products/pizza-prep-unit.png', description: 'Refrigerated pizza preparation unit with ingredient rail. Features a cutting board surface with refrigerated ingredient containers, designed for fast and efficient pizza assembly in pizzerias.', shortDescription: 'Refrigerated pizza prep unit', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catRefrigeration.id, name: 'Cold Room', slug: 'cold-room', featuredImage: '/products/cold-room.png', description: 'Walk-in cold room with PUF insulated panels. Modular construction with high-density PUF insulation for energy-efficient cold storage, customizable in size for large-scale food storage needs.', shortDescription: 'Walk-in cold room', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catRefrigeration.id, name: 'Visi Cooler', slug: 'visi-cooler', featuredImage: '/products/visi-cooler.png', description: 'Glass door visi cooler for beverage display. Transparent doors allow customers to see products while maintaining consistent refrigeration, ideal for retail and self-service beverage areas.', shortDescription: 'Glass door visi cooler', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catRefrigeration.id, name: 'Four Door Refrigerator', slug: 'four-door-refrigerator', featuredImage: '/products/four-door-fridge.png', description: 'Four door commercial upright refrigerator. Large-capacity upright unit with four doors for organized storage of high volumes of refrigerated items in commercial kitchens and food service operations.', shortDescription: 'Four door commercial refrigerator', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catRefrigeration.id, name: 'Two Door Refrigerator', slug: 'two-door-refrigerator', featuredImage: '/products/four-door-fridge.png', description: 'Two door commercial upright refrigerator. Reliable upright refrigeration with two compartments for organized storage, suitable for medium-volume operations in restaurants and commercial kitchens.', shortDescription: 'Two door commercial refrigerator', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catRefrigeration.id, name: 'Ice Cube Machine', slug: 'ice-cube-machine', featuredImage: '/products/ice-cube-machine.png', description: 'Commercial ice cube maker for bars and restaurants. Produces clear, uniform ice cubes at high capacity, essential for bars, restaurants, hotels, and any establishment serving cold beverages.', shortDescription: 'Commercial ice cube machine', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catRefrigeration.id, name: 'Deep Freezer', slug: 'deep-freezer', featuredImage: '/products/deep-freezer.png', description: 'Chest deep freezer for bulk frozen storage. Large-capacity chest freezer for storing frozen foods at consistently low temperatures, suitable for restaurants, supermarkets, and food processing units.', shortDescription: 'Chest deep freezer', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catRefrigeration.id, name: 'Single Door Visi Cooler', slug: 'single-door-visi-cooler', featuredImage: '/products/visi-cooler.png', description: 'Compact single door display cooler. Space-saving visi cooler with glass door for product visibility, perfect for small retail spaces, cafes, and convenience stores.', shortDescription: 'Single door visi cooler', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catRefrigeration.id, name: 'Three Door Counter', slug: 'three-door-counter', featuredImage: '/products/four-door-fridge.png', description: 'Three door counter height refrigerator. Counter-height design integrates seamlessly with kitchen workspace, providing refrigerated storage at a convenient working height.', shortDescription: 'Three door counter refrigerator', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catRefrigeration.id, name: 'Supreme Dark Undercounter', slug: 'supreme-dark-undercounter', featuredImage: '/products/undercounter-fridge.png', description: 'Premium undercounter refrigerator with dark finish. Stylish dark exterior with commercial-grade refrigeration performance, ideal for open kitchen designs where aesthetics matter.', shortDescription: 'Premium dark undercounter refrigerator', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },

    // Bakery Equipment (9 products) — indices 75-83
    { categoryId: catBakery.id, name: 'Deck Oven', slug: 'deck-oven', featuredImage: '/products/deck-oven.png', description: 'Multi-deck baking oven for bread and pastry. Independent temperature control for each deck allows simultaneous baking of different products, ideal for artisan bakeries and commercial bread production.', shortDescription: 'Multi-deck baking oven', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catBakery.id, name: 'Spiral Mixer', slug: 'spiral-mixer', featuredImage: '/products/spiral-mixer.png', description: 'Spiral dough mixer for consistent bread dough preparation. Spiral mixing action develops gluten structure efficiently without overheating dough, producing superior bread texture in large batches.', shortDescription: 'Spiral dough mixer', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catBakery.id, name: 'Planetary Mixer', slug: 'planetary-mixer', featuredImage: '/products/planetary-mixer.png', description: 'Planetary mixer for versatile mixing applications. Multi-function mixer with interchangeable attachments for mixing, whipping, and kneading, essential for bakeries, patisseries, and commercial kitchens.', shortDescription: 'Planetary mixer', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catBakery.id, name: 'Rotary Oven', slug: 'rotary-oven', featuredImage: '/products/rotary-oven.png', description: 'Rotary rack oven for even baking of large batches. Rotating rack ensures uniform heat distribution throughout the oven cavity, perfect for consistent baking of bread, pastries, and cookies in large quantities.', shortDescription: 'Rotary rack oven', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catBakery.id, name: 'Combi Oven', slug: 'combi-oven', featuredImage: '/products/convection-oven.png', description: 'Combination steamer and oven for versatile cooking. Switches between convection, steam, and combination modes for maximum cooking flexibility, reducing the need for multiple pieces of equipment.', shortDescription: 'Combination steamer and oven', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catBakery.id, name: 'Convection Oven', slug: 'convection-oven', featuredImage: '/products/convection-oven.png', description: 'Convection oven with fan-forced even baking. Fan circulation ensures uniform temperature throughout the cavity for consistent baking results, suitable for bakeries and commercial kitchens.', shortDescription: 'Convection oven', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catBakery.id, name: 'Bread Slicer', slug: 'bread-slicer', featuredImage: '/products/bread-slicer.png', description: 'Commercial bread slicer for uniform slices. Adjustable slice thickness with high-speed cutting blades, producing consistent slices for sandwich bread, toast, and specialty loaves.', shortDescription: 'Commercial bread slicer', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catBakery.id, name: 'Dough Sheeter', slug: 'dough-sheeter', featuredImage: '/products/dough-sheeter.png', description: 'Dough sheeter for rolling consistent pastry sheets. Adjustable roller gap creates sheets of uniform thickness for croissants, puff pastry, and pie crusts, reducing manual labor and ensuring consistency.', shortDescription: 'Dough sheeter', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catBakery.id, name: 'Conveyor Pizza Oven', slug: 'conveyor-pizza-oven-bakery', featuredImage: '/products/pizza-oven.png', description: 'Conveyor pizza oven for bakery pizza production. Continuous belt system with precise temperature control for consistent pizza baking, designed for high-volume bakery and pizzeria operations.', shortDescription: 'Conveyor pizza oven for bakeries', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },

    // Display Equipment (4 products) — indices 84-87
    { categoryId: catDisplay.id, name: 'Dry Display Counter', slug: 'dry-display-counter', featuredImage: '/products/dry-display-counter.png', description: 'Ambient display counter for packaged snacks and dry items. Elegant design with curved glass and LED lighting for attractive presentation of dry snacks, packaged foods, and bakery items.', shortDescription: 'Dry display counter', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catDisplay.id, name: 'Refrigerated Display Counter', slug: 'refrigerated-display-counter', featuredImage: '/products/refrigerated-display.png', description: 'Refrigerated display counter for perishable items. Maintains consistent cold temperature while showcasing products through transparent glass, ideal for kebabs, desserts, dairy, and cold cuts.', shortDescription: 'Refrigerated display counter', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catDisplay.id, name: 'Hot Display Counter', slug: 'hot-display-counter', featuredImage: '/products/dry-display-counter.png', description: 'Heated display counter for keeping food warm. Maintains safe serving temperatures while displaying hot food items attractively, perfect for fried snacks, gravies, and hot buffet items.', shortDescription: 'Hot display counter', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catDisplay.id, name: 'Cake Display Counter', slug: 'cake-display-counter', featuredImage: '/products/cake-display.png', description: 'Elegant cake display with 360° visibility. Full glass construction with internal lighting and temperature control showcases cakes and pastries beautifully, essential for bakeries and cafes.', shortDescription: 'Cake display counter', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },

    // Food Carts (3 products) — indices 88-90
    { categoryId: catFoodCarts.id, name: 'Food Service Cart', slug: 'food-service-cart', featuredImage: '/products/food-cart.png', description: 'Mobile food service cart for catering and events. Versatile cart with multiple shelves and work surfaces for food preparation and service at events, buffets, and outdoor catering.', shortDescription: 'Mobile food service cart', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catFoodCarts.id, name: 'Chaat Counter Cart', slug: 'chaat-counter-cart', featuredImage: '/products/food-cart.png', description: 'Dedicated chaat counter cart for street food style service. Purpose-built for Indian street food preparation and service with work surface, storage, and display areas for chaat ingredients and condiments.', shortDescription: 'Chaat counter cart', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
    { categoryId: catFoodCarts.id, name: 'Beverage Cart', slug: 'beverage-cart', featuredImage: '/products/food-cart.png', description: 'Mobile beverage service cart with cooling. Insulated compartments keep beverages cold, with serving surface and storage for cups and accessories, ideal for events, conferences, and hotel lobbies.', shortDescription: 'Mobile beverage cart', price: 0, stock: 50, leadTime: '5-7 days', featured: false, status: 'active' },
  ]

  const products: any[] = []
  for (const pData of productsData) {
    const product = await db.product.create({ data: pData })
    products.push(product)
  }

  // ── Product Variants (size-based options for select products) ──
  const variantData = [
    // Work Table (products[0]) - Standard/Heavy Duty variants
    { productId: products[0].id, variants: [
      { name: 'Standard (1200mm)', sku: 'WT-1200', price: 0, stock: 50, weight: '30kg', dimensions: '1200x600x850mm', isDefault: true, sortOrder: 1 },
      { name: 'Large (1500mm)', sku: 'WT-1500', price: 0, stock: 30, weight: '35kg', dimensions: '1500x600x850mm', isDefault: false, sortOrder: 2 },
      { name: 'Extra Large (1800mm)', sku: 'WT-1800', price: 0, stock: 20, weight: '40kg', dimensions: '1800x600x850mm', isDefault: false, sortOrder: 3 },
    ]},
    // Cold Room (products[66]) - Size variants
    { productId: products[66].id, variants: [
      { name: 'Small (6x6x8 ft)', sku: 'CR-668', price: 0, stock: 10, weight: '200kg', dimensions: '6x6x8 ft', isDefault: true, sortOrder: 1 },
      { name: 'Medium (8x8x10 ft)', sku: 'CR-8810', price: 0, stock: 5, weight: '350kg', dimensions: '8x8x10 ft', isDefault: false, sortOrder: 2 },
      { name: 'Large (10x12x12 ft)', sku: 'CR-101212', price: 0, stock: 3, weight: '500kg', dimensions: '10x12x12 ft', isDefault: false, sortOrder: 3 },
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

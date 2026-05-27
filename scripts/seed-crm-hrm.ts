import { db } from '../src/lib/db';
async function seed() {
  const companies = [
    { name: 'ITC Hotels', industry: 'Hospitality', phone: '+91-9812345678', email: 'procurement@itc.com', address: 'Chennai, India', revenue: 2500000, status: 'active' },
    { name: 'Taj Group', industry: 'Hospitality', phone: '+91-9823456789', email: 'supply@taj.com', address: 'Mumbai, India', revenue: 1800000, status: 'active' },
    { name: 'Haldiram Foods', industry: 'Food Manufacturing', phone: '+91-9834567890', email: 'purchase@haldirams.com', address: 'Delhi, India', revenue: 950000, status: 'active' },
    { name: 'Cafe Coffee Day', industry: 'F&B Chain', phone: '+91-9845678901', email: 'ops@ccd.com', address: 'Bangalore, India', revenue: 720000, status: 'prospect' },
    { name: 'Lemon Tree Hotels', industry: 'Hospitality', phone: '+91-9856789012', email: 'kitchen@lemontree.com', address: 'Delhi, India', revenue: 450000, status: 'prospect' },
  ]
  for (const c of companies) await db.company.create({ data: c })
  const pipeline = await db.pipeline.create({ data: { name: 'Sales Pipeline', description: 'Default sales pipeline', isDefault: true, stages: '[{"id":"1","name":"New","order":1},{"id":"2","name":"Contacted","order":2},{"id":"3","name":"Proposal","order":3},{"id":"4","name":"Negotiation","order":4},{"id":"5","name":"Won","order":5}]', status: 'active' } })
  const deals = [
    { pipelineId: pipeline.id, title: 'ITC Hotel Kitchen Setup', value: 2500000, stage: 'Proposal', probability: 60, status: 'open' },
    { pipelineId: pipeline.id, title: 'Taj Group Burner Order', value: 780000, stage: 'Negotiation', probability: 75, status: 'open' },
    { pipelineId: pipeline.id, title: 'Haldiram Mixer Order', value: 560000, stage: 'Won', probability: 100, status: 'won' },
    { pipelineId: pipeline.id, title: 'CCD Under-counter Fridge', value: 420000, stage: 'New', probability: 20, status: 'open' },
  ]
  for (const d of deals) await db.pipelineDeal.create({ data: d })
  const sources = [{ name: 'Website', type: 'organic', cost: 0, status: 'active' }, { name: 'Google Ads', type: 'paid', cost: 15000, status: 'active' }, { name: 'Referral', type: 'referral', cost: 0, status: 'active' }, { name: 'IndiaMART', type: 'paid', cost: 8000, status: 'active' }, { name: 'Social Media', type: 'social', cost: 5000, status: 'active' }]
  for (const s of sources) await db.leadSource.create({ data: s })
  const templates = [{ name: 'Welcome Email', subject: 'Welcome to Urban Kitchen!', body: 'Dear {{name}}, Thank you for your interest.', category: 'general', variables: '["name","company"]', status: 'active' }, { name: 'Quotation Follow-up', subject: 'Following up on your quotation', body: 'Dear {{name}}, We wanted to follow up.', category: 'followup', variables: '["name","quotation_number"]', status: 'active' }]
  for (const t of templates) await db.emailTemplate.create({ data: t })
  const sequences = [{ name: 'New Lead Nurture', description: '3-step email sequence for new leads', triggerType: 'lead_created', status: 'active' }, { name: 'Quotation Follow-up Series', description: 'Follow-up after sending quotation', triggerType: 'manual', status: 'active' }]
  for (const s of sequences) await db.emailSequence.create({ data: s })
  const integrations = [{ name: 'WhatsApp Business', category: 'crm', config: '{}', status: 'connected' }, { name: 'Gmail', category: 'email', config: '{}', status: 'connected' }, { name: 'Tally', category: 'accounting', config: '{}', status: 'disconnected' }, { name: 'Google Analytics', category: 'analytics', config: '{}', status: 'connected' }]
  for (const i of integrations) await db.integration.create({ data: i })
  const forms = [{ name: 'Contact Form', fields: '[{"name":"name","type":"text","label":"Name","required":true}]', submissions: 45, status: 'active' }, { name: 'AMC Quote Request', fields: '[{"name":"name","type":"text","label":"Name","required":true}]', submissions: 18, status: 'active' }]
  for (const f of forms) await db.crmForm.create({ data: f })
  const impData = [{ fileName: 'leads_jan_2025.csv', source: 'csv', records: 120, successful: 118, failed: 2, status: 'completed' }, { fileName: 'contacts_indiamart.xlsx', source: 'excel', records: 45, successful: 42, failed: 3, status: 'completed' }]
  for (const i of impData) await db.crmImport.create({ data: i })
  const convData = [{ channel: 'email', subject: 'Kitchen setup inquiry', status: 'open' }, { channel: 'whatsapp', subject: 'AMC renewal', status: 'open' }, { channel: 'phone', subject: 'Service request', status: 'closed' }]
  for (const c of convData) await db.conversation.create({ data: c })
  const departments = [{ name: 'Production', head: 'Rajesh Kumar', budget: 500000, status: 'active' }, { name: 'Sales', head: 'Priya Sharma', budget: 300000, status: 'active' }, { name: 'Operations', head: 'Amit Patel', budget: 250000, status: 'active' }, { name: 'Quality Control', head: 'Kavita Nair', budget: 150000, status: 'active' }, { name: 'Service', head: 'Ravi Singh', budget: 200000, status: 'active' }]
  for (const d of departments) await db.department.create({ data: d })
  const desigData = [{ name: 'Senior Welder', level: 3, minSalary: 25000, maxSalary: 35000, status: 'active' }, { name: 'QC Inspector', level: 4, minSalary: 28000, maxSalary: 40000, status: 'active' }, { name: 'Sales Manager', level: 5, minSalary: 45000, maxSalary: 65000, status: 'active' }, { name: 'Operations Manager', level: 5, minSalary: 42000, maxSalary: 60000, status: 'active' }, { name: 'Production Head', level: 6, minSalary: 55000, maxSalary: 80000, status: 'active' }]
  for (const d of desigData) await db.designation.create({ data: d })
  const holData = [{ name: 'Republic Day', date: new Date('2025-01-26'), type: 'public' }, { name: 'Holi', date: new Date('2025-03-14'), type: 'public' }, { name: 'Independence Day', date: new Date('2025-08-15'), type: 'public' }, { name: 'Diwali', date: new Date('2025-10-20'), type: 'public' }, { name: 'Christmas', date: new Date('2025-12-25'), type: 'public' }, { name: 'Company Day', date: new Date('2025-06-15'), type: 'company' }]
  for (const h of holData) await db.holiday.create({ data: h })
  const notData = [{ title: 'Annual Health Checkup', content: 'All employees must undergo annual health checkup.', priority: 'normal', postedBy: 'HR', status: 'active' }, { title: 'Safety Protocol Update', content: 'New safety protocols for production floor.', priority: 'urgent', postedBy: 'Safety Officer', status: 'active' }, { title: 'Diwali Bonus', content: 'Diwali bonus will be credited with October salary.', priority: 'high', postedBy: 'Finance', status: 'active' }]
  for (const n of notData) await db.notice.create({ data: n })
  const jobData = [{ title: 'Senior Welder', department: 'Production', type: 'full-time', experience: '3-5 years', salaryRange: '25-35K', description: 'Experienced welder', requirements: 'ITI in Welding', location: 'New Delhi', status: 'open', applications: 12 }, { title: 'Service Technician', department: 'Service', type: 'full-time', experience: '2-3 years', salaryRange: '20-28K', description: 'Field service technician', requirements: 'Diploma in Electrical', location: 'New Delhi', status: 'open', applications: 8 }, { title: 'Sales Executive', department: 'Sales', type: 'full-time', experience: '1-3 years', salaryRange: '18-25K', description: 'B2B sales executive', requirements: 'Graduate', location: 'Pan India', status: 'open', applications: 15 }]
  for (const j of jobData) await db.jobOpening.create({ data: j })
  const intData = [{ candidateName: 'Arjun Kumar', candidateEmail: 'arjun@email.com', position: 'Senior Welder', date: new Date(), interviewer: 'Rajesh Kumar', rating: 4, feedback: 'Good skills', status: 'completed' }, { candidateName: 'Meera Patel', candidateEmail: 'meera@email.com', position: 'Sales Executive', date: new Date(Date.now() + 86400000), interviewer: 'Priya Sharma', status: 'scheduled' }]
  for (const i of intData) await db.interview.create({ data: i })
  const trainData = [{ name: 'Welding Safety Training', type: 'internal', duration: '2 days', trainer: 'Safety Officer', enrolled: 15, maxSeats: 20, startDate: new Date(Date.now() + 7*86400000), endDate: new Date(Date.now() + 9*86400000), status: 'upcoming' }, { name: 'Advanced SS316 Fabrication', type: 'internal', duration: '3 days', trainer: 'Rajesh Kumar', enrolled: 8, maxSeats: 10, status: 'ongoing' }]
  for (const t of trainData) await db.trainingProgram.create({ data: t })
  const assetData = [{ name: 'MIG Welder #1', type: 'equipment', serialNo: 'MW-001', value: 85000, purchaseDate: new Date('2024-01-15'), status: 'assigned' }, { name: 'Dell Laptop', type: 'electronics', serialNo: 'DL-003', value: 55000, purchaseDate: new Date('2024-03-05'), status: 'available' }, { name: 'Service Van', type: 'vehicle', serialNo: 'SV-001', value: 800000, purchaseDate: new Date('2023-06-15'), status: 'assigned' }]
  for (const a of assetData) await db.asset.create({ data: a })
  const shiftData = [{ name: 'Morning Shift', startTime: '06:00', endTime: '14:00', breakDuration: 30, employees: 10, supervisor: 'Rajesh Kumar', status: 'active' }, { name: 'General Shift', startTime: '09:00', endTime: '18:00', breakDuration: 60, employees: 12, supervisor: 'Amit Patel', status: 'active' }, { name: 'Evening Shift', startTime: '14:00', endTime: '22:00', breakDuration: 30, employees: 8, supervisor: 'Ravi Singh', status: 'active' }]
  for (const s of shiftData) await db.shift.create({ data: s })
  const teamData = [{ name: 'Production Team A', members: 8, department: 'Production', status: 'active' }, { name: 'Sales North', members: 4, department: 'Sales', status: 'active' }, { name: 'Service Delhi NCR', members: 3, department: 'Service', status: 'active' }]
  for (const t of teamData) await db.team.create({ data: t })
  const emps = await db.employee.findMany({ take: 3 })
  for (const emp of emps) {
    await db.performanceReview.create({ data: { employeeId: emp.id, period: 'Q4 2024', score: 3.5 + Math.random() * 1.5, feedback: 'Consistent performer', status: 'completed' } })
    await db.appraisal.create({ data: { employeeId: emp.id, cycle: 'Annual 2024', rating: 3 + Math.random() * 2, hikePercent: 8 + Math.floor(Math.random() * 10), newSalary: emp.salary * 1.12, comments: 'Satisfactory performance', status: 'approved' } })
    await db.workReport.create({ data: { employeeId: emp.id, date: new Date(), hours: 8.5, tasks: '["Completed fabrication task","Quality check"]', summary: 'Productive day', status: 'submitted' } })
  }
  console.log('Done!')
}
seed().catch(console.error)

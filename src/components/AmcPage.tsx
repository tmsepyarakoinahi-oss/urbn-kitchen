'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Wrench,
  Clock,
  CheckCircle2,
  Phone,
  ArrowRight,
  Headphones,
  ChevronRight,
  Flame,
  Snowflake,
  Droplets,
  Monitor,
  UtensilsCrossed,
  Wind,
  Zap,
  CalendarCheck,
  FileCheck,
  LifeBuoy,
  Award,
  Timer,
  Settings,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

/* ─── helpers ─── */
const formatPrice = (price: number) => {
  const str = price.toString()
  let lastThree = str.substring(str.length - 3)
  const otherNumbers = str.substring(0, str.length - 3)
  if (otherNumbers !== '') lastThree = ',' + lastThree
  return '₹' + otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree
}

/* ─── Counter animation hook ─── */
function useCounter(end: number, duration = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const startTime = performance.now()
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * end))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )
    const el = ref.current
    if (el) observer.observe(el)
    return () => {
      if (el) observer.unobserve(el)
    }
  }, [end, duration])

  return { count, ref }
}

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
}

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
}

/* ─── Plan data ─── */
const plans = [
  {
    name: 'Basic',
    price: 15000,
    description: 'Essential maintenance for small setups',
    featured: false,
    badge: null,
    features: [
      { text: 'Preventive maintenance', included: true },
      { text: '2 visits/year', included: true },
      { text: '72hr response time', included: true },
      { text: 'Phone support', included: true },
      { text: 'Parts at 10% discount', included: true },
      { text: 'Emergency visits', included: false },
      { text: 'Free replacement parts', included: false },
      { text: 'Annual kitchen audit', included: false },
    ],
  },
  {
    name: 'Standard',
    price: 35000,
    description: 'Complete protection for growing businesses',
    featured: false,
    badge: 'Most Popular',
    features: [
      { text: 'Preventive + corrective maintenance', included: true },
      { text: '4 visits/year', included: true },
      { text: '48hr response time', included: true },
      { text: 'Priority phone + email support', included: true },
      { text: 'Parts at 15% discount', included: true },
      { text: 'Emergency visits (2/year)', included: true },
      { text: 'Free replacement parts', included: false },
      { text: 'Annual kitchen audit', included: false },
    ],
  },
  {
    name: 'Premium',
    price: 65000,
    description: 'Comprehensive coverage for enterprise kitchens',
    featured: true,
    badge: null,
    features: [
      { text: 'Comprehensive coverage', included: true },
      { text: '6 visits/year', included: true },
      { text: '24hr response time', included: true },
      { text: '24/7 dedicated support', included: true },
      { text: 'Parts at 25% discount', included: true },
      { text: 'Unlimited emergency visits', included: true },
      { text: 'Free replacement parts', included: true },
      { text: 'Annual kitchen audit', included: true },
    ],
  },
]

/* ─── Coverage data ─── */
const coverageItems = [
  {
    icon: <Flame className="w-7 h-7" />,
    title: 'Burners & Ranges',
    desc: 'Industrial burners, cooking ranges, tandoors, and griddles — all serviced and calibrated.',
  },
  {
    icon: <Snowflake className="w-7 h-7" />,
    title: 'Refrigeration Units',
    desc: 'Walk-in cold rooms, deep freezers, display chillers, and under-counter units maintained.',
  },
  {
    icon: <Droplets className="w-7 h-7" />,
    title: 'Dishwashing Equipment',
    desc: 'Commercial dishwashers, glass washers, and pot washers — cleaning and descaling.',
  },
  {
    icon: <Monitor className="w-7 h-7" />,
    title: 'Display Counters',
    desc: 'Hot & cold display counters, bakery showcases, and salad bars — temperature calibration.',
  },
  {
    icon: <UtensilsCrossed className="w-7 h-7" />,
    title: 'Food Prep Machines',
    desc: 'Mixers, slicers, peelers, vegetable cutters, and processors — lubrication and repair.',
  },
  {
    icon: <Wind className="w-7 h-7" />,
    title: 'Ventilation Systems',
    desc: 'Exhaust hoods, chimneys, fans, and ventilation ducts — cleaning and airflow optimization.',
  },
]

/* ─── Steps data ─── */
const steps = [
  {
    number: 1,
    icon: <Zap className="w-6 h-6" />,
    title: 'Choose Your Plan',
    desc: 'Select the AMC plan that fits your kitchen size and requirements.',
  },
  {
    number: 2,
    icon: <CalendarCheck className="w-6 h-6" />,
    title: 'Schedule Inspection',
    desc: 'Our team visits your kitchen for a detailed equipment assessment.',
  },
  {
    number: 3,
    icon: <FileCheck className="w-6 h-6" />,
    title: 'Get Coverage',
    desc: 'Sign the contract and your equipment is covered from day one.',
  },
  {
    number: 4,
    icon: <LifeBuoy className="w-6 h-6" />,
    title: 'Ongoing Support',
    desc: 'Regular maintenance visits and priority support whenever you need it.',
  },
]

/* ─── Stats data ─── */
const stats = [
  { value: 98, suffix: '%', label: 'Uptime Guarantee', icon: <Award className="w-5 h-5" /> },
  { value: 48, suffix: 'hr', label: 'Avg. Response Time', icon: <Timer className="w-5 h-5" /> },
  { value: 500, suffix: '+', label: 'Equipment Maintained', icon: <Settings className="w-5 h-5" /> },
  { value: 15, suffix: '+', label: 'Years of Service', icon: <Star className="w-5 h-5" /> },
]

/* ─── FAQ data ─── */
const faqs = [
  {
    question: 'What does AMC cover?',
    answer:
      'Our Annual Maintenance Contracts cover preventive maintenance, routine servicing, and corrective repairs for all commercial kitchen equipment listed in the contract. This includes burners, refrigeration, dishwashing, display counters, food prep machines, and ventilation systems. Coverage details vary by plan — Basic covers preventive maintenance, Standard adds corrective repairs, and Premium provides comprehensive coverage including free replacement parts.',
  },
  {
    question: 'How quickly do you respond to service requests?',
    answer:
      'Response times depend on your plan. Basic plan customers receive service within 72 hours, Standard plan within 48 hours, and Premium plan customers get priority 24-hour response. Emergency visits are available for Standard (2/year) and Premium (unlimited) plan holders. Our 24/7 dedicated support line ensures Premium customers always have direct access to our service team.',
  },
  {
    question: 'Can I upgrade my plan mid-contract?',
    answer:
      'Yes, you can upgrade your AMC plan at any time during the contract period. The price difference will be calculated on a pro-rata basis for the remaining contract duration. Upgrading gives you immediate access to the enhanced benefits of the higher plan, including faster response times and additional service visits.',
  },
  {
    question: 'Are replacement parts included?',
    answer:
      'Replacement parts are included only in the Premium plan. Basic and Standard plan holders receive discounted parts — 10% off for Basic and 15% off for Standard. All plans use genuine OEM parts to ensure the longevity and performance of your equipment. Premium plan holders enjoy free replacement parts as part of their comprehensive coverage.',
  },
  {
    question: 'What brands/equipment do you service?',
    answer:
      'We service all equipment manufactured by Urban Kitchens as well as major commercial kitchen brands including Hobart, Rational, Vulcan, Garland, True, Beverage-Air, and more. Our technicians are trained to handle SS304/SS316 stainless steel equipment, gas and electric cooking equipment, refrigeration systems, and ventilation installations.',
  },
  {
    question: 'How do I raise a service request?',
    answer:
      'You can raise a service request through multiple channels — call our dedicated support line, send an email to our service desk, or use the customer portal on our website. Premium plan customers have access to a 24/7 priority support number for immediate assistance. All requests are tracked and you receive real-time updates on the status of your service call.',
  },
]

/* ─── Component ─── */
export default function AmcPage() {
  const { setView } = useAppStore()

  const handleGetQuote = (planName: string) => {
    toast.success(`Quote request for ${planName} plan received! We'll contact you shortly.`, {
      description: 'Our team will reach out within 24 hours.',
    })
  }

  const handleContactSupport = () => {
    toast.info('Redirecting to contact page...', {
      description: 'Fill out the form for AMC consultation.',
    })
    setTimeout(() => setView('contact'), 500)
  }

  return (
    <div className="min-h-screen">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[#0b0b0b] grid-pattern" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b0b] via-transparent to-[#0b0b0b]" />

        {/* Decorative glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#59ff00]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#59ff00]/3 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} custom={0}>
              <Badge className="bg-[#59ff00]/10 text-[#59ff00] border-[#59ff00]/20 mb-6 px-4 py-1.5 text-sm">
                <Shield className="w-3.5 h-3.5 mr-1.5" />
                Annual Maintenance Contracts
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-[family-name:var(--font-poppins)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight mb-6"
            >
              Keep Your Kitchen{' '}
              <span className="text-[#59ff00] neon-text">Running</span>
              <br />
              at Peak Performance
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Comprehensive Annual Maintenance Contracts that ensure your commercial
              kitchen equipment stays operational, efficient, and hassle-free — 365 days a year.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                onClick={() => {
                  const el = document.getElementById('amc-plans')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold px-8 h-12 text-base neon-glow"
              >
                View Plans
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                onClick={handleContactSupport}
                variant="outline"
                className="border-[#59ff00] text-[#59ff00] hover:bg-[#59ff00]/10 font-semibold px-8 h-12 text-base"
              >
                <Headphones className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-16 md:mt-20 flex flex-wrap items-center justify-center gap-6 md:gap-10"
          >
            {[
              { icon: <Shield className="w-5 h-5" />, text: '98% Uptime' },
              { icon: <Clock className="w-5 h-5" />, text: '24hr Response' },
              { icon: <Wrench className="w-5 h-5" />, text: '500+ Equipment' },
              { icon: <Star className="w-5 h-5" />, text: '15+ Years' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-400 text-sm">
                <span className="text-[#59ff00]">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-[#59ff00]/30 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-[#59ff00] rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════ AMC PLANS ═══════════════════ */}
      <section id="amc-plans" className="py-16 md:py-24 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} custom={0} className="font-[family-name:var(--font-poppins)] text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
              Choose Your <span className="text-[#59ff00]">AMC Plan</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-gray-500 max-w-xl mx-auto">
              Flexible plans designed to keep your commercial kitchen running without interruption
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group relative bg-[#151515] border rounded-xl p-6 md:p-8 hover-lift transition-all ${
                  plan.featured
                    ? 'border-[#59ff00]/50 shadow-[0_0_30px_rgba(89,255,0,0.15)] hover:border-[#59ff00]/70'
                    : 'border-[#2a2a2a] hover:border-[#59ff00]/30'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#59ff00] text-black font-semibold px-4 py-1 text-xs border-none">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                {/* Featured glow */}
                {plan.featured && (
                  <div className="absolute inset-0 rounded-xl pointer-events-none opacity-50"
                    style={{ boxShadow: '0 0 40px rgba(89, 255, 0, 0.1), inset 0 0 40px rgba(89, 255, 0, 0.03)' }}
                  />
                )}

                <div className="relative z-10">
                  {/* Plan header */}
                  <div className="text-center mb-6">
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                      plan.featured ? 'bg-[#59ff00]/20' : 'bg-[#59ff00]/10'
                    }`}>
                      {plan.featured ? (
                        <Shield className="w-7 h-7 text-[#59ff00]" />
                      ) : plan.name === 'Standard' ? (
                        <Wrench className="w-7 h-7 text-[#59ff00]" />
                      ) : (
                        <Clock className="w-7 h-7 text-[#59ff00]" />
                      )}
                    </div>
                    <h3 className="font-[family-name:var(--font-poppins)] text-white text-xl font-bold mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="font-[family-name:var(--font-poppins)] text-3xl md:text-4xl font-extrabold text-[#59ff00]">
                        {formatPrice(plan.price)}
                      </span>
                      <span className="text-gray-500 text-sm">/year</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-[#2a2a2a] mb-6" />

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <div key={feature.text} className="flex items-center gap-3">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${
                            feature.included ? 'text-[#59ff00]' : 'text-gray-700'
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            feature.included ? 'text-gray-300' : 'text-gray-600 line-through'
                          }`}
                        >
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Button
                    onClick={() => handleGetQuote(plan.name)}
                    className={`w-full h-11 font-semibold text-sm ${
                      plan.featured
                        ? 'bg-[#59ff00] text-black hover:bg-[#59ff00]/90 neon-glow'
                        : 'border border-[#59ff00] text-[#59ff00] bg-transparent hover:bg-[#59ff00]/10'
                    }`}
                    variant={plan.featured ? 'default' : 'outline'}
                  >
                    Get Quote
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Custom plan note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <p className="text-gray-500 text-sm">
              Need a custom plan?{' '}
              <button
                onClick={handleContactSupport}
                className="text-[#59ff00] hover:underline inline-flex items-center gap-1"
              >
                Contact us <ArrowRight className="w-3 h-3" />
              </button>
              {' '}for tailored AMC solutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ COVERAGE ═══════════════════ */}
      <section className="py-16 md:py-24 bg-[#0b0b0b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} custom={0} className="font-[family-name:var(--font-poppins)] text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
              What&apos;s <span className="text-[#59ff00]">Covered</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-gray-500 max-w-xl mx-auto">
              Our AMC covers all major categories of commercial kitchen equipment
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coverageItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-[#151515] border border-[#2a2a2a] rounded-xl p-6 hover:border-[#59ff00]/30 hover-lift transition-all"
              >
                <div className="w-14 h-14 mb-4 rounded-xl bg-[#59ff00]/10 flex items-center justify-center text-[#59ff00] group-hover:bg-[#59ff00]/20 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-white font-[family-name:var(--font-poppins)] font-semibold text-lg mb-2 group-hover:text-[#59ff00] transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="py-16 md:py-24 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} custom={0} className="font-[family-name:var(--font-poppins)] text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
              How It <span className="text-[#59ff00]">Works</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-gray-500 max-w-xl mx-auto">
              Getting started with your AMC is simple — four easy steps
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connecting line - desktop only */}
            <div className="hidden lg:block absolute top-[52px] left-[calc(12.5%+28px)] right-[calc(12.5%+28px)] h-px bg-gradient-to-r from-[#59ff00]/30 via-[#59ff00]/20 to-[#59ff00]/30" />

            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group relative text-center"
              >
                <div className="relative z-10 flex flex-col items-center">
                  {/* Step number circle */}
                  <div className="w-16 h-16 rounded-full bg-[#151515] border-2 border-[#59ff00]/30 flex items-center justify-center mb-4 group-hover:border-[#59ff00] group-hover:bg-[#59ff00]/10 transition-all">
                    <span className="font-[family-name:var(--font-poppins)] text-[#59ff00] font-bold text-lg absolute opacity-30">
                      {step.number}
                    </span>
                    <span className="text-[#59ff00] relative z-10">{step.icon}</span>
                  </div>

                  {/* Arrow for mobile */}
                  {i < steps.length - 1 && (
                    <div className="lg:hidden text-[#59ff00]/30 mb-2">
                      <ArrowRight className="w-5 h-5 rotate-90" />
                    </div>
                  )}

                  <h3 className="text-white font-[family-name:var(--font-poppins)] font-semibold text-base mb-2 group-hover:text-[#59ff00] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-[220px]">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ WHY AMC ═══════════════════ */}
      <section className="py-16 md:py-24 bg-[#0b0b0b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} custom={0} className="font-[family-name:var(--font-poppins)] text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
              Why Choose <span className="text-[#59ff00]">Our AMC</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-gray-500 max-w-xl mx-auto">
              Numbers that speak for our commitment to keeping your kitchen running
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FAQ ═══════════════════ */}
      <section className="py-16 md:py-24 bg-[#0d0d0d]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} custom={0} className="font-[family-name:var(--font-poppins)] text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
              Frequently Asked <span className="text-[#59ff00]">Questions</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-gray-500 max-w-xl mx-auto">
              Everything you need to know about our Annual Maintenance Contracts
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="bg-[#151515] border border-[#2a2a2a] rounded-xl px-6 data-[state=open]:border-[#59ff00]/30 transition-colors"
                >
                  <AccordionTrigger className="text-left text-white hover:text-[#59ff00] hover:no-underline py-5 text-sm md:text-base font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-400 text-sm leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ CTA SECTION ═══════════════════ */}
      <section className="py-16 md:py-24 bg-[#0b0b0b] relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#59ff00]/5 rounded-full blur-[150px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-3xl mx-auto px-4 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-[#59ff00]/10 flex items-center justify-center">
            <Phone className="w-8 h-8 text-[#59ff00]" />
          </div>
          <h2 className="font-[family-name:var(--font-poppins)] text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Get Your <span className="text-[#59ff00]">AMC Consultation</span>
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Speak with our maintenance experts to find the perfect plan for your commercial kitchen. 
            Free assessment and no-obligation quote.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handleContactSupport}
              className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold px-8 h-12 text-base neon-glow"
            >
              Contact Us Today
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <a
              href="tel:+911145678900"
              className="text-gray-400 hover:text-[#59ff00] text-sm flex items-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4" />
              +91-11-45678900
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

/* ─── Stat Card Component ─── */
function StatCard({ stat, index }: { stat: (typeof stats)[number]; index: number }) {
  const { count, ref } = useCounter(stat.value)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group glass rounded-xl p-6 text-center hover-lift"
    >
      <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-[#59ff00]/10 flex items-center justify-center text-[#59ff00] group-hover:bg-[#59ff00]/20 transition-colors">
        {stat.icon}
      </div>
      <div className="font-[family-name:var(--font-poppins)] text-2xl md:text-4xl font-bold text-[#59ff00]">
        {count}
        {stat.suffix}
      </div>
      <div className="text-gray-500 text-xs md:text-sm mt-1">{stat.label}</div>
    </motion.div>
  )
}

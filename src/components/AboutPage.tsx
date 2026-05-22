'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Target,
  Eye,
  CheckCircle,
  Factory,
  Wrench,
} from 'lucide-react'

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
    return () => { if (el) observer.unobserve(el) }
  }, [end, duration])

  return { count, ref }
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
}

function StatCounter({ end, label }: { end: number; label: string }) {
  const { count, ref } = useCounter(end)
  return (
    <div ref={ref} className="text-center">
      <div className="font-[family-name:var(--font-poppins)] text-3xl md:text-5xl font-bold text-[#59ff00] mb-2">
        {count}+
      </div>
      <div className="text-gray-500 text-sm">{label}</div>
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0b0b0b]">
      {/* ─── HERO ─── */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#59ff00]/5 rounded-full blur-[120px]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" animate="visible">
            <motion.div variants={fadeUp} custom={0}>
              <span className="text-[#59ff00] text-sm font-medium uppercase tracking-wider">About Us</span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-[family-name:var(--font-poppins)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mt-3 mb-6"
            >
              Built for <span className="text-[#59ff00] neon-text">Excellence</span>,
              <br />Driven by Innovation
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
            >
              Urban Kitchens Manufacturing & Solutions has been at the forefront of commercial 
              kitchen equipment innovation, delivering precision-engineered products to India&apos;s 
              hospitality industry.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ─── OUR STORY ─── */}
      <section className="py-16 md:py-24 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="h-72 md:h-96 bg-[#151515] border border-[#2a2a2a] rounded-xl flex items-center justify-center">
                <Factory className="w-20 h-20 text-gray-700" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="font-[family-name:var(--font-poppins)] text-2xl md:text-3xl font-bold mb-4">
                Our <span className="text-[#59ff00]">Story</span>
              </h2>
              <div className="w-12 h-0.5 bg-[#59ff00] mb-6" />
              <p className="text-gray-400 leading-relaxed mb-4">
                Founded in 2009, Urban Kitchens began with a simple vision — to provide Indian 
                commercial kitchens with world-class stainless steel equipment that matches 
                international standards at competitive prices.
              </p>
              <p className="text-gray-400 leading-relaxed mb-4">
                From a small workshop in New Delhi, we&apos;ve grown into a full-fledged manufacturing 
                facility with over 50 skilled craftsmen, serving 500+ clients across the country 
                including star-rated hotels, restaurant chains, and catering businesses.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Our commitment to quality, customization, and after-sales support has made us 
                one of India&apos;s most trusted names in commercial kitchen manufacturing.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── MISSION & VISION ─── */}
      <section className="py-16 md:py-24 bg-[#0b0b0b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-8 hover:border-[#59ff00]/30 transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-[#59ff00]/10 flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-[#59ff00]" />
              </div>
              <h3 className="font-[family-name:var(--font-poppins)] text-white text-xl font-bold mb-3">Our Mission</h3>
              <p className="text-gray-400 leading-relaxed">
                To engineer and deliver the finest commercial kitchen equipment that empowers 
                culinary professionals to achieve their best, while maintaining the highest 
                standards of hygiene, durability, and energy efficiency.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-8 hover:border-[#59ff00]/30 transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-[#59ff00]/10 flex items-center justify-center mb-4">
                <Eye className="w-7 h-7 text-[#59ff00]" />
              </div>
              <h3 className="font-[family-name:var(--font-poppins)] text-white text-xl font-bold mb-3">Our Vision</h3>
              <p className="text-gray-400 leading-relaxed">
                To be India&apos;s most trusted and innovative commercial kitchen equipment 
                manufacturer, setting the benchmark for quality, customization, and 
                sustainability in the foodservice industry.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── KEY STATS ─── */}
      <section className="py-16 md:py-24 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCounter end={15} label="Years Experience" />
            <StatCounter end={500} label="Projects Completed" />
            <StatCounter end={200} label="Products Range" />
            <StatCounter end={50} label="Team Members" />
          </div>
        </div>
      </section>

      {/* ─── TEAM ─── */}
      <section className="py-16 md:py-24 bg-[#0b0b0b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} custom={0} className="font-[family-name:var(--font-poppins)] text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
              Our <span className="text-[#59ff00]">Leadership</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-gray-500 max-w-xl mx-auto">
              Meet the people who drive Urban Kitchens forward
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Rajesh Kumar', role: 'Founder & CEO', initial: 'RK' },
              { name: 'Priya Sharma', role: 'Sales Manager', initial: 'PS' },
              { name: 'Amit Patel', role: 'Operations Manager', initial: 'AP' },
              { name: 'Kavita Nair', role: 'Quality Control', initial: 'KN' },
            ].map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-6 text-center hover:border-[#59ff00]/30 hover-lift transition-all"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#59ff00]/10 border-2 border-[#59ff00]/20 flex items-center justify-center">
                  <span className="text-[#59ff00] font-bold text-xl font-[family-name:var(--font-poppins)]">{member.initial}</span>
                </div>
                <h3 className="text-white font-semibold text-base">{member.name}</h3>
                <p className="text-gray-500 text-sm mt-1">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MANUFACTURING ─── */}
      <section className="py-16 md:py-24 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-[family-name:var(--font-poppins)] text-2xl md:text-3xl font-bold mb-4">
                Manufacturing <span className="text-[#59ff00]">Facility</span>
              </h2>
              <div className="w-12 h-0.5 bg-[#59ff00] mb-6" />
              <p className="text-gray-400 leading-relaxed mb-6">
                Our state-of-the-art manufacturing facility in New Delhi is equipped with 
                modern welding, fabrication, and quality testing equipment. Every product 
                undergoes rigorous quality checks before leaving our factory floor.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  'CNC precision cutting & bending',
                  'MIG/TIG welding with argon shielding',
                  'In-house powder coating & finishing',
                  'Comprehensive QC testing lab',
                  'ISO 9001:2015 certified processes',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-[#59ff00] shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="h-72 md:h-96 bg-[#151515] border border-[#2a2a2a] rounded-xl flex items-center justify-center">
                <Wrench className="w-20 h-20 text-gray-700" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

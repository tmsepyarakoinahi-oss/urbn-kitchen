'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  CheckCircle,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' as const },
  }),
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.status) {
        toast.success('Thank you! Your inquiry has been submitted successfully.')
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      } else {
        toast.error(data.message || 'Failed to submit inquiry')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const contactCards = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Phone',
      details: ['+91-7080488840'],
      action: 'tel:+917080488840',
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'WhatsApp',
      details: ['+91-7080488840', 'Chat with us instantly'],
      action: 'https://wa.me/917080488840',
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email',
      details: ['info@urbankitchens.com', 'sales@urbankitchens.com'],
      action: 'mailto:info@urbankitchens.com',
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Address',
      details: ['Plot No. 45, Sector 12', 'Industrial Area, New Delhi - 110020'],
      action: '#',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0b0b0b] pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="text-center mb-12"
        >
          <motion.span variants={fadeUp} custom={0} className="text-[#59ff00] text-sm font-medium uppercase tracking-wider">
            Get in Touch
          </motion.span>
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="font-[family-name:var(--font-poppins)] text-3xl sm:text-4xl md:text-5xl font-extrabold mt-2 mb-4"
          >
            Contact <span className="text-[#59ff00]">Us</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-gray-400 max-w-xl mx-auto">
            Have a question or need a quote? We&apos;d love to hear from you. 
            Send us a message and we&apos;ll respond as soon as possible.
          </motion.p>
        </motion.div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {contactCards.map((card, i) => (
            <motion.a
              key={card.title}
              href={card.action}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-[#151515] border border-[#2a2a2a] rounded-xl p-5 text-center hover:border-[#59ff00]/30 hover-lift transition-all block"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#59ff00]/10 flex items-center justify-center text-[#59ff00] group-hover:bg-[#59ff00]/20 transition-colors">
                {card.icon}
              </div>
              <h3 className="text-white font-semibold text-sm mb-2">{card.title}</h3>
              {card.details.map((detail) => (
                <p key={detail} className="text-gray-500 text-xs">{detail}</p>
              ))}
            </motion.a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ─── FORM ─── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-6 md:p-8">
              <h2 className="font-[family-name:var(--font-poppins)] text-white text-xl font-bold mb-6">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Full Name *</label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="bg-[#1a1a1a] border-[#2a2a2a] text-white h-10"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Email *</label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="bg-[#1a1a1a] border-[#2a2a2a] text-white h-10"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Phone</label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91-XXXXXXXXXX"
                      className="bg-[#1a1a1a] border-[#2a2a2a] text-white h-10"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Subject</label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      className="bg-[#1a1a1a] border-[#2a2a2a] text-white h-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Message *</label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your requirements..."
                    className="bg-[#1a1a1a] border-[#2a2a2a] text-white min-h-[120px]"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold h-11 self-start px-8"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* ─── MAP PLACEHOLDER & SOCIAL ─── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            {/* Map */}
            <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl h-64 md:h-80 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 grid-pattern opacity-30" />
              <div className="relative text-center">
                <MapPin className="w-10 h-10 text-[#59ff00] mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Plot No. 45, Sector 12</p>
                <p className="text-gray-500 text-xs">Industrial Area, New Delhi</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-6">
              <h3 className="font-[family-name:var(--font-poppins)] text-white font-semibold mb-4">
                Follow Us
              </h3>
              <div className="flex items-center gap-3">
                <a href="#" className="w-11 h-11 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-500 hover:text-[#59ff00] hover:border-[#59ff00]/30 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-11 h-11 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-500 hover:text-[#59ff00] hover:border-[#59ff00]/30 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-11 h-11 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-500 hover:text-[#59ff00] hover:border-[#59ff00]/30 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-11 h-11 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-500 hover:text-[#59ff00] hover:border-[#59ff00]/30 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

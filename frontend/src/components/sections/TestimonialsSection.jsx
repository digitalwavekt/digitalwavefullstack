import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useState } from 'react'
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Rahul Sharma',
    role: 'Final Year Student',
    college: 'IIT Delhi',
    rating: 5,
    text: 'Digital Wave helped me build an amazing MERN stack project for my final year. The mentorship and code quality were exceptional. Got an A+ grade!',
    avatar: 'RS',
  },
  {
    name: 'Priya Patel',
    role: 'Software Developer',
    company: 'TCS',
    rating: 5,
    text: 'The internship program completely transformed my career. The live project experience and Google Meet sessions with industry experts were invaluable.',
    avatar: 'PP',
  },
  {
    name: 'Amit Kumar',
    role: 'Startup Founder',
    company: 'TechStart Pvt Ltd',
    rating: 5,
    text: 'They built our complete CRM system from scratch. The team understood our requirements perfectly and delivered ahead of schedule. Highly recommended!',
    avatar: 'AK',
  },
  {
    name: 'Sneha Gupta',
    role: 'CS Student',
    college: 'NIT Trichy',
    rating: 5,
    text: 'Best decision to choose Digital Wave for my AI/ML project. The documentation was thorough and the model accuracy exceeded my expectations.',
    avatar: 'SG',
  },
  {
    name: 'Vikram Singh',
    role: 'Product Manager',
    company: 'Infosys',
    rating: 5,
    text: 'Professional team with excellent communication. Our mobile app was delivered with all features working perfectly. Will definitely work with them again.',
    avatar: 'VS',
  },
]

export default function TestimonialsSection() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [current, setCurrent] = useState(0)

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length)
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  return (
    <section className="relative py-24 section-padding" ref={ref}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20 mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            What Our <span className="gradient-text">Clients Say</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Real feedback from students and businesses who trusted us with their projects and careers.
          </p>
        </motion.div>

        {/* Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass rounded-3xl p-8 md:p-12 relative">
            <Quote className="absolute top-8 right-8 w-12 h-12 text-blue-500/20" />

            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8 italic">
                "{testimonials[current].text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {testimonials[current].avatar}
                </div>
                <div>
                  <h4 className="text-white font-semibold">{testimonials[current].name}</h4>
                  <p className="text-gray-400 text-sm">
                    {testimonials[current].role} • {testimonials[current].college || testimonials[current].company}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === current ? 'w-8 bg-blue-500' : 'bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={prev}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

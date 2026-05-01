import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Helmet } from 'react-helmet-async'
import { 
  Target, Lightbulb, Heart, Users, Award, TrendingUp,
  Code2, Globe, Smartphone, Database, GraduationCap, Shield
} from 'lucide-react'

const team = [
  { name: 'Rahul Verma', role: 'Founder & CEO', image: 'RV', color: 'from-blue-500 to-cyan-500' },
  { name: 'Priya Sharma', role: 'Tech Lead', image: 'PS', color: 'from-purple-500 to-pink-500' },
  { name: 'Amit Kumar', role: 'Project Manager', image: 'AK', color: 'from-orange-500 to-yellow-500' },
  { name: 'Sneha Gupta', role: 'HR & Operations', image: 'SG', color: 'from-green-500 to-emerald-500' },
]

const milestones = [
  { year: '2019', title: 'Company Founded', desc: 'Started with a vision to bridge academia and industry' },
  { year: '2020', title: 'First 100 Projects', desc: 'Delivered our first 100 successful projects' },
  { year: '2021', title: 'Internship Launch', desc: 'Launched industry-ready internship programs' },
  { year: '2022', title: '500+ Students', desc: 'Trained over 500 students with 95% placement rate' },
  { year: '2023', title: 'National Expansion', desc: 'Expanded services across 15+ cities in India' },
  { year: '2024', title: '2000+ Students', desc: 'Crossed 2000+ trained students milestone' },
]

export default function About() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <>
      <Helmet>
        <title>About Us | Digital Wave IT Solutions</title>
        <meta name="description" content="Learn about Digital Wave IT Solutions - our mission, vision, team, and journey in delivering top-notch IT solutions and training programs." />
      </Helmet>

      <div className="relative pt-24 pb-16 section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
              About Us
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Building the Future of <br />
              <span className="gradient-text">Technology & Education</span>
            </h1>
            <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
              Digital Wave IT Solutions Pvt Ltd is a technology company committed to delivering 
              exceptional web solutions, mobile applications, and industry-ready training programs. 
              We believe in empowering the next generation of tech professionals through practical, 
              hands-on learning experiences.
            </p>
          </motion.div>

          {/* Mission, Vision, Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20" ref={ref}>
            {[
              { icon: Target, title: 'Our Mission', text: 'To bridge the gap between academic learning and industry requirements by providing practical, hands-on experience through internships and real-world projects.', color: 'blue' },
              { icon: Lightbulb, title: 'Our Vision', text: 'To become the most trusted IT solutions provider and career accelerator for students and businesses across India.', color: 'purple' },
              { icon: Heart, title: 'Our Values', text: 'Integrity, innovation, and impact drive everything we do. We believe in transparent communication and measurable results.', color: 'pink' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15 }}
                className="glass rounded-2xl p-8 border border-white/10"
              >
                <div className={`w-14 h-14 rounded-xl bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center mb-6`}>
                  <item.icon className={`w-7 h-7 text-${item.color}-400`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Timeline */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Our Journey</h2>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 hidden md:block" />
              <div className="space-y-8">
                {milestones.map((milestone, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex flex-col md:flex-row items-center gap-8 ${
                      i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      <div className="glass rounded-2xl p-6 border border-white/10 inline-block">
                        <span className="text-blue-400 font-bold text-lg">{milestone.year}</span>
                        <h4 className="text-white font-semibold mt-1">{milestone.title}</h4>
                        <p className="text-gray-400 text-sm mt-1">{milestone.desc}</p>
                      </div>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-4 border-dark-900 shrink-0 z-10" />
                    <div className="flex-1 hidden md:block" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white text-center mb-4">Our Team</h2>
            <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
              Meet the passionate individuals behind Digital Wave who are dedicated to delivering excellence.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {team.map((member, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-2xl p-6 text-center border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl`}>
                    {member.image}
                  </div>
                  <h4 className="text-white font-semibold">{member.name}</h4>
                  <p className="text-gray-400 text-sm">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

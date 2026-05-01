import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Background3D from '../components/3d/Background3D'
import HeroSection from '../components/sections/HeroSection'
import AboutPreview from '../components/sections/AboutPreview'
import ServicesSection from '../components/sections/ServicesSection'
import StatsSection from '../components/sections/StatsSection'
import ProjectsSection from '../components/sections/ProjectsSection'
import TestimonialsSection from '../components/sections/TestimonialsSection'
import InternshipCTA from '../components/sections/InternshipCTA'
import ContactCTA from '../components/sections/ContactCTA'

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Digital Wave IT Solutions | Web Development, Apps, CRM & Internships</title>
        <meta name="description" content="Leading IT solutions provider offering website development, mobile apps, CRM solutions, college projects, and industry internship programs." />
      </Helmet>

      <div className="relative">
        <Background3D />

        <div className="relative z-10">
          <HeroSection />
          <AboutPreview />
          <ServicesSection />
          <StatsSection />
          <ProjectsSection />
          <TestimonialsSection />
          <InternshipCTA />
          <ContactCTA />
        </div>
      </div>
    </>
  )
}

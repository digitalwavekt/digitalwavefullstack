import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ScrollToTop from './components/layout/ScrollToTop'
import LoadingScreen from './components/layout/LoadingScreen'
import VerifyCertificate from './pages/VerifyCertificate'
import ErrorBoundary from './components/ErrorBoundary'
import { useTheme } from './hooks/useTheme'

// Lazy load pages for performance
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Services = lazy(() => import('./pages/Services'))
const Projects = lazy(() => import('./pages/Projects'))
const Internship = lazy(() => import('./pages/Internship'))

// old college project page disabled for payment-first flow
const AIProjectOrder = lazy(() => import('./pages/AIProjectOrder'))

const AIProjectPortal = lazy(() => import('./pages/AIProjectPortal'))
const Contact = lazy(() => import('./pages/Contact'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const UserLogin = lazy(() => import('./pages/UserLogin'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'))
const StudentProjectLogin = lazy(() => import('./pages/StudentProjectLogin'))
const StudentProjectDashboard = lazy(() => import('./pages/StudentProjectDashboard'))
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'))
const PaymentFailed = lazy(() => import('./pages/PaymentFailed'))
const CertificateDownload = lazy(() => import('./pages/CertificateDownload'))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  const hydrateTheme = useTheme((state) => state.hydrateTheme)

  useEffect(() => {
    hydrateTheme()
  }, [hydrateTheme])

  return (
    <div className="min-h-screen bg-dark-900 text-white relative app-shell">
      <ScrollToTop />
      <Navbar />

      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <AnimatePresence mode="wait">
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/internship" element={<Internship />} />

            {/* Payment-first project order flow */}
            <Route path="/college-project" element={<AIProjectOrder />} />
            <Route path="/ai-project-order" element={<AIProjectOrder />} />

            <Route path="/student/ai-projects" element={<AIProjectPortal />} />
            <Route path="/student/project-login" element={<StudentProjectLogin />} />
            <Route path="/student/project-dashboard" element={<StudentProjectDashboard />} />

            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />

            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />

            <Route path="/certificate/:id" element={<CertificateDownload />} />
            <Route path="/certificate/verify/:token" element={<VerifyCertificate />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
      </ErrorBoundary>

      <Footer />
    </div>
  )
}

export default App

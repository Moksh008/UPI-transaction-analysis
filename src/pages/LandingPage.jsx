import { useNavigate } from 'react-router-dom'
import { TrendingUp, BarChart3, MapPin, CreditCard, ArrowRight, Database, Zap, Activity, Home, Info } from 'lucide-react'
import HeroGeometric from '../components/ui/HeroGeometric'
import { NavBar } from '../components/ui/Dock'
import { LogoCloud } from '../components/ui/logo-cloud'

export default function LandingPage() {
  const navigate = useNavigate()

  const navItems = [
    { name: 'Home', url: '#home', icon: Home },
    { name: 'Features', url: '#features', icon: BarChart3 },
    { name: 'About', url: '#about', icon: Info },
    { name: 'Login', url: '/login', icon: CreditCard },
  ]

  // Logo data for trusted by section
  const logos = [
    { src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg", alt: "React", width: 40, height: 40 },
    { src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg", alt: "Python", width: 40, height: 40 },
    { src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg", alt: "Firebase", width: 40, height: 40 },
    { src: "https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg", alt: "PostgreSQL", width: 40, height: 40 },
    { src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg", alt: "Tailwind", width: 40, height: 40 },
    { src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg", alt: "Node.js", width: 40, height: 40 },
    { src: "https://www.vectorlogo.zone/logos/axios/axios-icon.svg", alt: "Axios", width: 40, height: 40 },
    { src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg", alt: "VS Code", width: 40, height: 40 },
  ]

  const handleNavigate = (url) => {
    if (url.startsWith('/')) {
      navigate(url)
    } else {
      // Smooth scroll to section
      const element = document.querySelector(url)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* Navigation Bar */}
      <NavBar items={navItems} onNavigate={handleNavigate} />

      {/* Elegant Geometric Hero Section */}
      <div id="home">
        <HeroGeometric 
          badge="Finoro Analytics Platform"
          title1="Track India's"
          title2="Digital Revolution"
          description="Analyze billions of UPI transactions across 36 states with powerful interactive visualizations and real-time insights from 2018-2022."
        />
      </div>

      {/* Content Sections */}
      <div className="relative z-10 bg-gradient-to-b from-[#030303] via-[#0a0a0a] to-[#030303]">
        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-32">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-white/60 tracking-wide">Platform Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Powerful Analytics Tools
            </h2>
            <p className="text-lg text-white/40 max-w-2xl mx-auto">
              Everything you need to understand India's UPI ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<TrendingUp className="w-7 h-7" />}
              title="Growth Analysis"
              description="Track quarterly UPI growth and CAGR trends with comprehensive data visualization"
            />
            <FeatureCard
              icon={<MapPin className="w-7 h-7" />}
              title="Geographic Insights"
              description="Explore state-wise adoption patterns across all 36 Indian states"
            />
            <FeatureCard
              icon={<BarChart3 className="w-7 h-7" />}
              title="Transaction Types"
              description="Deep dive into P2P, Merchant, and Bill payment distributions"
            />
            <FeatureCard
              icon={<Database className="w-7 h-7" />}
              title="Real-time Data"
              description="Access live analytics from 3,594+ transaction records"
            />
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="relative bg-white/[0.02] backdrop-blur-sm rounded-3xl p-12 border border-white/[0.05] overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-rose-500/[0.03]" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
                Platform at a Glance
              </h2>
              <div className="grid md:grid-cols-4 gap-8">
                <StatCard 
                  number="3,594+" 
                  label="Transaction Records" 
                  icon={<Database className="w-6 h-6" />}
                  color="from-indigo-400 to-indigo-600"
                />
                <StatCard 
                  number="36" 
                  label="States & Territories" 
                  icon={<MapPin className="w-6 h-6" />}
                  color="from-rose-400 to-rose-600"
                />
                <StatCard 
                  number="2018-2022" 
                  label="Years of Data" 
                  icon={<BarChart3 className="w-6 h-6" />}
                  color="from-violet-400 to-violet-600"
                />
                <StatCard 
                  number="5" 
                  label="Payment Categories" 
                  icon={<Zap className="w-6 h-6" />}
                  color="from-amber-400 to-amber-600"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Logo Cloud - Trusted Technologies */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-8">
            <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Built With Modern Technologies</h3>
          </div>
          <LogoCloud logos={logos} className="mb-8" />
        </section>

        {/* CTA Section */}
        <section id="about" className="container mx-auto px-6 py-32 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse" />
              <span className="text-sm text-white/60 tracking-wide">Get Started</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
                Ready to Dive In?
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-white/40 mb-12 leading-relaxed font-light max-w-2xl mx-auto">
              Unlock powerful insights from India's digital payment revolution. Interactive dashboards await.
            </p>
            
            <button
              onClick={() => navigate('/login')}
              className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white rounded-2xl transition-all duration-300 text-lg font-semibold shadow-[0_8px_32px_0_rgba(99,102,241,0.2)] hover:shadow-[0_8px_32px_0_rgba(99,102,241,0.4)] hover:scale-105 transform"
            >
              <CreditCard className="w-6 h-6" />
              Access Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-12 border-t border-white/[0.05]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-indigo-400" />
              <span className="text-lg font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Finoro
              </span>
            </div>
            <p className="text-white/40 text-sm text-center">
              Built with React + FastAPI • Data from PhonePe Pulse
            </p>
            <p className="text-white/30 text-sm">
              © 2025 Finoro Analytics
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="group relative bg-white/[0.02] backdrop-blur-sm p-8 rounded-2xl border border-white/[0.08] hover:border-white/[0.15] transition-all duration-500 hover:bg-white/[0.04] overflow-hidden">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] to-rose-500/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="text-white/60 mb-4 group-hover:text-white group-hover:scale-110 transition-all duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-white transition-colors">
          {title}
        </h3>
        <p className="text-white/40 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}

function StatCard({ number, label, icon, color }) {
  return (
    <div className="text-center group">
      <div className={`flex justify-center mb-4 text-white/60 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent mb-3`}>
        {number}
      </div>
      <div className="text-white/40 font-medium">
        {label}
      </div>
    </div>
  )
}

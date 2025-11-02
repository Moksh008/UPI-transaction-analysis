import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { Home, BarChart3, Info, LogIn } from 'lucide-react'
import { cn } from '../../lib/utils'

export function NavBar({ items, className, onNavigate, initialActive }) {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  // Set active tab based on current route
  useEffect(() => {
    if (initialActive) {
      setActiveTab(initialActive)
    } else {
      // Auto-detect from URL
      const path = location.pathname
      const matchedItem = items.find(item => {
        if (item.url === path) return true
        if (item.url.includes('#') && path === item.url.split('#')[0]) return true
        return false
      })
      if (matchedItem) {
        setActiveTab(matchedItem.name)
      } else if (items[0]) {
        setActiveTab(items[0].name)
      }
    }
  }, [location.pathname, items, initialActive])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleClick = (item) => {
    setActiveTab(item.name)
    if (onNavigate) {
      onNavigate(item.url)
    }
  }

  return (
    <div
      className={cn(
        'fixed top-6 left-1/2 -translate-x-1/2 z-50',
        className,
      )}
    >
      <div className="flex items-center gap-3 bg-white/[0.05] border border-white/[0.1] backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <button
              key={item.name}
              onClick={() => handleClick(item)}
              className={cn(
                'relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors',
                'text-white/60 hover:text-white',
                isActive && 'text-white',
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-white/[0.08] rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-t-full">
                    <div className="absolute w-12 h-6 bg-indigo-500/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-rose-500/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-violet-500/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

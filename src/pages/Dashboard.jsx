import { useState, useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Map, 
  CreditCard, 
  TrendingUp,
  LogOut,
  User,
  Settings as SettingsIcon,
  BarChart2,
  Sparkles
} from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { Sidebar, SidebarBody, SidebarLink } from '../components/ui/Sidebar'
import { motion } from 'framer-motion'
import Overview from '../components/dashboard/Overview'
import GeographicView from '../components/dashboard/GeographicView'
import TransactionTypes from '../components/dashboard/TransactionTypes'
import Forecast from '../components/dashboard/Forecast'
import Analysis from '../components/dashboard/Analysis'
import AIChat from '../components/dashboard/AIChat'
import Settings from '../components/dashboard/Settings'

export default function Dashboard() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [user] = useAuthState(auth)

  const links = [
    {
      label: 'Overview',
      href: '/dashboard',
      icon: (
        <LayoutDashboard className="text-gray-700 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: 'AI Assistant',
      href: '/dashboard/ai-chat',
      icon: <Sparkles className="text-gray-700 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: 'Geographic View',
      href: '/dashboard/geographic',
      icon: <Map className="text-gray-700 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: 'Transaction Types',
      href: '/dashboard/types',
      icon: <CreditCard className="text-gray-700 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: 'Forecast',
      href: '/dashboard/forecast',
      icon: <TrendingUp className="text-gray-700 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: 'Analysis Your Data',
      href: '/dashboard/analysis',
      icon: <BarChart2 className="text-gray-700 h-5 w-5 flex-shrink-0" />,
    },
  ]

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="flex w-full h-screen overflow-hidden" style={{ backgroundColor: '#f7f6f2' }}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* User Info */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="User avatar" 
                    className="w-8 h-8 rounded-full flex-shrink-0 object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <motion.div
                  animate={{
                    display: open ? 'block' : 'none',
                    opacity: open ? 1 : 0,
                  }}
                  className="flex flex-col"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </span>
                </motion.div>
              </div>
              
              {/* Divider */}
              <div className="border-t border-gray-200 my-4" />
              
              {/* Platform Section */}
              <motion.div
                animate={{
                  display: open ? 'block' : 'none',
                  opacity: open ? 1 : 0,
                }}
                className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
              >
                Platform
              </motion.div>
            </div>

            <div className="flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4" />

            {/* Manage Section */}
            <motion.div
              animate={{
                display: open ? 'block' : 'none',
                opacity: open ? 1 : 0,
              }}
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
            >
              Manage
            </motion.div>

            <div className="flex flex-col gap-2">
              <SidebarLink
                link={{
                  label: 'Settings',
                  href: '/dashboard/settings',
                  icon: <SettingsIcon className="text-gray-700 h-5 w-5 flex-shrink-0" />,
                }}
              />
            </div>
          </div>
          <div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-start gap-2 group/sidebar py-2 w-full cursor-pointer text-gray-700 hover:text-gray-900 transition-colors"
            >
              <LogOut className="text-gray-700 h-5 w-5 flex-shrink-0" />
              <motion.span
                animate={{
                  display: open ? 'inline-block' : 'none',
                  opacity: open ? 1 : 0,
                }}
                className="text-gray-700 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
              >
                Logout
              </motion.span>
            </button>
          </div>
        </SidebarBody>
      </Sidebar>
      <main className="flex-1 overflow-auto" style={{ backgroundColor: '#f7f6f2' }}>
        <div className="p-6 md:p-10">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="ai-chat" element={<AIChat />} />
            <Route path="geographic" element={<GeographicView />} />
            <Route path="types" element={<TransactionTypes />} />
            <Route path="forecast" element={<Forecast />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

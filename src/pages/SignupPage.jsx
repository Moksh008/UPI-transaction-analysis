import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth'
import { auth } from '../firebase'
import { CreditCard, AlertCircle, Home, BarChart3, Info, User } from 'lucide-react'
import { NavBar } from '../components/ui/Dock'

export default function SignupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Features', url: '/#features', icon: BarChart3 },
    { name: 'About', url: '/#about', icon: Info },
    { name: 'Login', url: '/login', icon: CreditCard },
  ]

  const handleNavigate = (url) => {
    if (url.startsWith('/') && !url.includes('#')) {
      navigate(url)
    } else {
      navigate(url.split('#')[0] || '/')
    }
  }

  const handleEmailSignup = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update user profile with name
      await updateProfile(userCredential.user, {
        displayName: name
      })
      
      // Navigate to dashboard
      navigate('/dashboard')
    } catch (err) {
      let errorMessage = 'Failed to create account. Please try again.'
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Try logging in instead.'
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.'
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.'
      }
      setError(errorMessage)
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setError('')
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      
      // Navigate to dashboard
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Failed to sign up with Google.')
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full flex-col min-h-screen bg-[#030303] relative overflow-hidden">
      {/* Animated Background - No WebGL */}
      <div className="absolute inset-0 z-0">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_rgba(99,102,241,0.1)_0%,_transparent_50%),radial-gradient(circle_at_80%_80%,_rgba(236,72,153,0.1)_0%,_transparent_50%)]" />
        
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.8)_0%,_rgba(0,0,0,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-[#030303] to-transparent" />
      </div>

      {/* Navigation */}
      <NavBar items={navItems} onNavigate={handleNavigate} />

      {/* Main Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-center"
          >
            <div className="space-y-1">
              <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
                Create Account
              </h1>
              <p className="text-[1.4rem] text-white/70 font-light">
                Join Finoro today
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleGoogleSignup}
                disabled={loading}
                className="backdrop-blur-[2px] w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full py-3 px-4 transition-colors disabled:opacity-50"
              >
                <span className="text-lg">G</span>
                <span>Sign up with Google</span>
              </button>

              <div className="flex items-center gap-4">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-white/40 text-sm">or</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              <form onSubmit={handleEmailSignup} className="space-y-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full backdrop-blur-[1px] bg-white/5 text-white border border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border-white/30 text-center placeholder:text-white/30"
                  required
                  disabled={loading}
                />

                <input
                  type="email"
                  placeholder="your.email@finoro.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full backdrop-blur-[1px] bg-white/5 text-white border border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border-white/30 text-center placeholder:text-white/30"
                  required
                  disabled={loading}
                />
                
                <input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full backdrop-blur-[1px] bg-white/5 text-white border border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border-white/30 text-center placeholder:text-white/30"
                  required
                  disabled={loading}
                  minLength={6}
                />

                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full backdrop-blur-[1px] bg-white/5 text-white border border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border-white/30 text-center placeholder:text-white/30"
                  required
                  disabled={loading}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-semibold rounded-full py-3 px-4 hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>
            </div>

            <div className="pt-6">
              <p className="text-white/50 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-white hover:text-white/80 underline transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>

            <p className="text-xs text-white/40 pt-4">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/AuthContext.jsx'
import { LogoIcon, UserIcon, ChevronDownIcon, MenuIcon, CloseIcon } from './Icons.jsx'
import { Link, navigate } from '../services/navigate.jsx'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch {
      navigate('/profile')
    }
  }


  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-18 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex-1 flex justify-start items-center">
          <Link to="/" className="flex items-center gap-2.5 group">
            <LogoIcon className="w-8 h-8 transition-transform group-hover:scale-105" />
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-xl tracking-tight text-slate-900">StayLuxe</span>
              <span className="font-light text-xl text-slate-500">Home</span>
            </div>
          </Link>
        </div>

        {/* Center: Main Navigation (Desktop) — intentionally empty */}
        <nav className="hidden md:flex items-center justify-center gap-8 lg:gap-10" />

        {/* Right: Orders & Profile (Desktop) + Hamburger (Mobile) */}
        <div className="flex-1 flex justify-end items-center gap-4 sm:gap-6">
          {/* Desktop Right: Profile Dropdown */}
          <div className="hidden md:block relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-950 py-1.5 px-2.5 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none cursor-pointer"
              aria-expanded={profileOpen}
            >
              <UserIcon className="w-4 h-4 text-slate-600" />
              <span>Profile</span>
              <ChevronDownIcon className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {user ? (
                  <>
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.email || user.name}</p>
                    </div>
                    <Link
                      to="/bookings"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      Orders & Bookings
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      Owner Dashboard
                    </Link>
                    <Link
                      to="/list-property"
                      className="block px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      + List a Property
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      Profile & Account
                    </Link>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2 text-xs text-slate-500 border-b border-slate-100">
                      Welcome to StayLuxe
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      Sign In / Register
                    </Link>
                    <Link
                      to="/bookings"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      Find My Booking
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile: Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-6 py-4 shadow-lg animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-3">
            <div className="border-t border-slate-100 my-1" />
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-base font-medium rounded-lg px-3 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <UserIcon className="w-5 h-5 text-slate-600" />
              <span>Profile {user ? `(${user.name || user.email})` : ''}</span>
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-sm text-slate-600 pl-10 hover:text-slate-900 transition-colors"
                >
                  Owner Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleSignOut()
                  }}
                  className="text-left py-2 text-sm text-rose-600 pl-10 hover:underline cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

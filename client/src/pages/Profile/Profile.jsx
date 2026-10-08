import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/AuthContext.jsx'
import { apiRequest } from '../../services/api.js'
import Footer from '../../components/Footer.jsx'
import { CalendarIcon, MapPinIcon, GuestsIcon, UserIcon } from '../../components/Icons.jsx'

function dateLabel(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function Profile() {
  const { user, loading, setUser, signOut } = useAuth()
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [userBookings, setUserBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(false)

  const next = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('next') : null
  const destination = next?.startsWith('/') && !next.startsWith('//') ? next : '/bookings'

  // Fetch bookings when logged in
  useEffect(() => {
    if (user) {
      setLoadingBookings(true)
      apiRequest('/bookings?limit=50')
        .then((res) => {
          setUserBookings(res.items || [])
        })
        .catch(() => {})
        .finally(() => {
          setLoadingBookings(false)
        })
    }
  }, [user])

  // Handle immediate redirect if 'next' is present
  useEffect(() => {
    if (!loading && user && next) {
      window.location.replace(destination)
    }
  }, [loading, user, next, destination])

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')

    const values = new FormData(event.currentTarget)
    let payload = {}

    if (mode === 'register') {
      const userName = values.get('userName')?.trim() || ''
      const email = values.get('email')?.trim() || ''
      const passWord = values.get('passWord') || ''

      if (!userName || userName.length < 3) {
        setError('Username must be between 3 and 20 characters.')
        setBusy(false)
        return
      }
      if (!email) {
        setError('Please enter a valid email address.')
        setBusy(false)
        return
      }
      if (!passWord || passWord.length < 6) {
        setError('Password must contain at least 6 characters.')
        setBusy(false)
        return
      }

      payload = { userName, email, passWord }
    } else {
      const identity = values.get('identity')?.trim() || ''
      const passWord = values.get('passWord') || ''

      if (!identity || !passWord) {
        setError('Please enter your username/email and password.')
        setBusy(false)
        return
      }

      payload = {
        ...(identity.includes('@') ? { email: identity } : { userName: identity }),
        passWord
      }
    }

    try {
      const endpoint = mode === 'register' ? '/auth/register' : '/auth/loginuser'
      const result = await apiRequest(endpoint, { method: 'POST', body: payload })
      if (result.token) {
        try {
          localStorage.setItem('auth_token', result.token)
        } catch {}
      }
      setUser(result.user)
      window.location.assign(destination)
    } catch (requestError) {
      setError(requestError.message || 'Authentication failed. Please verify your credentials.')
    } finally {
      setBusy(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.assign('/')
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'denied':
        return 'bg-slate-100 text-slate-700 border-slate-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-slate-500 text-xs font-semibold">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Checking your session...
        </div>
      </div>
    )
  }

  // --- LOGGED IN USER PROFILE VIEW ---
  if (user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
        <main className="max-w-6xl mx-auto px-6 lg:px-10 py-10 w-full flex-1 space-y-8">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#101b37] text-white flex items-center justify-center font-bold text-xl uppercase shadow-sm">
                {user.userName ? user.userName.charAt(0) : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {user.userName}
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                    {user.role === 'admin' ? 'Admin' : 'Member'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <a
                href="/dashboard"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                Owner Dashboard
              </a>
              <a
                href="/list-property"
                className="px-4 py-2 bg-[#101b37] hover:bg-black text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                + List Property
              </a>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-4 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Bookings Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Your Reservations & Trips
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bookings stored in the database for your account
                </p>
              </div>
              <a
                href="/bookings"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Manage Orders →
              </a>
            </div>

            {loadingBookings ? (
              <div className="py-12 text-center text-xs text-slate-400 font-semibold">
                Loading your reservations...
              </div>
            ) : userBookings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm font-bold text-slate-700">No bookings made yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Discover our curated luxury properties and reserve your dream getaway.
                </p>
                <a
                  href="/"
                  className="mt-4 inline-block bg-[#101b37] hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
                >
                  Explore Stays
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {userBookings.map((b) => {
                  const hotel = typeof b.property === 'object' ? b.property : null
                  const hotelId = hotel?._id || b.property
                  const formattedTotal = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: b.currency || 'USD'
                  }).format((b.totalAmountCents || 0) / 100)

                  return (
                    <div
                      key={b._id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={hotel?.imageUrls?.[0] || '/images/rooms/room1.jpg'}
                          alt={hotel?.name || 'Hotel'}
                          className="w-16 h-14 rounded-lg object-cover bg-slate-200 shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = '/images/rooms/room1.jpg'
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">
                              {hotel?.name || 'Hotel Reservation'}
                            </h3>
                            <span
                              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusBadge(
                                b.status
                              )}`}
                            >
                              {b.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {dateLabel(b.checkIn)} — {dateLabel(b.checkOut)} · {b.guests} guest{b.guests > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                        <span className="text-xs font-extrabold text-slate-900">
                          {formattedTotal}
                        </span>
                        {hotelId && (
                          <a
                            href={`/hotels/${hotelId}`}
                            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-800"
                          >
                            View Hotel
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // --- UNAUTHENTICATED: LOGIN / REGISTER CARD ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between">
      <main className="max-w-md mx-auto py-16 px-6 w-full flex-1">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="text-center mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              STAYLUXE HOME
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              {mode === 'login' ? 'Sign In to Your Account' : 'Create an Account'}
            </h1>
            <p className="text-xs text-slate-500 mt-1.5">
              {mode === 'login'
                ? 'Welcome back! Enter your details to continue.'
                : 'Join StayLuxe to book luxury hotels or list your own properties.'}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError('')
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register')
                setError('')
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username *
                  </label>
                  <input
                    name="userName"
                    type="text"
                    required
                    minLength={3}
                    maxLength={20}
                    placeholder="e.g. alexander"
                    className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="alexander@example.com"
                    className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-slate-900"
                  />
                </div>
              </>
            )}

            {mode === 'login' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username or Email *
                </label>
                <input
                  name="identity"
                  type="text"
                  required
                  placeholder="Enter your username or email"
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-slate-900"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password *
              </label>
              <input
                name="passWord"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full mt-2 bg-[#101b37] hover:bg-black text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {busy ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
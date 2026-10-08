import { useEffect, useState, Component } from 'react'
import { AuthProvider, useAuth } from './hooks/AuthContext.jsx'
import Home from './pages/Home/Home.jsx'
import HotelDetails from './pages/Hotels/HotelDetails.jsx'
import Profile from './pages/Profile/Profile.jsx'
import BookingPage from './pages/Booking/BookingPage.jsx'
import Bookings from './pages/Booking/Bookings.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Rooms from './pages/Rooms/Rooms.jsx'
import ListProperty from './pages/Hotels/ListProperty.jsx'
import Navbar from './components/Navbar.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled app error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="max-w-md mx-auto px-6 py-24 text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            !
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h1>
          <p className="text-xs text-slate-500 mb-6">
            An unexpected error occurred while loading this page.
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.assign('/')
            }}
            className="inline-flex items-center justify-center px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-black rounded-xl transition-all shadow-xs cursor-pointer"
          >
            ← Return to Home
          </button>
        </main>
      )
    }
    return this.props.children
  }
}

function ProtectedPage({ children }) {
  const { user, loading } = useAuth()
  const returnTo = `${window.location.pathname}${window.location.search}`

  useEffect(() => {
    if (!loading && !user) {
      // Use history API to avoid a reload when redirecting to login
      window.history.pushState(null, '', `/profile?next=${encodeURIComponent(returnTo)}`)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }, [loading, user, returnTo])

  if (loading || !user) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-20 text-center text-slate-500 font-medium">
        Checking your session...
      </main>
    )
  }
  return children
}

function CurrentPage() {
  // Re-render whenever the URL changes (popstate = back/forward + our navigate())
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const onPopState = () => {
      setPath(window.location.pathname)
      window.scrollTo(0, 0)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])

  const hotelMatch = path.match(/^\/hotels\/([^/]+)\/?$/)
  const bookingMatch = path.match(/^\/hotels\/([^/]+)\/booking\/?$/)

  if (bookingMatch) {
    return <ProtectedPage><BookingPage hotelId={bookingMatch[1]} /></ProtectedPage>
  }
  if (hotelMatch) return <HotelDetails hotelId={hotelMatch[1]} />
  if (path === '/profile') return <Profile />
  if (path === '/bookings') return <ProtectedPage><Bookings /></ProtectedPage>
  if (path === '/dashboard') return <ProtectedPage><Dashboard /></ProtectedPage>
  if (path === '/list-property') return <ProtectedPage><ListProperty /></ProtectedPage>
  if (path === '/rooms') return <Rooms />
  if (path === '/') return <Home />
  return (
    <main className="max-w-2xl mx-auto px-6 py-24 text-center">
      <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Page not found</h1>
      <p className="text-slate-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault()
          window.history.pushState(null, '', '/')
          window.dispatchEvent(new PopStateEvent('popstate'))
        }}
        className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
      >
        Return to explore
      </a>
    </main>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Navbar />
        <CurrentPage />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
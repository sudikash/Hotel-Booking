import { useEffect, useState } from 'react'
import { apiRequest } from '../../services/api.js'
import Footer from '../../components/Footer.jsx'

function localDate() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

function BookingPage({ hotelId }) {
  const [hotel, setHotel] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('1')

  useEffect(() => {
    let active = true
    apiRequest(`/properties/${hotelId}`)
      .then((result) => { if (active) setHotel(result.property) })
      .catch((requestError) => { if (active) setError(requestError.message) })
    return () => { active = false }
  }, [hotelId])

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await apiRequest('/bookings', {
        method: 'POST',
        body: { propertyId: hotelId, checkIn, checkOut, guests: Number(guests) }
      })
      window.location.assign('/bookings')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  if (error && !hotel) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl mb-6 text-sm" role="alert">
          {error}
        </div>
        <a
          href="/"
          className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800"
        >
          ← Back to stays
        </a>
      </main>
    )
  }

  if (!hotel) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-24 text-center text-slate-500 font-medium">
        Loading booking details...
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Back Link */}
        <a
          href={`/hotels/${hotelId}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <span>←</span> Back to property
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Booking Form */}
          <section className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              Booking Request
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-3 mb-2 tracking-tight">
              Plan your stay
            </h1>
            <p className="text-sm text-slate-500 mb-8">
              Your request will be sent to the host for approval. No charge is processed right now.
            </p>

            <form className="space-y-5" onSubmit={submit}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Check-in Date
                </label>
                <input
                  type="date"
                  required
                  min={localDate()}
                  value={checkIn}
                  onChange={(event) => setCheckIn(event.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Check-out Date
                </label>
                <input
                  type="date"
                  required
                  min={checkIn || localDate()}
                  value={checkOut}
                  onChange={(event) => setCheckOut(event.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Number of Guests
                </label>
                <select
                  value={guests}
                  onChange={(event) => setGuests(event.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
                >
                  {Array.from({ length: hotel.maxGuests || 4 }, (_, index) => (
                    <option key={index + 1} value={index + 1}>
                      {index + 1} {index === 0 ? 'guest' : 'guests'}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#101b37] hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm cursor-pointer mt-4"
              >
                {busy ? 'Sending request...' : 'Request Booking'}
              </button>
            </form>
          </section>

          {/* Right: Property Summary Card */}
          <aside className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="aspect-video w-full rounded-2xl overflow-hidden mb-5 bg-slate-100">
              <img
                src={hotel.imageUrls?.[0] || '/images/rooms/room1.jpg'}
                alt={hotel.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = '/images/rooms/room1.jpg' }}
              />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Selected Property
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1 mb-1 truncate">
              {hotel.name}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              {hotel.location?.city ? `${hotel.location.city}, ` : ''}{hotel.location?.country || ''}
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-baseline justify-between">
              <span className="text-xs text-slate-400 font-medium">Rate per night</span>
              <div className="text-right">
                <span className="text-xl font-extrabold text-slate-900">
                  {new Intl.NumberFormat(undefined, { style: 'currency', currency: hotel.currency || 'USD' }).format(hotel.nightlyRateCents / 100)}
                </span>
                <span className="text-xs text-slate-500 ml-1">/ night</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default BookingPage
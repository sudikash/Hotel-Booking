import { useEffect, useState } from 'react'
import { apiRequest } from '../../services/api.js'
import Footer from '../../components/Footer.jsx'
import { CalendarIcon, MapPinIcon, GuestsIcon } from '../../components/Icons.jsx'

function dateLabel(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

  const loadBookings = async () => {
    try {
      const result = await apiRequest('/bookings?limit=100')
      setBookings(result.items || [])
      setError('')
    } catch (requestError) {
      setError(requestError.message || 'Failed to load bookings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const cancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    setBusyId(bookingId)
    try {
      await apiRequest(`/bookings/${bookingId}/cancel`, { method: 'PATCH' })
      await loadBookings()
    } catch (requestError) {
      setError(requestError.message || 'Failed to cancel booking.')
    } finally {
      setBusyId('')
    }
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

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans flex flex-col justify-between">
      <main className="max-w-6xl mx-auto px-6 lg:px-10 py-10 w-full flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-100">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">YOUR TRIPS & RESERVATIONS</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              My Orders & Bookings
            </h1>
          </div>
          <a
            href="/"
            className="self-start sm:self-auto bg-[#101b37] hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
          >
            Explore More Stays
          </a>
        </div>

        {/* State Alerts */}
        {loading && (
          <div className="py-20 text-center text-slate-500 text-xs font-semibold">
            <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading your bookings from database...
          </div>
        )}

        {error && (
          <div className="my-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && bookings.length === 0 && (
          <div className="text-center py-24 bg-slate-50 rounded-2xl border border-slate-100 max-w-md mx-auto my-10 p-8">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-xs border border-slate-200 flex items-center justify-center mx-auto mb-4 text-3xl">
              ✈️
            </div>
            <h2 className="text-base font-bold text-slate-900">No bookings found yet</h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              When you reserve a hotel on StayLuxe, your complete booking records and confirmation details will appear here.
            </p>
            <a
              href="/"
              className="mt-6 inline-block bg-[#101b37] hover:bg-black text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
            >
              Browse Hotels
            </a>
          </div>
        )}

        {/* Bookings List */}
        {!loading && bookings.length > 0 && (
          <div className="mt-8 space-y-4">
            {bookings.map((booking) => {
              const hotel = typeof booking.property === 'object' ? booking.property : null
              const hotelId = hotel?._id || booking.property
              const formattedTotal = new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: booking.currency || 'USD'
              }).format((booking.totalAmountCents || 0) / 100)

              return (
                <article
                  key={booking._id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
                >
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center min-w-0 flex-1">
                    {/* Hotel Thumbnail */}
                    <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={hotel?.imageUrls?.[0] || '/images/rooms/room1.jpg'}
                        alt={hotel?.name || 'Hotel'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/images/rooms/room1.jpg'
                        }}
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Booked on {dateLabel(booking.createdAt)}
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-slate-900 truncate">
                        {hotel?.name || 'Luxury Hotel Booking'}
                      </h2>

                      {hotel?.location?.city && (
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPinIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{hotel.location.city}, {hotel.location.country}</span>
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          {dateLabel(booking.checkIn)} — {dateLabel(booking.checkOut)}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1">
                          <GuestsIcon className="w-3.5 h-3.5 text-slate-400" />
                          {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Total Paid / Due</span>
                      <span className="text-base font-extrabold text-slate-900">{formattedTotal}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {hotelId && (
                        <a
                          href={`/hotels/${hotelId}`}
                          className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          View Hotel
                        </a>
                      )}
                      {['pending', 'confirmed'].includes(booking.status) && (
                        <button
                          type="button"
                          disabled={busyId === booking._id}
                          onClick={() => cancel(booking._id)}
                          className="px-3.5 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {busyId === booking._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
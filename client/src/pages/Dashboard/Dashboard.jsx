import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/AuthContext.jsx'
import { apiRequest } from '../../services/api.js'
import Footer from '../../components/Footer.jsx'

/**
 * ============================================================================
 * COLLEGE PROJECT: HOST DASHBOARD (MONITOR & MODIFY PROPERTIES)
 * ============================================================================
 * Key Points:
 * 1. Strictly monitors only properties owned by the currently logged-in user:
 *    Calls `GET /api/properties/mine`.
 * 2. Allows the owner to Modify (Edit) any of their properties:
 *    Calls `PATCH /api/properties/:id`.
 * 3. Allows the owner to Archive (Delete) their property:
 *    Calls `DELETE /api/properties/:id`.
 * 4. Allows the owner to monitor and accept/decline incoming guest bookings:
 *    Calls `PATCH /api/bookings/:id/decision`.
 * ============================================================================
 */

function dateLabel(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function Dashboard() {
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState('')

  // Editing Property State
  const [editingProperty, setEditingProperty] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editCountry, setEditCountry] = useState('')
  const [editRate, setEditRate] = useState('')
  const [editGuests, setEditGuests] = useState('')
  const [editStatus, setEditStatus] = useState('published')
  const [savingEdit, setSavingEdit] = useState(false)

  // 1. Load Owner's Properties & Booking Requests from Database
  const loadDashboard = async () => {
    try {
      setLoading(true)
      const [propertyResult, bookingResult] = await Promise.all([
        apiRequest('/properties/mine?limit=100'),
        apiRequest('/bookings/owner?limit=100')
      ])
      setProperties(propertyResult.items || [])
      setBookings(bookingResult.items || [])
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  // 2. Open Edit Modal for a Property
  const openEditModal = (prop) => {
    setEditingProperty(prop)
    setEditName(prop.name || '')
    setEditDescription(prop.description || '')
    setEditCity(prop.location?.city || '')
    setEditCountry(prop.location?.country || '')
    setEditRate(Math.round((prop.nightlyRateCents || 0) / 100).toString())
    setEditGuests((prop.maxGuests || 2).toString())
    setEditStatus(prop.status || 'published')
  }

  // 3. Save Modifications (PATCH /api/properties/:id)
  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editingProperty) return
    setSavingEdit(true)
    setError('')
    setNotice('')

    try {
      const payload = {
        name: editName.trim(),
        description: editDescription.trim(),
        location: {
          ...editingProperty.location,
          city: editCity.trim(),
          country: editCountry.trim()
        },
        nightlyRateCents: Math.round(Number(editRate) * 100),
        maxGuests: Number(editGuests),
        status: editStatus
      }

      await apiRequest(`/properties/${editingProperty._id}`, {
        method: 'PATCH',
        body: payload
      })

      setNotice(`Updated "${editName}" successfully!`)
      setEditingProperty(null)
      await loadDashboard()
    } catch (err) {
      setError(err.message || 'Failed to update property.')
    } finally {
      setSavingEdit(false)
    }
  }

  // 4. Archive/Delete Property (DELETE /api/properties/:id)
  const handleDeleteProperty = async (propertyId, propName) => {
    if (!window.confirm(`Are you sure you want to archive "${propName}"? It will no longer appear on Explore.`)) {
      return
    }

    setBusyId(propertyId)
    setError('')
    setNotice('')

    try {
      await apiRequest(`/properties/${propertyId}`, { method: 'DELETE' })
      setNotice(`Archived "${propName}" successfully.`)
      await loadDashboard()
    } catch (err) {
      setError(err.message || 'Failed to archive property.')
    } finally {
      setBusyId('')
    }
  }

  // 5. Decide on Incoming Guest Booking (Accept or Decline)
  const handleBookingDecision = async (bookingId, decision) => {
    setBusyId(bookingId)
    setError('')
    setNotice('')

    try {
      await apiRequest(`/bookings/${bookingId}/decision`, {
        method: 'PATCH',
        body: { decision }
      })
      await loadDashboard()
      setNotice(decision === 'accept' ? 'Booking accepted.' : 'Booking declined.')
    } catch (err) {
      setError(err.message || 'Could not update booking status.')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Top Banner */}
      <div className="bg-[#101b37] text-white py-10 px-6 lg:px-10 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] text-slate-300 uppercase mb-1">
              HOST MANAGEMENT CENTER
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Host Dashboard
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Logged in as <strong className="text-white">{user?.email || user?.userName}</strong>
            </p>
          </div>

          <a
            href="/list-property"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-900 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            <span>+</span>
            <span>List a New Property</span>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10 flex-1 w-full space-y-10">
        {/* Alert Notices */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            ✕ {error}
          </div>
        )}
        {notice && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            ✓ {notice}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs font-semibold">
            Loading your hosted properties from database...
          </div>
        ) : (
          <>
            {/* ==============================================================
                SECTION 1: MONITOR & MODIFY MY LISTED PROPERTIES
                ============================================================== */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    My Listed Properties
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Only you have permission to modify or manage these properties.
                  </p>
                </div>
                <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                  {properties.length} Total
                </span>
              </div>

              {properties.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm font-bold text-slate-700">No properties listed yet.</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    List your first hotel or room to start receiving reservations from guests.
                  </p>
                  <a
                    href="/list-property"
                    className="mt-4 inline-block bg-slate-900 hover:bg-black text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    List Your First Property
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                  {properties.map((prop) => {
                    const price = new Intl.NumberFormat('en-US').format(
                      Math.round((prop.nightlyRateCents || 0) / 100)
                    )

                    return (
                      <div
                        key={prop._id}
                        className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          {/* Image */}
                          <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                            <img
                              src={prop.imageUrls?.[0] || '/images/rooms/room1.jpg'}
                              alt={prop.name}
                              className="w-full h-full object-cover"
                            />
                            <span
                              className={`absolute top-2.5 right-2.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                prop.status === 'published'
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-700 text-white'
                              }`}
                            >
                              {prop.status}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="p-4">
                            <h3 className="text-xs font-bold text-slate-900 uppercase truncate">
                              <a href={`/hotels/${prop._id}`} className="hover:underline">
                                {prop.name}
                              </a>
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {prop.location?.city}, {prop.location?.country}
                            </p>
                            <p className="text-xs font-extrabold text-slate-900 mt-2">
                              {price} {prop.currency || 'USD'}{' '}
                              <span className="text-[10px] font-normal text-slate-400">/ night</span>
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Capacity: Up to {prop.maxGuests} guests
                            </p>
                          </div>
                        </div>

                        {/* Owner Actions: View, Modify, Archive */}
                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                          <a
                            href={`/hotels/${prop._id}`}
                            className="text-[11px] font-bold text-slate-700 hover:text-slate-900"
                          >
                            View Page
                          </a>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(prop)}
                              className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer"
                            >
                              Edit / Modify
                            </button>
                            <button
                              type="button"
                              disabled={busyId === prop._id}
                              onClick={() => handleDeleteProperty(prop._id, prop.name)}
                              className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              Archive
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* ==============================================================
                SECTION 2: MONITOR GUEST BOOKINGS & REQUESTS
                ============================================================== */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Incoming Guest Bookings
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Reservations made by guests for your properties.
                  </p>
                </div>
                <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                  {bookings.filter((b) => b.status === 'pending').length} Pending
                </span>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  No booking requests yet. Once guests reserve your stays, they will appear here.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 pt-2">
                  {bookings.map((booking) => {
                    const hotel = typeof booking.property === 'object' ? booking.property : null
                    const totalFormatted = new Intl.NumberFormat('en-US').format(
                      Math.round((booking.totalAmountCents || 0) / 100)
                    )

                    return (
                      <article
                        key={booking._id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {hotel?.name || 'Your Hotel'} · {dateLabel(booking.checkIn)} to{' '}
                            {dateLabel(booking.checkOut)}
                          </p>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                            Guest: {booking.user?.userName || booking.user?.email || 'Registered Guest'} ·{' '}
                            {booking.guests} Guest{booking.guests > 1 ? 's' : ''}
                          </h4>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Total: <strong>{totalFormatted} {booking.currency || 'USD'}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                              booking.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : booking.status === 'denied'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {booking.status}
                          </span>

                          {booking.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                disabled={busyId === booking._id}
                                onClick={() => handleBookingDecision(booking._id, 'accept')}
                                className="bg-[#101b37] hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                disabled={busyId === booking._id}
                                onClick={() => handleBookingDecision(booking._id, 'deny')}
                                className="border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold"
                              >
                                Decline
                              </button>
                            </>
                          )}
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* ====================================================================
          MODAL: MODIFY / EDIT PROPERTY DETAILS (OWNER ONLY)
          ==================================================================== */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  OWNER SETTINGS
                </span>
                <h3 className="text-sm font-bold text-slate-900 uppercase">
                  Modify Property: {editingProperty.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingProperty(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Property Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Price/Night ({editingProperty.currency || 'USD'})
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editRate}
                    onChange={(e) => setEditRate(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Max Guests
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editGuests}
                    onChange={(e) => setEditGuests(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProperty(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="bg-[#101b37] hover:bg-black text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  {savingEdit ? 'Saving...' : 'Save Modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
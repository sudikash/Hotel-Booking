import { useState, useEffect } from 'react'
import { apiRequest } from '../../services/api.js'
import { useAuth } from '../../hooks/AuthContext.jsx'
import Footer from '../../components/Footer.jsx'
import { MapPinIcon, AmenityFAIcon } from '../../components/Icons.jsx'

// --- 1. DEFAULT FALLBACK DATA MATCHING THE BACKEND MONGOOSE SCHEMA ---
const DEFAULT_ROOM_DATA = {
  _id: 'sample-luxury-suite',
  name: 'LUXURY SUITE',
  description:
    'Experience unparalleled comfort in our carefully curated suite, featuring spacious living areas, high-speed WiFi, panoramic city views, and dedicated hospitality.',
  location: {
    address: '108 Grand Boulevard',
    city: 'Kyiv',
    country: 'Ukraine',
    postalCode: '01001'
  },
  amenities: [
    'WiFi',
    'AC',
    'King Bed',
    'Kitchenette',
    'Mini Bar',
    'Flat Screen TV',
    'Desk',
    'Safe',
    'Coffee Maker'
  ],
  imageUrls: [
    '/images/rooms/room6.jpg',
    '/images/rooms/room1.jpg',
    '/images/rooms/room2.jpg',
    '/images/rooms/room3.jpg'
  ],
  nightlyRateCents: 600000,
  maxGuests: 2,
  currency: 'USD',
  status: 'published',
  owner: null
}

// --- 2. AMENITY ICONS (Font Awesome) ---
function AmenityIcon({ name }) {
  return <AmenityFAIcon name={name} className="w-5 h-5 text-slate-700" />
}

export default function Rooms({ hotelId }) {
  const { user } = useAuth()
  // --- 3. STATE MANAGEMENT ---
  const [room, setRoom] = useState(null)  // null = not yet loaded
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Booking Form State
  const [checkIn, setCheckIn] = useState('2026-10-15')
  const [checkOut, setCheckOut] = useState('2026-10-18')
  const [guestCount, setGuestCount] = useState(2)
  const [roomQuantity, setRoomQuantity] = useState(1)

  // Status & Feedback
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingMessage, setBookingMessage] = useState('')
  const [bookingError, setBookingError] = useState('')
  const [existingUserBooking, setExistingUserBooking] = useState(null)

  // Determine if logged-in user is the property owner
  const isOwner = Boolean(
    user &&
    room?.owner &&
    ((room.owner._id && String(room.owner._id) === String(user._id || user.id)) ||
      (room.owner.id && String(room.owner.id) === String(user._id || user.id)) ||
      (typeof room.owner === 'string' && String(room.owner) === String(user._id || user.id)))
  )

  // --- 4. FETCH ROOM DATA FROM BACKEND DATABASE ---
  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setRoom(null)
    setNotFound(false)
    setActiveImageIndex(0)
    setExistingUserBooking(null)

    const targetId = hotelId || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') : null)
    const fetchPath = targetId ? `/properties/${targetId}` : '/properties/featured'

    apiRequest(fetchPath)
      .then((res) => {
        if (!isMounted) return
        const dbData = res.property || res.items?.[0]
        if (dbData) {
          setRoom({
            _id: dbData._id,
            name: dbData.name || 'Hotel Stay',
            description: dbData.description || '',
            location: dbData.location || { city: '', country: '' },
            amenities: Array.isArray(dbData.amenities) ? dbData.amenities : [],
            imageUrls: dbData.imageUrls?.length ? dbData.imageUrls : ['/images/rooms/room1.jpg'],
            nightlyRateCents: dbData.nightlyRateCents || 500000,
            maxGuests: dbData.maxGuests || 2,
            currency: dbData.currency || 'USD',
            status: dbData.status || 'published',
            owner: dbData.owner || null
          })
          setNotFound(false)

          // Check if current user already has an active booking for this property
          if (user) {
            apiRequest('/bookings?limit=50')
              .then((bookingsRes) => {
                if (!isMounted) return
                const active = bookingsRes.items?.find(
                  (b) =>
                    (b.property?._id === dbData._id || b.property === dbData._id) &&
                    (b.status === 'confirmed' || b.status === 'pending')
                )
                if (active) {
                  setExistingUserBooking(active)
                }
              })
              .catch(() => {})
          }
        } else {
          setNotFound(true)
        }
      })
      .catch(() => {
        if (!isMounted) return
        setNotFound(true)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => { isMounted = false }
  }, [hotelId, user])

  // --- 5. CALCULATE NIGHTS & TOTAL ESTIMATE ---
  const startDate = new Date(checkIn)
  const endDate = new Date(checkOut)
  const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
  const nights = Number.isFinite(diffDays) && diffDays > 0 ? diffDays : 1

  const nightlyRateFormatted = new Intl.NumberFormat('en-US').format(
    Math.round((room?.nightlyRateCents || 0) / 100)
  )
  const totalAmountFormatted = new Intl.NumberFormat('en-US').format(
    Math.round(((room?.nightlyRateCents || 0) * nights) / 100)
  )

  // --- 6. HANDLE BOOKING SUBMISSION ---
  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    setBookingLoading(true)
    setBookingMessage('')
    setBookingError('')

    // 1. Mandatory check: User must be signed in
    if (!user) {
      window.location.assign(`/profile?next=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    // 2. Mandatory Business Rule: Owner cannot book own hotel
    if (isOwner) {
      setBookingError('You cannot book your own property.')
      setBookingLoading(false)
      return
    }

    // 3. Validate stay dates
    if (new Date(checkOut) <= new Date(checkIn)) {
      setBookingError('Check-out date must be strictly after check-in date.')
      setBookingLoading(false)
      return
    }

    try {
      await apiRequest('/bookings', {
        method: 'POST',
        body: {
          propertyId: room._id,
          checkIn,
          checkOut,
          guests: Number(guestCount)
        }
      })
      setBookingMessage('Your booking has been successfully confirmed and stored in the database!')
      setExistingUserBooking({ status: 'pending' })
    } catch (err) {
      if (err.status === 401) {
        window.location.assign(`/profile?next=${encodeURIComponent(window.location.pathname)}`)
      } else {
        setBookingError(err.message || 'Unable to reserve hotel. Please check date availability.')
      }
    } finally {
      setBookingLoading(false)
    }
  }

  const images = room?.imageUrls?.length ? room.imageUrls : DEFAULT_ROOM_DATA.imageUrls

  // --- LOADING SKELETON ---
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <div className="border-b border-slate-100 bg-slate-50/60">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3 flex items-center gap-2">
            <div className="h-3 w-12 bg-slate-200 rounded animate-pulse" />
            <span className="text-slate-300">/</span>
            <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
        <main className="max-w-7xl mx-auto px-6 lg:px-10 py-8 flex-1 w-full">
          <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-7 space-y-4">
              <div className="aspect-[16/10] bg-slate-200 rounded-2xl animate-pulse" />
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/3] bg-slate-200 rounded-xl animate-pulse" />)}
              </div>
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
              <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between font-sans">
        <main className="max-w-md mx-auto py-24 px-6 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
            🏨
          </div>
          <h1 className="text-xl font-bold text-slate-900">Property Not Found</h1>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            This hotel or room could not be found in the database. It may not exist yet or was archived by its owner.
          </p>
          <a
            href="/"
            className="mt-6 inline-block bg-[#101b37] hover:bg-black text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            ← Back to Explore
          </a>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans flex flex-col">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-slate-100 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3 flex items-center gap-2 text-xs text-slate-500">
          <a href="/" className="hover:text-slate-900 transition-colors">Home</a>
          <span>/</span>
          <span className="text-slate-900 font-semibold truncate">{room?.name}</span>
        </div>
      </div>

      {/* ====================================================================
          MAIN PAGE CONTENT
          ==================================================================== */}
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-8 flex-1 w-full">

        {/* --- Page Headline --- */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
          {room?.name || 'Hotel Stay'}: Your Ultimate Stay.
        </h1>

        {/* --- 2-Column Responsive Layout --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ================================================================
              LEFT COLUMN (7 cols): Main Photo, Gallery Thumbnails & Full Description
              ================================================================ */}
          <div className="lg:col-span-7 flex flex-col space-y-6">

            {/* Main Featured Photo */}
            <div className="relative aspect-[16/10] bg-slate-100 rounded-2xl overflow-hidden shadow-xs border border-slate-100">
              <img
                src={images[activeImageIndex] || images[0]}
                alt={room?.name || 'Hotel Room'}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_ROOM_DATA.imageUrls[0]
                }}
              />

              {/* Carousel Dot Indicators */}
              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 pointer-events-none">
                {images.slice(0, 5).map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full shadow-xs transition-all ${activeImageIndex === idx ? 'bg-white scale-125' : 'bg-white/60'
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Gallery Thumbnails (Click to view image) */}
            <div className="grid grid-cols-4 gap-3">
              {images.slice(1, 5).map((imgUrl, idx) => {
                const actualIndex = idx + 1
                const isActive = activeImageIndex === actualIndex
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(actualIndex)}
                    className={`aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 transition-all cursor-pointer border ${isActive
                      ? 'ring-2 ring-slate-900 border-transparent shadow-xs scale-98'
                      : 'border-slate-200 opacity-80 hover:opacity-100'
                      }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`View ${actualIndex}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_ROOM_DATA.imageUrls[actualIndex % DEFAULT_ROOM_DATA.imageUrls.length]
                      }}
                    />
                  </button>
                )
              })}
            </div>

            {/* FULL DESCRIPTION & LOCATION (Stored in DB) */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Full Description & Details
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed whitespace-pre-line">
                {room?.description}
              </p>

              {/* Host & Owner Information */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#101b37] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                    {room?.owner?.userName ? room.owner.userName.slice(0, 2) : 'SL'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Listed by {room?.owner?.userName || 'Verified StayLuxe Host'}
                    </p>
                    <p className="text-[11px] text-slate-500">Verified Property Partner</p>
                  </div>
                </div>
                {isOwner && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
                    Your Property
                  </span>
                )}
              </div>

              {/* Location details from DB */}
              <div className="p-3.5 bg-slate-50 rounded-xl flex items-start gap-3 border border-slate-100">
                <MapPinIcon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Address: </span>
                  {room?.location?.address ? `${room.location.address}, ` : ''}
                  {room?.location?.city}, {room?.location?.country}
                  {room?.location?.postalCode ? ` (${room.location.postalCode})` : ''}
                </div>
              </div>
            </div>

          </div>

          {/* ================================================================
              RIGHT COLUMN (5 cols): Title, Description, Amenities Grid & Booking Box
              ================================================================ */}
          <div className="lg:col-span-5 flex flex-col space-y-6">

            {/* Room Title & Short Description */}
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 uppercase tracking-tight">
                {room?.name}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
                {room?.description}
              </p>
            </div>

            {/* AMENITIES GRID (Rendered strictly from room.amenities stored in DB) */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Amenities</p>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-2.5">
                {(room?.amenities || []).map((amenity, index) => (
                  <div
                    key={`${amenity}-${index}`}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100 text-center hover:bg-slate-100 transition-colors"
                  >
                    <AmenityIcon name={amenity} />
                    <span className="text-[10px] font-semibold text-slate-700 mt-1.5 leading-tight truncate w-full">
                      {amenity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* BOOKING CARD BOX */}
            <div className="border border-slate-200 rounded-2xl p-5 sm:p-6 bg-white shadow-xs">
              {isOwner && (
                <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <p className="font-bold flex items-center gap-1.5">
                    <span>⚠️</span> Owner Restriction Notice
                  </p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    You are the registered owner of this property. Business rules strictly prevent hosts from booking their own listings.
                  </p>
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="space-y-4">

                {/* Check-in & Check-out Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 border border-slate-200 rounded-xl">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Check-in
                    </label>
                    <input
                      type="date"
                      required
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-800 focus:outline-none bg-transparent mt-0.5 cursor-pointer"
                    />
                  </div>

                  <div className="p-2 border border-slate-200 rounded-xl">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Check-out
                    </label>
                    <input
                      type="date"
                      required
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-800 focus:outline-none bg-transparent mt-0.5 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Guests & Rooms Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 border border-slate-200 rounded-xl">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Guests
                    </label>
                    <select
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full text-xs font-semibold text-slate-800 focus:outline-none bg-transparent mt-0.5 cursor-pointer"
                    >
                      {Array.from({ length: room?.maxGuests || 2 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          Up to {n} guest{n > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-2 border border-slate-200 rounded-xl">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Rooms
                    </label>
                    <select
                      value={roomQuantity}
                      onChange={(e) => setRoomQuantity(Number(e.target.value))}
                      className="w-full text-xs font-semibold text-slate-800 focus:outline-none bg-transparent mt-0.5 cursor-pointer"
                    >
                      <option value={1}>1 Room</option>
                      <option value={2}>2 Rooms</option>
                      <option value={3}>3 Rooms</option>
                    </select>
                  </div>
                </div>

                {/* Price Display */}
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <div className="flex items-baseline justify-between text-xs text-slate-500">
                    <span>Nightly rate</span>
                    <span className="font-semibold text-slate-700">
                      ${nightlyRateFormatted} {room?.currency || 'USD'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-900 font-bold">Total ({nights} night{nights > 1 ? 's' : ''})</span>
                    <span className="text-base sm:text-lg font-extrabold text-slate-900">
                      ${totalAmountFormatted} {room?.currency || 'USD'}
                    </span>
                  </div>
                </div>

                {/* Active booking indicator */}
                {existingUserBooking && (
                  <div className="p-3 rounded-xl bg-amber-50 text-amber-900 text-xs border border-amber-200 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold">You have an active booking for this hotel</p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Status: <span className="capitalize font-semibold">{existingUserBooking.status}</span>
                      </p>
                    </div>
                    <a
                      href="/bookings"
                      className="text-amber-800 underline font-bold shrink-0 text-[11px]"
                    >
                      View Orders
                    </a>
                  </div>
                )}

                {/* Status / Message Display */}
                {bookingMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">✓</span>
                      <span>{bookingMessage}</span>
                    </div>
                    <a
                      href="/bookings"
                      className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-xs"
                    >
                      View in Your Orders →
                    </a>
                  </div>
                )}
                {bookingError && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                    {bookingError}
                  </div>
                )}

                {/* Action Button */}
                <button
                  type="submit"
                  disabled={bookingLoading || isOwner}
                  className={`w-full text-xs font-bold tracking-widest py-3.5 rounded-lg transition-all uppercase shadow-xs cursor-pointer ${isOwner
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : !user
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-98'
                      : 'bg-[#181d28] hover:bg-black text-white active:scale-98'
                    } disabled:opacity-60`}
                >
                  {bookingLoading
                    ? 'Processing...'
                    : isOwner
                      ? 'Cannot Book Own Property'
                      : !user
                        ? 'Sign In to Book'
                        : 'BOOK NOW'}
                </button>

                {/* Guarantees */}
                <div className="pt-2 space-y-1.5 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Free cancellation up to 48 hours before check-in</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Best price guarantee verified on StayLuxe</span>
                  </div>
                </div>

              </form>
            </div>

          </div>

        </div>

      </main>

      {/* ====================================================================
          FOOTER COMPONENT
          ==================================================================== */}
      <Footer />

    </div>
  )
}

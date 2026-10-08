import { useEffect, useState, useRef } from 'react'
import { apiRequest } from '../../services/api.js'
import { Link } from '../../services/navigate.jsx'
import {
  MapPinIcon,
  CalendarIcon,
  GuestsIcon,
  SearchIcon,
  ChevronDownIcon,
  ArrowRightIcon
} from '../../components/Icons.jsx'
import Footer from '../../components/Footer.jsx'

/**
 * ============================================================================
 * COLLEGE PROJECT: HOTELS LISTING & SEARCH PAGE
 * ============================================================================
 * Key Features for Project Presentation:
 * 1. Search Bar: Queries backend MongoDB database by location & guest count.
 * 2. Database Retrieval: Fetches listed hotels from `/api/properties`.
 * 3. 3-Column Card Grid: Displays hotel photos, capacity, square meters, rooms, and price.
 * 4. Interactive Navigation: Clicking any hotel card, "View More", or "BOOK"
 *    fetches that specific hotel from the DB and displays it on the Room page!
 * ============================================================================
 */

// Default showcase hotel data matching backend MongoDB properties schema
export const SHOWCASE_HOTELS = [
  {
    _id: 'presidential-suite-01',
    name: 'PRESIDENTIAL SUITE',
    category: 'Suite',
    imageUrls: [
      '/images/rooms/room6.jpg',
      '/images/rooms/presidential-bed.jpg',
      '/images/rooms/presidential-bath.jpg',
      '/images/rooms/presidential-kitchen.jpg',
      '/images/rooms/presidential-view.jpg'
    ],
    maxGuests: 4,
    square: '190m²',
    roomCount: 3,
    nightlyRateCents: 5600000, // 56,000 UAH
    currency: 'UAH',
    location: { city: 'Kyiv', country: 'Ukraine', address: '108 Grand Boulevard' },
    amenities: ['WiFi', 'AC', 'King Bed', 'Kitchenette', 'Mini Bar', 'Spa Access', 'Flat Screen TV', 'Desk', 'Safe', 'Coffee Maker'],
    description: 'Experience unparalleled luxury in our sprawling 190m² Presidential Suite, featuring separate living, dining, and sleeping areas, a fully-equipped kitchenette, and floor-to-ceiling windows with panoramic views.'
  },
  {
    _id: 'standard-double-one-bed-02',
    name: 'STANDARD DOUBLE (ONE BED)',
    category: 'Standard',
    imageUrls: ['/images/rooms/room1.jpg'],
    maxGuests: 2,
    square: '32m²',
    roomCount: 1,
    nightlyRateCents: 550000, // 5,500 UAH
    currency: 'UAH',
    location: { city: 'Kyiv', country: 'Ukraine', address: '12 Khreshchatyk St' },
    amenities: ['WiFi', 'AC', 'King Bed', 'Flat Screen TV', 'Coffee Maker'],
    description: 'A cozy and modern room equipped with mood lighting, comfortable king-size bedding, and a peaceful ambiance for couples or solo travelers.'
  },
  {
    _id: 'standard-double-two-beds-03',
    name: 'STANDARD DOUBLE (TWO BEDS)',
    category: 'Standard',
    imageUrls: ['/images/rooms/room2.jpg'],
    maxGuests: 2,
    square: '32m²',
    roomCount: 1,
    nightlyRateCents: 550000, // 5,500 UAH
    currency: 'UAH',
    location: { city: 'Lviv', country: 'Ukraine', address: '44 Rynok Square' },
    amenities: ['WiFi', 'AC', 'Desk', 'Flat Screen TV', 'Mini Fridge'],
    description: 'Designed for friends or colleagues traveling together. Features two separate comfortable beds with premium linens and minimalist styling.'
  },
  {
    _id: 'family-double-room-04',
    name: 'FAMILY DOUBLE ROOM WITH TWO BEDS - DOUBLE AND SINGLE',
    category: 'Family',
    imageUrls: ['/images/rooms/room3.jpg'],
    maxGuests: 3,
    square: '32m²',
    roomCount: 1,
    nightlyRateCents: 650000, // 6,500 UAH
    currency: 'UAH',
    location: { city: 'Odesa', country: 'Ukraine', address: '8 Derybasivska St' },
    amenities: ['WiFi', 'AC', 'Bathtub', 'Family Lounge', 'Electric Kettle'],
    description: 'Ideal for small families with a child. Offers generous space with both a double bed and an extra single bed, plus room for luggage.'
  },
  {
    _id: 'emily-magic-hostel-05',
    name: 'EMILY MAGIC HOSTEL',
    category: 'Hostel',
    imageUrls: ['/images/rooms/room4.jpg'],
    maxGuests: 15,
    square: '45m²',
    roomCount: 5,
    nightlyRateCents: 45000, // 450 UAH
    currency: 'UAH',
    location: { city: 'Dnipro', country: 'Ukraine', address: '15 Yavornytskoho Ave' },
    amenities: ['WiFi', 'Shared Kitchen', 'Personal Lockers', 'Reading Lamp'],
    description: 'Budget-friendly and social dormitory style accommodation. Perfect for backpackers, student trips, and group travelers.'
  },
  {
    _id: 'deluxe-suite-06',
    name: 'DELUXE',
    category: 'Deluxe',
    imageUrls: ['/images/rooms/room5.jpg'],
    maxGuests: 2,
    square: '66m²',
    roomCount: 1,
    nightlyRateCents: 900000, // 9,000 UAH
    currency: 'UAH',
    location: { city: 'Kyiv', country: 'Ukraine', address: '22 Podil St' },
    amenities: ['WiFi', 'AC', 'Panoramic View', 'Private Balcony', 'Mini Bar', 'Bathtub & Shower'],
    description: 'Expansive deluxe suite featuring elegant wooden panel accents, a comfortable sofa seating zone, and scenic skyline views.'
  }
]


export default function Home() {
  // --- 1. STATE VARIABLES ---
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchLocation, setSearchLocation] = useState('')
  const [checkInDate, setCheckInDate] = useState('2026-10-15')
  const [checkOutDate, setCheckOutDate] = useState('2026-10-18')
  const [guests, setGuests] = useState(1)
  const [rooms, setRooms] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  // Dropdown states
  const [datesPickerOpen, setDatesPickerOpen] = useState(false)
  const [guestsPickerOpen, setGuestsPickerOpen] = useState(false)
  const searchCardRef = useRef(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchCardRef.current && !searchCardRef.current.contains(event.target)) {
        setDatesPickerOpen(false)
        setGuestsPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // --- 2. FETCH PROPERTIES FROM BACKEND DATABASE ---
  const fetchHotelsFromDB = async (searchTerm = '', guestLimit = 1, isSearchSubmit = false) => {
    setLoading(true)
    if (isSearchSubmit) {
      setHasSearched(true)
    }
    try {
      let queryParams = '?limit=6'
      if (searchTerm.trim()) queryParams += `&search=${encodeURIComponent(searchTerm.trim())}`
      if (guestLimit > 1) queryParams += `&guests=${guestLimit}`

      const res = await apiRequest(`/properties${queryParams}`)
      if (res.items && res.items.length > 0) {
        const dbHotels = res.items.map((item) => ({
          _id: item._id,
          name: item.name,
          category: item.category || 'Hotel',
          imageUrls: item.imageUrls?.length ? item.imageUrls : ['/images/rooms/room1.jpg'],
          maxGuests: item.maxGuests || 2,
          square: item.square || `${Math.max(25, (item.maxGuests || 2) * 18)}m²`,
          roomCount: item.roomCount || 1,
          nightlyRateCents: item.nightlyRateCents || 500000,
          currency: item.currency || 'USD',
          location: item.location || { city: '', country: '' },
          amenities: item.amenities || [],
          description: item.description || ''
        }))
        setHotels(dbHotels)
      } else {
        setHotels([])
      }
    } catch {
      setHotels([])
    } finally {
      setLoading(false)
    }
  }

  // Load recommendations/hotels from DB on mount
  useEffect(() => {
    fetchHotelsFromDB('', 1, false)
  }, [])

  // --- 3. HANDLE SEARCH FORM SUBMISSION ---
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setDatesPickerOpen(false)
    setGuestsPickerOpen(false)
    fetchHotelsFromDB(searchLocation, guests, true)

    const target = document.getElementById('hotels-grid')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleResetSearch = () => {
    setSearchLocation('')
    setGuests(1)
    setRooms(1)
    setSelectedCategory('ALL')
    setHasSearched(false)
    fetchHotelsFromDB('', 1, false)
  }

  // Filtered hotels based on selected category chip
  const filteredHotels = hotels.filter((hotel) => {
    if (selectedCategory === 'ALL') return true
    return hotel.category?.toUpperCase() === selectedCategory.toUpperCase()
  })

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
      {/* ====================================================================
          HERO SECTION & SEARCH BAR
          ==================================================================== */}
      <section className="relative bg-slate-900 pt-16 pb-12 sm:pb-16 px-6 lg:px-12 overflow-visible">
        {/* Luxury Hotel Dusk Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-90"
          style={{
            backgroundImage: "url('/images/hero.jpg')",
            backgroundPosition: 'center 40%'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-slate-950/30" />
        </div>

        {/* Hero Headline */}
        <div className="relative z-10 max-w-7xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.2em] text-slate-200/90 uppercase mb-3">
            LUXURY STAYS, UNFORGETTABLE EXPERIENCES
          </p>

          <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-white tracking-tight leading-[1.15]">
            Find the Perfect Hotel for <br />
            Your <span className="text-[#89a8f8]">Journey</span>
          </h1>

          {/* ================================================================
              SEARCH BAR: Query Backend DB for Location, Dates & Guests
              ================================================================ */}
          <div
            ref={searchCardRef}
            className="mt-8 max-w-5xl bg-white rounded-2xl shadow-2xl p-3 sm:p-4 border border-slate-100"
          >
            <form onSubmit={handleSearchSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-[1.5fr_auto_1.3fr_auto_1.2fr_auto] gap-3 md:gap-4 items-center">

                {/* 1. Location Input */}
                <div className="flex items-center gap-3 px-3 py-1">
                  <MapPinIcon className="w-5 h-5 text-slate-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Location / City
                    </span>
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      placeholder="Search city or hotel name..."
                      className="w-full text-xs font-semibold text-slate-800 focus:outline-none bg-transparent placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-9 bg-slate-200" />

                {/* 2. Check-in & Check-out Dates */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setDatesPickerOpen(!datesPickerOpen)
                      setGuestsPickerOpen(false)
                    }}
                    className="w-full flex items-center justify-between px-3 py-1 text-left rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CalendarIcon className="w-5 h-5 text-slate-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Check in - Check out
                        </span>
                        <span className="text-xs font-semibold text-slate-800 truncate block">
                          {checkInDate && checkOutDate ? `${checkInDate} — ${checkOutDate}` : 'Select dates'}
                        </span>
                      </div>
                    </div>
                    <ChevronDownIcon className="w-4 h-4 text-slate-400 ml-2" />
                  </button>

                  {/* Dates Popover */}
                  {datesPickerOpen && (
                    <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-40">
                      <p className="text-xs font-bold text-slate-800 mb-2">Select Stay Dates</p>
                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] text-slate-500 font-medium">Check-in</label>
                          <input
                            type="date"
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-lg p-1.5 mt-0.5"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-medium">Check-out</label>
                          <input
                            type="date"
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-lg p-1.5 mt-0.5"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setDatesPickerOpen(false)}
                          className="w-full mt-2 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-9 bg-slate-200" />

                {/* 3. Guests & Rooms */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setGuestsPickerOpen(!guestsPickerOpen)
                      setDatesPickerOpen(false)
                    }}
                    className="w-full flex items-center justify-between px-3 py-1 text-left rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <GuestsIcon className="w-5 h-5 text-slate-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Guests & Rooms
                        </span>
                        <span className="text-xs font-semibold text-slate-800 truncate block">
                          {guests} Guest{guests > 1 ? 's' : ''}, {rooms} Room{rooms > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <ChevronDownIcon className="w-4 h-4 text-slate-400 ml-2" />
                  </button>

                  {/* Guests Popover */}
                  {guestsPickerOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-40">
                      <p className="text-xs font-bold text-slate-800 mb-3">Guests & Rooms</p>

                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-xs text-slate-600">Guests</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setGuests(Math.max(1, guests - 1))}
                            className="w-6 h-6 rounded-full border border-slate-300 text-xs font-bold flex items-center justify-center hover:bg-slate-100"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{guests}</span>
                          <button
                            type="button"
                            onClick={() => setGuests(guests + 1)}
                            className="w-6 h-6 rounded-full border border-slate-300 text-xs font-bold flex items-center justify-center hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-1.5 mt-1">
                        <span className="text-xs text-slate-600">Rooms</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setRooms(Math.max(1, rooms - 1))}
                            className="w-6 h-6 rounded-full border border-slate-300 text-xs font-bold flex items-center justify-center hover:bg-slate-100"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{rooms}</span>
                          <button
                            type="button"
                            onClick={() => setRooms(rooms + 1)}
                            className="w-6 h-6 rounded-full border border-slate-300 text-xs font-bold flex items-center justify-center hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setGuestsPickerOpen(false)}
                        className="w-full mt-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                {/* 4. Search Button */}
                <div className="pt-2 md:pt-0">
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-[#101b37] hover:bg-[#1c2c54] text-white px-7 py-3 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <SearchIcon className="w-4 h-4" />
                    <span>Search</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* Category Filter Chips */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">Filter:</span>
                {['ALL', 'STANDARD', 'FAMILY', 'HOSTEL', 'DELUXE', 'SUITE'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#101b37] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ====================================================================
          HOTELS / ROOMS CARDS GRID
          When user clicks any card or "View Details" -> Navigates to /hotels/:id
          ==================================================================== */}
      <main id="hotels-grid" className="max-w-7xl mx-auto px-6 lg:px-12 py-12 flex-1 w-full">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {hasSearched ? `Search Results` : `Recommended Luxury Stays`}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {hasSearched
                ? `Showing properties matching your search criteria (${filteredHotels.length} found)`
                : `Handpicked luxury properties from our verified hosts`}
            </p>
          </div>
          {hasSearched && (
            <button
              type="button"
              onClick={handleResetSearch}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors self-start sm:self-auto cursor-pointer"
            >
              ← Clear search & view all
            </button>
          )}
        </div>

        {loading && (
          <div className="text-center py-16 text-slate-500 text-xs font-semibold">
            <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Querying database for available properties...
          </div>
        )}

        {/* Empty State: When user searched but no matching hotels were found */}
        {!loading && hasSearched && filteredHotels.length === 0 && (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200/80 p-8 max-w-lg mx-auto">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-4 text-2xl">
              🔍
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No hotels found for your search.
            </h3>
            <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
              We couldn't find any properties matching "{searchLocation || 'your filters'}". Try adjusting your location, dates, or guest count.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleResetSearch}
                className="bg-[#101b37] hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Show All Available Hotels
              </button>
            </div>
          </div>
        )}

        {/* Empty State: When database has no published hotels at all */}
        {!loading && !hasSearched && hotels.length === 0 && (
          <div className="text-center py-20 bg-slate-50/70 rounded-3xl border border-slate-200/80 p-8 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-4 text-2xl">
              🏨
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No Properties Listed in Database Yet
            </h3>
            <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
              Properties will only appear here once an owner lists a property in the database. As a host, you can publish a luxury stay right now!
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/list-property"
                className="bg-[#101b37] hover:bg-black text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
              >
                + List a Property Now
              </Link>
              <button
                type="button"
                onClick={() => fetchHotelsFromDB('', 1, false)}
                className="border border-slate-300 hover:bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Refresh Database
              </button>
            </div>
          </div>
        )}

        {/* Hotel Cards Grid */}
        {!loading && filteredHotels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredHotels.map((hotel) => {
              const price = new Intl.NumberFormat('en-US').format(
                Math.round(hotel.nightlyRateCents / 100)
              )

              return (
                <div
                  key={hotel._id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* --- Hotel Card Image with Badges --- */}
                  <Link
                    to={`/hotels/${hotel._id}`}
                    className="relative aspect-[16/10] bg-slate-100 overflow-hidden block"
                  >
                    <img
                      src={hotel.imageUrls?.[0] || '/images/rooms/room1.jpg'}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = '/images/rooms/room1.jpg'
                      }}
                    />

                    {/* Top Badges: Location & Rating */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <MapPinIcon className="w-3 h-3 text-slate-300" />
                        <span className="truncate max-w-[140px]">
                          {hotel.location?.city || 'StayLuxe'}, {hotel.location?.country || ''}
                        </span>
                      </span>
                      <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[11px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <span className="text-amber-500">★</span> 4.9
                      </span>
                    </div>

                    {/* Carousel Dots indicator */}
                    <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-1.5 pointer-events-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 shadow-xs" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 shadow-xs" />
                    </div>
                  </Link>

                  {/* --- Hotel Card Details (Compact) --- */}
                  <div className="px-4 py-3.5 flex flex-col gap-3">

                    {/* Name + Category row */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1 flex-1">
                        <Link to={`/hotels/${hotel._id}`} className="hover:text-indigo-600 transition-colors">
                          {hotel.name}
                        </Link>
                      </h3>
                      {hotel.category && (
                        <span className="shrink-0 text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100 capitalize">
                          {hotel.category}
                        </span>
                      )}
                    </div>

                    {/* Specs + Amenities in one compact row */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <GuestsIcon className="w-3 h-3 text-slate-400" />
                        {hotel.maxGuests} guests
                      </span>
                      <span className="text-slate-300 text-[10px]">•</span>
                      <span className="text-[11px] text-slate-500">{hotel.square}</span>
                      {hotel.amenities?.slice(0, 2).map((amenity, idx) => (
                        <>
                          <span key={`dot-${idx}`} className="text-slate-300 text-[10px]">•</span>
                          <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                            {amenity}
                          </span>
                        </>
                      ))}
                      {hotel.amenities?.length > 2 && (
                        <span className="text-[10px] text-slate-400">+{hotel.amenities.length - 2}</span>
                      )}
                    </div>

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                      <div className="leading-tight">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">From</span>
                        <div className="text-sm font-extrabold text-slate-900">
                          ${price} <span className="text-[11px] font-normal text-slate-400">{hotel.currency}/night</span>
                        </div>
                      </div>
                      <Link
                        to={`/hotels/${hotel._id}`}
                        className="bg-[#101b37] hover:bg-black text-white text-[11px] font-bold tracking-wide px-3.5 py-2 rounded-xl transition-all shadow-xs uppercase inline-flex items-center gap-1 active:scale-95 cursor-pointer"
                      >
                        Book
                        <ArrowRightIcon className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* ====================================================================
          FOOTER
          ==================================================================== */}
      <Footer />
    </div>
  )
}
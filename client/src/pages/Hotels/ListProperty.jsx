import { useState, useRef } from 'react'
import { apiRequest } from '../../services/api.js'
import Footer from '../../components/Footer.jsx'
import { UploadIcon } from '../../components/Icons.jsx'

/**
 * ============================================================================
 * COLLEGE PROJECT: LIST PROPERTY FORM
 * ============================================================================
 * Features:
 * 1. Real Drag & Drop and File Selector for hotel and room photos.
 * 2. Instant preview thumbnails with delete option and "Cover Photo" indicator.
 * 3. Uploads directly to backend storage (/api/uploads/images) with base64 fallback.
 * 4. Strictly saves only real owner-provided photos to the MongoDB database.
 * ============================================================================
 */

// Popular amenities for easy one-click selection
const POPULAR_AMENITIES = [
  'WiFi',
  'AC',
  'King Bed',
  'Kitchenette',
  'Mini Bar',
  'Spa Access',
  'Flat Screen TV',
  'Desk',
  'Safe',
  'Coffee Maker',
  'Balcony',
  'Swimming Pool',
  'Free Parking'
]

export default function ListProperty() {
  // Form State
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [nightlyRate, setNightlyRate] = useState('5500')
  const [currency, setCurrency] = useState('UAH')
  const [maxGuests, setMaxGuests] = useState('2')
  const [selectedAmenities, setSelectedAmenities] = useState(['WiFi', 'AC', 'King Bed', 'Flat Screen TV'])

  // Photo Upload State (Starts completely empty - no fake images)
  const [imagesList, setImagesList] = useState([])
  const [customImageUrl, setCustomImageUrl] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const fileInputRef = useRef(null)

  // Status & Feedback
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Toggle amenity selection
  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    )
  }

  // --- FILE DRAG & DROP AND SELECTION HANDLER ---
  const handleFiles = async (files) => {
    if (!files || files.length === 0) return

    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith('image/')
    )

    if (validFiles.length === 0) {
      setError('Please select valid image files (JPEG, PNG, WebP, AVIF).')
      return
    }

    setUploadingPhotos(true)
    setError('')

    try {
      // 1. Try uploading to backend upload endpoint (/api/uploads/images)
      const formData = new FormData()
      validFiles.forEach((file) => formData.append('images', file))

      const uploadResult = await apiRequest('/uploads/images', {
        method: 'POST',
        body: formData
      })

      if (uploadResult.imageUrls && uploadResult.imageUrls.length > 0) {
        setImagesList((prev) => [...prev, ...uploadResult.imageUrls])
      } else {
        throw new Error('Upload did not return image URLs')
      }
    } catch {
      // 2. Seamless local fallback: convert files to Base64 URLs so offline / demo presentations never fail
      const base64Promises = validFiles.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target.result)
          reader.readAsDataURL(file)
        })
      })

      const base64Urls = await Promise.all(base64Promises)
      setImagesList((prev) => [...prev, ...base64Urls])
    } finally {
      setUploadingPhotos(false)
    }
  }

  // Add custom image URL manually if owner hosts on an external CDN
  const addImageUrl = (e) => {
    e.preventDefault()
    if (customImageUrl.trim() && !imagesList.includes(customImageUrl.trim())) {
      setImagesList([...imagesList, customImageUrl.trim()])
      setCustomImageUrl('')
    }
  }

  // Remove an image from the list
  const removeImage = (indexToRemove) => {
    setImagesList(imagesList.filter((_, idx) => idx !== indexToRemove))
  }

  // Submit form to backend MongoDB
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      // Check that at least 1 real photo was provided
      if (imagesList.length === 0) {
        throw new Error('Please select or drop at least one photo of your property.')
      }

      // Calculate price in cents (as required by DB integer schema)
      const nightlyRateCents = Math.round(Number(nightlyRate) * 100)
      if (!Number.isInteger(nightlyRateCents) || nightlyRateCents < 1) {
        throw new Error('Please enter a valid positive nightly rate.')
      }

      // Prepare payload matching Mongoose Property schema
      const payload = {
        name: name.trim(),
        description: description.trim(),
        location: {
          city: city.trim(),
          country: country.trim(),
          address: address.trim(),
          postalCode: postalCode.trim()
        },
        amenities: selectedAmenities,
        imageUrls: imagesList,
        nightlyRateCents,
        maxGuests: Number(maxGuests),
        currency: currency.toUpperCase(),
        status: 'published'
      }

      // Post to backend DB
      const result = await apiRequest('/properties', {
        method: 'POST',
        body: payload
      })

      setSuccess('Property listed successfully in database!')
      setTimeout(() => {
        if (result.property?._id) {
          window.location.assign(`/hotels/${result.property._id}`)
        } else {
          window.location.assign('/dashboard')
        }
      }, 1200)
    } catch (err) {
      setError(err.message || 'Failed to list property. Ensure you are signed in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Header Banner */}
      <div className="bg-[#101b37] text-white py-12 px-6 lg:px-10 border-b border-slate-800">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.2em] text-slate-300 uppercase mb-2">
            HOST WITH STAYLUXE
          </p>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            List Your Property in Database
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl">
            Upload your real photos and enter your property details to publish your stay.
            Only you as the owner will be able to monitor and modify it from your Host Dashboard.
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <main className="max-w-4xl mx-auto px-6 py-10 w-full flex-1">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            ✕ {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Property Identity */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              1. Basic Property Information
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Property / Hotel Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Ocean Villa Suite"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-slate-900 focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe the rooms, views, style, and luxury experience..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-slate-900 focus:border-slate-900"
              />
            </div>
          </div>

          {/* Section 2: Location (Required by DB Schema) */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              2. Location Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kyiv"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Country *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ukraine"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. 108 Grand Boulevard"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  placeholder="e.g. 01001"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Pricing & Capacity */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              3. Pricing & Guest Capacity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Price per Night *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="e.g. 5500"
                  value={nightlyRate}
                  onChange={(e) => setNightlyRate(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Currency *</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-slate-900 bg-white"
                >
                  <option value="UAH">UAH (Ukrainian Hryvnia)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="GBP">GBP (British Pound)</option>
                  <option value="INR">INR (Indian Rupee)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Guests *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="50"
                  value={maxGuests}
                  onChange={(e) => setMaxGuests(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-slate-900 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Amenities */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              4. Property Amenities
            </h2>
            <p className="text-xs text-slate-500">
              Select all amenities available at this property:
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {POPULAR_AMENITIES.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity)
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#101b37] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {amenity}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ================================================================
              SECTION 5: SELECT & DRAG-AND-DROP PHOTO UPLOADER
              ================================================================ */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                5. Hotel and Room Photos *
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select and drop real photos of your hotel, bedrooms, and living spaces.
              </p>
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setIsDragging(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                handleFiles(e.dataTransfer.files)
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50'
              }`}
            >
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-3">
                <UploadIcon className="w-7 h-7 text-slate-600" />
              </div>

              <p className="text-sm font-bold text-slate-800">
                {uploadingPhotos
                  ? 'Uploading selected photos...'
                  : 'Select or Drop Photos Here'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Drag and drop image files from your computer, or click to browse.
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Supported formats: JPEG, PNG, WebP, AVIF
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                disabled={uploadingPhotos}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                {uploadingPhotos ? 'Processing...' : 'Browse Computer Files'}
              </button>
            </div>

            {/* Optional Manual URL Input */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Or add an external image URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="flex-1 text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-slate-900"
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="bg-slate-800 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* Preview of Uploaded Real Photos */}
            {imagesList.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-800">
                    Attached Photos ({imagesList.length})
                  </p>
                  <span className="text-[11px] text-slate-400">
                    First photo will be your property cover
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {imagesList.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs"
                    >
                      <img
                        src={url}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* First Image is Cover Badge */}
                      {idx === 0 && (
                        <span className="absolute bottom-2 left-2 bg-[#101b37] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                          Cover Photo
                        </span>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        title="Remove photo"
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white text-xs flex items-center justify-center cursor-pointer transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <a
              href="/dashboard"
              className="px-6 py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={submitting || uploadingPhotos}
              className="bg-[#101b37] hover:bg-black text-white px-8 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Saving to Database...' : 'Publish Hotel to DB'}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}

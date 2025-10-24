import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import client from '../sanityClient'
import exifr from 'exifr'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// ✅ Fix missing marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// 🗺️ Helper: Automatically zoom map when location updates
function MapAutoZoom({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.setView(position, 12) // zoom in to level 12
    }
  }, [position, map])
  return null
}

// 📍 Component to handle map clicks and marker placement
function LocationPicker({ setValue, position, setPosition, setCityName }) {
  useMapEvents({
    click(e) {
      const latlng = e.latlng
      setPosition(latlng)
      setValue('location', `${latlng.lat},${latlng.lng}`)
      reverseGeocode(latlng.lat, latlng.lng, setCityName, setValue)
    },
  })
  return position ? <Marker position={position} /> : null
}

// 🌆 Helper: Get city name using OpenStreetMap reverse geocoding
async function reverseGeocode(lat, lng, setCityName, setValue) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    )
    const data = await res.json()
    const city =
      data.address.city ||
      data.address.town ||
      data.address.village ||
      data.address.state ||
      'Unknown location'
    setCityName(city)
    setValue('locationName', city)
  } catch (e) {
    console.warn('Failed to fetch city name:', e)
    setCityName('Unknown location')
  }
}

export default function UploadForm() {
  const { register, handleSubmit, setValue, reset } = useForm()
  const [uploading, setUploading] = useState(false)
  const [position, setPosition] = useState(null)
  const [cityName, setCityName] = useState('Fetching location...')

  // ✅ Get user's current location on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords
          const latlng = { lat: latitude, lng: longitude }
          setPosition(latlng)
          setValue('location', `${latitude},${longitude}`)
          await reverseGeocode(latitude, longitude, setCityName, setValue)
        },
        (err) => {
          console.warn('Location access denied:', err.message)
          setCityName('Location not available')
        }
      )
    }
  }, [setValue])

  // ✅ Default date/time
  const currentDateTime = new Date().toISOString().slice(0, 16)

  const onSubmit = async (data) => {
    setUploading(true)
    try {
      const files = Array.from(data.media)
      const mediaRefs = []

      for (const file of files) {
        const asset = await client.assets.upload('file', file, { filename: file.name })
        mediaRefs.push({
          _key: crypto.randomUUID(),
          _type: 'file',
          asset: { _type: 'reference', _ref: asset._id },
        })

        if (file.type.startsWith('image/')) {
          const exif = await exifr.gps(file)
          if (exif?.latitude && exif?.longitude) {
            const lat = exif.latitude
            const lng = exif.longitude
            setPosition({ lat, lng })
            setValue('location', `${lat},${lng}`)
            await reverseGeocode(lat, lng, setCityName, setValue)
          }
        }
      }

      const doc = {
        _type: 'submission',
        title: data.title,
        description: data.description,
        media: mediaRefs,
        locationName: data.locationName || cityName,
        location: data.location
          ? {
              lat: parseFloat(data.location.split(',')[0]),
              lng: parseFloat(data.location.split(',')[1]),
            }
          : undefined,
        eventDate: data.eventDate || new Date().toISOString(),
        submitterName: data.submitterName,
        contact: data.contact,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()) : [],
        approved: false,
        createdAt: new Date().toISOString(),
      }

      await client.create(doc)
      alert('✅ Submission successful — pending admin approval.')
      reset()
      setCityName('Fetching location...')
    } catch (e) {
      console.error(e)
      alert('❌ Upload failed: ' + e.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow space-y-4"
    >
      <h2 className="text-xl font-semibold text-center mb-2">Submit Your Artifact</h2>

      <input className="w-full border p-2 rounded" placeholder="Title" {...register('title')} required />
      <textarea className="w-full border p-2 rounded" placeholder="Description" {...register('description')} />

      <input
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx"
        {...register('media')}
        className="w-full border p-2 rounded"
        required
      />

      <label className="font-medium block mt-2">Pick or Confirm Location</label>
      <MapContainer
        center={position || [31.5, 74.3]}
        zoom={position ? 12 : 5}
        style={{ height: '300px', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationPicker
          setValue={setValue}
          position={position}
          setPosition={setPosition}
          setCityName={setCityName}
        />
        <MapAutoZoom position={position} />
      </MapContainer>

      <input
        className="w-full border p-2 rounded bg-gray-100"
        placeholder="Location (lat,long)"
        {...register('location')}
        readOnly
      />

      <input
        className="w-full border p-2 rounded bg-gray-100"
        placeholder="City / Area Name"
        {...register('locationName')}
        value={cityName}
        readOnly
      />

      <input
        type="datetime-local"
        className="w-full border p-2 rounded"
        {...register('eventDate')}
        defaultValue={currentDateTime}
      />

      <input className="w-full border p-2 rounded" placeholder="Submitter Name" {...register('submitterName')} />
      <input className="w-full border p-2 rounded" placeholder="Contact" {...register('contact')} />
      <input className="w-full border p-2 rounded" placeholder="Tags (comma separated)" {...register('tags')} />

      <button
        type="submit"
        disabled={uploading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        {uploading ? 'Uploading...' : 'Submit'}
      </button>
    </form>
  )
}

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import client from '../sanityClient'
import exifr from 'exifr'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function LocationPicker({ setValue }) {
  const [position, setPosition] = useState(null)
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
      setValue('location', `${e.latlng.lat},${e.latlng.lng}`)
    },
  })
  return position ? <Marker position={position} /> : null
}

export default function UploadForm() {
  const { register, handleSubmit, setValue, reset } = useForm()
  const [uploading, setUploading] = useState(false)

  const onSubmit = async (data) => {
    setUploading(true)

    try {
      const files = Array.from(data.media)
      const mediaRefs = []
      for (const file of files) {
        const asset = await client.assets.upload('file', file, { filename: file.name })
        mediaRefs.push({
          _key: crypto.randomUUID(), // ✅ Unique key
          _type: 'file',
          asset: { _type: 'reference', _ref: asset._id },
        })

        // Extract EXIF metadata if image
        if (file.type.startsWith('image/')) {
          const exif = await exifr.gps(file)
          if (exif?.latitude && exif?.longitude) {
            setValue('location', `${exif.latitude},${exif.longitude}`)
          }
        }
      }


      const doc = {
        _type: 'submission',
        title: data.title,
        description: data.description,
        media: mediaRefs,
        locationName: data.locationName,
        location: data.location
          ? {
            lat: parseFloat(data.location.split(',')[0]),
            lng: parseFloat(data.location.split(',')[1]),
          }
          : undefined,
        eventDate: data.eventDate,
        submitterName: data.submitterName,
        contact: data.contact,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()) : [],
        approved: false,
        createdAt: new Date().toISOString(),
      }

      await client.create(doc)
      alert('✅ Submission successful — pending admin approval.')
      reset()
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

      <label className="font-medium block mt-2">Pick Location on Map</label>
      <MapContainer center={[31.5, 74.3]} zoom={5} style={{ height: '300px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationPicker setValue={setValue} />
      </MapContainer>

      <input className="w-full border p-2 rounded" placeholder="Location (lat,long)" {...register('location')} />
      <input type="datetime-local" className="w-full border p-2 rounded" {...register('eventDate')} />
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

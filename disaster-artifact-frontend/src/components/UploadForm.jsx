import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import client from '../sanityClient'

export default function UploadForm() {
  const { register, handleSubmit, setValue, reset } = useForm()
  const [uploading, setUploading] = useState(false)

  const onSubmit = async (data) => {
    try {
      setUploading(true)

      const file = data.media[0]
      if (!file) throw new Error('Please select a file.')

      // Auto-detect artifact type
      let artifactType = 'document'
      if (file.type.startsWith('image/')) artifactType = 'photo'
      else if (file.type.startsWith('video/')) artifactType = 'video'

      // Upload the file to Sanity
      const asset = await client.assets.upload('file', file, { filename: file.name })

      // Create the Sanity document
      const doc = {
        _type: 'submission',
        title: data.title,
        description: data.description,
        artifactType, // auto-detected
        media: {
          _type: 'file',
          asset: { _type: 'reference', _ref: asset._id },
        },
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
      }

      await client.create(doc)
      alert('✅ Submission successful — thank you!')
      reset()
    } catch (e) {
      console.error(e)
      alert('❌ Upload failed: ' + e.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Submit Your Artifact</h2>

      <div>
        <label>Title</label>
        <input {...register('title')} required />
      </div>

      <div>
        <label>Description</label>
        <textarea {...register('description')} />
      </div>

      <div>
        <label>Media (Image, Video, or Document)</label>
        <input
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          {...register('media')}
          required
        />
      </div>

      <div>
        <label>Location (lat,long)</label>
        <input {...register('location')} placeholder="31.5,74.3" />
      </div>

      <div>
        <label>Event Date</label>
        <input type="datetime-local" {...register('eventDate')} />
      </div>

      <div>
        <label>Submitter Name</label>
        <input {...register('submitterName')} />
      </div>

      <div>
        <label>Contact</label>
        <input {...register('contact')} />
      </div>

      <div>
        <label>Tags (comma separated)</label>
        <input {...register('tags')} />
      </div>

      <button type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Submit'}
      </button>
    </form>
  )
}

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import client from '../sanityClient'


export default function UploadForm() {
    const { register, handleSubmit, setValue } = useForm()
    const [uploading, setUploading] = useState(false)
    const onSubmit = async (data) => {
        try {
            setUploading(true)
            // If using Sanity's client to upload media directly
            const file = data.media[0]
            const asset = await client.assets.upload('file', file, { filename: file.name })


            const doc = {
                _type: 'submission',
                title: data.title,
                description: data.description,
                artifactType: data.artifactType,
                media: {
                    _type: 'file',
                    asset: { _type: 'reference', _ref: asset._id }
                },
                locationName: data.locationName,
                location: data.location ? { lat: parseFloat(data.location.split(',')[0]), lng: parseFloat(data.location.split(',')[1]) } : undefined,
                eventDate: data.eventDate,
                submitterName: data.submitterName,
                contact: data.contact,
                tags: data.tags ? data.tags.split(',').map(t => t.trim()) : []
            }


            await client.create(doc)
            alert('Submitted — thank you!')
        } catch (e) {
            console.error(e)
            alert('Upload failed: ' + e.message)
        } finally { setUploading(false) }
    }


    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label>Title</label>
                <input {...register('title')} required />
            </div>
            <div>
                <label>Description</label>
                <textarea {...register('description')} />
            </div>
            <div>
                <label>Artifact Type</label>
                <select {...register('artifactType')}>
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                </select>
            </div>
            <div>
                <label>Media</label>
                <input type="file" {...register('media')} required />
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
            <button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Submit'}</button>
        </form>
    )
}
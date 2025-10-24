import React, { useEffect, useState } from 'react'
import client, { urlFor } from '../sanityClient'

export default function Gallery() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const q = `*[_type=="submission" && approved==true] | order(_createdAt desc){
      _id, title, description, media, artifactType, locationName, location, eventDate
    }`
    client.fetch(q).then(setItems).catch(console.error)
  }, [])

  if (!items?.length) return <p>Loading...</p>

  return (
    <div>
      <h2>Approved Submissions</h2>
      <div className="grid">
        {items.map(it => {
          const ref = it.media?.asset?._ref
          const artifactType = it.artifactType

          let mediaContent = null

          // 🔹 Handle images
          if (ref?.startsWith('image-')) {
            mediaContent = (
              <img
                src={urlFor(it.media.asset).width(400).url()}
                alt={it.title}
                style={{ borderRadius: '8px', maxWidth: '100%' }}
              />
            )
          }

          // 🔹 Handle videos (you may add mp4 uploads)
          else if (artifactType === 'video') {
            // Generate CDN URL for the raw file (not image)
            const fileId = ref?.replace('file-', '').replace(/-[a-z0-9]+$/, '')
            const fileUrl = `https://cdn.sanity.io/files/${client.config().projectId}/${client.config().dataset}/${fileId}.mp4`
            mediaContent = (
              <video width="400" controls>
                <source src={fileUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )
          }

          // 🔹 Handle documents or other files (PDF, etc.)
          else if (ref?.startsWith('file-')) {
            const ext = ref.split('-').pop() // e.g. 'pdf'
            const fileId = ref.replace('file-', '').replace(`-${ext}`, '')
            const fileUrl = `https://cdn.sanity.io/files/${client.config().projectId}/${client.config().dataset}/${fileId}.${ext}`

            mediaContent = (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-block', marginTop: '8px' }}
              >
                📄 Download {ext.toUpperCase()} File
              </a>
            )
          }

          return (
            <div key={it._id} className="card" style={{ marginBottom: '20px' }}>
              <h3>{it.title}</h3>
              <p>{it.description}</p>
              {mediaContent}
              {it.locationName && <p>{it.locationName}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

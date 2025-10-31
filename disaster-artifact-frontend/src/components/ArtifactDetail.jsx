import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import client, { urlFor } from '../sanityClient'

export default function ArtifactDetail() {
  const { id } = useParams()
  const [artifact, setArtifact] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = `*[_type=="submission" && _id==$id][0]{
      _id, title, description, media, artifactType, locationName, location, eventDate,
      submitter->{name, avatar, email}
    }`
    client.fetch(q, { id }).then(data => {
      setArtifact(data)
      setLoading(false)
    })
  }, [id])

  if (loading) return <p className="text-center py-10">Loading...</p>
  if (!artifact) return <p className="text-center py-10">Artifact not found.</p>

  const ref = artifact.media?.asset?._ref
  let mediaUrl = ''

  if (ref?.startsWith('image-')) {
    mediaUrl = urlFor(artifact.media.asset).width(1200).url()
  } else if (artifact.artifactType === 'video') {
    const fileId = ref?.replace('file-', '').replace(/-[a-z0-9]+$/, '')
    mediaUrl = `https://cdn.sanity.io/files/${client.config().projectId}/${client.config().dataset}/${fileId}.mp4`
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Gallery
      </Link>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Media */}
        {artifact.artifactType === 'video' ? (
          <video
            src={mediaUrl}
            controls
            className="w-full h-96 object-cover"
          />
        ) : (
          <img src={mediaUrl} alt={artifact.title} className="w-full h-96 object-cover" />
        )}

        {/* Details */}
        <div className="p-6 space-y-3">
          <h1 className="text-2xl font-semibold text-gray-800">{artifact.title}</h1>
          <p className="text-gray-600">{artifact.description}</p>

          {artifact.locationName && (
            <p className="text-gray-500">📍 Location: {artifact.locationName}</p>
          )}
          {artifact.eventDate && (
            <p className="text-gray-500">
              🗓️ Event Date: {new Date(artifact.eventDate).toLocaleDateString()}
            </p>
          )}

          {/* Contributor Info */}
          <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-gray-200">
            {artifact.submitter?.avatar ? (
              <img
                src={artifact.submitter.avatar}
                alt={artifact.submitter.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                👤
              </div>
            )}
            <div>
              <p className="font-medium text-gray-700">
                {artifact.submitter?.name || 'Anonymous'}
              </p>
              {artifact.submitter?.email && (
                <p className="text-sm text-gray-500">{artifact.submitter.email}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

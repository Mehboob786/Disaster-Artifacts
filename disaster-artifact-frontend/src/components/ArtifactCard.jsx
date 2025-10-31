import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { urlFor } from '../sanityClient'

export default function ArtifactCard({ artifact }) {
  const navigate = useNavigate()
  const {
    _id,
    title,
    description,
    media,
    artifactType,
    locationName,
    eventDate,
    submitter,
  } = artifact

  const ref = media?.asset?._ref
  let mediaContent = null
  let fileUrl = ''

  // 🖼️ Image
  if (ref?.startsWith('image-')) {
    fileUrl = urlFor(media.asset).width(1000).url()
    mediaContent = (
      <img
        src={urlFor(media.asset).width(600).url()}
        alt={title}
        className="w-full h-56 object-cover rounded-t-xl"
      />
    )
  }

  // 🎥 Video
  else if (artifactType === 'video') {
    const fileId = ref?.replace('file-', '').replace(/-[a-z0-9]+$/, '')
    fileUrl = `https://cdn.sanity.io/files/${process.env.REACT_APP_SANITY_PROJECT_ID}/${process.env.REACT_APP_SANITY_DATASET}/${fileId}.mp4`
    mediaContent = (
      <video className="w-full h-56 object-cover rounded-t-xl" controls>
        <source src={fileUrl} type="video/mp4" />
      </video>
    )
  }

  // 📄 Document
  else if (ref?.startsWith('file-')) {
    const ext = ref.split('-').pop()
    const fileId = ref.replace('file-', '').replace(`-${ext}`, '')
    fileUrl = `https://cdn.sanity.io/files/${process.env.REACT_APP_SANITY_PROJECT_ID}/${process.env.REACT_APP_SANITY_DATASET}/${fileId}.${ext}`
    mediaContent = (
      <div className="flex flex-col items-center justify-center h-56 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl">
        <span className="text-blue-600 font-semibold">📄 {ext.toUpperCase()} File</span>
      </div>
    )
  }

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/artifact/${_id}`)}
      className="group bg-white border border-gray-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ease-in-out overflow-hidden cursor-pointer"
    >
      {/* Media */}
      <div className="relative overflow-hidden">
        {mediaContent}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition">
          {title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-3">{description}</p>

        <div className="mt-2 flex flex-wrap justify-between text-xs text-gray-500">
          {locationName && <p>📍 {locationName}</p>}
          {eventDate && <p>🗓️ {new Date(eventDate).toLocaleDateString()}</p>}
        </div>
      </div>

      {/* Contributor footer */}
      <div className="border-t border-gray-100 p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {submitter?.avatar ? (
            <img
              src={submitter.avatar}
              alt={submitter.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm">
              👤
            </div>
          )}
          <p className="text-sm font-medium text-gray-700">
            {submitter?.name || 'Anonymous'}
          </p>
        </div>
        <span className="text-xs text-gray-400">View ➜</span>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition duration-300"></div>
    </motion.div>
  )
}

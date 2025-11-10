import React from "react";
import { urlFor } from "../sanityClient";
import client from "../sanityClient";

export default function MediaPreview({ media = [] }) {
  if (!Array.isArray(media) || media.length === 0) {
    return (
      <div className="p-5 text-center text-gray-500">
        No media attached for this artifact.
      </div>
    );
  }

  const downloadableFiles = [];

  return (
    <div className="bg-gray-50 p-4 rounded-b-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {media.map((m, idx) => {
          const asset = m?.asset || m;
          const ref = asset?._ref || asset?._id;
          const url = asset?.url;

          if (!asset) return null;

          // 1️⃣ Direct Sanity URL already included
          if (url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
            return (
              <img
                key={idx}
                src={url}
                alt="Artifact"
                className="rounded-lg object-cover w-full h-64 shadow-sm"
              />
            );
          }

          // 2️⃣ Image reference
          if (ref && ref.startsWith("image-")) {
            try {
              const imageUrl = urlFor(asset).width(800).url();
              return (
                <img
                  key={idx}
                  src={imageUrl}
                  alt="Artifact media"
                  className="rounded-lg object-cover w-full h-64 shadow-sm"
                />
              );
            } catch {
              return null;
            }
          }

          // 3️⃣ File reference that is actually an image
          if (ref && ref.startsWith("file-") && /\.(jpg|jpeg|png|gif|webp)$/i.test(ref)) {
            const match = ref.match(/^file-(.+?)-([a-z0-9]+)$/);
            if (match) {
              const [fileId, ext] = match;
              const imageUrl = `https://cdn.sanity.io/files/${client.config().projectId}/${client.config().dataset}/${fileId}.${ext}`;
              return (
                <img
                  key={idx}
                  src={imageUrl}
                  alt="Artifact"
                  className="rounded-lg object-cover w-full h-64 shadow-sm"
                />
              );
            }
          }

          // 4️⃣ Video
          if (ref && ref.includes("mp4")) {
            const match = ref.match(/^file-(.+?)-([a-z0-9]+)$/);
            if (match) {
              const [fileId] = match;
              const videoUrl = `https://cdn.sanity.io/files/${client.config().projectId}/${client.config().dataset}/${fileId}.mp4`;
              return (
                <video
                  key={idx}
                  src={videoUrl}
                  controls
                  className="rounded-lg w-full h-64 bg-black shadow-sm"
                />
              );
            }
          }

          // 5️⃣ Generic downloadable file
          if (ref) {
            const match = ref.match(/^file-(.+?)-([a-z0-9]+)$/);
            if (match) {
              const [fileId, ext] = match;
              const fileUrl = `https://cdn.sanity.io/files/${client.config().projectId}/${client.config().dataset}/${fileId}.${ext}`;
              downloadableFiles.push({ idx, ext, fileUrl });
            }
          }

          return null;
        })}
      </div>

      {/* 📎 Downloadable Files */}
      {downloadableFiles.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-gray-700 mb-3">📄 Attached Files</h3>
          <div className="flex flex-wrap gap-3">
            {downloadableFiles.map((file) => (
              <a
                key={file.idx}
                href={file.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
              >
                ⬇️ Download {file.ext?.toUpperCase()} File
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

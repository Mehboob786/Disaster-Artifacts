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
          const ref = m?.asset?._ref;
          if (!ref) return null;

          // 🖼️ Image
          if (ref.startsWith("image-")) {
            const imageUrl = urlFor(m.asset).width(800).url();
            return (
              <img
                key={idx}
                src={imageUrl}
                alt="Artifact media"
                className="rounded-lg object-cover w-full h-64 shadow-sm"
              />
            );
          }

          // 🎥 Video
          if (ref.includes("file-") && ref.includes("mp4")) {
            const fileId = ref.replace("file-", "").replace(/-[a-z0-9]+$/, "");
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

          // 📄 File (store for later rendering)
          const ext = ref.split("-").pop();
          const fileId = ref.replace("file-", "").replace(`-${ext}`, "");
          const fileUrl = `https://cdn.sanity.io/files/${client.config().projectId}/${client.config().dataset}/${fileId}.${ext}`;
          downloadableFiles.push({ idx, ext, fileUrl });
          return null;
        })}
      </div>

      {/* 📎 Downloadable Files (shown at end) */}
      {downloadableFiles.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-gray-700 mb-3">
            📄 Attached Files
          </h3>
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

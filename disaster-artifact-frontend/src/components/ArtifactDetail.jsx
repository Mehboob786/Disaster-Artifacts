import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import client, { urlFor } from "../sanityClient";

export default function ArtifactDetail() {
  const { id } = useParams();
  const location = useLocation();
  const fromMap = location.state?.fromMap || false;

  const [artifact, setArtifact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = `*[_type=="submission" && _id==$id][0]{
      _id, title, description, media[], artifactType, locationName, location, eventDate,
      submitter->{name, avatar, email}
    }`;
    client
      .fetch(q, { id })
      .then((data) => {
        setArtifact(data);
        setLoading(false);
      })
      .catch(console.error);
  }, [id]);

  if (loading) return <p className="text-center py-10">Loading...</p>;
  if (!artifact) return <p className="text-center py-10">Artifact not found.</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* 🔙 Back Link */}
      <Link
        to={fromMap ? "/map" : "/"}
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to {fromMap ? "Map" : "Gallery"}
      </Link>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* 🎞️ Media Gallery */}
        {Array.isArray(artifact.media) && artifact.media.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50">
            {artifact.media.map((m, idx) => {
              const ref = m?.asset?._ref;
              if (!ref) return null;

              // 🖼️ Image
              if (ref.startsWith("image-")) {
                const imageUrl = urlFor(m.asset).width(800).url();
                return (
                  <img
                    key={idx}
                    src={imageUrl}
                    alt={artifact.title}
                    className="rounded-lg object-cover w-full h-64 shadow-sm"
                  />
                );
              }

              // 🎥 Video
              if (artifact.artifactType === "video" || ref.includes("mp4")) {
                const fileId = ref
                  .replace("file-", "")
                  .replace(/-[a-z0-9]+$/, "");
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

              // 📄 Other Files
              const ext = ref.split("-").pop();
              const fileId = ref.replace("file-", "").replace(`-${ext}`, "");
              const fileUrl = `https://cdn.sanity.io/files/${client.config().projectId}/${client.config().dataset}/${fileId}.${ext}`;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center h-56 bg-gray-100 border rounded-lg"
                >
                  <p className="mb-2 text-gray-700 font-medium">
                    📄 {ext?.toUpperCase()} File
                  </p>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    download
                  >
                    ⬇️ Download File
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-5 text-center text-gray-500">
            No media attached for this artifact.
          </div>
        )}

        {/* 📘 Artifact Details */}
        <div className="p-6 space-y-3">
          <h1 className="text-2xl font-semibold text-gray-800">
            {artifact.title}
          </h1>
          <p className="text-gray-600">{artifact.description}</p>

          {artifact.locationName && (
            <p className="text-gray-500">📍 Location: {artifact.locationName}</p>
          )}
          {artifact.eventDate && (
            <p className="text-gray-500">
              🗓️ Event Date:{" "}
              {new Date(artifact.eventDate).toLocaleDateString()}
            </p>
          )}

          {/* 👤 Contributor Info */}
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
                {artifact.submitter?.name || "Anonymous"}
              </p>
              {artifact.submitter?.email && (
                <p className="text-sm text-gray-500">
                  {artifact.submitter.email}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

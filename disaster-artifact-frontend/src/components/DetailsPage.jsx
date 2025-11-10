import React from "react";
import client from "../sanityClient";

export default function DetailsPage({ artifact }) {
    if (!artifact) {
        return <div className="p-5 text-center text-gray-500">No artifact found.</div>;
    }

    const {
        title,
        description,
        eventDate,
        locationName,
        artifactType,
        submitterName,
        media = [],
    } = artifact;

    return (
        <div className="bg-gray-50 p-6 rounded-lg shadow">
            {/* 🧾 Artifact Info */}
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">{title || "Untitled"}</h2>
                <p className="text-gray-600 mb-2">{description || "No description provided."}</p>
                <div className="text-sm text-gray-500 space-y-1">
                    <p><strong>Type:</strong> {artifactType || "N/A"}</p>
                    <p><strong>Location:</strong> {locationName || "Unknown"}</p>
                    <p><strong>Date:</strong> {eventDate ? new Date(eventDate).toDateString() : "N/A"}</p>
                    <p><strong>Submitted by:</strong> {submitterName || "Anonymous"}</p>
                    {artifact.contact && (
                        <p>
                            <strong>Email:</strong>{" "}
                            <a
                                href={`mailto:${artifact.contact}`}
                                className="text-blue-600 hover:text-blue-800 underline"
                            >
                                {artifact.contact}
                            </a>
                        </p>
                    )}
                </div>
            </div>
            {/* 🖼️ Media Section */}
            <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Media</h3>

                {media.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {media.map((item, idx) => {
                            const asset = item?.asset;
                            if (!asset) return null;

                            const mimeType = asset?.mimeType || "";
                            const isImage = mimeType.toUpperCase().startsWith("IMAGE/");
                            const fileUrl =
                                asset?.url ||
                                `https://cdn.sanity.io/files/${client.config().projectId}/${client.config().dataset}/${asset._id?.replace("file-", "")}`;

                            return (
                                <div
                                    key={idx}
                                    className="rounded-lg bg-white shadow-sm overflow-hidden"
                                >
                                    {/* File info & download button */}
                                    <div className="p-4 flex flex-col items-center">

                                        <a
                                            href={fileUrl}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                                        >
                                            ⬇️ Download {asset.extension?.toUpperCase() || "FILE"}
                                        </a>
                                    </div>

                                    {/* Media preview */}
                                    {isImage ? (
                                        <img
                                            src={asset.url}
                                            alt={asset.originalFilename || "Artifact media"}
                                            className="w-full h-64 object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-64 flex items-center justify-center bg-gray-100 text-gray-500">
                                            No image preview
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No image found.</p>
                )}
            </div>


        </div>
    );
}

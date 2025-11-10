import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import client from "../sanityClient";
import DetailsPage from "./DetailsPage"; // the component I gave you before

export default function ArtifactDetails() {
  const { id } = useParams();
  const [artifact, setArtifact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const query = `*[_type == "submission" && _id == $id][0]{
      _id,
      title,
      description,
      eventDate,
      contact,
      locationName,
      artifactType,
      submitterName,
      media[] {
        _key,
        _type,
        caption,
        asset->{
          _id,
          _type,
          url,
          mimeType,
          originalFilename,
          extension,
          size
        }
      }
    }`;

    client
      .fetch(query, { id })
      .then((data) => {
        setArtifact(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching artifact:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return <div className="p-5 text-center text-gray-500">Loading artifact...</div>;

  if (error)
    return (
      <div className="p-5 text-center text-red-600">
        Failed to load artifact: {error}
      </div>
    );

  if (!artifact)
    return (
      <div className="p-5 text-center text-gray-500">
        No artifact found with this ID.
      </div>
    );

  return <DetailsPage artifact={artifact} />;
}

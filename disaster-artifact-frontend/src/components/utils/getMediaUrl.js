// src/components/utils/getMediaUrl.js

import client, { urlFor } from "../../sanityClient";

export default function getMediaUrl(media, artifactType) {
  if (!media || !media.asset) return null;

  const ref = media.asset._ref || media.asset._id;
  const url = media.asset.url; // if populated from GROQ projection
  if (url) return url;

  // If it's an image asset
  if (ref?.startsWith("image-")) {
    return urlFor(ref).url();
  }

  // If it's a file asset (Sanity stores like file-abc1234-ext)
  if (ref?.startsWith("file-")) {
    // Convert to full CDN URL manually
    const [, fileId, ext] = ref.match(/^file-(.+?)-([a-z0-9]+)$/) || [];
    if (fileId && ext) {
      return `https://cdn.sanity.io/files/${client.config().projectId}/${client.config().dataset}/${fileId}.${ext}`;
    }
  }

  return null;
}

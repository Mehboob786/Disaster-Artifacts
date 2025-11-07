import React from "react";
import { Routes, Route } from "react-router-dom";
import Gallery from "../components/Gallery";
import UploadForm from "../components/UploadForm";
import ArtifactDetails from "../components/ArtifactDetail";
import MapView from "../components/MapView";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Gallery />} />
      <Route path="/upload" element={<UploadForm />} />
      <Route path="/artifact/:id" element={<ArtifactDetails />} />
      <Route path="/map" element={<MapView />} />
    </Routes>
  );
}

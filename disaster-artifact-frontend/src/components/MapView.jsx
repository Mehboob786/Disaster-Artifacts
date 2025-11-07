import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import client from "../sanityClient";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";

// ✅ Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 📍 Numbered circle icon
function createCountIcon(count) {
  return L.divIcon({
    html: `<div style="
      background-color:#007bff;
      color:white;
      font-weight:bold;
      border-radius:50%;
      width:32px;
      height:32px;
      display:flex;
      align-items:center;
      justify-content:center;
      border:2px solid white;
      box-shadow:0 0 4px rgba(0,0,0,0.3);
    ">${count}</div>`,
    className: "",
    iconSize: [32, 32],
  });
}

// 📏 Determine grouping precision by zoom
function getPrecisionForZoom(zoom) {
  if (zoom < 6) return 1;
  if (zoom < 8) return 2;
  if (zoom < 10) return 3;
  if (zoom < 11) return 4;
  return null; // show individual artifacts
}

export default function MapView() {
  const [artifacts, setArtifacts] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [zoom, setZoom] = useState(5);
  const navigate = useNavigate();

  // 🔄 Load all artifacts
  useEffect(() => {
    const q = `*[_type=="submission" && approved==true && defined(location)]{
      _id, title, locationName, location, description
    }`;
    client.fetch(q).then(setArtifacts).catch(console.error);
  }, []);

  // 🧩 Group artifacts dynamically based on zoom
  useEffect(() => {
    if (artifacts.length === 0) return;

    const precision = getPrecisionForZoom(zoom);
    if (!precision) {
      // Show individually (but merge identical coordinates)
      const exactGroups = {};
      artifacts.forEach((a) => {
        const key = `${a.location.lat},${a.location.lng}`;
        if (!exactGroups[key]) {
          exactGroups[key] = {
            artifacts: [],
            location: a.location,
            locationName: a.locationName,
          };
        }
        exactGroups[key].artifacts.push(a);
      });
      setGrouped(exactGroups);
      return;
    }

    // Group based on precision rounding
    const groupedData = {};
    artifacts.forEach((a) => {
      const lat = parseFloat(a.location.lat).toFixed(precision);
      const lng = parseFloat(a.location.lng).toFixed(precision);
      const key = `${lat},${lng}`;
      if (!groupedData[key]) {
        groupedData[key] = {
          artifacts: [],
          location: { lat: parseFloat(lat), lng: parseFloat(lng) },
          locationName: a.locationName,
        };
      }
      groupedData[key].artifacts.push(a);
    });
    setGrouped(groupedData);
  }, [artifacts, zoom]);

  return (
    <div className="p-3" style={{ height: "80vh" }}>
      <h2 className="text-center fw-bold mb-3">🗺️ Artifact Map View</h2>

      <MapContainer
        center={[30.3753, 69.3451]}
        zoom={5}
        style={{ height: "100%", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapZoomWatcher onZoomChange={setZoom} />

        {/* 🟢 Show markers (grouped or single) */}
        {Object.entries(grouped).map(([key, group]) => {
          const isGrouped = getPrecisionForZoom(zoom) !== null;
          const { lat, lng } = group.location;

          // If zoomed out → show number bubble
          if (isGrouped) {
            return (
              <Marker
                key={key}
                position={[lat, lng]}
                icon={createCountIcon(group.artifacts.length)}
                eventHandlers={{
                  click: (e) => {
                    const map = e.target._map;
                    map.flyTo([lat, lng], zoom + 2);
                  },
                }}
              >
                <Popup>
                  <strong>{group.locationName}</strong>
                  <br />
                  📦 {group.artifacts.length} artifact(s)
                  <br />
                  <small>Click to zoom in</small>
                </Popup>
              </Marker>
            );
          }

          // If zoomed in → show actual markers
          if (group.artifacts.length === 1) {
            const a = group.artifacts[0];
            return (
              <Marker
                key={a._id}
                position={[a.location.lat, a.location.lng]}
                icon={L.icon({
                  iconUrl:
                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                  shadowUrl:
                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                })}
              >
                <Popup>
                  <strong>{a.title}</strong>
                  <br />
                  📍 {a.locationName}
                  <br />
                  <small>{a.description?.slice(0, 60)}...</small>
                  <br />
                  <button
                    onClick={() =>
                      navigate(`/artifact/${a._id}`, { state: { fromMap: true } })
                    }
                    className="btn btn-sm btn-primary mt-2"
                  >
                    View Details
                  </button>
                </Popup>
              </Marker>
            );
          }

          // 🧩 Multiple artifacts with same lat/lng → show one marker, multiple links
          return (
            <Marker
              key={key}
              position={[lat, lng]}
              icon={createCountIcon(group.artifacts.length)}
            >
              <Popup>
                <strong>{group.locationName}</strong>
                <br />
                📦 {group.artifacts.length} artifact(s)
                <hr />
                {group.artifacts.map((a) => (
                  <div key={a._id} style={{ marginBottom: "8px" }}>
                    <strong>{a.title}</strong>
                    <br />
                    <button
                      onClick={() =>
                        navigate(`/artifact/${a._id}`, { state: { fromMap: true } })
                      }
                      className="btn btn-sm btn-outline-primary mt-1"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

// 🧭 Track zoom level
function MapZoomWatcher({ onZoomChange }) {
  useMapEvents({
    zoomend: (e) => {
      onZoomChange(e.target.getZoom());
    },
  });
  return null;
}

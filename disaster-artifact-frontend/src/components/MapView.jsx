import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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

// 📍 Create a custom circular icon showing number
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

export default function MapView() {
    const [grouped, setGrouped] = useState({});
    const [loading, setLoading] = useState(true);
    const [zoomedLocation, setZoomedLocation] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const q = `*[_type=="submission" && approved==true && defined(location)]{
    _id, title, locationName, location, description
  }`;

        client.fetch(q)
            .then((data) => {
                // ✅ Normalize coordinates (round to ~1 km precision)
                const groupedData = {};

                data.forEach((a) => {
                    const lat = parseFloat(a.location.lat).toFixed(2);
                    const lng = parseFloat(a.location.lng).toFixed(2);
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
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleClusterClick = (key) => {
        setZoomedLocation(key);
    };

    return (
        <div className="p-3" style={{ height: "80vh" }}>
            <h2 className="text-center fw-bold mb-3">🗺️ Artifact Map View</h2>

            {loading ? (
                <p className="text-center text-muted">Loading map...</p>
            ) : (
                <MapContainer
                    center={[30.3753, 69.3451]} // Default Pakistan
                    zoom={zoomedLocation ? 10 : 5}
                    style={{ height: "100%", width: "100%", borderRadius: "12px" }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {/* Show grouped markers */}
                    {!zoomedLocation &&
                        Object.entries(grouped).map(([key, group]) => (
                            <Marker
                                key={key}
                                position={[group.location.lat, group.location.lng]}
                                icon={createCountIcon(group.artifacts.length)} // 💡 Show number on marker
                                eventHandlers={{
                                    click: () => handleClusterClick(key),
                                }}
                            >
                                <Popup>
                                    <strong>{group.locationName}</strong>
                                    <br />
                                    📦 {group.artifacts.length} artifact(s)
                                    <br />
                                    <button
                                        onClick={() => handleClusterClick(key)}
                                        className="btn btn-sm btn-outline-primary mt-2"
                                    >
                                        Zoom In
                                    </button>
                                </Popup>
                            </Marker>
                        ))}

                    {/* When zoomed in, show artifacts individually */}
                    {zoomedLocation &&
                        grouped[zoomedLocation]?.artifacts.map((a) => (
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
                        ))}
                    <AutoZoom grouped={grouped} zoomedLocation={zoomedLocation} />
                </MapContainer>
            )}
        </div>
    );
}

// 🌍 AutoZoom helper
function AutoZoom({ grouped, zoomedLocation }) {
    const map = useMap();
    useEffect(() => {
        if (zoomedLocation && grouped[zoomedLocation]) {
            const { lat, lng } = grouped[zoomedLocation].location;
            map.flyTo([lat, lng], 10);
        } else {
            map.flyTo([30.3753, 69.3451], 5);
        }
    }, [zoomedLocation, grouped, map]);
    return null;
}

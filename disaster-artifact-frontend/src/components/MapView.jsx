import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import client from "../sanityClient";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";

// ✅ Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapView() {
    const [artifacts, setArtifacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const q = `*[_type=="submission" && approved==true && defined(location)]{
      _id, title, locationName, location, description
    }`;
        client.fetch(q)
            .then(setArtifacts)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-3" style={{ height: "80vh" }}>
            <h2 className="text-center fw-bold mb-3">🗺️ Artifact Map View</h2>

            {loading ? (
                <p className="text-center text-muted">Loading map...</p>
            ) : (
                <MapContainer
                    center={[30.3753, 69.3451]} // Default center: Pakistan
                    zoom={5}
                    style={{ height: "100%", width: "100%", borderRadius: "12px" }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {artifacts.map((a) => (
                        <Marker key={a._id} position={[a.location.lat, a.location.lng]}>
                            <Popup>
                                <strong>{a.title}</strong>
                                <br />
                                📍 {a.locationName}
                                <br />
                                <small>{a.description?.slice(0, 60)}...</small>
                                <br />
                                <button
                                    onClick={() => navigate(`/artifact/${a._id}`, { state: { fromMap: true } })}
                                    className="btn btn-sm btn-primary mt-2"
                                >
                                    View Details
                                </button>

                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            )}
        </div>
    );
}

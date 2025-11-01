import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import client from "../sanityClient";
import exifr from "exifr";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Card, Button, Spinner, Form, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// ✅ Fix missing marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 🗺️ Auto-zoom on position change
function MapAutoZoom({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 12);
  }, [position, map]);
  return null;
}

// 📍 Handle map click for manual location selection
function LocationPicker({ setValue, position, setPosition, setCityName }) {
  useMapEvents({
    click(e) {
      const latlng = e.latlng;
      setPosition(latlng);
      setValue("location", `${latlng.lat},${latlng.lng}`);
      reverseGeocode(latlng.lat, latlng.lng, setCityName, setValue);
    },
  });
  return position ? <Marker position={position} /> : null;
}

// 🌆 Reverse geocoding helper
async function reverseGeocode(lat, lng, setCityName, setValue) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await res.json();
    const city =
      data.address.city ||
      data.address.town ||
      data.address.village ||
      data.address.state ||
      "Unknown location";
    setCityName(city);
    setValue("locationName", city);
  } catch (e) {
    console.warn("Failed to fetch city name:", e);
    setCityName("Unknown location");
  }
}

export default function UploadForm() {
  const { register, handleSubmit, setValue, reset } = useForm();
  const [uploading, setUploading] = useState(false);
  const [position, setPosition] = useState(null);
  const [cityName, setCityName] = useState("Fetching location...");

  // ✅ Get user’s current position on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const latlng = { lat: latitude, lng: longitude };
          setPosition(latlng);
          setValue("location", `${latitude},${longitude}`);
          await reverseGeocode(latitude, longitude, setCityName, setValue);
        },
        (err) => {
          console.warn("Location access denied:", err.message);
          setCityName("Location not available");
        }
      );
    }
  }, [setValue]);

  const currentDateTime = new Date().toISOString().slice(0, 16);

  const onSubmit = async (data) => {
    setUploading(true);
    try {
      const files = Array.from(data.media);
      const mediaRefs = [];

      for (const file of files) {
        const asset = await client.assets.upload("file", file, {
          filename: file.name,
        });
        mediaRefs.push({
          _key: crypto.randomUUID(),
          _type: "file",
          asset: { _type: "reference", _ref: asset._id },
        });

        if (file.type.startsWith("image/")) {
          const exif = await exifr.gps(file);
          if (exif?.latitude && exif?.longitude) {
            const lat = exif.latitude;
            const lng = exif.longitude;
            setPosition({ lat, lng });
            setValue("location", `${lat},${lng}`);
            await reverseGeocode(lat, lng, setCityName, setValue);
          }
        }
      }

      const doc = {
        _type: "submission",
        title: data.title,
        description: data.description,
        media: mediaRefs,
        locationName: data.locationName || cityName,
        location: data.location
          ? {
              lat: parseFloat(data.location.split(",")[0]),
              lng: parseFloat(data.location.split(",")[1]),
            }
          : undefined,
        eventDate: data.eventDate || new Date().toISOString(),
        submitterName: data.submitterName,
        contact: data.contact,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
        approved: false,
        createdAt: new Date().toISOString(),
      };

      await client.create(doc);
      alert("✅ Submission successful — pending admin approval.");
      reset();
      setCityName("Fetching location...");
    } catch (e) {
      console.error(e);
      alert("❌ Upload failed: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center py-5"
      style={{
        minHeight: "85vh",
        background:
          "linear-gradient(135deg, #e0f7fa 0%, #e8f5e9 50%, #f3e5f5 100%)",
      }}
    >
      <Card
        className="p-4 p-md-5 shadow-lg border-0"
        style={{
          borderRadius: "1.5rem",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          maxWidth: "700px",
          width: "100%",
        }}
      >
        <h3 className="text-center mb-4 fw-bold text-primary">
          🌍 Submit a Community Artifact
        </h3>

        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Artifact Title"
              {...register("title")}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Brief description of the artifact"
              {...register("description")}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Upload Media</Form.Label>
            <Form.Control
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              {...register("media")}
              required
            />
          </Form.Group>

          <Form.Label className="fw-semibold mt-3">
            📍 Pick or Confirm Location
          </Form.Label>
          <div className="mb-3 rounded overflow-hidden border border-light">
            <MapContainer
              center={position || [31.5, 74.3]}
              zoom={position ? 12 : 5}
              style={{ height: "300px", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker
                setValue={setValue}
                position={position}
                setPosition={setPosition}
                setCityName={setCityName}
              />
              <MapAutoZoom position={position} />
            </MapContainer>
          </div>

          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Latitude, Longitude"
              {...register("location")}
              readOnly
              value={position ? `${position.lat},${position.lng}` : ""}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="City / Area Name"
              {...register("locationName")}
              readOnly
              value={cityName}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="datetime-local"
              defaultValue={currentDateTime}
              {...register("eventDate")}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Submitter Name"
              {...register("submitterName")}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Contact Info"
              {...register("contact")}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Control
              type="text"
              placeholder="Tags (comma separated)"
              {...register("tags")}
            />
          </Form.Group>

          <div className="text-center">
            <Button
              type="submit"
              variant="primary"
              disabled={uploading}
              className="px-4 py-2 fw-semibold"
            >
              {uploading ? (
                <>
                  <Spinner animation="border" size="sm" /> Uploading...
                </>
              ) : (
                "Submit Artifact"
              )}
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
}

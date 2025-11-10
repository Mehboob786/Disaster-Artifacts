import React, { useEffect, useState } from 'react';
import { Card, Button, Spinner, Form, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import client from '../sanityClient';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDisaster, setFilterDisaster] = useState('all');
  const [filterSubmitter, setFilterSubmitter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [visibleCount, setVisibleCount] = useState(9);

  const navigate = useNavigate();

  useEffect(() => {
    const q = `*[_type=="submission" && approved==true] | order(_createdAt desc){
      _id, title, description, artifactType, disasterType, locationName,
      eventDate, submitterName,
      media[]{..., asset->{_id, _type, url, mimeType, extension}}
    }`;
    client.fetch(q)
      .then(data => setItems(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = items
    .filter(it => {
      const matchesSearch =
        it.title?.toLowerCase().includes(search.toLowerCase()) ||
        it.locationName?.toLowerCase().includes(search.toLowerCase());

      const matchesArtifact = filterType === 'all' || it.artifactType === filterType;
      const matchesDisaster = filterDisaster === 'all' || it.disasterType === filterDisaster;
      const matchesSubmitter = filterSubmitter === 'all' || it.submitterName === filterSubmitter;

      return matchesSearch && matchesArtifact && matchesDisaster && matchesSubmitter;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.eventDate) - new Date(a.eventDate);
      if (sortOrder === 'oldest') return new Date(a.eventDate) - new Date(b.eventDate);
      if (sortOrder === 'titleAZ') return a.title.localeCompare(b.title);
      if (sortOrder === 'titleZA') return b.title.localeCompare(a.title);
      return 0;
    })
    .slice(0, visibleCount);

  // Dynamic submitter dropdown values
  const uniqueSubmitters = [...new Set(items.map(i => i.submitterName).filter(Boolean))];

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4 fw-bold">🌍 Community Disaster Archive</h2>

      {/* 🔍 Search + Filters */}
      <Row className="mb-4 g-2 justify-content-center">
        <Col xs={12} md={5} lg={4}>
          <Form.Control
            type="text"
            placeholder="Search title or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Col>

        <Col xs={12} md={3} lg={2}>
          <Form.Select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
          </Form.Select>
        </Col>

        <Col xs={12} md={3} lg={2}>
          <Form.Select value={filterDisaster} onChange={e => setFilterDisaster(e.target.value)}>
            <option value="all">All Disasters</option>
            <option value="flood">Flood</option>
            <option value="earthquake">Earthquake</option>
            <option value="tornado">Tornado</option>
            <option value="hurricane_typhoon">Hurricane/Typhoon</option>
            <option value="wildfire">Wildfire</option>
            <option value="dust_storm">Dust Storm</option>
            <option value="freeze">Freeze</option>
            <option value="severe_storm">Severe Storm</option>
            <option value="winter_storm">Winter Storm</option>
          </Form.Select>
        </Col>

        <Col xs={12} md={3} lg={2}>
          <Form.Select value={filterSubmitter} onChange={e => setFilterSubmitter(e.target.value)}>
            <option value="all">All Submitters</option>
            {uniqueSubmitters.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </Form.Select>
        </Col>

        <Col xs={12} md={3} lg={2}>
          <Form.Select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
            <option value="newest">Newest → Oldest</option>
            <option value="oldest">Oldest → Newest</option>
            <option value="titleAZ">Title A → Z</option>
            <option value="titleZA">Title Z → A</option>
          </Form.Select>
        </Col>
      </Row>

      {/* 🖼️ Gallery Section */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : filteredItems.length === 0 ? (
        <p className="text-center text-muted">No submissions found.</p>
      ) : (
        <Row className="justify-content-center">
          {filteredItems.map(it => {
            const media = it.media?.[0];
            let mediaContent = null;

            if (media && media.asset && media.asset.url) {
              const { url, mimeType } = media.asset;

              if (mimeType?.startsWith("image/")) {
                mediaContent = (
                  <Card.Img
                    variant="top"
                    src={url}
                    alt={it.title}
                    style={{ height: 200, objectFit: "cover" }}
                  />
                );
              } else {
                mediaContent = (
                  <div
                    className="d-flex align-items-center justify-content-center bg-light text-muted"
                    style={{ height: 200 }}
                  >
                    No image found
                  </div>
                );
              }
            } else {
              mediaContent = (
                <div
                  className="d-flex align-items-center justify-content-center bg-light text-muted"
                  style={{ height: 200 }}
                >
                  No image found
                </div>
              );
            }




            return (
              <Col key={it._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <Card
                  className="shadow-sm h-100"
                  style={{ borderRadius: '12px', cursor: 'pointer' }}
                  onClick={() => navigate(`/artifact/${it._id}`)}
                >
                  {mediaContent}
                  <Card.Body>
                    <Card.Title>{it.title}</Card.Title>
                    <Card.Text className="text-muted" style={{ fontSize: '0.9rem' }}>
                      {it.description?.length > 120
                        ? it.description.slice(0, 120) + '...'
                        : it.description}
                    </Card.Text>
                    <div className="d-flex justify-content-between mt-3">
                      {it.locationName && <small className="text-muted">📍 {it.locationName}</small>}
                      {it.eventDate && (
                        <small className="text-muted">
                          🗓️ {new Date(it.eventDate).toLocaleDateString()}
                        </small>
                      )}
                    </div>
                  </Card.Body>
                  <Card.Footer className="d-flex align-items-center justify-content-between bg-white">
                    <div className="d-flex align-items-center">
                      <div
                        className="bg-secondary text-white rounded-circle me-2 d-flex align-items-center justify-content-center"
                        style={{ width: 32, height: 32 }}
                      >
                        👤
                      </div>
                      <small className="fw-semibold text-dark">
                        {it.submitterName || 'Anonymous'}
                      </small>
                    </div>
                    <Button variant="outline-primary" size="sm">
                      View
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}

        </Row>
      )}


      {/* 📜 Load More Button */}
      {visibleCount < items.length && (
        <div className="text-center mt-4">
          <Button variant="primary" onClick={() => setVisibleCount(prev => prev + 6)}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Card, Button, Spinner, Form, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import client, { urlFor } from '../sanityClient';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [visibleCount, setVisibleCount] = useState(9);

  const navigate = useNavigate();

  useEffect(() => {
    const q = `*[_type=="submission" && approved==true] | order(_createdAt desc){
  _id, title, description, media, artifactType, locationName, eventDate,
  submitterName
}`;


    client.fetch(q).then(setItems).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filteredItems = items
    .filter(it => {
      const matchesSearch =
        it.title?.toLowerCase().includes(search.toLowerCase()) ||
        it.locationName?.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'all' || it.artifactType === filterType;
      return matchesSearch && matchesType;
    })
    .slice(0, visibleCount);

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4 fw-bold">🌍 Community Disaster Archive</h2>

      {/* 🔍 Search & Filter Controls */}
      <Row className="mb-4 justify-content-center">
        <Col xs={12} md={6} lg={4}>
          <Form.Control
            type="text"
            placeholder="Search by title or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Col>
        <Col xs={12} md={4} lg={3} className="mt-2 mt-md-0">
          <Form.Select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
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
            const ref = it.media?.asset?._ref;
            let mediaContent = null;
            let fileUrl = '';

            if (ref?.startsWith('image-')) {
              fileUrl = urlFor(it.media.asset).width(600).url();
              mediaContent = <Card.Img variant="top" src={fileUrl} alt={it.title} />;
            } else if (it.artifactType === 'video') {
              const fileId = ref?.replace('file-', '').replace(/-[a-z0-9]+$/, '');
              fileUrl = `https://cdn.sanity.io/files/${client.config().projectId}/${client.config().dataset}/${fileId}.mp4`;
              mediaContent = (
                <video width="100%" controls className="rounded-top">
                  <source src={fileUrl} type="video/mp4" />
                </video>
              );
            } else if (ref?.startsWith('file-')) {
              const ext = ref.split('-').pop();
              const fileId = ref.replace('file-', '').replace(`-${ext}`, '');
              fileUrl = `https://cdn.sanity.io/files/${client.config().projectId}/${client.config().dataset}/${fileId}.${ext}`;
              mediaContent = (
                <div className="text-center py-5 bg-light rounded-top">
                  📄 <a href={fileUrl} target="_blank" rel="noopener noreferrer">{ext.toUpperCase()} File</a>
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
                      {it.locationName && (
                        <small className="text-muted">📍 {it.locationName}</small>
                      )}
                      {it.eventDate && (
                        <small className="text-muted">
                          🗓️ {new Date(it.eventDate).toLocaleDateString()}
                        </small>
                      )}
                    </div>
                  </Card.Body>
                  <Card.Footer className="d-flex align-items-center justify-content-between bg-white">
                    <div className="d-flex align-items-center">
                      {it.submitter?.avatar ? (
                        <img
                          src={it.submitter.avatar}
                          alt={it.submitter.name}
                          className="rounded-circle me-2"
                          style={{ width: 32, height: 32, objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="bg-secondary text-white rounded-circle me-2 d-flex align-items-center justify-content-center"
                          style={{ width: 32, height: 32 }}
                        >
                          👤
                        </div>
                      )}
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

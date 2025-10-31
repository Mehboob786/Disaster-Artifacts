import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import AppRouter from "./routes/Router";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"; // 👈 for gradient animation

export default function App() {
  const navigate = useNavigate();

  return (
    <div className="animated-bg d-flex flex-column min-vh-100">
      {/* 🌍 Navbar */}
      <Navbar
        expand="lg"
        className="shadow-sm"
        style={{
          background:
            "linear-gradient(90deg, rgba(2, 104, 160, 1) 0%, rgba(0,150,199,1) 50%, rgba(0,187,214,1) 100%)",
        }}
        variant="dark"
      >
        <Container>
          <Navbar.Brand
            onClick={() => navigate("/")}
            className="fw-bold text-white d-flex align-items-center"
            style={{ cursor: "pointer", fontSize: "1.3rem" }}
          >
            🌐 Community Disaster Archive
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-navbar" />
          <Navbar.Collapse id="main-navbar" className="justify-content-end">
            <Nav className="align-items-center gap-2">
              <Button
                variant="outline-light"
                className="px-3 fw-semibold"
                onClick={() => navigate("/")}
              >
                View Submissions
              </Button>
              <Button
                variant="warning"
                className="px-3 fw-semibold text-dark"
                onClick={() => navigate("/upload")}
              >
                + Add Submission
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* 🧭 Page Content */}
      <Container className="flex-grow-1 py-5">
        <div
          className="p-4 p-md-5 bg-white rounded-4 shadow-sm border border-light"
          style={{
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(66, 131, 236, 0.9)",
            minHeight: "70vh",
          }}
        >
          <AppRouter />
        </div>
      </Container>

      {/* 🤝 Footer */}
      <footer
        className="text-center text-muted py-3"
        style={{
          background: "rgba(255, 255, 255, 0.7)",
          borderTop: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <small>
          Built with ❤️ for resilient communities • Powered by{" "}
          <span className="text-primary fw-semibold">React & Bootstrap</span>
        </small>
      </footer>
    </div>
  );
}

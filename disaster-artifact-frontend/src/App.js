import React, { useState } from "react";
import UploadForm from "./components/UploadForm";
import Gallery from "./components/Gallery";

export default function App() {
  const [view, setView] = useState("gallery"); // default page

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-semibold">Community Disaster Submissions</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setView("gallery")}
            className={`px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition ${
              view === "gallery" ? "bg-blue-700" : "bg-blue-500"
            }`}
          >
            View Submissions
          </button>
          <button
            onClick={() => setView("upload")}
            className={`px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition ${
              view === "upload" ? "bg-blue-700" : "bg-blue-500"
            }`}
          >
            Add Submission
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <main className="container mx-auto p-6">
        {view === "upload" ? <UploadForm /> : <Gallery />}
      </main>
    </div>
  );
}

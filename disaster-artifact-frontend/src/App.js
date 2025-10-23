import React from 'react'
import UploadForm from './components/UploadForm'
import Gallery from './components/Gallery'


export default function App() {
  return (
    <div className="container">
      <h1>Community Disaster Submissions</h1>
      <UploadForm />
      <hr />
      <Gallery />
    </div>
  )
}
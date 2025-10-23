import React, { useEffect, useState } from 'react'
import client, { urlFor } from '../sanityClient'


export default function Gallery() {
    const [items, setItems] = useState([])
    useEffect(() => {
        const q = `*[_type=="submission" && approved==true] | order(_createdAt desc){title, description, media, artifactType, locationName, location, eventDate}`
        client.fetch(q).then(setItems).catch(console.error)
    }, [])


    if (!items) return null
    return (
        <div>
            <h2>Approved Submissions</h2>
            <div className="grid">
                {items.map(it => (
                    <div key={it._id} className="card">
                        <h3>{it.title}</h3>
                        <p>{it.description}</p>
                        {it.media?.asset && (
                            <img src={urlFor(it.media.asset).width(400).url()} alt={it.title} />
                        )}
                        {it.locationName && <p>{it.locationName}</p>}
                    </div>
                ))}
            </div>
        </div>
    )
}
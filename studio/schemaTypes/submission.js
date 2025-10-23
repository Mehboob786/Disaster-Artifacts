


export default {
    name: 'submission',
    title: 'Submission',
    type: 'document',
    fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'description', title: 'Description', type: 'text' },
        { name: 'artifactType', title: 'Artifact Type', type: 'string', options: { list: ['photo', 'video', 'document'] } },
        { name: 'media', title: 'Media', type: 'file' },
        { name: 'locationName', title: 'Location Name', type: 'string' },
        { name: 'location', title: 'Location (Lat/Long)', type: 'geopoint' },
        { name: 'eventDate', title: 'Date / Time of Event', type: 'datetime' },
        { name: 'submitterName', title: 'Submitter Name', type: 'string' },
        { name: 'contact', title: 'Contact (email/phone)', type: 'string' },
        { name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }] },
        { name: 'approved', title: 'Approved', type: 'boolean', initialValue: false },
        { name: 'createdAt', title: 'Created At', type: 'datetime', readOnly: true }
    ]
}
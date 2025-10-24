export default {
    name: 'submission',
    type: 'document',
    title: 'Submission',
    fields: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'text' },
        {
            name: 'media',
            title: 'Media',
            type: 'array',
            of: [{ type: 'file' }],
        },
        { name: 'artifactType', type: 'string' },
        { name: 'locationName', type: 'string' },
        { name: 'location', type: 'geopoint' },
        { name: 'eventDate', type: 'datetime' },
        { name: 'submitterName', type: 'string' },
        { name: 'contact', type: 'string' },
        { name: 'tags', type: 'array', of: [{ type: 'string' }] },
        { name: 'approved', type: 'boolean', title: 'Approved', initialValue: false },
    ],
}

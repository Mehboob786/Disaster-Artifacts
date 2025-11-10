import { defineType } from 'sanity'

export default defineType({
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

    // ✅ NEW FIELD
    {
      name: 'disasterType',
      title: 'Disaster Type',
      type: 'string',
      options: {
        list: [
          { title: 'Flood', value: 'flood' },
          { title: 'Earthquake', value: 'earthquake' },
          { title: 'Tornado', value: 'tornado' },
          { title: 'Hurricane/Typhoon', value: 'hurricane_typhoon' },
          { title: 'Wildfire', value: 'wildfire' },
          { title: 'Dust Storm', value: 'dust_storm' },
          { title: 'Freeze', value: 'freeze' },
          { title: 'Severe Storm', value: 'severe_storm' },
          { title: 'Winter Storm', value: 'winter_storm' },
        ],
        layout: 'dropdown',
      },
    },

    { name: 'locationName', type: 'string' },
    { name: 'location', type: 'geopoint' },
    { name: 'eventDate', type: 'datetime' },
    { name: 'submitterName', type: 'string' },
    { name: 'contact', type: 'string' },
    { name: 'tags', type: 'array', of: [{ type: 'string' }] },
    { name: 'approved', type: 'boolean', title: 'Approved', initialValue: false },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    },
  ],
})

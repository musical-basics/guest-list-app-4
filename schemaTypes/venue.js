export default {
  name: 'venue',
  title: 'Venue',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
    },
    {
      name: 'events',
      title: 'Events',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'event' }] }],
    },
  ],
};
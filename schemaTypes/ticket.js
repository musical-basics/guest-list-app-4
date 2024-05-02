export default {
  name: 'ticket',
  title: 'Ticket',
  type: 'document',
  fields: [
    {
      name: 'guest',
      title: 'Guest',
      type: 'reference',
      to: [{ type: 'guest' }],
    },
    {
      name: 'event',
      title: 'Event',
      type: 'reference',
      to: [{ type: 'event' }],
    },
  ],
};
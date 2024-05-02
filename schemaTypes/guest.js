export default {
  name: 'guest',
  title: 'Guest',
  type: 'document',
  fields: [
    {
      name: 'fullName',
      title: 'Full Name',
      type: 'string',
    },
    {
      name: 'phoneNumber',
      title: 'Phone Number',
      type: 'string',
    },
    {
      name: 'group',
      title: 'Group',
      type: 'reference',
      to: [{ type: 'group' }],
    },
  ],
};
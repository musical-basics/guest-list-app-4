export default {
  name: 'group',
  title: 'Group',
  type: 'document',
  fields: [
    {
      name: 'groupName',
      title: 'Name of Group',
      type: 'string',
    },
    {
      name: 'numMales',
      title: 'Number of Males',
      type: 'number',
    },
    {
      name: 'numFemales',
      title: 'Number of Females',
      type: 'number',
    },
    {
      name: 'hotel',
      title: 'Hotel',
      type: 'string',
    },
    {
      name: 'groupMembers',
      title: 'Group Members',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'guest' }] }],
    },

  ],
};
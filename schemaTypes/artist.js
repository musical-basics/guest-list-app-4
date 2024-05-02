export default {
  name: 'artist',
  title: 'Artist',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'musicGenre',
      title: 'Music Genre',
      type: 'string',
      options: {
        list: [
          { value: 'edm', title: 'EDM' },
          { value: 'house', title: 'House' },
          { value: 'hip-hop', title: 'Hip Hop' },
          { value: 'electronic', title: 'Electronic' },
          { value: 'dubstep', title: 'Dubstep' },
          { value: 'latin', title: 'Latin' },
          { value: 'other', title: 'Other' },
        ],
      },
    },
    {
      name: 'profilePicture',
      title: 'Profile Picture',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
  ],
}
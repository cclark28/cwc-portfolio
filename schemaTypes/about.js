export default {
  name: 'about',
  title: 'About',
  type: 'document',
  fields: [
    { name: 'description', title: 'Description', type: 'array', of: [{ type: 'block' }] },
    { name: 'coverImage', title: 'Cover Image', type: 'image', options: { hotspot: true }, validation: Rule => Rule.required() },
    {
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [
        { type: 'image', name: 'galleryImage', title: 'Image', options: { hotspot: true } },
        {
          type: 'object',
          name: 'galleryVideo',
          title: 'Video',
          fields: [
            { name: 'file', title: 'Video File', type: 'file', options: { accept: 'video/*' }, validation: Rule => Rule.required() },
            { name: 'aspectRatio', title: 'Aspect Ratio', type: 'string', options: { list: ['16:9', '9:16'] }, validation: Rule => Rule.required() },
          ],
        },
      ],
    },
  ],
}

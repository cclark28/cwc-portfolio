export default {
  name: 'playground',
  title: 'Playground',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: Rule => Rule.required() },
    { name: 'year', title: 'Year', type: 'number', validation: Rule => Rule.required().min(2000).max(2030) },
    { name: 'tags', title: 'Tags', type: 'string', description: 'e.g. Experiment, Side Project, Concept, Personal' },
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
    { name: 'externalUrl', title: 'External Link', type: 'url', description: 'Optional link to a live demo, CodePen, prototype, etc.' },
    { name: 'private', title: 'Private (password-locked)', type: 'boolean', initialValue: false },
    { name: 'published', title: 'Published', type: 'boolean', initialValue: false },
  ],
}

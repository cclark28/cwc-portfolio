export default {
  name: 'photography',
  title: 'Photography Series',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: Rule => Rule.required() },
    { name: 'year', title: 'Year (display only)', type: 'number', validation: Rule => Rule.required().min(2000).max(2030) },
    { name: 'private', title: 'Private (password protected)', type: 'boolean', initialValue: false },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: { list: ['Music', 'Abandoned', 'Nature', 'Portrait', 'Video', 'Other'] },
    },
    { name: 'caption', title: 'Caption', type: 'string' },
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
      description: 'gallery[0] is the bento hero (4x2 desktop / 2x2 mobile)',
    },
    { name: 'portfolio', title: 'Portfolio (featured)', type: 'boolean', initialValue: false },
    { name: 'published', title: 'Published', type: 'boolean', initialValue: false },
  ],
}
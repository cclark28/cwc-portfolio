import { MetadataRoute } from 'next'
import { fetchProjects, fetchPhotography } from '@/lib/sanity'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.charleswclark.com'

  const [projects, photography] = await Promise.all([
    fetchProjects(),
    fetchPhotography(),
  ])

  const projectEntries = (projects || []).map((p: { slug: string }) => ({
    url: `${baseUrl}/work/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const photoEntries = (photography || []).map((p: { slug: string }) => ({
    url: `${baseUrl}/photo/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...projectEntries,
    ...photoEntries,
  ]
}

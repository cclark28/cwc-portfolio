import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: true,
})

// Fetch all published projects
export async function fetchProjects() {
  return client.fetch(`
    *[_type == "project"] | order(year desc) {
      "id": _id,
      title,
      "slug": slug.current,
      year,
      client,
      role,
      "tags": type,
      "desc": description,
      private,
      "coverImageUrl": coverImage.asset->url,
      "gallery": gallery[].asset->url
    }
  `)
}

// Fetch all published photography items
export async function fetchPhotography() {
  return client.fetch(`
    *[_type == "photography"] | order(year desc) {
      "id": _id,
      title,
      "slug": slug.current,
      year,
      client,
      role,
      "tags": type,
      "desc": description,
      private,
      "coverImageUrl": coverImage.asset->url,
      "gallery": gallery[].asset->url
    }
  `)
}

// Fetch site settings (password, etc.)
export async function fetchSettings() {
  return client.fetch(`
    *[_type == "settings"][0] {
      siteTitle,
      sitePassword,
      passwordEnabled,
      contactEmail
    }
  `)
}

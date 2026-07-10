import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-08-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

// Fetch all published projects
export async function fetchProjects() {
  return client.fetch(`
    *[_type == "project" && !(_id in path("drafts.**"))] | order(year desc) {
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
      "gallery": gallery[] {
        _type,
        _type == "galleryImage" => { "url": asset->url },
        _type == "galleryVideo" => { "url": file.asset->url, aspectRatio }
      }
    }
  `)
}

// Fetch all published photography items
export async function fetchPhotography() {
  return client.fetch(`
    *[_type == "photography" && !(_id in path("drafts.**"))] | order(year desc) {
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
      "gallery": gallery[] {
        _type,
        _type == "galleryImage" => { "url": asset->url },
        _type == "galleryVideo" => { "url": file.asset->url, aspectRatio }
      }
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
      contactEmail,
      commandModule
    }
  `)
}

// Fetch all published playground items
export async function fetchPlayground() {
  return client.fetch(`
    *[_type == "playground" && !(_id in path("drafts.**"))] | order(year desc) {
      "id": _id,
      title,
      "slug": slug.current,
      year,
      tags,
      "desc": description,
      private,
      externalUrl,
      "coverImageUrl": coverImage.asset->url,
      "gallery": gallery[] {
        _type,
        _type == "galleryImage" => { "url": asset->url },
        _type == "galleryVideo" => { "url": file.asset->url, aspectRatio }
      }
    }
  `)
}

// Fetch a single project by slug
export async function fetchProjectBySlug(slug: string) {
  return client.fetch(`
    *[_type == "project" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
      "id": _id, title, "slug": slug.current, year, client, role,
      "tags": type, "desc": description,
      "coverImageUrl": coverImage.asset->url,
      "gallery": gallery[] {
        _type,
        _type == "galleryImage" => { "url": asset->url },
        _type == "galleryVideo" => { "url": file.asset->url, aspectRatio }
      }
    }
  `, { slug })
}

// Fetch a single photography item by slug
export async function fetchPhotographyBySlug(slug: string) {
  return client.fetch(`
    *[_type == "photography" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
      "id": _id, title, "slug": slug.current, year, client, role,
      "tags": type, "desc": description,
      "coverImageUrl": coverImage.asset->url,
      "gallery": gallery[] {
        _type,
        _type == "galleryImage" => { "url": asset->url },
        _type == "galleryVideo" => { "url": file.asset->url, aspectRatio }
      }
    }
  `, { slug })
}

// Fetch about/info content
export async function fetchAbout() {
  return client.fetch(`
    *[_type == "about"][0] {
      headline,
      bio,
      currentRole,
      location,
      contactEmail,
      currentCity,
      currentCountry,
      timezone,
      latitude,
      longitude,
      heroInitials,
      heroName,
      heroRoles,
      heroBio,
      heroTagline,
      heroAvailability,
      heroLocation,
      "coverImageUrl": coverImage.asset->url
    }
  `)
}

import { createClient } from 'next-sanity'

const projectId = 'smatdclo'
const dataset = 'site'
const apiVersion = '2024-07-01' // or latest

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // private dataset
  token: process.env.NEXT_PUBLIC_SANITY_TOKEN, // set in .env.local
})

export async function fetchAbout() {
  const query = `*[_type == "about"][0] {
    headline,
    heroBio,
    roles,
    location,
    email,
    timezone,
    gps,
    // add other fields per schema
  }`
  return client.fetch(query)
}

export async function fetchSettings() {
  const query = `*[_type == "settings"][0]`
  return client.fetch(query)
}

// Add other GROQ fetches (work, photo, playground) as needed
// Filter drafts: !(_id in path("drafts.**"))

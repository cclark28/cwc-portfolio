import Image from 'next/image'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchProjectBySlug, fetchProjects } from '@/lib/sanity'
import Link from 'next/link'

// Sanity descriptions can be plain strings OR Portable Text (array of blocks).
function normalizeDesc(desc: unknown): string | undefined {
  if (!desc) return undefined
  if (typeof desc === 'string') return desc
  if (Array.isArray(desc)) {
    return desc
      .filter((block: Record<string, unknown>) => block._type === 'block')
      .map((block: Record<string, unknown>) =>
        (block.children as Array<{ text?: string }>)
          ?.map((child) => child.text || '')
          .join('') || ''
      )
      .filter(Boolean)
      .join('\n\n')
  }
  return undefined
}

interface ProjectData {
  id: string
  title: string
  slug: string
  year: number
  client?: string
  role?: string
  tags?: string
  desc?: unknown
  coverImageUrl?: string
  gallery?: string[]
}

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  const projects = await fetchProjects()
  return (projects || []).map((p: { slug: string }) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const project: ProjectData | null = await fetchProjectBySlug(slug)
  if (!project) return { title: 'Project Not Found' }

  const description = normalizeDesc(project.desc) || `${project.title} — a project by Charles W. Clark`
  const title = `${project.title} | Charles W. Clark`

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.charleswclark.com/work/${project.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://www.charleswclark.com/work/${project.slug}`,
      siteName: 'Charles W. Clark',
      locale: 'en_US',
      ...(project.coverImageUrl ? { images: [{ url: project.coverImageUrl, alt: project.title }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@charleswclarkII',
      ...(project.coverImageUrl ? { images: [project.coverImageUrl] } : {}),
    },
  }
}

export default async function WorkProjectPage({ params }: { params: Params }) {
  const { slug } = await params
  const project: ProjectData | null = await fetchProjectBySlug(slug)
  if (!project) notFound()

  const description = normalizeDesc(project.desc)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: description || `${project.title} — a project by Charles W. Clark`,
    url: `https://www.charleswclark.com/work/${project.slug}`,
    dateCreated: String(project.year),
    creator: {
      '@type': 'Person',
      name: 'Charles W. Clark',
      url: 'https://www.charleswclark.com',
    },
    ...(project.coverImageUrl ? { image: project.coverImageUrl } : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main
        style={{
          minHeight: '100vh',
          background: '#FAFAFB',
          color: '#18181B',
          fontFamily: 'var(--font-grotesk), sans-serif',
        }}
      >
        {/* Header */}
        <header
          style={{
            padding: '24px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #E5E4E6',
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '13px',
              letterSpacing: '0.04em',
              color: '#9B9AA0',
              textDecoration: 'none',
              textTransform: 'uppercase',
            }}
          >
            &larr; Back to canvas
          </Link>
        </header>

        {/* Project Info */}
        <article
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            padding: '64px 32px',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-grotesk), sans-serif',
              fontSize: '40px',
              fontWeight: 700,
              lineHeight: 1.15,
              margin: '0 0 16px 0',
              color: '#18181B',
            }}
          >
            {project.title}
          </h1>

          {/* Meta row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px',
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '12px',
              letterSpacing: '0.04em',
              color: '#9B9AA0',
              textTransform: 'uppercase',
              marginBottom: '32px',
            }}
          >
            {project.year && <span>{project.year}</span>}
            {project.client && <span>{project.client}</span>}
            {project.role && <span>{project.role}</span>}
            {project.tags && <span>{project.tags}</span>}
          </div>

          {/* Description */}
          {description && (
            <div
              style={{
                fontFamily: 'var(--font-grotesk), sans-serif',
                fontSize: '16px',
                lineHeight: 1.65,
                color: '#18181B',
                maxWidth: '640px',
                marginBottom: '48px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {description}
            </div>
          )}

          {/* Cover Image */}
          {project.coverImageUrl && (
            <div style={{ marginBottom: '32px' }}>
              <Image
                src={project.coverImageUrl}
                alt={project.title}
                width={960}
                height={640}
                sizes="(max-width: 960px) 100vw, 960px"
                priority
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '4px',
                }}
              />
            </div>
          )}

          {/* Gallery */}
          {project.gallery && project.gallery.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
            >
              {project.gallery.map((url, i) => (
                <Image
                  key={i}
                  src={url}
                  alt={`${project.title} — image ${i + 1}`}
                  width={960}
                  height={640}
                  sizes="(max-width: 960px) 100vw, 960px"
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '4px',
                  }}
                />
              ))}
            </div>
          )}
        </article>
      </main>
    </>
  )
}

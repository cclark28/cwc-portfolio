import { fetchProjects, fetchPhotography, fetchPlayground, fetchSettings, fetchAbout } from '@/lib/sanity';
import { withSize, type RawCanvasItem } from '@/lib/canvasLayout';
import HomeClient from '@/components/HomeClient';

// Tell Next.js to always fetch fresh data (no caching)
export const dynamic = 'force-dynamic';

// Sample data as fallback when Sanity has no content yet
const SAMPLE_WORK: RawCanvasItem[] = [
  { id: 'terminus', slug: 'terminus', title: 'Terminus Software, Inc.', year: 2024, private: false, category: 'work' },
  { id: 'gungeon', slug: 'gungeon', title: 'Enter the Gungeon — House of the Gundead', year: 2021, private: false, category: 'work' },
  { id: 'asian-art', slug: 'asian-art', title: 'Asian Art Museum San Francisco', year: 2013, private: false, category: 'work' },
  { id: 'delivra', slug: 'delivra', title: 'Delivra', year: 2022, private: false, category: 'work' },
  { id: 'ronin', slug: 'ronin', title: 'Rónin Tactics', year: 2020, private: false, category: 'work' },
  { id: 'jlo', slug: 'jlo', title: 'JLO', year: 2018, private: false, category: 'work' },
  { id: 'blend', slug: 'blend', title: 'Blend Creative Team', year: 2017, private: false, category: 'work' },
  { id: 'pokedex', slug: 'pokedex', title: 'Pokédex 3D Pro', year: 2013, private: false, category: 'work' },
  { id: 'pokemon-bw2', slug: 'pokemon-bw2', title: 'Pokémon Black & White v2', year: 2012, private: false, category: 'work' },
  { id: 'pokemon-rumble', slug: 'pokemon-rumble', title: 'Pokémon Rumble Blast', year: 2011, private: false, category: 'work' },
  { id: 'wargaming', slug: 'wargaming', title: 'Wargaming', year: 2015, private: false, category: 'work' },
  { id: 'fieldcraft', slug: 'fieldcraft', title: 'FieldCraft Survival', year: 2023, private: false, category: 'work' },
  { id: 'skyfeeder', slug: 'skyfeeder', title: 'Skyfeeder', year: 2016, private: false, category: 'work' },
  { id: 'skycurser', slug: 'skycurser', title: 'SKYCURSER', year: 2014, private: false, category: 'work' },
];

const SAMPLE_PHOTO: RawCanvasItem[] = [
  { id: 'pixies', slug: 'pixies', title: 'Pixies — Live', year: 2023, private: false, category: 'photo' },
  { id: 'warpaint', slug: 'warpaint', title: 'Warpaint — Live', year: 2022, private: false, category: 'photo' },
  { id: 'yolatengo', slug: 'yolatengo', title: 'Yo La Tengo — Live', year: 2021, private: false, category: 'photo' },
  { id: 'huey', slug: 'huey', title: 'American Huey Museum', year: 2019, private: false, category: 'photo' },
  { id: 'jamie-rose', slug: 'jamie-rose', title: 'Jamie Rose', year: 2020, private: false, category: 'photo' },
  { id: 'sarah-green', slug: 'sarah-green', title: 'Sarah Green', year: 2019, private: false, category: 'photo' },
  { id: 'botwin', slug: 'botwin', title: 'Botwin', year: 2018, private: false, category: 'photo' },
  { id: 'ritz-theatre', slug: 'ritz-theatre', title: 'Ritz Theatre', year: 2021, private: false, category: 'photo' },
  { id: 'lugar-plaza', slug: 'lugar-plaza', title: 'Lugar Plaza', year: 2019, private: false, category: 'photo' },
  { id: 'wright-patterson', slug: 'wright-patterson', title: 'Wright-Patterson Airbase', year: 2019, private: false, category: 'photo' },
  { id: 'okinawa', slug: 'okinawa', title: 'Okinawa Americana', year: 2017, private: false, category: 'photo' },
  { id: 'tu-lam', slug: 'tu-lam', title: 'TU LAM', year: 2016, private: false, category: 'photo' },
  { id: 'reid-medical', slug: 'reid-medical', title: 'Reid Medical Center', year: 2015, private: false, category: 'photo' },
];

// Sanity descriptions can be plain strings OR Portable Text (array of blocks).
// This normalizes both to a plain string.
function normalizeDesc(desc: unknown): string | undefined {
  if (!desc) return undefined;
  if (typeof desc === 'string') return desc;
  if (Array.isArray(desc)) {
    return desc
      .filter((block: Record<string, unknown>) => block._type === 'block')
      .map((block: Record<string, unknown>) =>
        (block.children as Array<{ text?: string }>)
          ?.map((child) => child.text || '')
          .join('') || ''
      )
      .filter(Boolean)
      .join('\n\n');
  }
  return undefined;
}

export default async function Home() {
  let rawWork: RawCanvasItem[];
  let rawPhoto: RawCanvasItem[];
  let rawPlayground: RawCanvasItem[] = [];
  let settings: { sitePassword?: string; passwordEnabled?: boolean; commandModule?: Record<string, unknown> } = {};
  let aboutData: { headline?: string; bio?: string; currentRole?: string; location?: string; contactEmail?: string; coverImageUrl?: string; currentCity?: string; currentCountry?: string; timezone?: string; latitude?: string; longitude?: string; heroInitials?: string; heroName?: string; heroRoles?: string[]; heroBio?: string; heroTagline?: string; heroAvailability?: string } | null = null;

  try {
    const [projects, photography, playgroundItems, siteSettings, about] = await Promise.all([
      fetchProjects(),
      fetchPhotography(),
      fetchPlayground(),
      fetchSettings(),
      fetchAbout(),
    ]);
    aboutData = about;

    rawWork = projects.length > 0
      ? projects.map((p: Record<string, unknown>) => ({ ...p, desc: normalizeDesc(p.desc), category: 'work' as const }))
      : SAMPLE_WORK;

    rawPhoto = photography.length > 0
      ? photography.map((p: Record<string, unknown>) => ({ ...p, desc: normalizeDesc(p.desc), category: 'photo' as const }))
      : SAMPLE_PHOTO;

    rawPlayground = (playgroundItems || []).map((p: Record<string, unknown>) => ({
      ...p,
      desc: normalizeDesc(p.desc),
      category: 'playground' as const,
    }));

    settings = siteSettings || {};
  } catch {
    // Sanity not connected yet — use sample data
    rawWork = SAMPLE_WORK;
    rawPhoto = SAMPLE_PHOTO;
  }

  const work = withSize(rawWork);
  const photo = withSize(rawPhoto);
  const playground = withSize(rawPlayground);

  const allItems = [...rawWork, ...rawPhoto, ...rawPlayground];

  return (
    <>
      <HomeClient
        work={work}
        photo={photo}
        playground={playground}
        sitePassword={settings.sitePassword}
        passwordEnabled={settings.passwordEnabled}
        commandModule={settings.commandModule}
        aboutData={aboutData}
      />

      {/* Hidden but crawlable content for SEO — visible to search engines and AI crawlers */}
      <div
        className="sr-only"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
        }}
      >
        <h1>Charles W. Clark — Multidisciplinary Designer &amp; Art Director</h1>
        <p>
          Print, web, entertainment, SaaS, and now experimental AI — 20+ years of designing
          across every medium I can get my hands on. I love the challenge. I look forward to building what&apos;s next.
        </p>

        <section aria-label="About Charles W. Clark">
          <h2>About</h2>
          <p>
            Charles W. Clark is a multidisciplinary designer and art director with over 20 years
            of experience. His career began at the Copperas Cove Leader-Press and Killeen Daily Herald,
            where he learned newspaper layout and production. He then spent over a decade at NUVO
            Newsweekly in Indianapolis, growing from designer to Production Manager — overseeing the
            design team while maintaining print schedules and production. He also learned photography
            at NUVO, which became a lasting part of his practice.
          </p>
          <p>
            Charlie left NUVO to pursue digital design, which led to a Senior Interactive Designer
            role and work across the entertainment and gaming space — including projects for
            Pok&eacute;mon Black &amp; White, Pok&eacute;dex 3D Pro, Enter the Gungeon, Wargaming,
            R&oacute;nin Tactics, FieldCraft Survival, SKYCURSER, and the Asian Art Museum of
            San Francisco. His concert photography has covered artists like Pixies and Yo La Tengo.
          </p>
          <p>
            Today at DemandScience, he works in B2B SaaS — helping clients with creative, supporting
            internal marketing teams with design and production, and championing best-use-case
            implementation of AI across the organization.
          </p>
          <p>
            In his spare time, Charlie creates experimental art under the name Saboteur. By night,
            he works on Tommy&apos;s — a comic book where he handles all art and production.
          </p>
          <p>
            I&apos;ve worked across every arena of design — print, web, interactive, and now experimental AI.
            I love the challenges each one brings, and I look forward to building new things.
          </p>
        </section>

        <section aria-label="Work">
          <h2>Selected Work</h2>
          <ul>
            {allItems
              .filter((item) => item.category === 'work')
              .map((item) => (
                <li key={item.id}>
                  <a href={`/work/${item.slug}`}>
                    <strong>{item.title}</strong> ({item.year})
                    {item.client && <> — {item.client}</>}
                    {item.desc && <> — {item.desc}</>}
                  </a>
                </li>
              ))}
          </ul>
        </section>

        <section aria-label="Photography">
          <h2>Photography</h2>
          <ul>
            {allItems
              .filter((item) => item.category === 'photo')
              .map((item) => (
                <li key={item.id}>
                  <a href={`/photo/${item.slug}`}>
                    <strong>{item.title}</strong> ({item.year})
                    {item.desc && <> — {item.desc}</>}
                  </a>
                </li>
              ))}
          </ul>
        </section>

        {allItems.some((item) => item.category === 'playground') && (
          <section aria-label="Playground">
            <h2>Playground</h2>
            <ul>
              {allItems
                .filter((item) => item.category === 'playground')
                .map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong> ({item.year})
                    {item.desc && <> — {item.desc}</>}
                  </li>
                ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}

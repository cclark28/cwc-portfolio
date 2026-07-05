import { fetchProjects, fetchPhotography, fetchSettings } from '@/lib/sanity';
import { withSize, type RawCanvasItem } from '@/lib/canvasLayout';
import HomeClient from '@/components/HomeClient';

// Sample data as fallback when Sanity has no content yet
const SAMPLE_WORK: RawCanvasItem[] = [
  { id: 'terminus', slug: 'terminus', title: 'Terminus Software, Inc.', year: 2024, private: false, category: 'work' },
  { id: 'gungeon', slug: 'gungeon', title: 'Enter the Gungeon — House of the Gundead', year: 2021, private: false, category: 'work' },
  { id: 'asian-art', slug: 'asian-art', title: 'Asian Art Museum San Francisco', year: 2013, private: false, category: 'work' },
  { id: 'delivra', slug: 'delivra', title: 'Delivra', year: 2022, private: false, category: 'work' },
  { id: 'ronin', slug: 'ronin', title: 'Rónin Tactics', year: 2020, private: false, category: 'work' },
  { id: 'jlo', slug: 'jlo', title: 'JLO', year: 2018, private: true, category: 'work' },
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

export default async function Home() {
  let rawWork: RawCanvasItem[];
  let rawPhoto: RawCanvasItem[];
  let settings: { sitePassword?: string; passwordEnabled?: boolean } = {};

  try {
    const [projects, photography, siteSettings] = await Promise.all([
      fetchProjects(),
      fetchPhotography(),
      fetchSettings(),
    ]);

    rawWork = projects.length > 0
      ? projects.map((p: Record<string, unknown>) => ({ ...p, category: 'work' as const }))
      : SAMPLE_WORK;

    rawPhoto = photography.length > 0
      ? photography.map((p: Record<string, unknown>) => ({ ...p, category: 'photo' as const }))
      : SAMPLE_PHOTO;

    settings = siteSettings || {};
  } catch {
    // Sanity not connected yet — use sample data
    rawWork = SAMPLE_WORK;
    rawPhoto = SAMPLE_PHOTO;
  }

  const work = withSize(rawWork);
  const photo = withSize(rawPhoto);

  return (
    <HomeClient
      work={work}
      photo={photo}
      sitePassword={settings.sitePassword}
      passwordEnabled={settings.passwordEnabled}
    />
  );
}

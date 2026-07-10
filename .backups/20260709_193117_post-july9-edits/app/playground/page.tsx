import { fetchPlayground } from '@/lib/sanity';
import PlaygroundPage from '@/components/PlaygroundPage';

export const dynamic = 'force-dynamic';

// Sanity descriptions can be plain strings OR Portable Text (array of blocks).
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

export interface PlaygroundItem {
  id: string;
  title: string;
  slug: string;
  year: number;
  tags: string;
  desc?: string;
  private: boolean;
  externalUrl?: string;
  coverImageUrl?: string;
  gallery?: Array<{
    _type: string;
    url?: string;
    aspectRatio?: string;
  }>;
}

export default async function Playground() {
  let items: PlaygroundItem[] = [];

  try {
    const raw = await fetchPlayground();
    items = (raw || []).map((p: Record<string, unknown>) => ({
      ...p,
      desc: normalizeDesc(p.desc),
    })) as PlaygroundItem[];
  } catch {
    // Sanity not connected — empty state
  }

  return <PlaygroundPage items={items} />;
}

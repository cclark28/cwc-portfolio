import requests, re, html, json, time

TOKEN = 'skezUJWHdVNM1vRnMjh2LQupCepims3T7x6OxLSNAdx8aRBqloqH1WbW6irAMJZ2HO0hxF0z2JoEwvs2VxJd5r8tQp8OpLL3PCGzfACAMfnJpGxrqjQk8jxFU9PLirYp8YvwWeWqSA45MgHopM3WMG0Qg7jBCudkjo2GRRZJG7AnPPj4yOKV'
PROJ = 'smatdclo'
DS = 'site'
API_QUERY = f'https://{PROJ}.api.sanity.io/v2024-01-01/data/query/{DS}'
API_MUTATE = f'https://{PROJ}.api.sanity.io/v2024-01-01/data/mutate/{DS}'
HEADERS = {'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'}

# Slugs with 800-char truncated descriptions
truncated_slugs = [
    'asian-art-museum-san-francisco',
    'blend-creative-team',
    'delivra',
    'fieldcraft-survival',
    'jlo-capital-records-pitch',
    'pokedex-3d-pro',
    'pokemon-black-white-2',
    'pokemon-rumble-blast',
    'ronin-tactics',
    'skycurser',
    'skyfeeder',
    'wargaming',
]

# Tags from the live site (scraped from homepage links)
slug_tags = {
    'asian-art-museum-san-francisco': 'Campaign, Print Design, Web Design',
    'blend-creative-team': 'Art Direction, Branding, Design, Photography',
    'delivra': 'Art Direction',
    'fieldcraft-survival': 'Art Direction, Branding, Design, E-commerce',
    'jlo-capital-records-pitch': 'Web Design',
    'pokedex-3d-pro': 'Web Design',
    'pokemon-black-white-2': 'Web Design',
    'pokemon-rumble-blast': 'Web Design',
    'ronin-tactics': 'E-commerce, Website Redesign',
    'skycurser': 'Logo Design, Product Design, Web Design',
    'skyfeeder': 'Design, Illustration, Mobile Game Design',
    'wargaming': 'Branding, Illustration, Print, Web Design',
    'terminus': 'Brand, Design, Web, Strategy',
    'gungeon': 'Arcade Cabinet Design',
}

print("Tags will be set for all projects")
print(json.dumps(slug_tags, indent=2))
print()

# Get Sanity project IDs
r = requests.get(API_QUERY, params={'query': '*[_type=="project" && !(_id in path("drafts.**"))]{_id, "slug": slug.current, description}'}, headers=HEADERS)
projects = r.json()['result']
slug_to_proj = {p['slug']: p for p in projects}

mutations = []

# Update tags for ALL projects
for slug, tags in slug_tags.items():
    if slug in slug_to_proj:
        mutations.append({
            'patch': {
                'id': slug_to_proj[slug]['_id'],
                'set': {'type': tags}
            }
        })

# Apply tag mutations first
if mutations:
    r = requests.post(API_MUTATE, json={'mutations': mutations}, headers=HEADERS)
    print(f"Updated tags for {len(mutations)} projects. Status: {r.status_code}")

print(f"\nDone setting tags.")

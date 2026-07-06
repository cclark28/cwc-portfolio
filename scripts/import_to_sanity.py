#!/usr/bin/env python3
"""
WordPress XML → Sanity CMS full importer.
Run from Terminal: cd ~/Documents/cwc && python3 scripts/import_to_sanity.py

Parses the WP export XML, finds local images in assets/images/,
uploads them to Sanity CDN, and creates project + photography documents.
"""

import xml.etree.ElementTree as ET
import os, sys, time, mimetypes
import requests

# ── Config ──
PROJECT_ID = 'smatdclo'
DATASET = 'site'
TOKEN = 'skezUJWHdVNM1vRnMjh2LQupCepims3T7x6OxLSNAdx8aRBqloqH1WbW6irAMJZ2HO0hxF0z2JoEwvs2VxJd5r8tQp8OpLL3PCGzfACAMfnJpGxrqjQk8jxFU9PLirYp8YvwWeWqSA45MgHopM3WMG0Qg7jBCudkjo2GRRZJG7AnPPj4yOKV'

# Paths (relative to cwc root)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)
IMAGE_DIR = os.path.join(ROOT_DIR, 'assets', 'images')
XML_PATH = os.path.join(ROOT_DIR, 'assets', 'charlieclark.WordPress.2026-07-04.xml')

# If XML isn't in assets, check common locations
if not os.path.exists(XML_PATH):
    alt_paths = [
        os.path.expanduser('~/Documents/cwc/charlieclark.WordPress.2026-07-04.xml'),
        os.path.expanduser('~/Downloads/charlieclark.WordPress.2026-07-04.xml'),
        os.path.expanduser('~/Desktop/charlieclark.WordPress.2026-07-04.xml'),
    ]
    for p in alt_paths:
        if os.path.exists(p):
            XML_PATH = p
            break

MAX_GALLERY = 12  # Max gallery images per item

ASSET_URL = f'https://{PROJECT_ID}.api.sanity.io/v2024-01-01/assets/images/{DATASET}'
MUTATE_URL = f'https://{PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/{DATASET}'
HEADERS = {'Authorization': f'Bearer {TOKEN}'}

ns = {
    'wp': 'http://wordpress.org/export/1.2/',
    'content': 'http://purl.org/rss/1.0/modules/content/',
}


def upload_image(filepath):
    """Upload image to Sanity CDN. Returns image reference dict or None."""
    mime, _ = mimetypes.guess_type(filepath)
    if not mime:
        mime = 'image/jpeg'
    filename = os.path.basename(filepath)
    size_mb = os.path.getsize(filepath) / (1024 * 1024)

    for attempt in range(3):
        try:
            with open(filepath, 'rb') as f:
                resp = requests.post(
                    ASSET_URL,
                    headers={**HEADERS, 'Content-Type': mime},
                    params={'filename': filename},
                    data=f,
                    timeout=180,
                )
            if resp.status_code in (200, 201):
                doc = resp.json().get('document', {})
                asset_id = doc.get('_id', '')
                if asset_id:
                    return {'_type': 'image', 'asset': {'_type': 'reference', '_ref': asset_id}}
            elif resp.status_code == 429:
                print(f"    Rate limited, waiting 5s...")
                time.sleep(5)
                continue
            else:
                print(f"    ✗ Upload failed: {resp.status_code}")
                return None
        except requests.Timeout:
            print(f"    Timeout uploading {filename} ({size_mb:.1f}MB), retrying...")
            time.sleep(2)
            continue
        except Exception as e:
            print(f"    ✗ Error: {e}")
            return None
    return None


def create_document(doc):
    """Create a Sanity document."""
    resp = requests.post(
        MUTATE_URL,
        headers={**HEADERS, 'Content-Type': 'application/json'},
        json={'mutations': [{'create': doc}]},
        timeout=30,
    )
    if resp.status_code not in (200, 201):
        print(f"  ✗ Create failed: {resp.status_code} {resp.text[:200]}")
        return False
    return True


def is_image_file(f):
    return os.path.splitext(f)[1].lower() in ('.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff', '.bmp')


def main():
    if not os.path.exists(XML_PATH):
        print(f"ERROR: WordPress XML not found at {XML_PATH}")
        print("Please copy charlieclark.WordPress.2026-07-04.xml to ~/Documents/cwc/assets/")
        sys.exit(1)

    if not os.path.isdir(IMAGE_DIR):
        print(f"ERROR: Image directory not found at {IMAGE_DIR}")
        sys.exit(1)

    # Test API connectivity
    print("Testing Sanity API connection...")
    try:
        r = requests.get(
            f'https://{PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/{DATASET}',
            headers=HEADERS,
            params={'query': 'count(*[_type in ["project","photography"]])'},
            timeout=10,
        )
        if r.status_code != 200:
            print(f"ERROR: API returned {r.status_code}. Check your token.")
            sys.exit(1)
        existing = r.json().get('result', 0)
        print(f"  Connected. {existing} existing documents in Sanity.")
    except Exception as e:
        print(f"ERROR: Cannot reach Sanity API: {e}")
        sys.exit(1)

    print(f"\nParsing {XML_PATH}...")
    tree = ET.parse(XML_PATH)
    root = tree.getroot()

    # Build local file index
    local_files = [f for f in os.listdir(IMAGE_DIR) if not f.startswith('.')]
    local_by_wpid = {}
    for f in local_files:
        parts = f.split('_', 2)
        if len(parts) >= 2:
            local_by_wpid.setdefault(parts[1], []).append(f)

    # Build attachment map
    att_map = {}
    parent_to_atts = {}
    for item in root.findall('.//item'):
        pt = item.find('wp:post_type', ns)
        if pt is None or pt.text != 'attachment':
            continue
        pid = item.find('wp:post_id', ns).text
        parent_el = item.find('wp:post_parent', ns)
        parent_id = parent_el.text if parent_el is not None else '0'
        local_matches = local_by_wpid.get(pid, [])
        att_map[pid] = {'local_file': local_matches[0] if local_matches else '', 'parent_id': parent_id}
        parent_to_atts.setdefault(parent_id, []).append(pid)

    # Extract projects and photos
    projects = []
    photos = []

    for item in root.findall('.//item'):
        pt = item.find('wp:post_type', ns)
        if pt is None:
            continue

        status = item.find('wp:status', ns)
        if status is not None and status.text != 'publish':
            continue

        title = item.find('title')
        title_text = title.text if title is not None and title.text else ''
        slug_el = item.find('wp:post_name', ns)
        slug = slug_el.text if slug_el is not None else ''
        post_id = item.find('wp:post_id', ns).text

        cats = [c.text for c in item.findall('category') if c.get('domain') == 'category' and c.text]

        metas = {}
        for meta in item.findall('wp:postmeta', ns):
            key = meta.find('wp:meta_key', ns)
            val = meta.find('wp:meta_value', ns)
            if key is not None and val is not None and val.text:
                metas[key.text] = val.text

        thumb_id = metas.get('_thumbnail_id', '')
        att_ids = parent_to_atts.get(post_id, [])
        if thumb_id and thumb_id not in att_ids:
            att_ids.insert(0, thumb_id)

        # Year
        year = None
        for c in item.findall('category'):
            if c.get('domain') == 'post_tag' and c.text and c.text.isdigit():
                y = int(c.text)
                if 2000 <= y <= 2030:
                    year = y
                    break
        if not year:
            pd = item.find('wp:post_date', ns)
            if pd is not None and pd.text:
                try:
                    year = int(pd.text[:4])
                except:
                    pass

        if pt.text == 'project':
            if slug == 'claravine-test':
                continue
            projects.append({
                'title': title_text, 'slug': slug, 'year': year or 2020,
                'categories': cats, 'description': metas.get('rank_math_description', ''),
                'att_ids': att_ids, 'thumb_id': thumb_id, 'post_id': post_id,
            })
        elif pt.text == 'post' and 'Photography' in cats:
            photo_cat = 'Other'
            if 'Music' in cats: photo_cat = 'Music'
            elif 'Abandoned' in cats: photo_cat = 'Abandoned'
            elif 'Nature' in cats: photo_cat = 'Nature'
            elif 'model' in cats: photo_cat = 'Portrait'
            elif 'Video' in cats: photo_cat = 'Video'

            photos.append({
                'title': title_text, 'slug': slug, 'year': year or 2020,
                'photo_category': photo_cat, 'categories': cats,
                'att_ids': att_ids, 'thumb_id': thumb_id, 'post_id': post_id,
            })

    total = len(projects) + len(photos)
    print(f"\nFound {len(projects)} work projects + {len(photos)} photography = {total} total")
    print(f"Local images available: {len(local_files)}")

    # ── Import Work Projects ──
    print(f"\n{'='*60}")
    print(f"IMPORTING {len(projects)} WORK PROJECTS")
    print(f"{'='*60}")

    for i, proj in enumerate(projects):
        print(f"\n[{i+1}/{len(projects)}] {proj['title']} ({proj['year']})")

        image_files = []
        for att_id in proj['att_ids']:
            att = att_map.get(att_id, {})
            local = att.get('local_file', '')
            if local and is_image_file(local):
                image_files.append(local)

        if not image_files:
            keywords = proj['slug'].replace('-', ' ').split()
            for f in sorted(local_files):
                if is_image_file(f) and any(kw.lower() in f.lower() for kw in keywords if len(kw) > 3):
                    image_files.append(f)
            image_files = image_files[:20]

        print(f"  {len(image_files)} images found")

        # Cover
        cover_ref = None
        if proj['thumb_id']:
            att = att_map.get(proj['thumb_id'], {})
            local = att.get('local_file', '')
            if local and is_image_file(local):
                print(f"  ↑ Cover (thumb): {local}")
                cover_ref = upload_image(os.path.join(IMAGE_DIR, local))
                if local in image_files:
                    image_files.remove(local)

        if not cover_ref and image_files:
            print(f"  ↑ Cover: {image_files[0]}")
            cover_ref = upload_image(os.path.join(IMAGE_DIR, image_files[0]))
            image_files = image_files[1:]

        # Gallery
        gallery_refs = []
        for gi, gf in enumerate(image_files[:MAX_GALLERY]):
            print(f"  ↑ Gallery [{gi+1}/{min(len(image_files), MAX_GALLERY)}]: {gf}")
            ref = upload_image(os.path.join(IMAGE_DIR, gf))
            if ref:
                ref['_key'] = f'img_{gi}'
                gallery_refs.append(ref)
            time.sleep(0.05)

        doc = {
            '_type': 'project',
            'title': proj['title'],
            'slug': {'_type': 'slug', 'current': proj['slug']},
            'year': proj['year'],
            'private': False,
            'discipline': ', '.join(proj['categories']),
            'published': True,
            'portfolio': True,
        }
        if proj['description']:
            doc['description'] = [{
                '_type': 'block', '_key': 'desc0', 'style': 'normal', 'markDefs': [],
                'children': [{'_type': 'span', '_key': 's0', 'text': proj['description'], 'marks': []}],
            }]
        if cover_ref:
            doc['coverImage'] = cover_ref
        if gallery_refs:
            doc['gallery'] = gallery_refs

        ok = create_document(doc)
        print(f"  {'✓ Created' if ok else '✗ FAILED'}")
        time.sleep(0.2)

    # ── Import Photography ──
    print(f"\n{'='*60}")
    print(f"IMPORTING {len(photos)} PHOTOGRAPHY POSTS")
    print(f"{'='*60}")

    for i, photo in enumerate(photos):
        print(f"\n[{i+1}/{len(photos)}] {photo['title']} ({photo['year']})")

        image_files = []
        for att_id in photo['att_ids']:
            att = att_map.get(att_id, {})
            local = att.get('local_file', '')
            if local and is_image_file(local):
                image_files.append(local)

        if not image_files:
            keywords = photo['slug'].replace('-', ' ').split()
            for f in sorted(local_files):
                if is_image_file(f) and any(kw.lower() in f.lower() for kw in keywords if len(kw) > 3):
                    image_files.append(f)
            image_files = image_files[:20]

        print(f"  {len(image_files)} images found")

        cover_ref = None
        if image_files:
            print(f"  ↑ Cover: {image_files[0]}")
            cover_ref = upload_image(os.path.join(IMAGE_DIR, image_files[0]))
            image_files = image_files[1:]

        gallery_refs = []
        for gi, gf in enumerate(image_files[:MAX_GALLERY]):
            print(f"  ↑ Gallery [{gi+1}/{min(len(image_files), MAX_GALLERY)}]: {gf}")
            ref = upload_image(os.path.join(IMAGE_DIR, gf))
            if ref:
                ref['_key'] = f'img_{gi}'
                gallery_refs.append(ref)
            time.sleep(0.05)

        doc = {
            '_type': 'photography',
            'title': photo['title'],
            'slug': {'_type': 'slug', 'current': photo['slug']},
            'year': photo['year'],
            'private': False,
            'category': photo['photo_category'],
            'published': True,
            'portfolio': True,
        }
        if cover_ref:
            doc['coverImage'] = cover_ref
        if gallery_refs:
            doc['gallery'] = gallery_refs

        ok = create_document(doc)
        print(f"  {'✓ Created' if ok else '✗ FAILED'}")
        time.sleep(0.2)

    # Final summary
    print(f"\n{'='*60}")
    print("IMPORT COMPLETE")
    print(f"{'='*60}")
    try:
        r = requests.get(
            f'https://{PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/{DATASET}',
            headers=HEADERS,
            params={'query': '{"projects": count(*[_type=="project"]), "photos": count(*[_type=="photography"])}'},
            timeout=10,
        )
        result = r.json().get('result', {})
        print(f"Sanity now has: {result.get('projects', '?')} projects, {result.get('photos', '?')} photography posts")
    except:
        pass
    print("\nYour site will auto-update on next page load (Sanity data replaces sample data).")


if __name__ == '__main__':
    main()

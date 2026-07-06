#!/usr/bin/env python3
"""
Batch importer: WordPress XML → Sanity CMS.
Processes items one at a time. Tracks progress in a JSON file so it can
be re-run safely without creating duplicates.

Usage: python3 scripts/batch_import.py [--type project|photo] [--start N]
"""

import xml.etree.ElementTree as ET
import os, sys, time, mimetypes, json, argparse
import requests

# ── Config ──
PROJECT_ID = 'smatdclo'
DATASET = 'site'
TOKEN = 'skezUJWHdVNM1vRnMjh2LQupCepims3T7x6OxLSNAdx8aRBqloqH1WbW6irAMJZ2HO0hxF0z2JoEwvs2VxJd5r8tQp8OpLL3PCGzfACAMfnJpGxrqjQk8jxFU9PLirYp8YvwWeWqSA45MgHopM3WMG0Qg7jBCudkjo2GRRZJG7AnPPj4yOKV'

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)
IMAGE_DIR = os.path.join(ROOT_DIR, 'assets', 'images')
XML_PATH = os.path.join(ROOT_DIR, 'assets', 'charlieclark.WordPress.2026-07-04.xml')
PROGRESS_FILE = os.path.join(SCRIPT_DIR, 'import_progress.json')

MAX_GALLERY = 12

ASSET_URL = f'https://{PROJECT_ID}.api.sanity.io/v2024-01-01/assets/images/{DATASET}'
MUTATE_URL = f'https://{PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/{DATASET}'
QUERY_URL = f'https://{PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/{DATASET}'
HEADERS = {'Authorization': f'Bearer {TOKEN}'}

ns = {
    'wp': 'http://wordpress.org/export/1.2/',
    'content': 'http://purl.org/rss/1.0/modules/content/',
}


def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {'done_projects': [], 'done_photos': []}


def save_progress(progress):
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f, indent=2)


def upload_image(filepath):
    mime, _ = mimetypes.guess_type(filepath)
    if not mime:
        mime = 'image/jpeg'
    for attempt in range(3):
        try:
            with open(filepath, 'rb') as f:
                resp = requests.post(
                    ASSET_URL,
                    headers={**HEADERS, 'Content-Type': mime},
                    params={'filename': os.path.basename(filepath)},
                    data=f,
                    timeout=180,
                )
            if resp.status_code in (200, 201):
                doc = resp.json().get('document', {})
                aid = doc.get('_id', '')
                if aid:
                    return {'_type': 'image', 'asset': {'_type': 'reference', '_ref': aid}}
            elif resp.status_code == 429:
                print(f"    Rate limited, waiting 5s...")
                time.sleep(5)
                continue
            else:
                print(f"    Upload failed: {resp.status_code}")
                return None
        except requests.Timeout:
            print(f"    Timeout, retrying...")
            time.sleep(2)
            continue
        except Exception as e:
            print(f"    Error: {e}")
            return None
    return None


def create_document(doc):
    resp = requests.post(
        MUTATE_URL,
        headers={**HEADERS, 'Content-Type': 'application/json'},
        json={'mutations': [{'create': doc}]},
        timeout=30,
    )
    return resp.status_code in (200, 201)


def is_image_file(f):
    return os.path.splitext(f)[1].lower() in ('.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff', '.bmp')


def get_existing_titles():
    """Get titles already in Sanity to prevent duplicates."""
    titles = set()
    for doc_type in ['project', 'photography']:
        r = requests.get(QUERY_URL, headers=HEADERS,
            params={'query': f'*[_type=="{doc_type}"].title'}, timeout=10)
        for t in r.json().get('result', []):
            if t:
                titles.add(t)
    return titles


def parse_xml():
    tree = ET.parse(XML_PATH)
    root = tree.getroot()

    local_files = [f for f in os.listdir(IMAGE_DIR) if not f.startswith('.')]
    local_by_wpid = {}
    for f in local_files:
        parts = f.split('_', 2)
        if len(parts) >= 2:
            local_by_wpid.setdefault(parts[1], []).append(f)

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
            photos.append({
                'title': title_text, 'slug': slug, 'year': year or 2020,
                'categories': cats,
                'att_ids': att_ids, 'thumb_id': thumb_id, 'post_id': post_id,
            })

    return projects, photos, att_map, local_files


def import_one_project(proj, att_map, local_files):
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

    cover_ref = None
    if proj['thumb_id']:
        att = att_map.get(proj['thumb_id'], {})
        local = att.get('local_file', '')
        if local and is_image_file(local):
            cover_ref = upload_image(os.path.join(IMAGE_DIR, local))
            if local in image_files:
                image_files.remove(local)

    if not cover_ref and image_files:
        cover_ref = upload_image(os.path.join(IMAGE_DIR, image_files[0]))
        image_files = image_files[1:]

    gallery_refs = []
    for gi, gf in enumerate(image_files[:MAX_GALLERY]):
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
    }
    if proj.get('description'):
        doc['description'] = proj['description']
    if cover_ref:
        doc['coverImage'] = cover_ref
    if gallery_refs:
        doc['gallery'] = gallery_refs

    return create_document(doc), (1 if cover_ref else 0) + len(gallery_refs)


def import_one_photo(photo, att_map, local_files):
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

    cover_ref = None
    if image_files:
        cover_ref = upload_image(os.path.join(IMAGE_DIR, image_files[0]))
        image_files = image_files[1:]

    gallery_refs = []
    for gi, gf in enumerate(image_files[:MAX_GALLERY]):
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
    }
    if cover_ref:
        doc['coverImage'] = cover_ref
    if gallery_refs:
        doc['gallery'] = gallery_refs

    return create_document(doc), (1 if cover_ref else 0) + len(gallery_refs)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--type', choices=['project', 'photo', 'all'], default='all')
    parser.add_argument('--start', type=int, default=0)
    args = parser.parse_args()

    existing_titles = get_existing_titles()
    print(f"Already in Sanity: {len(existing_titles)} items")

    projects, photos, att_map, local_files = parse_xml()
    print(f"XML contains: {len(projects)} projects, {len(photos)} photos")

    if args.type in ('project', 'all'):
        print(f"\n=== PROJECTS ===")
        for i, proj in enumerate(projects):
            if i < args.start and args.type == 'project':
                continue
            if proj['title'] in existing_titles:
                print(f"[{i+1}/{len(projects)}] SKIP (already exists): {proj['title']}")
                continue
            print(f"[{i+1}/{len(projects)}] {proj['title']} ({proj['year']})...")
            ok, img_count = import_one_project(proj, att_map, local_files)
            print(f"  -> {'OK' if ok else 'FAILED'} ({img_count} images)")
            if ok:
                existing_titles.add(proj['title'])
            time.sleep(0.3)

    if args.type in ('photo', 'all'):
        print(f"\n=== PHOTOGRAPHY ===")
        seen = set()
        for i, photo in enumerate(photos):
            if i < args.start and args.type == 'photo':
                continue
            if photo['title'] in existing_titles or photo['title'] in seen:
                print(f"[{i+1}/{len(photos)}] SKIP (duplicate): {photo['title']}")
                continue
            seen.add(photo['title'])
            print(f"[{i+1}/{len(photos)}] {photo['title']} ({photo['year']})...")
            ok, img_count = import_one_photo(photo, att_map, local_files)
            print(f"  -> {'OK' if ok else 'FAILED'} ({img_count} images)")
            if ok:
                existing_titles.add(photo['title'])
            time.sleep(0.3)

    # Final count
    r = requests.get(QUERY_URL, headers=HEADERS,
        params={'query': '{"projects": count(*[_type=="project"]), "photos": count(*[_type=="photography"])}'}, timeout=10)
    result = r.json().get('result', {})
    print(f"\n=== DONE === Sanity now has: {result.get('projects', '?')} projects, {result.get('photos', '?')} photos")


if __name__ == '__main__':
    main()

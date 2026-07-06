#!/usr/bin/env python3
"""
Upload gallery images to existing Sanity documents.
Usage: python3 scripts/upload_galleries_batch.py START END
Processes items START through END (0-indexed). Skips items that already have galleries.
"""
import xml.etree.ElementTree as ET
import os, sys, time, mimetypes, requests, json

TOKEN = 'skezUJWHdVNM1vRnMjh2LQupCepims3T7x6OxLSNAdx8aRBqloqH1WbW6irAMJZ2HO0hxF0z2JoEwvs2VxJd5r8tQp8OpLL3PCGzfACAMfnJpGxrqjQk8jxFU9PLirYp8YvwWeWqSA45MgHopM3WMG0Qg7jBCudkjo2GRRZJG7AnPPj4yOKV'
IMAGE_DIR = 'assets/images'
BASE = 'https://smatdclo.api.sanity.io/v2024-01-01'
HEADERS = {'Authorization': f'Bearer {TOKEN}'}
ns = {'wp': 'http://wordpress.org/export/1.2/'}
MAX_GALLERY = 6

START = int(sys.argv[1]) if len(sys.argv) > 1 else 0
END = int(sys.argv[2]) if len(sys.argv) > 2 else START + 3

def upload_img(path):
    mime, _ = mimetypes.guess_type(path)
    if not mime: mime = 'image/jpeg'
    for attempt in range(3):
        try:
            with open(path, 'rb') as f:
                r = requests.post(f'{BASE}/assets/images/site', headers={**HEADERS, 'Content-Type': mime},
                    params={'filename': os.path.basename(path)}, data=f, timeout=120)
            if r.status_code in (200, 201):
                aid = r.json().get('document', {}).get('_id', '')
                if aid: return {'_type': 'image', 'asset': {'_type': 'reference', '_ref': aid}}
            elif r.status_code == 429:
                time.sleep(5); continue
            else: return None
        except: time.sleep(2); continue
    return None

def patch_gallery(doc_id, gallery_refs):
    r = requests.post(f'{BASE}/data/mutate/site',
        headers={**HEADERS, 'Content-Type': 'application/json'},
        json={'mutations': [{'patch': {'id': doc_id, 'set': {'gallery': gallery_refs}}}]},
        timeout=30)
    return r.status_code in (200, 201)

def is_img(f): return os.path.splitext(f)[1].lower() in ('.jpg', '.jpeg', '.png', '.gif', '.webp')

# Parse XML for attachment mapping
tree = ET.parse('assets/charlieclark.WordPress.2026-07-04.xml')
root = tree.getroot()
local_files = [f for f in os.listdir(IMAGE_DIR) if not f.startswith('.')]
local_by_wpid = {}
for f in local_files:
    parts = f.split('_', 2)
    if len(parts) >= 2: local_by_wpid.setdefault(parts[1], []).append(f)

# Build parent -> attachment files mapping
parent_to_images = {}
for item in root.findall('.//item'):
    pt = item.find('wp:post_type', ns)
    if pt is None or pt.text != 'attachment': continue
    pid = item.find('wp:post_id', ns).text
    par = item.find('wp:post_parent', ns)
    parid = par.text if par is not None else '0'
    if parid == '0': continue
    files = local_by_wpid.get(pid, [])
    for f in files:
        if is_img(f):
            parent_to_images.setdefault(parid, []).append(f)

# Build post_id -> slug mapping from XML
post_slug_map = {}
for item in root.findall('.//item'):
    pid = item.find('wp:post_id', ns).text
    slug_el = item.find('wp:post_name', ns)
    slug = slug_el.text if slug_el is not None else ''
    post_slug_map[pid] = slug

# Get all Sanity docs with their slugs and gallery status
r = requests.get(f'{BASE}/data/query/site', headers=HEADERS,
    params={'query': '*[_type in ["project","photography"]] | order(_type, title) { _id, _type, title, "slug": slug.current, "galleryCount": count(gallery) }'}, timeout=10)
docs = r.json().get('result', [])

# Build slug -> (post_id, images) from XML
slug_to_post = {}
for item in root.findall('.//item'):
    pt = item.find('wp:post_type', ns)
    if pt is None: continue
    pid = item.find('wp:post_id', ns).text
    slug_el = item.find('wp:post_name', ns)
    slug = slug_el.text if slug_el is not None else ''
    if slug:
        slug_to_post[slug] = pid

# Build the work list: docs that need galleries
work_list = []
for doc in docs:
    if (doc.get('galleryCount') or 0) > 0:
        continue  # Already has gallery
    slug = doc.get('slug', '')
    post_id = slug_to_post.get(slug, '')
    images = parent_to_images.get(post_id, [])
    if not images:
        # Try keyword matching as fallback
        kw = slug.replace('-', ' ').split()
        for f in sorted(local_files):
            if is_img(f) and any(k.lower() in f.lower() for k in kw if len(k) > 3):
                images.append(f)
        images = images[:20]
    if images:
        work_list.append({'doc': doc, 'images': sorted(images)[:MAX_GALLERY]})

print(f'{len(work_list)} items need galleries, processing {START}-{END}')

for i, item in enumerate(work_list[START:END], START + 1):
    doc = item['doc']
    images = item['images']
    print(f'[{i}/{len(work_list)}] {doc["title"]} — {len(images)} images', flush=True)

    gallery_refs = []
    for gi, gf in enumerate(images):
        ref = upload_img(os.path.join(IMAGE_DIR, gf))
        if ref:
            ref['_key'] = f'gal_{gi}'
            gallery_refs.append(ref)
        time.sleep(0.05)

    if gallery_refs:
        ok = patch_gallery(doc['_id'], gallery_refs)
        print(f'  -> {"OK" if ok else "FAILED"} ({len(gallery_refs)} uploaded)', flush=True)
    else:
        print(f'  -> no images uploaded', flush=True)
    time.sleep(0.2)

print(f'Batch {START}-{END} done')

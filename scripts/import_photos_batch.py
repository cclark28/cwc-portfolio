#!/usr/bin/env python3
"""Import photography posts in a range. Usage: python3 scripts/import_photos_batch.py START END"""
import xml.etree.ElementTree as ET
import os, sys, time, mimetypes, requests

TOKEN = 'skezUJWHdVNM1vRnMjh2LQupCepims3T7x6OxLSNAdx8aRBqloqH1WbW6irAMJZ2HO0hxF0z2JoEwvs2VxJd5r8tQp8OpLL3PCGzfACAMfnJpGxrqjQk8jxFU9PLirYp8YvwWeWqSA45MgHopM3WMG0Qg7jBCudkjo2GRRZJG7AnPPj4yOKV'
IMAGE_DIR = 'assets/images'
BASE = 'https://smatdclo.api.sanity.io/v2024-01-01'
HEADERS = {'Authorization': f'Bearer {TOKEN}'}
ns = {'wp': 'http://wordpress.org/export/1.2/'}

START = int(sys.argv[1]) if len(sys.argv) > 1 else 0
END = int(sys.argv[2]) if len(sys.argv) > 2 else START + 5

def upload_img(path):
    mime, _ = mimetypes.guess_type(path)
    if not mime: mime = 'image/jpeg'
    with open(path, 'rb') as f:
        r = requests.post(f'{BASE}/assets/images/site', headers={**HEADERS, 'Content-Type': mime},
            params={'filename': os.path.basename(path)}, data=f, timeout=120)
    if r.status_code in (200, 201):
        aid = r.json().get('document', {}).get('_id', '')
        if aid: return {'_type': 'image', 'asset': {'_type': 'reference', '_ref': aid}}
    return None

def create_doc(doc):
    r = requests.post(f'{BASE}/data/mutate/site', headers={**HEADERS, 'Content-Type': 'application/json'},
        json={'mutations': [{'create': doc}]}, timeout=30)
    return r.status_code in (200, 201)

def is_img(f): return os.path.splitext(f)[1].lower() in ('.jpg', '.jpeg', '.png', '.gif', '.webp')

tree = ET.parse('assets/charlieclark.WordPress.2026-07-04.xml')
root = tree.getroot()
local_files = [f for f in os.listdir(IMAGE_DIR) if not f.startswith('.')]
local_by_wpid = {}
for f in local_files:
    parts = f.split('_', 2)
    if len(parts) >= 2: local_by_wpid.setdefault(parts[1], []).append(f)

att_map = {}
parent_to_atts = {}
for item in root.findall('.//item'):
    pt = item.find('wp:post_type', ns)
    if pt is None or pt.text != 'attachment': continue
    pid = item.find('wp:post_id', ns).text
    par = item.find('wp:post_parent', ns)
    parid = par.text if par is not None else '0'
    lm = local_by_wpid.get(pid, [])
    att_map[pid] = {'local_file': lm[0] if lm else ''}
    parent_to_atts.setdefault(parid, []).append(pid)

# Get existing to skip duplicates
r = requests.get(f'{BASE}/data/query/site', headers=HEADERS,
    params={'query': '*[_type=="photography"].title'}, timeout=10)
existing = set(r.json().get('result', []))

photos = []
for item in root.findall('.//item'):
    pt = item.find('wp:post_type', ns)
    if pt is None or pt.text != 'post': continue
    status = item.find('wp:status', ns)
    if status is not None and status.text != 'publish': continue
    cats = [c.text for c in item.findall('category') if c.get('domain') == 'category' and c.text]
    if 'Photography' not in cats: continue
    title = item.find('title')
    tt = title.text if title is not None and title.text else ''
    slug_el = item.find('wp:post_name', ns)
    slug = slug_el.text if slug_el is not None else ''
    pid = item.find('wp:post_id', ns).text
    metas = {}
    for meta in item.findall('wp:postmeta', ns):
        k = meta.find('wp:meta_key', ns); v = meta.find('wp:meta_value', ns)
        if k is not None and v is not None and v.text: metas[k.text] = v.text
    thumb_id = metas.get('_thumbnail_id', '')
    att_ids = parent_to_atts.get(pid, [])
    year = None
    for c in item.findall('category'):
        if c.get('domain') == 'post_tag' and c.text and c.text.isdigit():
            y = int(c.text)
            if 2000 <= y <= 2030: year = y; break
    if not year:
        pd = item.find('wp:post_date', ns)
        if pd is not None and pd.text:
            try: year = int(pd.text[:4])
            except: pass
    photos.append({'title': tt, 'slug': slug, 'year': year or 2020, 'thumb_id': thumb_id, 'att_ids': att_ids})

# Deduplicate by title within the XML itself
seen = set()
unique_photos = []
for p in photos:
    if p['title'] not in seen:
        seen.add(p['title'])
        unique_photos.append(p)
photos = unique_photos

print(f'{len(photos)} unique photos in XML, importing {START}-{END}')

for i, photo in enumerate(photos[START:END], START + 1):
    if photo['title'] in existing:
        print(f'[{i}/{len(photos)}] SKIP: {photo["title"]}'); continue
    print(f'[{i}/{len(photos)}] {photo["title"]} ({photo["year"]})', flush=True)
    cover = None
    if photo['thumb_id']:
        att = att_map.get(photo['thumb_id'], {})
        lf = att.get('local_file', '')
        if lf and is_img(lf):
            cover = upload_img(os.path.join(IMAGE_DIR, lf))
    if not cover:
        for aid in photo['att_ids']:
            att = att_map.get(aid, {})
            lf = att.get('local_file', '')
            if lf and is_img(lf):
                cover = upload_img(os.path.join(IMAGE_DIR, lf)); break
    if not cover:
        kw = photo['slug'].replace('-', ' ').split()
        for f in sorted(local_files):
            if is_img(f) and any(k.lower() in f.lower() for k in kw if len(k) > 3):
                cover = upload_img(os.path.join(IMAGE_DIR, f)); break
    doc = {'_type': 'photography', 'title': photo['title'],
           'slug': {'_type': 'slug', 'current': photo['slug']},
           'year': photo['year'], 'private': False}
    if cover: doc['coverImage'] = cover
    ok = create_doc(doc)
    print(f'  -> {"OK" if ok else "FAILED"} (cover:{"yes" if cover else "no"})', flush=True)
    if ok: existing.add(photo['title'])
    time.sleep(0.2)

print(f'Batch {START}-{END} done')

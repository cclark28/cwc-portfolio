// Shared project data for CWC Pages (desktop canvas) and CWC Pages Mobile.
// Plain ES module — import via dynamic import() from a DC logic class.

export const MIN_YEAR = 2011, MAX_YEAR = 2025;

export function sizeAndDepth(year) {
  const t = Math.max(0, Math.min(1, (year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)));
  const w = Math.round(130 + t * 130);
  const h = Math.round(w * 9 / 16);
  const opacity = 0.68 + t * 0.32;
  const gray = Math.round((1 - t) * 35);
  const labelColor = t > 0.6 ? '#18181B' : (t > 0.3 ? '#58565D' : '#9B9AA0');
  const shadow = t > 0.65 ? '0 12px 26px rgba(24,24,27,0.18)' : 'none';
  const z = Math.round(t * 100);
  return { w, h, opacity, gray, labelColor, shadow, z, t };
}

export const WORK_RAW = [
  { id:'terminus', title:'Terminus Software, Inc.', year:2024, tags:'Brand, Design, Web, Strategy', client:'Terminus / DemandScience', role:'Brand Designer, Sr. Creative Designer', desc:"Brand and creative work for the original account-based marketing platform, trusted by teams at Gainsight, Roche, and Dow Jones. Led a full brand refresh, then carried it through advertising, ebooks, trade show environments, and a site-wide style system.", private:false },
  { id:'gungeon', title:'Enter the Gungeon — House of the Gundead', year:2021, tags:'Arcade Cabinet Design', client:'Griffin Aerotech, with Devolver Digital & Dodge Roll', role:'Cabinet Artwork Design', desc:"Working from a layered file supplied by artist Max Grecke, designed the marquee, side panels, control board, glass splash, and kick panels for a full-scale arcade cabinet built around the Gungeon universe.", private:false },
  { id:'asian-art', title:'Asian Art Museum San Francisco', year:2013, tags:'Campaign, Print Design, Web Design', client:'Asian Art Museum', role:'Designer, via JVST', desc:"Interactive city-wide campaign for the 2013 Terracotta Warriors exhibit — posters in a lost \u201cHan purple\u201d pigment, bus wraps, building banners, and a missing-warrior microsite tracked via a #lostwarrior social hunt.", private:false },
  { id:'delivra', title:'Delivra', year:2022, tags:'Art Direction', client:'Delivra', role:'Art Direction', desc:"Rebrand and site redesign for an Indianapolis email-marketing company — new speech-bubble logo mark, brighter palette, and a full brand guide alongside copywriter Shari Finell.", private:false },
  { id:'ronin', title:'R\u00f3nin Tactics', year:2020, tags:'E-commerce, Website Redesign', client:'R\u00f3nin Tactics', role:'Web Design', desc:"Website redesign and e-commerce build-out for the tactical apparel brand.", private:false },
  { id:'jlo', title:'JLO', year:2018, tags:'Web Design', client:'Capitol Records (pitch)', role:'Web Design', desc:"An unreleased web design pitch built for a Capitol Records project — kept private per the pitch agreement.", private:true },
  { id:'blend', title:'Blend Creative Team', year:2017, tags:'Art Direction, Branding, Design, Photography', client:'Blend Creative', role:'Art Direction', desc:"Brand and photography direction for an in-house creative team.", private:false },
  { id:'pokedex', title:'Pok\u00e9dex 3D Pro', year:2013, tags:'Web Design', client:'Nintendo / The Pok\u00e9mon Company', role:'Web Design', desc:"Companion microsite for the Pok\u00e9dex 3D Pro Nintendo 3DS title.", private:false },
  { id:'pokemon-bw2', title:'Pok\u00e9mon Black & White v2', year:2012, tags:'Web Design', client:'Nintendo / The Pok\u00e9mon Company', role:'Web Design', desc:"Launch microsite for the Black & White version 2 titles.", private:false },
  { id:'pokemon-rumble', title:'Pok\u00e9mon Rumble Blast', year:2011, tags:'Web Design', client:'Nintendo / The Pok\u00e9mon Company', role:'Web Design', desc:"Launch site for the Rumble Blast 3DS title.", private:false },
  { id:'wargaming', title:'Wargaming', year:2015, tags:'Branding, Illustration, Print, Web Design', client:'Wargaming (World of Tanks)', role:'Designer', desc:"Branding and campaign design for the World of Tanks franchise.", private:false },
  { id:'fieldcraft', title:'FieldCraft Survival', year:2023, tags:'Art Direction, Branding, Design, E-commerce', client:'FieldCraft Survival', role:'Art Direction', desc:"Full brand and e-commerce direction for a survival-gear retailer.", private:false },
  { id:'skyfeeder', title:'Skyfeeder', year:2016, tags:'Design, Illustration, Mobile Game Design', client:'Skyfeeder', role:'Design, Illustration', desc:"Illustration and UI design for a mobile game.", private:false },
  { id:'skycurser', title:'SKYCURSER', year:2014, tags:'Logo Design, Product Design, Web Design', client:'SKYCURSER', role:'Logo, Product, Web Design', desc:"Logo design and product site for SKYCURSER.", private:false }
];

export const PHOTO_RAW = [
  { id:'pixies', title:'Pixies — Live', year:2023, tags:'Personal · 35mm', client:'—', role:'Photography', desc:"Pit-side coverage from a club date.", private:false },
  { id:'warpaint', title:'Warpaint — Live', year:2022, tags:'Personal · 35mm', client:'—', role:'Photography', desc:"Low-light coverage from a Warpaint set.", private:false },
  { id:'yolatengo', title:'Yo La Tengo — Live', year:2021, tags:'Personal · 35mm', client:'—', role:'Photography', desc:"A quiet, feedback-heavy set caught on film.", private:false },
  { id:'huey', title:'American Huey Museum', year:2019, tags:'Personal', client:'—', role:'Photography', desc:"Aircraft and archive shots from the museum's collection.", private:false },
  { id:'jamie-rose', title:'Jamie Rose', year:2020, tags:'Personal · Portrait', client:'—', role:'Photography', desc:"A portrait session shot in available light.", private:false },
  { id:'sarah-green', title:'Sarah Green', year:2019, tags:'Personal · Portrait', client:'—', role:'Photography', desc:"Portrait series, natural light.", private:false },
  { id:'botwin', title:'Botwin', year:2018, tags:'Personal · Portrait', client:'—', role:'Photography', desc:"A single-subject portrait study.", private:false },
  { id:'ritz-theatre', title:'Ritz Theatre', year:2021, tags:'Personal · Architecture', client:'—', role:'Photography', desc:"Interior and marquee shots of a historic theatre.", private:false },
  { id:'lugar-plaza', title:'Lugar Plaza', year:2019, tags:'Personal · Architecture', client:'—', role:'Photography', desc:"Downtown Indianapolis, early morning light.", private:false },
  { id:'wright-patterson', title:'Wright-Patterson Airbase', year:2019, tags:'Personal · Aviation', client:'—', role:'Photography', desc:"Aircraft on display at the airbase.", private:false },
  { id:'okinawa', title:'Okinawa Americana', year:2017, tags:'Personal · Travel', client:'—', role:'Photography', desc:"Street scenes from Okinawa.", private:false },
  { id:'tu-lam', title:'TU LAM', year:2016, tags:'Personal · Portrait', client:'—', role:'Photography', desc:"A portrait shot on location.", private:false },
  { id:'reid-medical', title:'Reid Medical Center', year:2015, tags:'Personal · Architecture', client:'—', role:'Photography', desc:"Facility photography, exterior and lobby.", private:false }
];

function withSize(list, category) {
  return list.map(p => Object.assign({}, p, sizeAndDepth(p.year), { category }));
}

export const WORK = withSize(WORK_RAW, 'work');
export const PHOTO = withSize(PHOTO_RAW, 'photo');
export const PROJECTS = WORK.concat(PHOTO);

export function groupByYear(list) {
  const years = {};
  list.forEach(p => { (years[p.year] = years[p.year] || []).push(p); });
  return Object.keys(years).map(Number).sort((a, b) => b - a).map(y => ({ year: y, items: years[y] }));
}

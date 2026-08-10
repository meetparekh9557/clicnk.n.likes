// Shared schema.org knowledge for the two schema tools (Schema Generator,
// Schema Validator & Score), so the generator's output fields and the
// validator's required-property checklist can never quietly drift apart.
// Required/recommended lists follow Google Search Central's own documented
// structured-data requirements for each type, not an invented standard.

export const SCHEMA_TYPES = [
  { type: 'Organization', label: 'Organization' },
  { type: 'LocalBusiness', label: 'Local Business' },
  { type: 'Article', label: 'Article / Blog Post' },
  { type: 'Product', label: 'Product' },
  { type: 'FAQPage', label: 'FAQ Page' },
  { type: 'HowTo', label: 'How-To' },
];

// required: property must be present. oneOf: at least one of this group
// must be present (Google accepts any one for Product rich results).
export const SCHEMA_RULES = {
  Organization: { required: ['name', 'url'], recommended: ['logo', 'description', 'contactPoint', 'sameAs'] },
  LocalBusiness: { required: ['name', 'address'], recommended: ['telephone', 'openingHoursSpecification', 'image', 'priceRange', 'geo'] },
  Article: { required: ['headline', 'image', 'datePublished', 'author'], recommended: ['dateModified', 'publisher', 'description'] },
  BlogPosting: { required: ['headline', 'image', 'datePublished', 'author'], recommended: ['dateModified', 'publisher', 'description'] },
  Product: { required: ['name'], recommended: ['image', 'description', 'brand'], oneOf: ['offers', 'review', 'aggregateRating'] },
  FAQPage: { required: ['mainEntity'], recommended: [] },
  HowTo: { required: ['name', 'step'], recommended: ['description', 'totalTime'] },
  BreadcrumbList: { required: ['itemListElement'], recommended: [] },
  Review: { required: ['reviewRating', 'author'], recommended: ['itemReviewed'] },
  Event: { required: ['name', 'startDate', 'location'], recommended: ['endDate', 'offers', 'image'] },
};

// Plain-English cost of a type being entirely absent from a page. This is
// the translation layer every competitor tool skips: they name the missing
// property, we say what it actually costs a business owner who has never
// heard of JSON-LD.
export const TYPE_MISSING_COST = {
  Organization: 'Nothing tells Google or AI answer engines who you actually are, the foundation every other schema type and most AI citations build on.',
  LocalBusiness: "You are not eligible for Google's local pack or Maps results, no matter how good your actual local SEO is.",
  Article: 'Your posts show as a plain blue link in search instead of a card with a thumbnail and byline, and AI answer engines have less to work with when deciding whether to cite you.',
  Product: 'No star rating, price or availability can show directly in your search result, even if the page itself has real reviews and pricing.',
  FAQPage: 'You forfeit the expandable FAQ dropdown in search, one of the easiest ways to make a listing physically larger without paying for ads.',
  HowTo: 'You forfeit the step-by-step rich result in search for a page that is already structured as steps.',
};

// Plain-English cost of one missing property on a type that does exist.
export const PROP_COST = {
  address: 'without it you are invisible in "near me" searches, the single highest-intent local query type',
  telephone: 'click-to-call in the search result requires this field specifically',
  image: 'Google will not grant the rich result at all without it, however complete the rest of the markup is',
  datePublished: 'both Google and AI answer engines use this to judge freshness before citing you',
  dateModified: 'signals the content is actively maintained, which AI answer engines weight when picking a source to cite',
  author: 'part of the E-E-A-T signal Google associates with the Article rich result',
  publisher: 'ties the content to a real, named organisation rather than an anonymous byline',
  logo: "shows next to your name in Google's Knowledge Panel and in AI citations",
  sameAs: 'the strongest signal tying your website to your real social profiles, which AI answer engines cross-reference before citing a business',
  priceRange: 'shown directly in the local pack alongside your listing',
  openingHoursSpecification: 'shown directly in the local pack; without it Google shows "Hours unknown" next to your listing',
  geo: 'improves distance-based ranking specifically for "near me" searches',
  brand: 'ties the product to a recognisable name instead of a generic listing',
  description: 'gives Google and AI engines real context instead of guessing from surrounding text',
  contactPoint: 'lets Google surface a verified contact method directly in search and AI answers',
  mainEntity: 'the FAQ dropdown cannot render without at least one question/answer pair',
  step: 'the HowTo rich result cannot render without at least one step',
  'one of: offers, review, aggregateRating': 'at least one is required for any product rich result (price, a review, or a star rating)',
};

export function propCost(prop) {
  return PROP_COST[prop] || 'a required field for this rich result to be eligible at all';
}

export function hasProp(obj, prop) {
  if (obj == null || typeof obj !== 'object') return false;
  const v = obj[prop];
  if (v === undefined || v === null) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'string') return v.trim().length > 0;
  if (typeof v === 'object') return Object.keys(v).length > 0;
  return true;
}

// Scores one parsed JSON-LD object against SCHEMA_RULES. Shared by the
// paste-your-code path and the live-URL path so the two can never quietly
// score the same markup differently.
export function scoreSchemaObject(obj) {
  const type = Array.isArray(obj['@type']) ? obj['@type'][0] : obj['@type'];
  const rule = SCHEMA_RULES[type];
  if (!rule) return { type: type || 'Unknown', known: false, pct: null, requiredMissing: [], recommendedMissing: [] };
  const requiredMissing = rule.required.filter((p) => !hasProp(obj, p));
  const oneOfOk = !rule.oneOf || rule.oneOf.some((p) => hasProp(obj, p));
  const recommendedMissing = rule.recommended.filter((p) => !hasProp(obj, p));
  const reqTotal = rule.required.length + (rule.oneOf ? 1 : 0);
  const reqFound = (rule.required.length - requiredMissing.length) + (rule.oneOf ? (oneOfOk ? 1 : 0) : 0);
  const recTotal = rule.recommended.length;
  const recFound = recTotal - recommendedMissing.length;
  const pct = Math.round((reqTotal ? (reqFound / reqTotal) * 70 : 70) + (recTotal ? (recFound / recTotal) * 30 : 30));
  if (!oneOfOk) requiredMissing.push(`one of: ${rule.oneOf.join(', ')}`);
  return { type, known: true, pct, requiredMissing, recommendedMissing, object: obj };
}

// Scores every detected object and rolls up an overall 0-100 completeness
// score. `presentTypes` (from the caller) plus GENERATABLE_TYPES below
// decides which of our six generatable types are entirely absent, each
// carrying its own TYPE_MISSING_COST rather than just an empty checklist.
export const GENERATABLE_TYPES = ['Organization', 'LocalBusiness', 'Article', 'Product', 'FAQPage', 'HowTo'];

// Parses pasted JSON-LD (either raw JSON, or HTML containing one or more
// <script type="application/ld+json"> blocks) into a flat list of objects.
// Mirrors the live-URL parsing in apps-script.gs's extractFacts_ so pasted
// and live-fetched markup score identically.
export function parseJsonLdBlocks(text) {
  const blocks = [];
  const scriptRe = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m, found = false;
  while ((m = scriptRe.exec(text)) !== null) { found = true; blocks.push(m[1]); }
  if (!found) blocks.push(text);
  const objs = [];
  const errors = [];
  blocks.forEach((b) => {
    const t = b.trim();
    if (!t) return;
    try {
      const parsed = JSON.parse(t);
      const arr = Array.isArray(parsed) ? parsed : (parsed['@graph'] ? parsed['@graph'] : [parsed]);
      arr.forEach((o) => { if (o && typeof o === 'object') objs.push(o); });
    } catch (e) {
      errors.push(e.message);
    }
  });
  return { objs, errors };
}

// Best-effort extraction of shared business identity fields from whichever
// Organization/LocalBusiness object is already on a page, so the generator
// can pre-fill from real, self-published data instead of a blank form.
export function bizFromSchema(objs) {
  const org = (objs || []).find((o) => {
    const t = Array.isArray(o['@type']) ? o['@type'][0] : o['@type'];
    return t === 'Organization' || t === 'LocalBusiness';
  });
  if (!org) return null;
  const addr = (org.address && typeof org.address === 'object') ? org.address : {};
  const logo = typeof org.logo === 'string' ? org.logo : (org.logo && org.logo.url) || org.image || '';
  const phone = org.telephone || (org.contactPoint && org.contactPoint.telephone) || '';
  return {
    name: org.name || '',
    url: org.url || '',
    phone,
    logo,
    street: addr.streetAddress || '',
    city: addr.addressLocality || '',
    region: addr.addressRegion || '',
    postalCode: addr.postalCode || '',
    country: addr.addressCountry || '',
    sameAs: Array.isArray(org.sameAs) ? org.sameAs.join(', ') : (org.sameAs || ''),
  };
}

export function scoreSchemaObjects(objs) {
  const results = (objs || []).map(scoreSchemaObject);
  const presentTypes = results.map((r) => r.type);
  const missingTypes = GENERATABLE_TYPES.filter((t) => !presentTypes.includes(t));
  const knownResults = results.filter((r) => r.known);
  const overall = results.length
    ? Math.round(results.reduce((s, r) => s + (r.known ? r.pct : 60), 0) / results.length)
    : 0;
  return { results, knownResults, presentTypes, missingTypes, overall, hasAny: results.length > 0 };
}

// Builds a valid JSON-LD object from the Schema Generator's flat field
// values. `f` is the raw form values object for the chosen type.
export function buildJsonLd(type, f) {
  const clean = (s) => (s || '').trim();
  const list = (s) => clean(s).split(',').map((x) => x.trim()).filter(Boolean);

  if (type === 'Organization') {
    const o = { '@context': 'https://schema.org', '@type': 'Organization', name: clean(f.name), url: clean(f.url) };
    if (clean(f.logo)) o.logo = clean(f.logo);
    if (clean(f.description)) o.description = clean(f.description);
    if (clean(f.phone) || clean(f.email)) {
      o.contactPoint = { '@type': 'ContactPoint', contactType: 'customer service' };
      if (clean(f.phone)) o.contactPoint.telephone = clean(f.phone);
      if (clean(f.email)) o.contactPoint.email = clean(f.email);
    }
    if (list(f.sameAs).length) o.sameAs = list(f.sameAs);
    return o;
  }

  if (type === 'LocalBusiness') {
    const o = { '@context': 'https://schema.org', '@type': 'LocalBusiness', name: clean(f.name) };
    if (clean(f.url)) o.url = clean(f.url);
    if (clean(f.image)) o.image = clean(f.image);
    if (clean(f.description)) o.description = clean(f.description);
    if (clean(f.phone)) o.telephone = clean(f.phone);
    if (clean(f.priceRange)) o.priceRange = clean(f.priceRange);
    o.address = {
      '@type': 'PostalAddress',
      streetAddress: clean(f.street),
      addressLocality: clean(f.city),
      addressRegion: clean(f.region),
      postalCode: clean(f.postalCode),
      addressCountry: clean(f.country),
    };
    if (clean(f.hours)) {
      o.openingHoursSpecification = list(f.hours).map((h) => ({ '@type': 'OpeningHoursSpecification', description: h }));
    }
    if (list(f.sameAs).length) o.sameAs = list(f.sameAs);
    return o;
  }

  if (type === 'Article') {
    const o = {
      '@context': 'https://schema.org', '@type': 'Article',
      headline: clean(f.headline), datePublished: clean(f.datePublished),
    };
    if (clean(f.image)) o.image = clean(f.image);
    if (clean(f.dateModified)) o.dateModified = clean(f.dateModified);
    if (clean(f.description)) o.description = clean(f.description);
    if (clean(f.authorName)) o.author = { '@type': 'Person', name: clean(f.authorName) };
    if (clean(f.publisherName)) {
      o.publisher = { '@type': 'Organization', name: clean(f.publisherName) };
      if (clean(f.publisherLogo)) o.publisher.logo = { '@type': 'ImageObject', url: clean(f.publisherLogo) };
    }
    return o;
  }

  if (type === 'Product') {
    const o = { '@context': 'https://schema.org', '@type': 'Product', name: clean(f.name) };
    if (clean(f.image)) o.image = clean(f.image);
    if (clean(f.description)) o.description = clean(f.description);
    if (clean(f.brand)) o.brand = { '@type': 'Brand', name: clean(f.brand) };
    if (clean(f.sku)) o.sku = clean(f.sku);
    if (clean(f.price)) {
      o.offers = {
        '@type': 'Offer', price: clean(f.price), priceCurrency: clean(f.priceCurrency) || 'INR',
        availability: `https://schema.org/${clean(f.availability) || 'InStock'}`,
      };
    }
    if (clean(f.ratingValue) && clean(f.reviewCount)) {
      o.aggregateRating = { '@type': 'AggregateRating', ratingValue: clean(f.ratingValue), reviewCount: clean(f.reviewCount) };
    }
    return o;
  }

  if (type === 'FAQPage') {
    const qas = (f.qas || []).filter((q) => clean(q.q) && clean(q.a));
    return {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: qas.map((q) => ({
        '@type': 'Question', name: clean(q.q),
        acceptedAnswer: { '@type': 'Answer', text: clean(q.a) },
      })),
    };
  }

  if (type === 'HowTo') {
    const steps = (f.steps || []).filter((s) => clean(s.name));
    const o = {
      '@context': 'https://schema.org', '@type': 'HowTo', name: clean(f.name),
      step: steps.map((s) => ({ '@type': 'HowToStep', name: clean(s.name), text: clean(s.text) || clean(s.name) })),
    };
    if (clean(f.description)) o.description = clean(f.description);
    if (clean(f.totalTime)) o.totalTime = clean(f.totalTime);
    return o;
  }

  return { '@context': 'https://schema.org', '@type': type };
}

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

export function hasProp(obj, prop) {
  if (obj == null || typeof obj !== 'object') return false;
  const v = obj[prop];
  if (v === undefined || v === null) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'string') return v.trim().length > 0;
  if (typeof v === 'object') return Object.keys(v).length > 0;
  return true;
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

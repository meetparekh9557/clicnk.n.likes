// Real clients (logos live in public/clients/). Names are used only for
// alt text and ordering - they are NOT shown on the page. The mix spans
// film, legal, marine automation, manufacturing, apparel, jewellery,
// F&B, real estate and more: the proof that Click.n.likes is multi-
// industry, not local/D2C only.
export interface Client {
  slug: string;
  name: string;
}

export const clients: Client[] = [
  { slug: 'aidbylaw', name: 'AidbyLaw' },
  { slug: 'aquamarine-automation', name: 'Aqua Marine Automation' },
  { slug: 'hamprigo', name: 'Hamprigo Industries' },
  { slug: 'adamas-films', name: 'Adamas Films' },
  { slug: 'kopa-seamless', name: 'Kopa Seamless' },
  { slug: 'linear-grid-atelier', name: 'Linear Grid Atelier' },
  { slug: 'lumagreens', name: 'LumaGreens Solutions' },
  { slug: 'momento', name: 'Momento' },
  { slug: 'ramat-home', name: 'Ramat Home' },
  { slug: 'tikasaheb', name: 'Tikasaheb' },
  { slug: 'label-tiksh', name: 'Tiksh' },
  { slug: 'hettees', name: 'Hettees' },
  { slug: 'gala-glitzz', name: 'Gala Glitzz' },
  { slug: 'house-of-shril', name: 'House of Shril' },
  { slug: 'vaishali-jewelers', name: 'Vaishali Jewellers' },
];

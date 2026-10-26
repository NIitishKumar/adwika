import { Product } from '@/types';

export const PRODUCTS: Product[] = [
  // CO-ORDS
  {
    id: 'the-gulab-set',
    name: 'The Gulab Set',
    subtitle: 'SILK · ROSE',
    category: 'CO-ORDS',
    priceINR: 12800,
    priceUSD: 155,
    image: '/images/gulab-set.jpg',
    secondaryImage: '/images/women-collection.jpg',
    description: 'A pale rose coordinate in fluid mulberry silk crepe. Cut with relaxed proportions, inverted pleating, and hand-finished blind hems.',
    craftDetails: [
      '100% Pure Mulberry Silk Crepe de Chine',
      'Artisanal hand-pleating and internal French seams',
      'Mother-of-pearl buttons crafted from river shells',
      'Wide-leg fluid silhouette with concealed side pockets'
    ],
    fabric: 'Pure Mulberry Silk',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    isNew: true,
    featured: true
  },
  {
    id: 'the-noor-coord',
    name: 'The Noor Co-ord',
    subtitle: 'CHANDERI · ECRU',
    category: 'CO-ORDS',
    priceINR: 11400,
    priceUSD: 137,
    image: '/images/noor-coord.jpg',
    secondaryImage: '/images/women-collection.jpg',
    description: 'Ethereal ecru coordinates combining lightweight Chanderi with delicate ton-sur-ton cord work along cuffs and hemlines.',
    craftDetails: [
      'Pure Chanderi Silk with sheer handloom finish',
      'Lined in featherweight organic mulmul cotton',
      'Tonal cord work with whisper-soft metallic accents',
      'Includes wrap top and pleated wide trousers'
    ],
    fabric: 'Pure Chanderi Silk & Mulmul',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    isNew: true,
    featured: true
  },
  {
    id: 'the-mehr-drape',
    name: 'The Mehr Drape Set',
    subtitle: 'TEXTURED SILK · RUST',
    category: 'CO-ORDS',
    priceINR: 14200,
    priceUSD: 170,
    image: '/images/mehr-drape.jpg',
    secondaryImage: '/images/occasionwear-collection.jpg',
    description: 'An ode to autumnal evenings, featuring rich rust textured matka silk draped into sculpted folds that contour naturally over the body.',
    craftDetails: [
      '100% Handloom Matka Silk in terracotta rust',
      'Sculptural cowl fall with internal stay support',
      'Hand-twisted fringe details along the hemline',
      'Specialist dry clean to preserve natural texture'
    ],
    fabric: 'Bhagalpuri Matka Silk',
    sizes: ['S', 'M', 'L'],
    isNew: true,
    featured: true
  },

  // KURTIS
  {
    id: 'the-aangan-kurta',
    name: 'The Aangan Kurti',
    subtitle: 'COTTON SILK · OLIVE',
    category: 'KURTIS',
    priceINR: 9600,
    priceUSD: 115,
    image: '/images/aangan-kurta.jpg',
    secondaryImage: '/images/craft-detail-collection.jpg',
    description: 'An architectural everyday silhouette cut from airy olive cotton-silk handloom, featuring tailored plackets and soft structural drape.',
    craftDetails: [
      'Handloom Cotton-Silk woven in Maheshwar',
      'Naturally vegetable-dyed olive hue',
      'Concealed placket with hand-sewn bar tacks',
      'Deep side slits engineered for effortless ease'
    ],
    fabric: 'Maheshwari Cotton Silk',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    isNew: true,
    featured: true
  },
  {
    id: 'adw-01',
    name: 'Sandstone Chanderi Angrakha Kurti',
    subtitle: 'HAND-PLEATED · ANTIQUE GOLD ZARI',
    category: 'KURTIS',
    priceINR: 38500,
    priceUSD: 460,
    image: '/images/women-collection.jpg',
    description: 'An architectural silhouette rooted in historic Rajputana cuts, reimagined with minimal lines and breathable handspun Chanderi silk. Features soft earthen tones and a sculptural drape.',
    craftDetails: [
      'Handspun Chanderi silk with woven zari border',
      'Artisanal hand-pleating by master craftsmen in Chanderi',
      'Subtle brass button closures crafted in Jaipur',
      'Lined in pure mulmul cotton for seamless comfort'
    ],
    fabric: 'Pure Chanderi Silk & Mulmul Cotton',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    isNew: false,
    featured: true
  },
  {
    id: 'adw-04',
    name: 'Ivory Raw Silk Trench Kurti',
    subtitle: 'DOUBLE-BREASTED · TUSSAR WEAVE',
    category: 'KURTIS',
    priceINR: 32000,
    priceUSD: 385,
    image: '/images/women-collection.jpg',
    description: 'Where modern tailoring meets Indian handloom heritage. Structured shoulders soften into fluid drape panels, cinched with a matching fabric obi belt.',
    craftDetails: [
      '100% wild tussar silk spun by hand in Bhagalpur',
      'Hand-carved horn buttons made sustainably in Uttar Pradesh',
      'Tailored welt pockets and deep storm flap detailing',
      'Natural ecru dye with zero harsh chemical bleaching'
    ],
    fabric: 'Bhagalpuri Tussar Raw Silk',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    isNew: false,
    featured: false
  },

  // SUITS
  {
    id: 'adw-02',
    name: 'Alabaster Greige Anarkali Suit',
    subtitle: 'KASHMIRI NEEDLEWORK · HAMMERED SILK',
    category: 'SUITS',
    priceINR: 89000,
    priceUSD: 1060,
    image: '/images/occasionwear-collection.jpg',
    description: 'A whisper-light modern heirloom designed for quiet celebrations. Cut in soft greige silk with delicate tone-on-tone flora embroidery that catches daylight with ethereal grace.',
    craftDetails: [
      'Over 180 hours of hand-embroidery by Kashmiri artisans',
      'Hammered raw silk with micro-sequin illumination',
      'Contemporary paneled skirt with concealed side pockets',
      'Includes gossamer organza dupatta with scalloped borders'
    ],
    fabric: 'Hammered Raw Silk & Gossamer Organza',
    sizes: ['XS', 'S', 'M', 'L'],
    isNew: true,
    featured: true
  },
  {
    id: 'adw-05',
    name: 'Zardozi Midnight Velvet Sharara Suit',
    subtitle: 'CHARCOAL SILK VELVET · WIRE EMBROIDERY',
    category: 'SUITS',
    priceINR: 76000,
    priceUSD: 910,
    image: '/images/occasionwear-collection.jpg',
    description: 'Designed for the modern nocturnal affair. Cut from plush silk velvet with delicate geometry crafted in hand-beaded dabka and nakshi threads.',
    craftDetails: [
      'Fine Italian silk velvet with deep matte luster',
      'Real silver and gold electroplated dabka bullion wire',
      'High-waisted pleated flared trouser silhouette',
      'Tailored internal boning for seamless drape'
    ],
    fabric: 'Silk Velvet & Georgette',
    sizes: ['XS', 'S', 'M', 'L'],
    isNew: false,
    featured: false
  },

  // SHIRTS
  {
    id: 'adw-03',
    name: 'Sage Zari Handloom Silk Shirt',
    subtitle: 'TEXTURED OLIVE SILK · MARODI CORD',
    category: 'SHIRTS',
    priceINR: 24000,
    priceUSD: 290,
    image: '/images/craft-detail-collection.jpg',
    description: 'A relaxed tailored shirt silhouette cut from hand-woven Maheshwari silk with subtle metallic thread borders and inverted back pleats.',
    craftDetails: [
      'Hand-woven on pit looms in Maheshwar',
      'Marodi cord embroidery in antique gold wire',
      'Mother-of-pearl buttons crafted from river shells',
      'Relaxed dropped shoulder fit'
    ],
    fabric: 'Hand-woven Maheshwari Silk & Zari Cord',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    isNew: true,
    featured: true
  },
  {
    id: 'adw-07',
    name: 'Ecru Tussar Tailored Minimal Shirt',
    subtitle: 'ORGANIC WILD SILK · CONCEALED PLACKET',
    category: 'SHIRTS',
    priceINR: 19500,
    priceUSD: 235,
    image: '/images/editorial-details-tall.jpg',
    description: 'A crisp, breathable wardrobe foundation crafted from untreated wild tussar silk, designed with clean architectural lines.',
    craftDetails: [
      '100% wild tussar silk spun in Bhagalpur',
      'French seams throughout for exceptional longevity',
      'Minimal band collar with concealed front closure',
      'Artisanal hand-spun slub texture'
    ],
    fabric: 'Pure Bhagalpuri Tussar Silk',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    isNew: true,
    featured: false
  },

  // SAREES (COMING SOON)
  {
    id: 'saree-01',
    name: 'Ivory Hand-Embroidered Zari Saree',
    subtitle: 'HANDLOOM SILK · GOLD ZARI MOTIFS',
    category: 'SAREES',
    priceINR: 52000,
    priceUSD: 625,
    image: '/images/hero-user.jpg',
    secondaryImage: '/images/hero-ivory-saree.jpg',
    description: 'An ethereal drape in featherweight handloom silk adorned with handcrafted floral borders and whisper-thin antique zari borders. Currently in atelier production.',
    craftDetails: [
      'Hand-woven on traditional pit looms over 45 days',
      'Delicate micro-sequin illumination along the pallu',
      'Includes unstitched pure silk blouse piece',
      'Arriving Winter 2026'
    ],
    fabric: 'Chanderi Handloom Silk & Zari',
    sizes: ['S'],
    isNew: true,
    featured: true,
    comingSoon: true
  },
  {
    id: 'saree-02',
    name: 'Kalamkari Hand-Painted Silk Saree',
    subtitle: 'NATURAL INDIGO & MADDER ROOT ON MUGA',
    category: 'SAREES',
    priceINR: 64000,
    priceUSD: 770,
    image: '/images/craft-detail-collection.jpg',
    secondaryImage: '/images/hero-cinematic.jpg',
    description: 'An heirloom art piece created by Srikalahasti artisans using bamboo kalam pens and natural organic river dyes. Currently in atelier production.',
    craftDetails: [
      'Traditional 23-step Srikalahasti kalamkari technique',
      'Organic dyes made of pomegranate rind, indigo and iron',
      'Hand-rolled silk hems and certified GI craft certification',
      'Arriving Winter 2026'
    ],
    fabric: 'Assam Muga Wild Silk',
    sizes: ['S'],
    isNew: true,
    featured: false,
    comingSoon: true
  }
];

export const REGIONS = [
  { country: 'India', currency: 'INR' as const, symbol: '₹', label: 'India · INR (₹)' },
  { country: 'United States', currency: 'USD' as const, symbol: '$', label: 'United States · USD ($)' },
  { country: 'United Kingdom', currency: 'GBP' as const, symbol: '£', label: 'United Kingdom · GBP (£)' },
  { country: 'Europe', currency: 'EUR' as const, symbol: '€', label: 'European Union · EUR (€)' },
  { country: 'UAE', currency: 'AED' as const, symbol: 'AED', label: 'United Arab Emirates · AED (د.إ)' },
];

export const CURRENCY_RATES = {
  INR: { code: 'INR' as const, symbol: '₹', rateFromINR: 1, label: 'INR' },
  USD: { code: 'USD' as const, symbol: '$', rateFromINR: 0.012, label: 'USD' },
  GBP: { code: 'GBP' as const, symbol: '£', rateFromINR: 0.0095, label: 'GBP' },
  EUR: { code: 'EUR' as const, symbol: '€', rateFromINR: 0.011, label: 'EUR' },
  AED: { code: 'AED' as const, symbol: 'AED ', rateFromINR: 0.044, label: 'AED' },
};

// Practice Areas
export const PRACTICE_AREAS = [
  {
    id: 'estate-planning',
    name: 'Estate Planning & Probate',
    keywords: ['estate planning', 'wills', 'trusts', 'probate', 'inheritance', 'beneficiaries']
  },
  {
    id: 'trust-litigation',
    name: 'Trust Litigation',
    keywords: ['trust disputes', 'trust litigation', 'fiduciary duties', 'breach of trust', 'trustee removal']
  },
  {
    id: 'fire-litigation',
    name: 'Fire Victim Litigation (Eaton Fire, Pacific Palisades)',
    keywords: ['fire victims', 'wildfire', 'property damage', 'insurance claims', 'Eaton Fire', 'Pacific Palisades']
  },
  {
    id: 'conservatorship',
    name: 'Conservatorship/Guardianship',
    keywords: ['conservatorship', 'guardianship', 'elder care', 'incapacity', 'protective proceedings']
  },
  {
    id: 'real-estate',
    name: 'Real Estate (Dubai properties)',
    keywords: ['Dubai real estate', 'international property', 'property investment', 'real estate law']
  }
];

// Languages
export const LANGUAGES = [
  { id: 'english', name: 'English', code: 'en' },
  { id: 'spanish', name: 'Spanish', code: 'es' },
  { id: 'both', name: 'Both (English & Spanish)', code: 'both' }
];

// Legal Disclaimers
export const DISCLAIMERS = {
  article: {
    en: 'Disclaimer: This article is for informational purposes only and does not constitute legal advice. For advice specific to your situation, please contact an attorney.',
    es: 'Descargo de responsabilidad: Este artículo es solo para fines informativos y no constituye asesoramiento legal. Para obtener asesoramiento específico sobre su situación, comuníquese con un abogado.'
  },
  script: {
    en: 'Remember, this is general information only. For advice about your specific situation, contact a qualified attorney.',
    es: 'Recuerde, esto es solo información general. Para obtener asesoramiento sobre su situación específica, comuníquese con un abogado calificado.'
  },
  social: {
    en: 'This is not legal advice. Contact us for a consultation.',
    es: 'Esto no es asesoramiento legal. Contáctenos para una consulta.'
  }
};

// Attorney Information
export const ATTORNEY_INFO = {
  name: 'Rozsa Gyene',
  barNumber: '208356',
  firmName: 'Law Offices of Rozsa Gyene',
  address: '450 N Brand Blvd, Suite 623, Glendale, California 91203',
  phone: '(818) 396-8036',
  email: 'rozsa@gyenelaw.com',
  website: 'https://gyenelaw.com',
  experience: '25+ years',
  serviceArea: 'Los Angeles County including Glendale, Burbank, Pasadena'
};

// Content Types
export const CONTENT_TYPES = {
  NEW: 'new',
  IMPORTED: 'imported'
};

// Video Platforms
export const VIDEO_PLATFORMS = {
  HEYGEN: 'heygen',
  PICTORY: 'pictory'
};

// Video Formats
export const VIDEO_FORMATS = {
  REELS: '9:16',  // Instagram Reels, Stories
  FEED: '1:1'     // Instagram/Facebook Feed
};

// Image Sizes
export const IMAGE_SIZES = {
  SQUARE: { width: 1080, height: 1080, name: 'Instagram/Facebook Feed (1:1)' },
  STORY: { width: 1080, height: 1920, name: 'Stories/Reels (9:16)' },
  LINK: { width: 1200, height: 630, name: 'Facebook Link Preview' }
};

// Content Status
export const CONTENT_STATUS = {
  DRAFT: 'draft',
  GENERATING: 'generating',
  READY: 'ready',
  PROCESSING_VIDEO: 'processing_video',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Seasonal Content Topics
export const SEASONAL_TOPICS = {
  'estate-planning': [
    'Review your estate plan before the holidays',
    'New year estate planning resolutions',
    'Tax season and your trust',
    'Spring cleaning for your estate plan',
    'Back-to-school estate planning for parents',
    'Year-end estate planning strategies'
  ],
  'fire-litigation': [
    'Fire season preparation checklist',
    'What to do immediately after a fire',
    'Eaton Fire deadline reminder',
    'Pacific Palisades fire claim updates',
    'Protecting your property during fire season',
    'Understanding your fire insurance policy'
  ],
  'trust-litigation': [
    'Common trust disputes and how to avoid them',
    'When to challenge a trustee',
    'Signs of trust mismanagement',
    'Resolving family trust disputes',
    'Your rights as a trust beneficiary'
  ],
  'conservatorship': [
    'What to do when a loved one passes',
    'Avoiding probate in California',
    'Signs your parent may need help managing finances',
    'When is conservatorship necessary',
    'Alternatives to conservatorship'
  ],
  'real-estate': [
    'Dubai real estate investment guide',
    'Legal considerations for international property',
    'Tax implications of Dubai property ownership',
    'Remote property management tips'
  ]
};

// Image Types
export const IMAGE_TYPES = {
  QUOTE: 'quote',
  INFOGRAPHIC: 'infographic',
  BRANDED: 'branded',
  TEXT_OVERLAY: 'text_overlay'
};

// Brand Colors (default - can be customized)
export const BRAND_COLORS = {
  primary: '#1e3c72',
  secondary: '#c9a961',
  accent: '#2a5298',
  text: '#2c3e50',
  background: '#ffffff'
};

// OpenAI Models
export const OPENAI_MODELS = {
  TEXT: 'gpt-4-turbo-preview',
  IMAGE: 'dall-e-3'
};

// Content Length Guidelines
export const CONTENT_LENGTH = {
  ARTICLE: { min: 800, max: 1200, unit: 'words' },
  VIDEO_SCRIPT: { min: 60, max: 90, unit: 'seconds' },
  SOCIAL_CAPTION: { min: 50, max: 150, unit: 'characters' },
  HASHTAGS: { min: 5, max: 10, unit: 'tags' }
};

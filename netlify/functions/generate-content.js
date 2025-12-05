const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const ATTORNEY_INFO = {
  name: process.env.ATTORNEY_NAME || 'Rozsa Gyene',
  barNumber: process.env.ATTORNEY_BAR_NO || '208356',
  firmName: process.env.FIRM_NAME || 'Law Offices of Rozsa Gyene',
  address: process.env.FIRM_ADDRESS || '450 N Brand Blvd, Suite 623, Glendale, California 91203',
  phone: process.env.FIRM_PHONE || '(818) 396-8036',
  serviceArea: process.env.SERVICE_AREA || 'Los Angeles County including Glendale, Burbank, Pasadena'
};

const DISCLAIMERS = {
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

const addDisclaimer = (content, type, language, include) => {
  if (!include) return content;
  const disclaimer = DISCLAIMERS[type]?.[language] || DISCLAIMERS[type]?.en;

  if (type === 'article') {
    return `${content}\n\n---\n\n${disclaimer}`;
  } else if (type === 'script' || type === 'social') {
    return `${content}\n\n${disclaimer}`;
  }
  return content;
};

const generateArticle = async (topic, practiceArea, language) => {
  const langInstruction = language === 'es'
    ? 'Write this article in professional, formal Spanish (using "usted" form):'
    : 'Write this article in English:';

  const prompt = `You are a legal content writer for ${ATTORNEY_INFO.firmName}, an experienced law firm with 25+ years of practice.

${langInstruction}

Topic: ${topic}
Practice Area: ${practiceArea}

Write a comprehensive, professional blog article (800-1200 words) that:
1. Has an engaging title
2. Includes an introduction that hooks the reader
3. Covers the topic thoroughly with clear sections
4. Uses professional but approachable language
5. Provides valuable information for potential clients
6. Includes a call-to-action at the end mentioning "${ATTORNEY_INFO.firmName}" and encouraging readers to contact the office for a consultation
7. Mentions the service area: ${ATTORNEY_INFO.serviceArea}
8. Is SEO-friendly and informative

The tone should be professional, trustworthy, and educational. Focus on helping potential clients understand their legal situation.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2000
  });

  return completion.choices[0].message.content;
};

const generateVideoScript = async (topic, practiceArea, language) => {
  const langInstruction = language === 'es'
    ? 'Write this script in professional, formal Spanish (using "usted" form):'
    : 'Write this script in English:';

  const prompt = `You are creating a short video script for ${ATTORNEY_INFO.firmName}.

${langInstruction}

Topic: ${topic}
Practice Area: ${practiceArea}

Create a SHORT 30-40 second video script (approximately 75-100 words) that:
1. Starts with ONE clear, simple hook question or statement about PEOPLE or FAMILY
2. Makes 2-3 key points focusing on PEOPLE, FAMILY, and RELATIONSHIPS
3. Speaks directly to the viewer - use "you" and "your family"
4. Uses short, clear sentences that are easy to understand when spoken aloud
5. Ends with: "Call ${ATTORNEY_INFO.firmName} at ${ATTORNEY_INFO.phone} for help"
6. Is designed to be read aloud clearly by an AI voiceover

CRITICAL - Script must be PEOPLE-FOCUSED to trigger good video footage:
- Keep it CONCISE - 30-40 seconds only (75-100 words maximum)
- Talk about: your family, your loved ones, your children, protecting people you care about, peace of mind, security, helping families, guidance, support
- NEVER mention: documents, paperwork, forms, files, estate plans, wills, trusts, signing, legal documents (these words trigger boring paper/document footage)
- Instead of "create a will" say "protect your family" or "make sure your loved ones are taken care of"
- Instead of "estate planning" say "planning for your family's future"
- Focus on EMOTIONAL benefits: peace of mind, security, protecting loved ones, family safety
- Use simple, warm, conversational language - like talking to a neighbor over coffee
- Start sentences clearly - no mumbling
- NO legal jargon whatsoever

Format: Plain spoken words only, natural and human, focusing on people and families.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 200  // Reduced for shorter scripts (30-40 seconds)
  });

  return completion.choices[0].message.content;
};

const generateSocialCaptions = async (topic, practiceArea, language) => {
  const langInstruction = language === 'es'
    ? 'Write these captions in professional Spanish:'
    : 'Write these captions in English:';

  const prompt = `Create 5 different social media captions for Facebook/Instagram about this topic:

${langInstruction}

Topic: ${topic}
Practice Area: ${practiceArea}
Law Firm: ${ATTORNEY_INFO.firmName}

Each caption should:
1. Be 50-150 characters
2. Be engaging and professional
3. Include a call-to-action
4. Be slightly different from each other (different angles/approaches)
5. Work well with a video post

Format: Return exactly 5 captions, one per line, numbered 1-5.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 500
  });

  const captions = completion.choices[0].message.content
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^\d+\.\s*/, '').trim());

  return captions.slice(0, 5);
};

const generateHashtags = async (topic, practiceArea, language) => {
  const langInstruction = language === 'es'
    ? 'Generate hashtags in Spanish:'
    : 'Generate hashtags in English:';

  const prompt = `Generate 8-10 relevant hashtags for social media about:

${langInstruction}

Topic: ${topic}
Practice Area: ${practiceArea}

Mix of:
- General legal/law firm hashtags
- Practice area specific hashtags
- Location-based hashtags (Los Angeles, Glendale, California)

Format: Return only the hashtags, space-separated, each starting with #`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 200
  });

  const hashtags = completion.choices[0].message.content
    .split(/\s+/)
    .filter(tag => tag.startsWith('#'));

  return hashtags;
};

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { topic, practiceArea, language, includeDisclaimer } = JSON.parse(event.body);

    if (!topic || !practiceArea || !language) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const languages = language === 'both' ? ['en', 'es'] : [language === 'spanish' ? 'es' : 'en'];
    const result = {};

    for (const lang of languages) {
      const suffix = lang === 'es' && language === 'both' ? 'Es' : '';

      // Generate all content in parallel for each language
      const [article, script, captions, hashtags] = await Promise.all([
        generateArticle(topic, practiceArea, lang),
        generateVideoScript(topic, practiceArea, lang),
        generateSocialCaptions(topic, practiceArea, lang),
        generateHashtags(topic, practiceArea, lang)
      ]);

      // Add disclaimers if requested
      result[`article${suffix}`] = addDisclaimer(article, 'article', lang, includeDisclaimer);
      result[`script${suffix}`] = addDisclaimer(script, 'script', lang, includeDisclaimer);
      result[`captions${suffix}`] = captions.map(c => addDisclaimer(c, 'social', lang, includeDisclaimer));
      result[`hashtags${suffix}`] = hashtags;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Error generating content:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to generate content',
        details: error.message
      })
    };
  }
};

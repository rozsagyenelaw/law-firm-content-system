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
    en: `Disclaimer: This article is for informational purposes only and does not constitute legal advice. For advice specific to your situation, please contact ${ATTORNEY_INFO.firmName} at ${ATTORNEY_INFO.phone}.`,
    es: `Descargo de responsabilidad: Este artículo es solo para fines informativos y no constituye asesoramiento legal. Para obtener asesoramiento específico sobre su situación, comuníquese con ${ATTORNEY_INFO.firmName} al ${ATTORNEY_INFO.phone}.`
  },
  script: {
    en: `Remember, this is general information only. For advice about your specific situation, contact ${ATTORNEY_INFO.firmName} at ${ATTORNEY_INFO.phone}.`,
    es: `Recuerde, esto es solo información general. Para obtener asesoramiento sobre su situación específica, comuníquese con ${ATTORNEY_INFO.firmName} al ${ATTORNEY_INFO.phone}.`
  },
  social: {
    en: `This is not legal advice. Contact ${ATTORNEY_INFO.firmName} for a consultation at ${ATTORNEY_INFO.phone}.`,
    es: `Esto no es asesoramiento legal. Contáctese con ${ATTORNEY_INFO.firmName} para una consulta al ${ATTORNEY_INFO.phone}.`
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

const generateArticle = async (topic, practiceArea, language, articleLength = 'full') => {
  const langInstruction = language === 'es'
    ? 'Write this article in professional, formal Spanish (using "usted" form):'
    : 'Write this article in English:';

  // Configure length based on selection
  const lengthConfig = {
    full: {
      wordCount: '800-1200 words',
      maxTokens: 2000,
      description: 'comprehensive, professional blog article'
    },
    short: {
      wordCount: '200-300 words',
      maxTokens: 500,
      description: 'concise article perfect for video descriptions or social media posts'
    }
  };

  const config = lengthConfig[articleLength] || lengthConfig.full;

  const prompt = `You are a legal content writer for ${ATTORNEY_INFO.firmName}, an experienced law firm with 25+ years of practice.

${langInstruction}

Topic: ${topic}
Practice Area: ${practiceArea}

Write a ${config.description} (${config.wordCount}) that:
1. Has an engaging title
2. Includes an introduction that hooks the reader
3. Covers the topic ${articleLength === 'full' ? 'thoroughly with clear sections' : 'concisely with key points'}
4. Uses professional but approachable language
5. Provides valuable information for potential clients
6. Includes a call-to-action at the end mentioning "${ATTORNEY_INFO.firmName}" and encouraging readers to contact the office for a consultation
7. Mentions the service area: ${ATTORNEY_INFO.serviceArea}
8. Is SEO-friendly and informative

${articleLength === 'short' ? 'Keep it BRIEF and focused - this will be used as a video description or social media post.' : ''}

The tone should be professional, trustworthy, and educational. Focus on helping potential clients understand their legal situation.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: config.maxTokens
  });

  return completion.choices[0].message.content;
};

const generateVideoScript = async (topic, practiceArea, language) => {
  const langInstruction = language === 'es'
    ? 'Write this script in professional, formal Spanish (using "usted" form):'
    : 'Write this script in English:';

  // Random visual scenarios to ensure each video gets different footage
  const visualScenarios = [
    "Picture a grandmother holding her grandchild's hand while walking through a sunny garden",
    "Imagine parents sitting at their kitchen table, holding hands and smiling",
    "Think of a family laughing together at a backyard barbecue",
    "Envision an elderly couple on a porch swing, looking at photo albums",
    "See a young mother playing with her toddler in a bright living room",
    "Visualize a father and son throwing a football in the park",
    "Picture a multi-generational family sharing dinner around a dining table",
    "Imagine grandparents watching their grandchildren play at a playground",
    "Think of a couple taking a peaceful walk along the beach at sunset",
    "See a family gathered around laughing at a holiday celebration",
    "Envision parents hugging their adult children at a graduation",
    "Picture a family enjoying a picnic in a green meadow"
  ];

  const randomScenario = visualScenarios[Math.floor(Math.random() * visualScenarios.length)];

  const prompt = `Create a SHORT, PUNCHY video script (under 60 seconds, 50-75 words max) for ${ATTORNEY_INFO.firmName}.

${langInstruction}

Topic: ${topic}
Practice Area: ${practiceArea}

VISUAL THEME: ${randomScenario}

REQUIRED FORMAT (5 parts):

1. HOOK (3 seconds - grab attention immediately)
   - Start with a shocking fact, urgent question, or "Did you know...?"
   - Make them STOP scrolling
   - Example: "Did you know your family could wait years in probate court?"

2. PROBLEM (what can go wrong)
   - ONE specific scary consequence if they don't act
   - Keep it real and relatable
   - Example: "Without a living trust, the court controls your assets."

3. SOLUTION (how this legal tool helps)
   - Explain what it does in ONE simple sentence
   - Focus on the main benefit
   - Example: "A living trust skips probate and keeps everything private."

4. CALL TO ACTION
   - "Call ${ATTORNEY_INFO.firmName} at ${ATTORNEY_INFO.phone}"

5. DISCLAIMER (will be added automatically - do NOT include)

CRITICAL RULES:
- 50-75 words TOTAL (excluding disclaimer)
- Short, punchy sentences
- Simple 5th grade reading level
- NO legal jargon
- Each sentence = different visual scene
- Use action words: "imagine", "picture", "think about"
- Different locations per sentence: kitchen table, park, living room, porch, etc.

GOOD Example:
"What happens when you die without a plan? Your family waits months in probate court, stressed and confused. A living trust fixes this - it keeps your assets out of court and gives your family immediate access. Picture them in your home, together, without legal battles. Call ${ATTORNEY_INFO.firmName} at ${ATTORNEY_INFO.phone}."

BAD Example (too long, too complex):
"Estate planning involves creating comprehensive legal documents that establish trusts and execute testamentary instruments..."

Format: HOOK → PROBLEM → SOLUTION → CALL TO ACTION (punchy, simple, visual!)`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,  // High creativity but focused
    max_tokens: 150  // Short scripts (50-75 words = under 60 seconds)
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
    const { topic, practiceArea, language, includeDisclaimer, articleLength } = JSON.parse(event.body);

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
        generateArticle(topic, practiceArea, lang, articleLength || 'full'),
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

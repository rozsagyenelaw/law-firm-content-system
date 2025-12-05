const OpenAI = require('openai');
const axios = require('axios');
const cheerio = require('cheerio');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const ATTORNEY_INFO = {
  name: process.env.ATTORNEY_NAME || 'Rozsa Gyene',
  firmName: process.env.FIRM_NAME || 'Law Offices of Rozsa Gyene',
  phone: process.env.FIRM_PHONE || '(818) 396-8036'
};

const DISCLAIMERS = {
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
  return `${content}\n\n${disclaimer}`;
};

const extractArticleContent = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);

    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, .menu, .navigation, .sidebar').remove();

    // Try to find article content
    let title = $('h1').first().text().trim() ||
                $('title').text().trim() ||
                $('meta[property="og:title"]').attr('content') || '';

    let content = '';

    // Try common article selectors
    const articleSelectors = [
      'article',
      '.post-content',
      '.entry-content',
      '.article-content',
      '.content',
      'main'
    ];

    for (const selector of articleSelectors) {
      const element = $(selector).first();
      if (element.length) {
        content = element.text().trim();
        if (content.length > 200) break;
      }
    }

    // Fallback to body if nothing found
    if (!content || content.length < 200) {
      content = $('body').text().trim();
    }

    // Clean up whitespace
    content = content.replace(/\s+/g, ' ').trim();

    if (!content || content.length < 100) {
      throw new Error('Could not extract sufficient content from URL');
    }

    return { title, content };

  } catch (error) {
    throw new Error(`Failed to fetch URL: ${error.message}`);
  }
};

const generateScriptFromArticle = async (title, content, language) => {
  const langInstruction = language === 'es'
    ? 'Write this script in professional, formal Spanish (using "usted" form):'
    : 'Write this script in English:';

  const prompt = `You are creating a short video script based on a blog article for ${ATTORNEY_INFO.firmName}.

${langInstruction}

Article Title: ${title}
Article Content: ${content.substring(0, 2000)}...

Create a 60-90 second video script that:
1. Starts with a compelling hook related to the article topic
2. Summarizes the key points from the article
3. Is conversational and easy to follow when spoken
4. Keeps the viewer engaged
5. Ends with: "Contact ${ATTORNEY_INFO.firmName} at ${ATTORNEY_INFO.phone} for a consultation"
6. Is designed to be read aloud by an AI avatar or voiceover

Format: Write only the spoken words, no stage directions. Make it flow naturally when spoken.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 500
  });

  return completion.choices[0].message.content;
};

const generateSocialCaptions = async (title, content, language) => {
  const langInstruction = language === 'es'
    ? 'Write these captions in professional Spanish:'
    : 'Write these captions in English:';

  const prompt = `Create 5 different social media captions for Facebook/Instagram based on this article:

${langInstruction}

Article Title: ${title}
Article Summary: ${content.substring(0, 500)}...

Each caption should:
1. Be 50-150 characters
2. Be engaging and professional
3. Reference the article topic
4. Include a call-to-action
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

const generateHashtags = async (title, content, language) => {
  const langInstruction = language === 'es'
    ? 'Generate hashtags in Spanish:'
    : 'Generate hashtags in English:';

  const prompt = `Generate 8-10 relevant hashtags based on this article:

${langInstruction}

Article Title: ${title}
Article Summary: ${content.substring(0, 300)}...

Include:
- Topic-specific hashtags
- Legal/law firm hashtags
- Location hashtags (Los Angeles, California)

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
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

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
    const { url, language, includeDisclaimer } = JSON.parse(event.body);

    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URL is required' })
      };
    }

    // Extract article content
    const { title, content } = await extractArticleContent(url);

    const languages = language === 'both' ? ['en', 'es'] : [language === 'spanish' ? 'es' : 'en'];
    const result = {
      title,
      originalArticle: content
    };

    for (const lang of languages) {
      const suffix = lang === 'es' && language === 'both' ? 'Es' : '';

      // Generate content in parallel
      const [script, captions, hashtags] = await Promise.all([
        generateScriptFromArticle(title, content, lang),
        generateSocialCaptions(title, content, lang),
        generateHashtags(title, content, lang)
      ]);

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
    console.error('Error importing blog:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to import blog',
        details: error.message
      })
    };
  }
};

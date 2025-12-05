const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const PRACTICE_AREA_CONTEXT = {
  'estate-planning': 'Estate Planning & Probate - topics about wills, trusts, probate, inheritance, estate administration',
  'trust-litigation': 'Trust Litigation - topics about trust disputes, fiduciary duties, trustee removal, breach of trust',
  'fire-litigation': 'Fire Victim Litigation (Eaton Fire, Pacific Palisades) - topics about wildfire claims, property damage, insurance disputes',
  'conservatorship': 'Conservatorship/Guardianship - topics about conservatorship, guardianship, elder care, incapacity',
  'real-estate': 'Real Estate (Dubai properties) - topics about Dubai real estate, international property, investment'
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
    const { practiceArea } = JSON.parse(event.body);

    if (!practiceArea) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Practice area is required' })
      };
    }

    const context = PRACTICE_AREA_CONTEXT[practiceArea] || practiceArea;

    const prompt = `Generate 10 engaging content topic ideas for a law firm's blog and social media.

Practice Area: ${context}
Location: Los Angeles County, California

Requirements:
1. Topics should be practical and helpful for potential clients
2. Mix of educational content and common questions
3. Should be timely and relevant
4. Each topic should work as both a blog article and social media video
5. Include some seasonal/timely topics when relevant
6. Focus on California law when applicable

Format: Return exactly 10 topic ideas, one per line, numbered 1-10. Make them specific and actionable.

Example format:
1. What happens if you die without a will in California?
2. 5 common mistakes people make when creating a trust
...etc`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 800
    });

    const ideas = completion.choices[0].message.content
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 0);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ideas: ideas.slice(0, 10) })
    };

  } catch (error) {
    console.error('Error generating ideas:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to generate content ideas',
        details: error.message
      })
    };
  }
};

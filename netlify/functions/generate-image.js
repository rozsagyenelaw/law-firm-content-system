const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const FIRM_INFO = {
  firmName: process.env.FIRM_NAME || 'Law Offices of Rozsa Gyene',
  location: 'Glendale, California'
};

const IMAGE_SIZE_MAP = {
  SQUARE: { size: '1024x1024', name: 'Instagram/Facebook Feed (1:1)' },
  STORY: { size: '1024x1792', name: 'Stories/Reels (9:16)' },
  LINK: { size: '1024x1024', name: 'Facebook Link Preview' } // DALL-E 3 supports 1024x1024, 1024x1792, 1792x1024
};

const buildImagePrompt = (imageType, prompt, text, brandColors) => {
  const baseStyle = `Professional, clean design for a law firm (${FIRM_INFO.firmName}).
Brand colors: primary ${brandColors.primary}, secondary ${brandColors.secondary}.
High quality, modern, trustworthy appearance.`;

  let fullPrompt = '';

  switch(imageType) {
    case 'quote':
      fullPrompt = `${baseStyle}
Create a professional quote graphic with the following text: "${text}"
${prompt}
Style: Clean typography, professional legal aesthetic, balanced composition.
Include subtle legal imagery (scales of justice, gavel, etc.) if appropriate.`;
      break;

    case 'infographic':
      fullPrompt = `${baseStyle}
Create a simple, clean infographic about: ${prompt}
${text ? `Include this text: "${text}"` : ''}
Style: Easy to read, numbered steps or bullet points, icons, professional layout.`;
      break;

    case 'branded':
      fullPrompt = `${baseStyle}
Create a professional branded announcement image: ${prompt}
${text ? `Main text: "${text}"` : ''}
Style: Corporate, trustworthy, high-end law firm aesthetic.`;
      break;

    case 'text_overlay':
      fullPrompt = `${baseStyle}
Create an image with text overlay: ${prompt}
Text to display: "${text}"
Style: Professional background image (subtle, not distracting) with clear, readable text overlay.`;
      break;

    default:
      fullPrompt = `${baseStyle}\n${prompt}`;
  }

  return fullPrompt;
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
    const { imageType, prompt, text, sizes, brandColors } = JSON.parse(event.body);

    if (!imageType || !prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Image type and prompt are required' })
      };
    }

    if (!sizes || sizes.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'At least one size must be selected' })
      };
    }

    const images = [];

    // Generate images for each requested size
    for (const sizeKey of sizes) {
      const sizeConfig = IMAGE_SIZE_MAP[sizeKey];
      if (!sizeConfig) continue;

      const fullPrompt = buildImagePrompt(imageType, prompt, text, brandColors);

      try {
        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt: fullPrompt,
          n: 1,
          size: sizeConfig.size,
          quality: 'standard',
          style: 'natural'
        });

        images.push({
          size: sizeKey,
          sizeName: sizeConfig.name,
          url: response.data[0].url,
          filename: `${imageType}_${sizeKey}_${Date.now()}.png`
        });

      } catch (sizeError) {
        console.error(`Error generating ${sizeKey} image:`, sizeError);
        // Continue with other sizes
      }
    }

    if (images.length === 0) {
      throw new Error('Failed to generate any images');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ images })
    };

  } catch (error) {
    console.error('Error generating images:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to generate images',
        details: error.message
      })
    };
  }
};

const axios = require('axios');

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_API_URL = 'https://api.heygen.com/v2/video/generate';

// HeyGen avatar IDs (you'll need to get these from your HeyGen account)
const AVATARS = {
  professional_male: 'default_avatar_id', // Replace with actual avatar ID
  professional_female: 'default_avatar_id' // Replace with actual avatar ID
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
    const { script, language, format, avatarType } = JSON.parse(event.body);

    if (!script) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Script is required' })
      };
    }

    if (!HEYGEN_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'HeyGen API key not configured' })
      };
    }

    // Determine voice based on language
    const voiceId = language === 'es' ? 'es-ES-Standard-A' : 'en-US-Standard-A';
    const avatar = AVATARS[avatarType] || AVATARS.professional_male;

    // HeyGen API request
    const requestBody = {
      video_inputs: [
        {
          character: {
            type: 'avatar',
            avatar_id: avatar,
            avatar_style: 'normal'
          },
          voice: {
            type: 'text',
            input_text: script,
            voice_id: voiceId
          }
        }
      ],
      dimension: {
        width: format === '9:16' ? 1080 : 1080,
        height: format === '9:16' ? 1920 : 1080
      },
      aspect_ratio: format === '9:16' ? '9:16' : '1:1'
    };

    const response = await axios.post(HEYGEN_API_URL, requestBody, {
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const videoId = response.data.data?.video_id || response.data.video_id;

    if (!videoId) {
      throw new Error('No video ID returned from HeyGen API');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        videoId,
        status: 'processing',
        message: 'Video creation started. Check status with the video ID.'
      })
    };

  } catch (error) {
    console.error('Error creating HeyGen video:', error);

    let errorMessage = 'Failed to create HeyGen video';
    let errorDetails = error.message;

    if (error.response) {
      errorDetails = error.response.data?.message || error.response.statusText;
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: errorMessage,
        details: errorDetails
      })
    };
  }
};

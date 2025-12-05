const axios = require('axios');

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_API_URL = 'https://api.heygen.com/v2/video/generate';

// HeyGen public avatar IDs (these are publicly available avatars)
// You can get your custom avatar IDs by visiting: https://app.heygen.com/avatars
const AVATARS = {
  professional_male: 'Angela-inblackskirt-20220820',
  professional_female: 'Anna_public_3_20240108'
};

// Voice IDs for HeyGen
const VOICES = {
  'en': '1bd001e7e50f421d891986aad5158bc8', // English male voice
  'es': 'af9e1e4a3c254ad096e5c3a99c7e8c1e'  // Spanish male voice
};

exports.handler = async (event) => {
  console.log('HeyGen function called:', {
    method: event.httpMethod,
    path: event.path,
    headers: event.headers
  });

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
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

    // Determine voice and avatar
    const voiceId = VOICES[language] || VOICES['en'];
    const avatarId = AVATARS[avatarType] || AVATARS.professional_female;

    // HeyGen API request body
    const requestBody = {
      video_inputs: [
        {
          character: {
            type: 'avatar',
            avatar_id: avatarId,
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
      aspect_ratio: format,
      test: false
    };

    console.log('Creating HeyGen video with:', {
      avatarId,
      voiceId,
      format,
      scriptLength: script.length
    });

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
    let statusCode = 500;

    if (error.response) {
      console.error('HeyGen API Error Response:', {
        status: error.response.status,
        data: error.response.data
      });
      errorDetails = JSON.stringify(error.response.data);
      statusCode = error.response.status;
    }

    return {
      statusCode,
      headers,
      body: JSON.stringify({
        error: errorMessage,
        details: errorDetails,
        hint: 'Check if your HeyGen API key is valid and has credits available'
      })
    };
  }
};

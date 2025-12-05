const axios = require('axios');

const PICTORY_API_KEY = process.env.PICTORY_API_KEY;
const PICTORY_API_URL = 'https://api.pictory.ai/pictoryapis/v1';

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
    const { script, language, format, videoName } = JSON.parse(event.body);

    if (!script) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Script is required' })
      };
    }

    if (!PICTORY_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Pictory API key not configured' })
      };
    }

    // Pictory API - Create video from script
    const requestBody = {
      videoName: videoName || `Law_Firm_Video_${Date.now()}`,
      language: language === 'es' ? 'es' : 'en',
      scenes: [
        {
          text: script,
          voiceOver: true,
          splitTextOnNewLine: true,
          splitTextOnPeriod: true
        }
      ],
      brandLogo: {
        url: '', // Add logo URL if available
        position: 'bottom-right'
      },
      videoDescription: 'Legal content video',
      videoSettings: {
        width: format === '9:16' ? 1080 : 1080,
        height: format === '9:16' ? 1920 : 1080,
        aspectRatio: format === '9:16' ? '9:16' : '1:1',
        enableCaptions: true,
        enableAudio: true
      },
      audio: {
        aiVoiceOver: {
          speaker: language === 'es' ? 'es-ES-Standard-A' : 'en-US-Standard-C',
          speed: 1.0,
          amplifyLevel: 0
        },
        backgroundMusic: {
          enabled: true,
          volume: 0.3
        }
      }
    };

    const response = await axios.post(`${PICTORY_API_URL}/video/storyboard`, requestBody, {
      headers: {
        'Authorization': `Bearer ${PICTORY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Pictory-User-Id': process.env.PICTORY_USER_ID || 'default'
      },
      timeout: 30000
    });

    const jobId = response.data.data?.jobId || response.data.jobId;

    if (!jobId) {
      throw new Error('No job ID returned from Pictory API');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        videoId: jobId,
        status: 'processing',
        message: 'Video creation started. Check status with the job ID.'
      })
    };

  } catch (error) {
    console.error('Error creating Pictory video:', error);

    let errorMessage = 'Failed to create Pictory video';
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

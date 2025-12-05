const axios = require('axios');

const PICTORY_API_KEY = process.env.PICTORY_API_KEY;
const PICTORY_API_URL = 'https://api.pictory.ai/pictoryapis/v1';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const videoId = event.queryStringParameters?.videoId;

    if (!videoId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Video ID is required' })
      };
    }

    if (!PICTORY_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Pictory API key not configured' })
      };
    }

    const response = await axios.get(`${PICTORY_API_URL}/jobs/${videoId}`, {
      headers: {
        'Authorization': `Bearer ${PICTORY_API_KEY}`,
        'X-Pictory-User-Id': process.env.PICTORY_USER_ID || 'default'
      },
      timeout: 10000
    });

    const data = response.data.data || response.data;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: data.status,
        videoUrl: data.videoUrl || data.video_url,
        thumbnail: data.thumbnailUrl,
        progress: data.progress
      })
    };

  } catch (error) {
    console.error('Error checking Pictory video status:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to check video status',
        details: error.message
      })
    };
  }
};

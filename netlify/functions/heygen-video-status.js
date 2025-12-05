const axios = require('axios');

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_STATUS_URL = 'https://api.heygen.com/v1/video_status.get';

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

    if (!HEYGEN_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'HeyGen API key not configured' })
      };
    }

    const response = await axios.get(`${HEYGEN_STATUS_URL}?video_id=${videoId}`, {
      headers: {
        'X-Api-Key': HEYGEN_API_KEY
      },
      timeout: 10000
    });

    const data = response.data.data || response.data;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: data.status,
        videoUrl: data.video_url || data.video_url_https,
        thumbnail: data.thumbnail_url,
        duration: data.duration
      })
    };

  } catch (error) {
    console.error('Error checking HeyGen video status:', error);
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

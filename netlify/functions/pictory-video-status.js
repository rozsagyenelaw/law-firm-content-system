const axios = require('axios');

const PICTORY_CLIENT_ID = process.env.PICTORY_CLIENT_ID;
const PICTORY_CLIENT_SECRET = process.env.PICTORY_CLIENT_SECRET;
const PICTORY_API_URL = 'https://api.pictory.ai/pictoryapis';

// Function to get OAuth access token
async function getAccessToken() {
  const response = await axios.post(`${PICTORY_API_URL}/v1/oauth2/token`, {
    client_id: PICTORY_CLIENT_ID,
    client_secret: PICTORY_CLIENT_SECRET
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  return response.data.access_token;
}

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

    if (!PICTORY_CLIENT_ID || !PICTORY_CLIENT_SECRET) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Pictory API credentials not configured' })
      };
    }

    // Get OAuth access token
    const accessToken = await getAccessToken();

    const response = await axios.get(`${PICTORY_API_URL}/v1/jobs/${videoId}`, {
      headers: {
        'Authorization': accessToken
      },
      timeout: 10000
    });

    console.log('Pictory job status response:', response.data);

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
    console.error('Error response:', error.response?.data);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to check video status',
        details: error.response?.data || error.message
      })
    };
  }
};

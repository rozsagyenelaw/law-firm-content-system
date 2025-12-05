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

    console.log('Pictory job status response:', JSON.stringify(response.data, null, 2));

    const data = response.data.data || response.data;

    // Map Pictory status to our expected format
    let status = data.status;
    let videoUrl = null;
    let progress = 0;

    if (status === 'completed') {
      videoUrl = data.videoUrl || data.video_url || data.url;
      progress = 100;
    } else if (status === 'in-progress' || status === 'processing') {
      status = 'processing';
      progress = data.progress || data.percentComplete || 50; // Default to 50% if not provided
    } else if (status === 'failed' || status === 'error') {
      status = 'failed';
    }

    console.log('Parsed status:', { status, progress, videoUrl });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: status,
        videoUrl: videoUrl,
        thumbnail: data.thumbnailUrl,
        progress: progress,
        error: data.error || data.errorMessage
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

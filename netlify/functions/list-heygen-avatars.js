const axios = require('axios');

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

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
    if (!HEYGEN_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'HeyGen API key not configured' })
      };
    }

    // List available avatars from HeyGen
    const response = await axios.get('https://api.heygen.com/v2/avatars', {
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        avatars: response.data.data?.avatars || response.data.avatars || response.data,
        message: 'Available avatars from your HeyGen account'
      })
    };

  } catch (error) {
    console.error('Error listing HeyGen avatars:', error);

    let errorMessage = 'Failed to list HeyGen avatars';
    let errorDetails = error.message;

    if (error.response) {
      console.error('Response data:', error.response.data);
      errorDetails = JSON.stringify(error.response.data);
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

const { google } = require('googleapis');

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
    const { refresh_token } = JSON.parse(event.body);

    if (!refresh_token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Refresh token is required' })
      };
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({ refresh_token });

    // This will automatically refresh the token
    const { credentials } = await oauth2Client.refreshAccessToken();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        access_token: credentials.access_token,
        expiry_date: credentials.expiry_date
      })
    };

  } catch (error) {
    console.error('Error refreshing token:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to refresh token',
        details: error.message
      })
    };
  }
};

const { google } = require('googleapis');

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
    const code = event.queryStringParameters?.code;

    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Authorization code is required' })
      };
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    // In production, you should store these tokens securely
    // For now, we'll return them to the client to store in localStorage

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/html'
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Google Drive Authorization</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
              color: white;
            }
            .container {
              text-align: center;
              background: rgba(255,255,255,0.1);
              padding: 2rem;
              border-radius: 8px;
            }
            h1 { margin-bottom: 1rem; }
            p { margin-bottom: 1.5rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✓ Authorization Successful</h1>
            <p>Google Drive has been connected successfully.</p>
            <p>You can close this window and return to the application.</p>
          </div>
          <script>
            // Store tokens in localStorage
            localStorage.setItem('googleDriveTokens', JSON.stringify(${JSON.stringify(tokens)}));

            // Send message to parent window
            if (window.opener) {
              window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', tokens: ${JSON.stringify(tokens)} }, '*');
            }

            // Auto-close after 2 seconds
            setTimeout(() => {
              window.close();
            }, 2000);
          </script>
        </body>
        </html>
      `
    };

  } catch (error) {
    console.error('Error in OAuth callback:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'text/html'
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authorization Failed</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #721e3c 0%, #982a52 100%);
              color: white;
            }
            .container {
              text-align: center;
              background: rgba(255,255,255,0.1);
              padding: 2rem;
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✗ Authorization Failed</h1>
            <p>There was an error connecting to Google Drive.</p>
            <p>Please try again or contact support.</p>
          </div>
        </body>
        </html>
      `
    };
  }
};

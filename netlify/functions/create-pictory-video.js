const axios = require('axios');

const PICTORY_CLIENT_ID = process.env.PICTORY_CLIENT_ID;
const PICTORY_CLIENT_SECRET = process.env.PICTORY_CLIENT_SECRET;
const PICTORY_API_URL = 'https://api.pictory.ai/pictoryapis';

// Function to get OAuth access token
async function getAccessToken() {
  console.log('Getting Pictory OAuth token...');

  const response = await axios.post(`${PICTORY_API_URL}/v1/oauth2/token`, {
    client_id: PICTORY_CLIENT_ID,
    client_secret: PICTORY_CLIENT_SECRET
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  console.log('OAuth token received');
  return response.data.access_token;
}

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

    console.log('Pictory video creation request:', {
      scriptLength: script?.length,
      language,
      format,
      videoName,
      hasClientId: !!PICTORY_CLIENT_ID,
      hasClientSecret: !!PICTORY_CLIENT_SECRET
    });

    if (!script) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Script is required' })
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

    // Pictory API v2 - Create video storyboard from text
    const phoneNumber = process.env.FIRM_PHONE || '(818) 291-6217';

    // Split script into individual sentences to force scene changes
    // This ensures each sentence gets its own scene with different footage
    const sentences = script
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Split script into ${sentences.length} scenes:`, sentences);

    // Create a separate scene for each sentence
    // Add zoom setting to zoom out by 25% (scale of 0.75)
    const scenes = sentences.map(sentence => ({
      story: sentence + '.', // Add period back
      createSceneOnNewLine: false,
      createSceneOnEndOfSentence: false,
      visualZoom: false, // Disable automatic zoom to show more of the scene
      visualScale: 0.75 // Scale down to 75% to zoom out by 25%
    }));

    const requestBody = {
      videoName: videoName || `Law_Firm_Video_${Date.now()}`,
      videoWidth: format === '9:16' ? 1080 : 1920,
      videoHeight: format === '9:16' ? 1920 : 1080,
      language: language === 'es' ? 'es' : 'en',
      scenes: scenes,
      backgroundMusic: {
        enabled: true,
        autoMusic: true,
        volume: 0.15
      },
      voiceOver: {
        enabled: true,
        aiVoices: [
          {
            speaker: language === 'es' ? 'Maria' : 'Matthew',
            speed: 95
          }
        ]
      },
      // Text overlay with phone number
      textOverlay: {
        enabled: true,
        text: `📞 ${phoneNumber}`,
        position: 'bottom',
        fontSize: 20,
        fontColor: '#FFFFFF',
        backgroundColor: 'rgba(30, 60, 114, 0.8)',
        duration: 'full'
      }
    };

    console.log('Sending request to Pictory API v2 render endpoint...');
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await axios.post(`${PICTORY_API_URL}/v2/video/storyboard/render`, requestBody, {
      headers: {
        'Authorization': accessToken,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('Pictory API full response:', JSON.stringify(response.data, null, 2));

    const jobId = response.data.data?.jobId || response.data.jobId || response.data.data?.job_id || response.data.job_id;

    if (!jobId) {
      console.error('No job ID in response. Full response:', JSON.stringify(response.data, null, 2));
      throw new Error(`No job ID returned from Pictory API. Response: ${JSON.stringify(response.data)}`);
    }

    console.log('Video job created successfully. Job ID:', jobId);

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
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });

    let errorMessage = 'Failed to create Pictory video';
    let errorDetails = error.message;

    if (error.response) {
      console.error('Pictory API Error Response:', {
        status: error.response.status,
        data: error.response.data
      });
      errorDetails = JSON.stringify(error.response.data) || error.response.statusText;
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: errorMessage,
        details: errorDetails,
        hint: 'Check if your Pictory API credentials are valid and have the correct permissions'
      })
    };
  }
};

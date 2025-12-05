const axios = require('axios');

const PICTORY_API_KEY = process.env.PICTORY_API_KEY;
const PICTORY_API_URL = 'https://api.pictory.ai/pictoryapis';

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
      hasApiKey: !!PICTORY_API_KEY
    });

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

    // Pictory API v2 - Create video storyboard from text
    // Using correct format based on API documentation
    const requestBody = {
      videoName: videoName || `Law_Firm_Video_${Date.now()}`,
      videoWidth: format === '9:16' ? 1080 : 1920,
      videoHeight: format === '9:16' ? 1920 : 1080,
      language: language === 'es' ? 'es' : 'en',
      scenes: [
        {
          story: script,
          createSceneOnNewLine: true,
          createSceneOnEndOfSentence: true
        }
      ],
      backgroundMusic: {
        enabled: true,
        autoMusic: true,
        volume: 0.2
      },
      voiceOver: {
        enabled: true,
        aiVoices: [
          {
            speaker: language === 'es' ? 'Maria' : 'Matthew'
          }
        ]
      }
    };

    console.log('Sending request to Pictory API v2...');
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await axios.post(`${PICTORY_API_URL}/v2/video/storyboard`, requestBody, {
      headers: {
        'Authorization': PICTORY_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('Pictory API response:', response.data);

    const jobId = response.data.job_id || response.data.data?.job_id || response.data.jobId;

    if (!jobId) {
      console.error('No job ID in response:', response.data);
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
        hint: 'Check if your Pictory API key is valid and has the correct permissions'
      })
    };
  }
};

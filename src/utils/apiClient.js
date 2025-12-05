import axios from 'axios';

// Determine API base URL based on current location
const getApiBaseUrl = () => {
  // If running on localhost, use local dev server
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8889/.netlify/functions';
  }
  // For production (Netlify), use relative path
  return '/.netlify/functions';
};

const API_BASE_URL = getApiBaseUrl();

class ApiClient {
  constructor() {
    console.log('ApiClient initialized with baseURL:', API_BASE_URL);
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 120000 // 120 seconds timeout for API calls
    });
  }

  // Content Generation
  async generateContent(data) {
    try {
      const response = await this.client.post('/generate-content', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Content Ideas
  async generateContentIdeas(practiceArea) {
    try {
      const response = await this.client.post('/generate-ideas', { practiceArea });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Blog Import
  async importBlog(url) {
    try {
      const response = await this.client.post('/import-blog', { url });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Image Generation
  async generateImage(data) {
    try {
      const response = await this.client.post('/generate-image', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // HeyGen Video
  async createHeyGenVideo(data) {
    console.log('🎬 [START] createHeyGenVideo called');
    console.log('📦 [DATA]', data);

    try {
      // Try direct fetch instead of axios to bypass any axios issues
      const fullUrl = window.location.origin + '/.netlify/functions/create-heygen-video';
      console.log('🌐 [URL]', fullUrl);

      console.log('📤 [SENDING] POST request...');
      const fetchResponse = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      console.log('📥 [RECEIVED] Status:', fetchResponse.status, fetchResponse.statusText);

      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        console.error('❌ [ERROR RESPONSE]', errorText);
        throw new Error(`HTTP ${fetchResponse.status}: ${errorText}`);
      }

      const responseData = await fetchResponse.json();
      console.log('✅ [SUCCESS]', responseData);
      return responseData;
    } catch (error) {
      console.error('💥 [EXCEPTION]', error);
      console.error('💥 [ERROR NAME]', error.name);
      console.error('💥 [ERROR MESSAGE]', error.message);
      console.error('💥 [ERROR STACK]', error.stack);
      throw new Error('Failed to create HeyGen video: ' + error.message);
    }
  }

  async getHeyGenVideoStatus(videoId) {
    try {
      const response = await this.client.get(`/heygen-video-status?videoId=${videoId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async listHeyGenAvatars() {
    try {
      const response = await this.client.get('/list-heygen-avatars');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Pictory Video
  async createPictoryVideo(data) {
    try {
      const response = await this.client.post('/create-pictory-video', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPictoryVideoStatus(videoId) {
    try {
      const response = await this.client.get(`/pictory-video-status?videoId=${videoId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Google Drive
  async saveToGoogleDrive(data) {
    try {
      const response = await this.client.post('/save-to-drive', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getGoogleAuthUrl() {
    try {
      const response = await this.client.get('/google-auth-url');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handling
  handleError(error) {
    if (error.response) {
      // Server responded with error
      return new Error(error.response.data.error || 'Server error occurred');
    } else if (error.request) {
      // Request made but no response
      return new Error('No response from server. Please check your connection.');
    } else {
      // Error setting up request
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

const apiClientInstance = new ApiClient();
export default apiClientInstance;

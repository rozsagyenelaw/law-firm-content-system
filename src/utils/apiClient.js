import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '/.netlify/functions'
  : 'http://localhost:8888/.netlify/functions';

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
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
    try {
      const response = await this.client.post('/create-heygen-video', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
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

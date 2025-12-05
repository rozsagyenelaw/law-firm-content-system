# Law Firm Content & Video Automation System

A comprehensive web application for Law Offices of Rozsa Gyene to automate content creation, video generation, and social media management.

## Features

- **Content Generator**: Generate full blog articles, video scripts, and social media captions from topics
- **Blog Importer**: Convert existing blog articles into video scripts
- **Image Generator**: Create branded social media images using AI
- **Video Automation**:
  - HeyGen integration for AI avatar videos
  - Pictory integration for stock footage videos
- **Bilingual Support**: Generate content in English, Spanish, or both
- **Google Drive Integration**: Auto-save all content to organized folders
- **Legal Disclaimers**: Automatically append appropriate disclaimers
- **Content Ideas**: AI-powered topic suggestions for your practice areas

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your API keys:
```bash
cp .env.example .env
```

Required API keys:
- **OpenAI API Key**: Get from https://platform.openai.com/api-keys
- **HeyGen API Key**: Get from HeyGen developer portal
- **Pictory API Key**: Get from Pictory developer portal
- **Google OAuth Credentials**: Create at https://console.cloud.google.com/

### 3. Google Drive Setup
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:8888/.netlify/functions/google-auth-callback`
6. Copy Client ID and Client Secret to .env file

### 4. Run Locally
```bash
npm run dev
```
The app will open at `http://localhost:8888`

### 5. Deploy to Netlify
1. Push code to GitHub
2. Connect repository to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy!

## Practice Areas Supported

- Estate Planning & Probate
- Trust Litigation
- Fire Victim Litigation (Eaton Fire, Pacific Palisades)
- Conservatorship/Guardianship
- Real Estate (Dubai properties)

## Usage

### Create New Content
1. Click "Create New Content"
2. Enter a topic or get AI suggestions
3. Select practice area and language
4. Review generated article, script, and captions
5. Create videos with HeyGen and/or Pictory
6. Access completed content in Google Drive

### Import Existing Blog
1. Click "Import Blog"
2. Paste your blog URL
3. Select language
4. Review generated script
5. Create videos
6. Download or access from Google Drive

## File Structure
```
/Social Media Videos/
  /HeyGen/
    /English/
    /Spanish/
  /Pictory/
    /English/
    /Spanish/
/Generated Content/
  /Articles/
    /English/
    /Spanish/
  /Scripts/
  /Images/
```

## Support
For questions or issues, contact: rozsa@gyenelaw.com

## License
Proprietary - Law Offices of Rozsa Gyene

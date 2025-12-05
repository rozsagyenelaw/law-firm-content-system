# API Reference

This document describes all the backend API endpoints (Netlify Functions) used in the Law Firm Content System.

## Base URL

- **Development**: `http://localhost:8888/.netlify/functions`
- **Production**: `https://your-site.netlify.app/.netlify/functions`

## Authentication

Most endpoints don't require authentication except for Google Drive operations, which require an OAuth access token.

---

## Content Generation

### Generate Content

Generate a complete content package including article, video script, captions, and hashtags.

**Endpoint**: `POST /generate-content`

**Request Body**:
```json
{
  "topic": "What happens if you die without a will in California",
  "practiceArea": "estate-planning",
  "language": "english",
  "includeDisclaimer": true
}
```

**Parameters**:
- `topic` (string, required): The content topic
- `practiceArea` (string, required): One of: `estate-planning`, `trust-litigation`, `fire-litigation`, `conservatorship`, `real-estate`
- `language` (string, required): One of: `english`, `spanish`, `both`
- `includeDisclaimer` (boolean, optional): Include legal disclaimers (default: true)

**Response** (for English):
```json
{
  "article": "Full blog article content...",
  "script": "60-90 second video script...",
  "captions": [
    "Caption 1...",
    "Caption 2...",
    "Caption 3...",
    "Caption 4...",
    "Caption 5..."
  ],
  "hashtags": ["#estateplanning", "#california", "#lawfirm", "..."]
}
```

**Response** (for Both languages):
```json
{
  "article": "English article...",
  "script": "English script...",
  "captions": ["English captions..."],
  "hashtags": ["English hashtags..."],
  "articleEs": "Spanish article...",
  "scriptEs": "Spanish script...",
  "captionsEs": ["Spanish captions..."],
  "hashtagsEs": ["Spanish hashtags..."]
}
```

**Errors**:
- `400`: Missing required fields
- `500`: Content generation failed

---

## Content Ideas

### Generate Content Ideas

Generate 10 AI-powered content topic ideas based on practice area.

**Endpoint**: `POST /generate-ideas`

**Request Body**:
```json
{
  "practiceArea": "estate-planning"
}
```

**Response**:
```json
{
  "ideas": [
    "What happens if you die without a will in California?",
    "5 common mistakes people make when creating a trust",
    "How to choose the right executor for your estate",
    "..."
  ]
}
```

---

## Blog Import

### Import Blog Article

Import an existing blog article and generate video script and social content.

**Endpoint**: `POST /import-blog`

**Request Body**:
```json
{
  "url": "https://gyenelaw.com/blog/your-article",
  "language": "english",
  "includeDisclaimer": true
}
```

**Response**:
```json
{
  "title": "Article Title",
  "originalArticle": "Full article text...",
  "script": "Generated video script...",
  "captions": ["Caption 1...", "..."],
  "hashtags": ["#hashtag1", "..."]
}
```

**Errors**:
- `400`: Invalid URL
- `500`: Failed to fetch or parse article

---

## Image Generation

### Generate Images

Generate AI images for social media using DALL-E 3.

**Endpoint**: `POST /generate-image`

**Request Body**:
```json
{
  "imageType": "quote",
  "prompt": "Professional quote graphic about estate planning",
  "text": "Every family needs an estate plan",
  "sizes": ["SQUARE", "STORY"],
  "brandColors": {
    "primary": "#1e3c72",
    "secondary": "#c9a961"
  }
}
```

**Parameters**:
- `imageType`: `quote`, `infographic`, `branded`, `text_overlay`
- `prompt` (required): Description of desired image
- `text`: Text to display on image (for quote/text_overlay types)
- `sizes`: Array of `SQUARE`, `STORY`, or `LINK`
- `brandColors`: Object with `primary` and `secondary` hex colors

**Response**:
```json
{
  "images": [
    {
      "size": "SQUARE",
      "sizeName": "Instagram/Facebook Feed (1:1)",
      "url": "https://...",
      "filename": "quote_SQUARE_1234567890.png"
    },
    {
      "size": "STORY",
      "sizeName": "Stories/Reels (9:16)",
      "url": "https://...",
      "filename": "quote_STORY_1234567890.png"
    }
  ]
}
```

---

## HeyGen Video

### Create HeyGen Video

Create an AI avatar video using HeyGen.

**Endpoint**: `POST /create-heygen-video`

**Request Body**:
```json
{
  "script": "Hello, I'm Attorney Rozsa Gyene...",
  "language": "en",
  "format": "9:16",
  "avatarType": "professional_male"
}
```

**Response**:
```json
{
  "videoId": "video_12345",
  "status": "processing",
  "message": "Video creation started..."
}
```

### Get HeyGen Video Status

Check the status of a HeyGen video.

**Endpoint**: `GET /heygen-video-status?videoId=video_12345`

**Response**:
```json
{
  "status": "completed",
  "videoUrl": "https://...",
  "thumbnail": "https://...",
  "duration": 65
}
```

**Status values**: `processing`, `completed`, `failed`

---

## Pictory Video

### Create Pictory Video

Create a stock footage video with Pictory.

**Endpoint**: `POST /create-pictory-video`

**Request Body**:
```json
{
  "script": "Estate planning is crucial for every family...",
  "language": "en",
  "format": "9:16",
  "videoName": "Estate_Planning_Video"
}
```

**Response**:
```json
{
  "videoId": "job_12345",
  "status": "processing",
  "message": "Video creation started..."
}
```

### Get Pictory Video Status

Check the status of a Pictory video.

**Endpoint**: `GET /pictory-video-status?videoId=job_12345`

**Response**:
```json
{
  "status": "completed",
  "videoUrl": "https://...",
  "thumbnail": "https://...",
  "progress": 100
}
```

---

## Google Drive

### Get Auth URL

Get the Google OAuth authorization URL.

**Endpoint**: `GET /google-auth-url`

**Response**:
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### OAuth Callback

Handle Google OAuth callback (automatically called after user authorizes).

**Endpoint**: `GET /google-auth-callback?code=...`

This returns an HTML page that stores tokens and closes the window.

### Save to Drive

Save a file to Google Drive.

**Endpoint**: `POST /save-to-drive`

**Request Body**:
```json
{
  "fileName": "article_2024_01_15.txt",
  "content": "File content here...",
  "contentType": "text/plain",
  "folderType": "articles-en",
  "accessToken": "ya29.a0..."
}
```

**Folder Types**:
- `videos-heygen-en` → Social Media Videos/HeyGen/English
- `videos-heygen-es` → Social Media Videos/HeyGen/Spanish
- `videos-pictory-en` → Social Media Videos/Pictory/English
- `videos-pictory-es` → Social Media Videos/Pictory/Spanish
- `articles-en` → Generated Content/Articles/English
- `articles-es` → Generated Content/Articles/Spanish
- `scripts` → Generated Content/Scripts
- `images` → Generated Content/Images

**Response**:
```json
{
  "success": true,
  "fileId": "1abc...",
  "viewLink": "https://drive.google.com/file/d/...",
  "downloadLink": "https://drive.google.com/uc?id=...",
  "folderPath": "Generated Content/Articles/English"
}
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

**Common HTTP Status Codes**:
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (missing/invalid auth)
- `405`: Method Not Allowed
- `500`: Internal Server Error (API failures, etc.)

---

## Rate Limits

### API Limits:
- **OpenAI**: Depends on your plan (typically 3,500 requests/min)
- **HeyGen**: Depends on credits (10 free/month)
- **Pictory**: 120 credits with $49 plan
- **Google Drive**: 1000 requests/100 seconds/user

### Netlify Limits (Free Tier):
- 125,000 function invocations/month
- 100 hours of function runtime/month

---

## Testing

### Test with cURL:

```bash
# Generate Content
curl -X POST http://localhost:8888/.netlify/functions/generate-content \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "What is a living trust?",
    "practiceArea": "estate-planning",
    "language": "english",
    "includeDisclaimer": true
  }'

# Generate Ideas
curl -X POST http://localhost:8888/.netlify/functions/generate-ideas \
  -H "Content-Type: application/json" \
  -d '{"practiceArea": "estate-planning"}'

# Get Google Auth URL
curl http://localhost:8888/.netlify/functions/google-auth-url
```

### Test with JavaScript:

```javascript
// Generate content
const response = await fetch('/.netlify/functions/generate-content', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'What is a living trust?',
    practiceArea: 'estate-planning',
    language: 'english',
    includeDisclaimer: true
  })
});

const data = await response.json();
console.log(data);
```

---

## Best Practices

1. **Always handle errors**: Check response status and parse error messages
2. **Include loading states**: API calls can take 5-30 seconds
3. **Retry logic**: Implement retries for transient failures
4. **Cache when possible**: Store generated content to avoid re-generation
5. **Monitor costs**: Track API usage to manage costs
6. **Rate limiting**: Don't exceed provider rate limits
7. **Validate input**: Check data before sending to API

---

## Support

For API issues:
1. Check Netlify Function logs
2. Test with sample data
3. Verify API keys are correct
4. Review error messages
5. Contact: rozsa@gyenelaw.com

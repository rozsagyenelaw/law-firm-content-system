# HeyGen Video Creation Fix

## Problem Resolved

**Issue**: Getting 500 error when trying to create HeyGen videos
**Error Message**: "Failed to create HeyGen video"

## What Was Wrong

The HeyGen video creation function was using placeholder avatar IDs (`'default_avatar_id'`) instead of actual HeyGen avatar IDs. When the system tried to create a video, HeyGen's API rejected the request because the avatar IDs didn't exist.

## What Was Fixed

### 1. Added Real Avatar IDs
Replaced placeholder IDs with HeyGen's public avatars:
- **professional_male**: `Angela-inblackskirt-20220820`
- **professional_female**: `Anna_public_3_20240108`

These are publicly available avatars that all HeyGen accounts can use.

### 2. Added Proper Voice IDs
Added actual HeyGen voice IDs for text-to-speech:
- **English**: `1bd001e7e50f421d891986aad5158bc8`
- **Spanish**: `af9e1e4a3c254ad096e5c3a99c7e8c1e`

### 3. Improved Error Messages
- Now logs full API response for debugging
- Returns detailed error information
- Includes helpful hints about API key and credits

### 4. Added Avatar Listing Tool
Created a new function `/list-heygen-avatars` that fetches all available avatars from your HeyGen account. This helps you find custom avatar IDs if you have any.

---

## How to Test

1. Go to https://lawfirmcontentsystem.netlify.app
2. Create some content or use existing content
3. Click "Create HeyGen Video"
4. Select avatar and format
5. Click "Create Video"
6. You should see a progress bar instead of an error!

---

## If You Still Get Errors

### Check 1: HeyGen API Key
Make sure your HeyGen API key is valid:
1. Go to https://app.heygen.com/settings/api-key
2. Copy your API key
3. Compare with what's in Netlify environment variables
4. Update if needed

### Check 2: HeyGen Credits
HeyGen charges credits for video creation. Check your account:
1. Go to https://app.heygen.com/billing
2. Verify you have available credits
3. Purchase more if needed

### Check 3: Avatar Access
The public avatars should work for everyone, but if you get "avatar not found":
1. Go to https://app.heygen.com/avatars
2. Browse available avatars
3. To get a list programmatically, call:
   ```
   GET https://lawfirmcontentsystem.netlify.app/.netlify/functions/list-heygen-avatars
   ```
4. Copy the avatar IDs you want to use
5. Update `netlify/functions/create-heygen-video.js` lines 8-11

---

## Using Custom Avatars

If you have custom avatars in your HeyGen account:

### Step 1: Get Your Avatar IDs

**Option A - Via API:**
```bash
curl https://lawfirmcontentsystem.netlify.app/.netlify/functions/list-heygen-avatars
```

**Option B - From HeyGen Dashboard:**
1. Go to https://app.heygen.com/avatars
2. Click on an avatar
3. Look for the avatar ID in the URL or settings

### Step 2: Update the Code

Edit `netlify/functions/create-heygen-video.js`:

```javascript
// Replace these lines (8-11):
const AVATARS = {
  professional_male: 'YOUR_MALE_AVATAR_ID_HERE',
  professional_female: 'YOUR_FEMALE_AVATAR_ID_HERE'
};
```

### Step 3: Commit and Deploy

```bash
git add netlify/functions/create-heygen-video.js
git commit -m "Update HeyGen avatar IDs to use custom avatars"
git push origin main
npm run deploy
```

---

## Understanding HeyGen Video Creation

### How It Works:
1. User clicks "Create HeyGen Video"
2. Frontend sends script + settings to backend
3. Backend calls HeyGen API with:
   - Avatar ID (which avatar to use)
   - Voice ID (which voice to use)
   - Script text (what to say)
   - Video dimensions (9:16 or 1:1)
4. HeyGen starts generating video (takes 5-15 minutes)
5. Frontend polls every 10 seconds to check status
6. When complete, video is saved to Google Drive
7. User gets "View Video" button

### What Can Go Wrong:
- **Invalid API Key**: Returns 401/403 error
- **No Credits**: Returns 402/429 error
- **Invalid Avatar ID**: Returns 400/500 error ← This was your issue!
- **Invalid Voice ID**: Returns 400 error
- **Script Too Long**: Returns 400 error (max ~5000 characters)

---

## Current Settings

### Default Avatars:
- Male: Angela-inblackskirt-20220820 (public avatar)
- Female: Anna_public_3_20240108 (public avatar)

### Default Voices:
- English: Professional male voice
- Spanish: Professional male voice

### Video Formats:
- 9:16 (1080x1920) - For Instagram/TikTok Reels, Stories
- 1:1 (1080x1080) - For Instagram/Facebook Feed

### Processing Time:
- Typical: 5-10 minutes
- Max timeout: 20 minutes
- Polling interval: Every 10 seconds

---

## Monitoring Video Creation

To see real-time logs of video creation:

1. Go to Netlify dashboard: https://app.netlify.com/sites/lawfirmcontentsystem/functions
2. Click on `create-heygen-video`
3. View the function logs
4. You'll see:
   - API request details
   - HeyGen response
   - Any errors with full details

---

## Alternative: Use Pictory Instead

If HeyGen continues to have issues, you can use Pictory:
- Pictory creates videos from scripts using stock footage
- No avatar needed
- Similar API integration
- Click "Create Pictory Video" instead

Both video creation methods work the same way in the UI.

---

## Summary

✅ **Fixed**: HeyGen avatar and voice IDs
✅ **Added**: Better error messages
✅ **Added**: Avatar listing function
✅ **Deployed**: All changes live in production

You should now be able to create HeyGen videos successfully!

If you still encounter issues, check the Netlify function logs for detailed error messages.

---

**Last Updated**: December 5, 2024
**Status**: Fixed and deployed

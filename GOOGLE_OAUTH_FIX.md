# Fix Google OAuth for Production - 2 Minute Setup

## What You Need to Do

Add the production URL to your Google Cloud Console OAuth settings.

---

## Step-by-Step Instructions

### Step 1: Open Google Cloud Console
Go to: **https://console.cloud.google.com/apis/credentials**

### Step 2: Find Your OAuth Client
- You should see: "Web client 1" or similar
- Client ID starts with: `326585223924-...`
- Click on it to edit

### Step 3: Add Production Redirect URI
1. Scroll to **"Authorized redirect URIs"**
2. You should already see:
   ```
   http://localhost:8889/.netlify/functions/google-auth-callback
   ```
3. Click **"+ ADD URI"**
4. Paste this EXACTLY:
   ```
   https://lawfirmcontentsystem.netlify.app/.netlify/functions/google-auth-callback
   ```
5. Click **"SAVE"** at the bottom

### Step 4: Done!
That's it! No redeployment needed.

---

## Visual Guide

```
Before:
┌────────────────────────────────────────────────┐
│ Authorized redirect URIs                       │
├────────────────────────────────────────────────┤
│ • http://localhost:8889/.netlify/functions/... │
└────────────────────────────────────────────────┘

After:
┌────────────────────────────────────────────────┐
│ Authorized redirect URIs                       │
├────────────────────────────────────────────────┤
│ • http://localhost:8889/.netlify/functions/... │
│ • https://lawfirmcontentsystem.netlify.app/... │
└────────────────────────────────────────────────┘
```

---

## What This URL Does

When you click "Connect Google Drive" on the production site, Google will:
1. Show authorization popup
2. You approve
3. Google redirects back to this URL
4. Your app saves the connection

Without this URL, Google will reject the connection.

---

## Verification

After adding the URL:

1. Go to: https://lawfirmcontentsystem.netlify.app
2. Try to connect Google Drive
3. Should work! ✅

---

## If You Get Stuck

The exact URL to add is:
```
https://lawfirmcontentsystem.netlify.app/.netlify/functions/google-auth-callback
```

Copy and paste this exactly - no spaces, no trailing slash after "callback".

---

**Time to complete: 2 minutes**

const { google } = require('googleapis');

const FOLDER_STRUCTURE = {
  'videos-en': 'Social Media Videos/English',
  'videos-es': 'Social Media Videos/Spanish',
  'articles-en': 'Generated Content/Articles/English',
  'articles-es': 'Generated Content/Articles/Spanish',
  'scripts': 'Generated Content/Scripts',
  'images': 'Generated Content/Images'
};

// Initialize OAuth2 client
const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

// Get or create folder
const getOrCreateFolder = async (drive, folderPath, parentId = null) => {
  const parts = folderPath.split('/');
  let currentParentId = parentId;

  for (const folderName of parts) {
    // Search for existing folder
    const response = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false ${currentParentId ? `and '${currentParentId}' in parents` : ''}`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    if (response.data.files.length > 0) {
      currentParentId = response.data.files[0].id;
    } else {
      // Create folder
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: currentParentId ? [currentParentId] : []
      };

      const folder = await drive.files.create({
        resource: folderMetadata,
        fields: 'id'
      });

      currentParentId = folder.data.id;
    }
  }

  return currentParentId;
};

// Save file to Drive
const saveFileToDrive = async (drive, fileName, content, mimeType, folderId) => {
  const fileMetadata = {
    name: fileName,
    parents: [folderId]
  };

  let media;
  if (typeof content === 'string') {
    // Text content
    media = {
      mimeType: mimeType,
      body: content
    };
  } else {
    // Binary content (Buffer)
    media = {
      mimeType: mimeType,
      body: content
    };
  }

  const file = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id, webViewLink, webContentLink'
  });

  return {
    fileId: file.data.id,
    viewLink: file.data.webViewLink,
    downloadLink: file.data.webContentLink
  };
};

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
    const {
      fileName,
      content,
      contentType,
      folderType,
      accessToken
    } = JSON.parse(event.body);

    if (!fileName || !content || !folderType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    if (!accessToken) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Google Drive authentication required' })
      };
    }

    // Set up OAuth2 client with access token
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Get folder path
    const folderPath = FOLDER_STRUCTURE[folderType];
    if (!folderPath) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid folder type' })
      };
    }

    // Create folder structure if it doesn't exist
    const folderId = await getOrCreateFolder(drive, folderPath);

    // Determine mime type
    let mimeType = contentType || 'text/plain';
    if (fileName.endsWith('.mp4')) mimeType = 'video/mp4';
    else if (fileName.endsWith('.png')) mimeType = 'image/png';
    else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) mimeType = 'image/jpeg';
    else if (fileName.endsWith('.txt')) mimeType = 'text/plain';
    else if (fileName.endsWith('.html')) mimeType = 'text/html';
    else if (fileName.endsWith('.pdf')) mimeType = 'application/pdf';

    // Save file
    const result = await saveFileToDrive(drive, fileName, content, mimeType, folderId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        fileId: result.fileId,
        viewLink: result.viewLink,
        downloadLink: result.downloadLink,
        folderPath: folderPath
      })
    };

  } catch (error) {
    console.error('Error saving to Google Drive:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to save to Google Drive',
        details: error.message,
        hint: error.response?.data || 'Check if Google Drive access token is valid'
      })
    };
  }
};

import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { getStatusLabel, getStatusColor, formatDate } from '../utils/helpers';
import apiClient from '../utils/apiClient';

function Dashboard({ contentList, onNavigate, onUpdateContent }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [driveConnected, setDriveConnected] = useState(false);
  const [driveToken, setDriveToken] = useState(null);

  useEffect(() => {
    // Check if Google Drive is connected
    const token = localStorage.getItem('googleDriveToken');
    if (token) {
      setDriveConnected(true);
      setDriveToken(token);
    }

    // Listen for OAuth callback
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const handleOAuthMessage = (event) => {
    if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
      const { access_token } = event.data.tokens;
      localStorage.setItem('googleDriveToken', access_token);
      setDriveConnected(true);
      setDriveToken(access_token);
    }
  };

  const handleConnectDrive = async () => {
    try {
      const { authUrl } = await apiClient.getGoogleAuthUrl();
      window.open(authUrl, 'Google Drive Authorization', 'width=600,height=700');
    } catch (error) {
      alert('Failed to start Google Drive authorization: ' + error.message);
    }
  };

  const handleDisconnectDrive = () => {
    localStorage.removeItem('googleDriveToken');
    setDriveConnected(false);
    setDriveToken(null);
  };

  const filteredContent = filterStatus === 'all'
    ? contentList
    : contentList.filter(item => item.status === filterStatus);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h2>Content Dashboard</h2>
          <div className="drive-status">
            {driveConnected ? (
              <div className="drive-connected">
                <span className="drive-icon">✓</span>
                <span>Google Drive Connected</span>
                <button className="btn-link" onClick={handleDisconnectDrive}>
                  Disconnect
                </button>
              </div>
            ) : (
              <button className="btn btn-outline btn-small" onClick={handleConnectDrive}>
                Connect Google Drive
              </button>
            )}
          </div>
        </div>
        <div className="action-buttons">
          <button
            className="btn btn-primary btn-large"
            onClick={() => onNavigate('new-content')}
          >
            + Create New Content
          </button>
          <button
            className="btn btn-outline"
            onClick={() => onNavigate('import-blog')}
          >
            Import Blog
          </button>
          <button
            className="btn btn-outline"
            onClick={() => onNavigate('content-ideas')}
          >
            Get Content Ideas
          </button>
          <button
            className="btn btn-outline"
            onClick={() => onNavigate('image-generator')}
          >
            Generate Images
          </button>
        </div>
      </div>

      <div className="content-filters">
        <label>Filter by status:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="generating">Generating</option>
          <option value="ready">Ready</option>
          <option value="processing_video">Processing Video</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="content-list">
        {filteredContent.length === 0 ? (
          <div className="empty-state">
            <h3>No content yet</h3>
            <p>Create your first piece of content by clicking "Create New Content" above.</p>
          </div>
        ) : (
          filteredContent.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              onUpdateContent={onUpdateContent}
              driveToken={driveToken}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ContentCard({ content, onUpdateContent, driveToken }) {
  const [expanded, setExpanded] = useState(false);
  const [videoConfig, setVideoConfig] = useState({
    format: '9:16',
    avatar: 'professional_male'
  });
  const [showVideoConfig, setShowVideoConfig] = useState(null);

  const handleCreateVideo = async (platform) => {
    setShowVideoConfig(null);

    onUpdateContent(content.id, {
      status: 'processing_video',
      [`${platform}VideoStatus`]: 'processing',
      [`${platform}VideoProgress`]: 0
    });

    try {
      const script = content.language === 'spanish' || content.language === 'es'
        ? content.scriptEs || content.script
        : content.script;

      const language = content.language === 'spanish' || content.language === 'es' ? 'es' : 'en';

      let response;
      if (platform === 'heygen') {
        response = await apiClient.createHeyGenVideo({
          script,
          language,
          format: videoConfig.format,
          avatarType: videoConfig.avatar
        });
      } else {
        response = await apiClient.createPictoryVideo({
          script,
          language,
          format: videoConfig.format,
          videoName: `${content.topic.substring(0, 50)}_${Date.now()}`
        });
      }

      const videoId = response.videoId;

      // Poll for video status
      const pollInterval = setInterval(async () => {
        try {
          let statusResponse;
          if (platform === 'heygen') {
            statusResponse = await apiClient.getHeyGenVideoStatus(videoId);
          } else {
            statusResponse = await apiClient.getPictoryVideoStatus(videoId);
          }

          const { status, videoUrl, progress } = statusResponse;

          if (progress) {
            onUpdateContent(content.id, {
              [`${platform}VideoProgress`]: progress
            });
          }

          console.log('Video status update:', statusResponse);

          if (status === 'completed') {
            clearInterval(pollInterval);

            // Save to Google Drive if connected
            let driveUrl = null;
            if (driveToken && videoUrl) {
              try {
                const folderType = language === 'es'
                  ? `videos-${platform}-es`
                  : `videos-${platform}-en`;

                const driveResponse = await apiClient.saveToGoogleDrive({
                  fileName: `${content.topic.substring(0, 50)}_${platform}.mp4`,
                  content: videoUrl,
                  contentType: 'video/mp4',
                  folderType,
                  accessToken: driveToken
                });
                driveUrl = driveResponse.viewLink;
              } catch (driveError) {
                console.error('Failed to save to Drive:', driveError);
              }
            }

            onUpdateContent(content.id, {
              status: 'completed',
              [`${platform}VideoStatus`]: 'completed',
              [`${platform}VideoUrl`]: videoUrl,
              [`${platform}VideoDriveUrl`]: driveUrl,
              [`${platform}VideoProgress`]: 100
            });
          } else if (status === 'failed') {
            clearInterval(pollInterval);
            const errorMsg = statusResponse.errorMessage || statusResponse.error || 'Video generation failed';
            console.error('Video failed:', errorMsg);
            onUpdateContent(content.id, {
              status: 'failed',
              [`${platform}VideoStatus`]: 'failed',
              [`${platform}VideoError`]: errorMsg
            });
            alert(`Video generation failed: ${errorMsg}`);
          }
        } catch (pollError) {
          console.error('Error polling video status:', pollError);
        }
      }, 10000); // Poll every 10 seconds

      // Set timeout to stop polling after 20 minutes
      setTimeout(() => clearInterval(pollInterval), 1200000);

    } catch (error) {
      console.error(`Error creating ${platform} video:`, error);
      onUpdateContent(content.id, {
        status: 'failed',
        [`${platform}VideoStatus`]: 'failed',
        [`${platform}VideoError`]: error.message
      });
    }
  };

  return (
    <div className="content-card">
      <div className="content-card-header">
        <div>
          <h3>{content.topic}</h3>
          <div className="content-meta">
            <span className="content-type">{content.type}</span>
            <span className="content-language">{content.language}</span>
            <span className="content-practice-area">{content.practiceArea}</span>
            <span className="content-date">{formatDate(content.createdAt)}</span>
          </div>
        </div>
        <span
          className="status-badge"
          style={{ backgroundColor: getStatusColor(content.status) }}
        >
          {getStatusLabel(content.status)}
        </span>
      </div>

      <div className="content-card-body">
        {expanded && (
          <div className="content-details">
            {content.article && (
              <div className="content-section">
                <h4>Article</h4>
                <p className="content-preview">
                  {content.article.substring(0, 200)}...
                </p>
                {content.articleDriveUrl && (
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => window.open(content.articleDriveUrl)}
                  >
                    View in Drive
                  </button>
                )}
              </div>
            )}

            {content.script && (
              <div className="content-section">
                <h4>Video Script</h4>
                <p className="content-preview">{content.script}</p>
              </div>
            )}

            {content.captions && (
              <div className="content-section">
                <h4>Social Media Captions</h4>
                <ul>
                  {content.captions.map((caption, idx) => (
                    <li key={idx}>{caption}</li>
                  ))}
                </ul>
              </div>
            )}

            {content.hashtags && (
              <div className="content-section">
                <h4>Hashtags</h4>
                <p>{content.hashtags.join(' ')}</p>
              </div>
            )}
          </div>
        )}

        {/* Video Progress Bars */}
        {content.heygenVideoStatus === 'processing' && (
          <div className="video-progress">
            <label>HeyGen Video Progress:</label>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${content.heygenVideoProgress || 0}%` }}
              />
            </div>
            <span>{content.heygenVideoProgress || 0}%</span>
          </div>
        )}

        {content.pictoryVideoStatus === 'processing' && (
          <div className="video-progress">
            <label>Pictory Video Progress:</label>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${content.pictoryVideoProgress || 0}%` }}
              />
            </div>
            <span>{content.pictoryVideoProgress || 0}%</span>
          </div>
        )}

        {/* Video Configuration */}
        {showVideoConfig && (
          <div className="video-config">
            <h4>Video Settings for {showVideoConfig === 'heygen' ? 'HeyGen' : 'Pictory'}</h4>

            <div className="config-group">
              <label>Video Format:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="9:16"
                    checked={videoConfig.format === '9:16'}
                    onChange={(e) => setVideoConfig({...videoConfig, format: e.target.value})}
                  />
                  <span>9:16 (Reels/Stories)</span>
                </label>
                <label>
                  <input
                    type="radio"
                    value="1:1"
                    checked={videoConfig.format === '1:1'}
                    onChange={(e) => setVideoConfig({...videoConfig, format: e.target.value})}
                  />
                  <span>1:1 (Feed)</span>
                </label>
              </div>
            </div>

            {showVideoConfig === 'heygen' && (
              <div className="config-group">
                <label>Avatar:</label>
                <select
                  value={videoConfig.avatar}
                  onChange={(e) => setVideoConfig({...videoConfig, avatar: e.target.value})}
                >
                  <option value="professional_male">Professional Male</option>
                  <option value="professional_female">Professional Female</option>
                </select>
              </div>
            )}

            <div className="config-actions">
              <button
                className="btn btn-outline btn-small"
                onClick={() => setShowVideoConfig(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-small"
                onClick={() => handleCreateVideo(showVideoConfig)}
              >
                Create Video
              </button>
            </div>
          </div>
        )}

        <div className="content-actions">
          <button
            className="btn btn-outline"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show Less' : 'Show More'}
          </button>

          {content.status === 'ready' && !showVideoConfig && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => setShowVideoConfig('heygen')}
                disabled={content.heygenVideoStatus === 'processing'}
              >
                {content.heygenVideoStatus === 'processing'
                  ? 'Creating HeyGen Video...'
                  : 'Create HeyGen Video'}
              </button>

              <button
                className="btn btn-primary"
                onClick={() => setShowVideoConfig('pictory')}
                disabled={content.pictoryVideoStatus === 'processing'}
              >
                {content.pictoryVideoStatus === 'processing'
                  ? 'Creating Pictory Video...'
                  : 'Create Pictory Video'}
              </button>
            </>
          )}

          {content.heygenVideoUrl && (
            <>
              <a
                href={content.heygenVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success"
              >
                View HeyGen Video
              </a>
              {content.heygenVideoDriveUrl && (
                <a
                  href={content.heygenVideoDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-small"
                >
                  Open in Drive
                </a>
              )}
            </>
          )}

          {content.pictoryVideoUrl && (
            <>
              <a
                href={content.pictoryVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success"
              >
                View Pictory Video
              </a>
              {content.pictoryVideoDriveUrl && (
                <a
                  href={content.pictoryVideoDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-small"
                >
                  Open in Drive
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

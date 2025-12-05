import React, { useState } from 'react';
import './Dashboard.css';
import { getStatusLabel, getStatusColor, formatDate } from '../utils/helpers';

function Dashboard({ contentList, onNavigate, onUpdateContent }) {
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredContent = filterStatus === 'all'
    ? contentList
    : contentList.filter(item => item.status === filterStatus);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Content Dashboard</h2>
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
            />
          ))
        )}
      </div>
    </div>
  );
}

function ContentCard({ content, onUpdateContent }) {
  const [expanded, setExpanded] = useState(false);

  const handleCreateVideo = async (platform) => {
    onUpdateContent(content.id, {
      status: 'processing_video',
      [`${platform}VideoStatus`]: 'processing'
    });

    // TODO: Call video API
    // For now, simulate processing
    setTimeout(() => {
      onUpdateContent(content.id, {
        [`${platform}VideoStatus`]: 'completed',
        [`${platform}VideoUrl`]: 'https://drive.google.com/file/example'
      });
    }, 3000);
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
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => window.open(content.articleUrl)}
                  disabled={!content.articleUrl}
                >
                  View in Drive
                </button>
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

        <div className="content-actions">
          <button
            className="btn btn-outline"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show Less' : 'Show More'}
          </button>

          {content.status === 'ready' && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => handleCreateVideo('heygen')}
                disabled={content.heygenVideoStatus === 'processing'}
              >
                {content.heygenVideoStatus === 'processing'
                  ? 'Creating HeyGen Video...'
                  : 'Create HeyGen Video'}
              </button>

              <button
                className="btn btn-primary"
                onClick={() => handleCreateVideo('pictory')}
                disabled={content.pictoryVideoStatus === 'processing'}
              >
                {content.pictoryVideoStatus === 'processing'
                  ? 'Creating Pictory Video...'
                  : 'Create Pictory Video'}
              </button>
            </>
          )}

          {content.heygenVideoUrl && (
            <a
              href={content.heygenVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-success"
            >
              View HeyGen Video
            </a>
          )}

          {content.pictoryVideoUrl && (
            <a
              href={content.pictoryVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-success"
            >
              View Pictory Video
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

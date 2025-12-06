import React, { useState } from 'react';
import './ContentGenerator.css';
import { PRACTICE_AREAS, LANGUAGES, CONTENT_STATUS } from '../constants';
import { generateId, countWords, estimateScriptDuration } from '../utils/helpers';
import apiClient from '../utils/apiClient';

function ContentGenerator({ onBack, onContentCreated }) {
  const [topic, setTopic] = useState('');
  const [practiceArea, setPracticeArea] = useState('estate-planning');
  const [language, setLanguage] = useState('english');
  const [articleLength, setArticleLength] = useState('full');
  const [includeDisclaimer, setIncludeDisclaimer] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [driveTokens, setDriveTokens] = useState(null);

  // Check if Google Drive is connected
  React.useEffect(() => {
    const tokens = localStorage.getItem('googleDriveTokens');
    if (tokens) {
      setDriveConnected(true);
      setDriveTokens(JSON.parse(tokens));
    }
  }, []);

  // Helper function to get valid access token (refresh if expired)
  const getValidAccessToken = async (tokens) => {
    if (!tokens) return null;

    // Check if token is expired or will expire in the next minute
    const now = Date.now();
    const expiryDate = tokens.expiry_date;

    if (expiryDate && expiryDate > now + 60000) {
      // Token is still valid
      return tokens.access_token;
    }

    // Token expired or about to expire, refresh it
    try {
      const refreshedTokens = await apiClient.refreshGoogleToken(tokens.refresh_token);

      // Update stored tokens
      const newTokens = { ...tokens, ...refreshedTokens };
      localStorage.setItem('googleDriveTokens', JSON.stringify(newTokens));
      setDriveTokens(newTokens);

      return refreshedTokens.access_token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // If refresh fails, try using the old token anyway
      return tokens.access_token;
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await apiClient.generateContent({
        topic,
        practiceArea,
        language,
        articleLength,
        includeDisclaimer
      });

      const content = {
        id: generateId(),
        type: 'new',
        topic,
        practiceArea,
        language,
        status: CONTENT_STATUS.READY,
        createdAt: new Date().toISOString(),
        ...response
      };

      setGeneratedContent(content);
    } catch (err) {
      setError(err.message || 'Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent) return;

    setSaving(true);
    setError(null);

    try {
      let contentWithDriveUrls = { ...generatedContent };

      // Save to Google Drive if connected
      if (driveConnected && driveTokens) {
        // Get valid access token (refresh if needed)
        const accessToken = await getValidAccessToken(driveTokens);

        if (accessToken) {
          // Save English article
          if (generatedContent.article) {
            try {
              const englishResponse = await apiClient.saveToGoogleDrive({
                fileName: `${topic.substring(0, 50)}_article.txt`,
                content: generatedContent.article,
                contentType: 'text/plain',
                folderType: 'articles-en',
                accessToken: accessToken
              });
              contentWithDriveUrls.articleDriveUrl = englishResponse.viewLink;
            } catch (driveError) {
              console.error('Failed to save English article to Drive:', driveError);
            }
          }

          // Save Spanish article if it exists
          if (generatedContent.articleEs) {
            try {
              const spanishResponse = await apiClient.saveToGoogleDrive({
                fileName: `${topic.substring(0, 50)}_articulo.txt`,
                content: generatedContent.articleEs,
                contentType: 'text/plain',
                folderType: 'articles-es',
                accessToken: accessToken
              });
              contentWithDriveUrls.articleEsDriveUrl = spanishResponse.viewLink;
            } catch (driveError) {
              console.error('Failed to save Spanish article to Drive:', driveError);
            }
          }
        }
      }

      onContentCreated(contentWithDriveUrls);
      onBack();
    } catch (err) {
      setError(err.message || 'Failed to save content');
      setSaving(false);
    }
  };

  const handleEdit = (field, value) => {
    setGeneratedContent({
      ...generatedContent,
      [field]: value
    });
  };

  return (
    <div className="content-generator">
      <div className="generator-header">
        <button className="btn btn-outline" onClick={onBack}>
          ← Back to Dashboard
        </button>
        <h2>Create New Content</h2>
      </div>

      {!generatedContent ? (
        <div className="generator-form card">
          <div className="form-group">
            <label htmlFor="topic">
              Topic <span className="required">*</span>
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., What happens if you die without a will in California"
              disabled={generating}
            />
            <small>Enter the legal topic you want to create content about</small>
          </div>

          <div className="form-group">
            <label htmlFor="practiceArea">
              Practice Area <span className="required">*</span>
            </label>
            <select
              id="practiceArea"
              value={practiceArea}
              onChange={(e) => setPracticeArea(e.target.value)}
              disabled={generating}
            >
              {PRACTICE_AREAS.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="language">
              Language <span className="required">*</span>
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={generating}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="articleLength">
              Article Length <span className="required">*</span>
            </label>
            <select
              id="articleLength"
              value={articleLength}
              onChange={(e) => setArticleLength(e.target.value)}
              disabled={generating}
            >
              <option value="full">Full Article (800-1200 words) - For blog/website</option>
              <option value="short">Short Article (200-300 words) - For video descriptions</option>
            </select>
            <small>
              Choose full-length for your website blog, or short for video descriptions and social media
            </small>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={includeDisclaimer}
                onChange={(e) => setIncludeDisclaimer(e.target.checked)}
                disabled={generating}
              />
              <span>Include legal disclaimers (recommended)</span>
            </label>
            <small>
              Automatically adds appropriate disclaimers to comply with California State Bar rules
            </small>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <button
            className="btn btn-primary btn-large"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <>
                <div className="spinner-small"></div>
                Generating Content...
              </>
            ) : (
              'Generate Content'
            )}
          </button>
        </div>
      ) : (
        <div className="generated-content">
          <div className="alert alert-success">
            Content generated successfully! Review and edit before saving.
          </div>

          {/* Article */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Blog Article</h3>
              <span className="word-count">
                {countWords(generatedContent.article)} words
              </span>
            </div>
            <div className="form-group">
              <textarea
                value={generatedContent.article}
                onChange={(e) => handleEdit('article', e.target.value)}
                rows="15"
              />
            </div>
          </div>

          {/* Video Script */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Video Script</h3>
              <span className="script-duration">
                ~{estimateScriptDuration(generatedContent.script)} seconds
              </span>
            </div>
            <div className="form-group">
              <textarea
                value={generatedContent.script}
                onChange={(e) => handleEdit('script', e.target.value)}
                rows="8"
              />
            </div>
          </div>

          {/* Social Media Captions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Social Media Captions</h3>
            </div>
            {generatedContent.captions.map((caption, index) => (
              <div key={index} className="form-group">
                <label>Caption {index + 1}</label>
                <textarea
                  value={caption}
                  onChange={(e) => {
                    const newCaptions = [...generatedContent.captions];
                    newCaptions[index] = e.target.value;
                    handleEdit('captions', newCaptions);
                  }}
                  rows="3"
                />
              </div>
            ))}
          </div>

          {/* Hashtags */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Hashtags</h3>
            </div>
            <div className="form-group">
              <input
                type="text"
                value={generatedContent.hashtags.join(' ')}
                onChange={(e) => handleEdit('hashtags', e.target.value.split(' '))}
                placeholder="#estateplanning #california #lawfirm"
              />
            </div>
          </div>

          {/* Spanish Content (if both languages selected) */}
          {language === 'both' && generatedContent.articleEs && (
            <>
              <div className="language-divider">
                <h3>Spanish Content</h3>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Artículo (Spanish)</h3>
                  <span className="word-count">
                    {countWords(generatedContent.articleEs)} palabras
                  </span>
                </div>
                <div className="form-group">
                  <textarea
                    value={generatedContent.articleEs}
                    onChange={(e) => handleEdit('articleEs', e.target.value)}
                    rows="15"
                  />
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Guión de Video (Spanish)</h3>
                </div>
                <div className="form-group">
                  <textarea
                    value={generatedContent.scriptEs}
                    onChange={(e) => handleEdit('scriptEs', e.target.value)}
                    rows="8"
                  />
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Subtítulos (Spanish)</h3>
                </div>
                {generatedContent.captionsEs.map((caption, index) => (
                  <div key={index} className="form-group">
                    <label>Subtítulo {index + 1}</label>
                    <textarea
                      value={caption}
                      onChange={(e) => {
                        const newCaptions = [...generatedContent.captionsEs];
                        newCaptions[index] = e.target.value;
                        handleEdit('captionsEs', newCaptions);
                      }}
                      rows="3"
                    />
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Hashtags (Spanish)</h3>
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    value={generatedContent.hashtagsEs.join(' ')}
                    onChange={(e) => handleEdit('hashtagsEs', e.target.value.split(' '))}
                  />
                </div>
              </div>
            </>
          )}

          <div className="generator-actions">
            <button
              className="btn btn-outline"
              onClick={() => {
                setGeneratedContent(null);
                setTopic('');
                setError(null);
              }}
              disabled={saving}
            >
              Start Over
            </button>
            <button
              className="btn btn-primary btn-large"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="spinner-small"></div>
                  Saving{driveConnected ? ' to Drive' : ''}...
                </>
              ) : (
                'Save & Continue to Videos'
              )}
            </button>
          </div>
          {driveConnected && (
            <p className="drive-info">
              Articles will be automatically saved to Google Drive
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default ContentGenerator;

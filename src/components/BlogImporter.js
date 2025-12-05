import React, { useState } from 'react';
import './BlogImporter.css';
import { LANGUAGES, CONTENT_STATUS } from '../constants';
import { generateId, isValidUrl, estimateScriptDuration } from '../utils/helpers';
import apiClient from '../utils/apiClient';

function BlogImporter({ onBack, onContentCreated }) {
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState('english');
  const [includeDisclaimer, setIncludeDisclaimer] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [importedContent, setImportedContent] = useState(null);

  const handleImport = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }

    setImporting(true);
    setError(null);

    try {
      const response = await apiClient.importBlog({
        url,
        language,
        includeDisclaimer
      });

      const content = {
        id: generateId(),
        type: 'imported',
        topic: response.title,
        practiceArea: 'imported',
        language,
        status: CONTENT_STATUS.READY,
        createdAt: new Date().toISOString(),
        sourceUrl: url,
        ...response
      };

      setImportedContent(content);
    } catch (err) {
      setError(err.message || 'Failed to import blog');
    } finally {
      setImporting(false);
    }
  };

  const handleSave = () => {
    if (importedContent) {
      onContentCreated(importedContent);
      onBack();
    }
  };

  const handleEdit = (field, value) => {
    setImportedContent({
      ...importedContent,
      [field]: value
    });
  };

  return (
    <div className="blog-importer">
      <div className="importer-header">
        <button className="btn btn-outline" onClick={onBack}>
          ← Back to Dashboard
        </button>
        <h2>Import Existing Blog</h2>
      </div>

      {!importedContent ? (
        <div className="importer-form card">
          <div className="form-group">
            <label htmlFor="url">
              Blog URL <span className="required">*</span>
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://gyenelaw.com/blog/your-article"
              disabled={importing}
            />
            <small>
              Enter the URL from gyenelaw.com, premierdubairealty.com, or any blog article
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="language">
              Generate Script In <span className="required">*</span>
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={importing}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={includeDisclaimer}
                onChange={(e) => setIncludeDisclaimer(e.target.checked)}
                disabled={importing}
              />
              <span>Include legal disclaimers (recommended)</span>
            </label>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <button
            className="btn btn-primary btn-large"
            onClick={handleImport}
            disabled={importing}
          >
            {importing ? (
              <>
                <div className="spinner-small"></div>
                Importing Blog...
              </>
            ) : (
              'Import & Generate Script'
            )}
          </button>
        </div>
      ) : (
        <div className="imported-content">
          <div className="alert alert-success">
            Blog imported successfully! Review the generated script before saving.
          </div>

          {/* Original Article Preview */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Original Article</h3>
              <a
                href={importedContent.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-small"
              >
                View Original
              </a>
            </div>
            <h4 className="article-title">{importedContent.topic}</h4>
            <p className="article-preview">
              {importedContent.originalArticle?.substring(0, 300)}...
            </p>
          </div>

          {/* Video Script */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Video Script</h3>
              <span className="script-duration">
                ~{estimateScriptDuration(importedContent.script)} seconds
              </span>
            </div>
            <div className="form-group">
              <textarea
                value={importedContent.script}
                onChange={(e) => handleEdit('script', e.target.value)}
                rows="10"
              />
            </div>
          </div>

          {/* Social Media Captions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Social Media Captions</h3>
            </div>
            {importedContent.captions.map((caption, index) => (
              <div key={index} className="form-group">
                <label>Caption {index + 1}</label>
                <textarea
                  value={caption}
                  onChange={(e) => {
                    const newCaptions = [...importedContent.captions];
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
                value={importedContent.hashtags.join(' ')}
                onChange={(e) => handleEdit('hashtags', e.target.value.split(' '))}
              />
            </div>
          </div>

          {/* Spanish Content (if both languages selected) */}
          {language === 'both' && importedContent.scriptEs && (
            <>
              <div className="language-divider">
                <h3>Spanish Content</h3>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Guión de Video (Spanish)</h3>
                </div>
                <div className="form-group">
                  <textarea
                    value={importedContent.scriptEs}
                    onChange={(e) => handleEdit('scriptEs', e.target.value)}
                    rows="10"
                  />
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Subtítulos (Spanish)</h3>
                </div>
                {importedContent.captionsEs.map((caption, index) => (
                  <div key={index} className="form-group">
                    <label>Subtítulo {index + 1}</label>
                    <textarea
                      value={caption}
                      onChange={(e) => {
                        const newCaptions = [...importedContent.captionsEs];
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
                    value={importedContent.hashtagsEs.join(' ')}
                    onChange={(e) => handleEdit('hashtagsEs', e.target.value.split(' '))}
                  />
                </div>
              </div>
            </>
          )}

          <div className="importer-actions">
            <button
              className="btn btn-outline"
              onClick={() => {
                setImportedContent(null);
                setUrl('');
                setError(null);
              }}
            >
              Import Another
            </button>
            <button
              className="btn btn-primary btn-large"
              onClick={handleSave}
            >
              Save & Continue to Videos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogImporter;

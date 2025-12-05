import React, { useState } from 'react';
import './ContentIdeasGenerator.css';
import { PRACTICE_AREAS, SEASONAL_TOPICS } from '../constants';
import apiClient from '../utils/apiClient';

function ContentIdeasGenerator({ onBack, onTopicSelected }) {
  const [practiceArea, setPracticeArea] = useState('estate-planning');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [savedIdeas, setSavedIdeas] = useState([]);

  const handleGenerateIdeas = async () => {
    setGenerating(true);
    setError(null);

    try {
      const response = await apiClient.generateContentIdeas(practiceArea);
      setIdeas(response.ideas);
    } catch (err) {
      setError(err.message || 'Failed to generate content ideas');
    } finally {
      setGenerating(false);
    }
  };

  const handleUseSeasonalIdeas = () => {
    const seasonal = SEASONAL_TOPICS[practiceArea] || [];
    setIdeas(seasonal);
  };

  const handleSaveIdea = (idea) => {
    if (!savedIdeas.includes(idea)) {
      setSavedIdeas([...savedIdeas, idea]);
    }
  };

  const handleRemoveSavedIdea = (idea) => {
    setSavedIdeas(savedIdeas.filter(i => i !== idea));
  };

  return (
    <div className="content-ideas-generator">
      <div className="generator-header">
        <button className="btn btn-outline" onClick={onBack}>
          ← Back to Dashboard
        </button>
        <h2>Content Ideas Generator</h2>
      </div>

      <div className="ideas-form card">
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

        <div className="ideas-actions">
          <button
            className="btn btn-primary"
            onClick={handleGenerateIdeas}
            disabled={generating}
          >
            {generating ? (
              <>
                <div className="spinner-small"></div>
                Generating Ideas...
              </>
            ) : (
              'Generate 10 AI-Powered Ideas'
            )}
          </button>

          <button
            className="btn btn-outline"
            onClick={handleUseSeasonalIdeas}
            disabled={generating}
          >
            Show Seasonal Topics
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
      </div>

      {ideas.length > 0 && (
        <div className="ideas-list">
          <h3>Content Ideas</h3>
          <div className="ideas-grid">
            {ideas.map((idea, index) => (
              <div key={index} className="idea-card">
                <p>{idea}</p>
                <div className="idea-actions">
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => onTopicSelected(idea)}
                  >
                    Use This Topic
                  </button>
                  <button
                    className="btn btn-outline btn-small"
                    onClick={() => handleSaveIdea(idea)}
                  >
                    {savedIdeas.includes(idea) ? 'Saved ✓' : 'Save for Later'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {savedIdeas.length > 0 && (
        <div className="saved-ideas">
          <h3>Saved Ideas</h3>
          <div className="saved-ideas-list">
            {savedIdeas.map((idea, index) => (
              <div key={index} className="saved-idea-item">
                <span>{idea}</span>
                <div className="saved-idea-actions">
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => onTopicSelected(idea)}
                  >
                    Use
                  </button>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => handleRemoveSavedIdea(idea)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ContentIdeasGenerator;

import React, { useState } from 'react';
import './ImageGenerator.css';
import { IMAGE_SIZES, BRAND_COLORS } from '../constants';
import apiClient from '../utils/apiClient';

function ImageGenerator({ onBack }) {
  const [imageType, setImageType] = useState('quote');
  const [prompt, setPrompt] = useState('');
  const [text, setText] = useState('');
  const [selectedSizes, setSelectedSizes] = useState(['SQUARE']);
  const [brandColors, setBrandColors] = useState(BRAND_COLORS);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);

  const handleGenerate = async () => {
    if (!prompt.trim() && !text.trim()) {
      setError('Please provide either a prompt or text for the image');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await apiClient.generateImage({
        imageType,
        prompt,
        text,
        sizes: selectedSizes,
        brandColors
      });

      setGeneratedImages(response.images);
    } catch (err) {
      setError(err.message || 'Failed to generate images');
    } finally {
      setGenerating(false);
    }
  };

  const handleSizeToggle = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const getImageTypeDescription = () => {
    switch(imageType) {
      case 'quote':
        return 'Create quote graphics with legal tips and professional design';
      case 'infographic':
        return 'Generate simple infographics (e.g., "5 Steps to Create a Will")';
      case 'branded':
        return 'Professional branded images for announcements';
      case 'text_overlay':
        return 'Text overlay images for Instagram/Facebook';
      default:
        return '';
    }
  };

  return (
    <div className="image-generator">
      <div className="generator-header">
        <button className="btn btn-outline" onClick={onBack}>
          ← Back to Dashboard
        </button>
        <h2>Generate Social Media Images</h2>
      </div>

      <div className="generator-form card">
        <div className="form-group">
          <label htmlFor="imageType">
            Image Type <span className="required">*</span>
          </label>
          <select
            id="imageType"
            value={imageType}
            onChange={(e) => setImageType(e.target.value)}
            disabled={generating}
          >
            <option value="quote">Quote Graphic</option>
            <option value="infographic">Simple Infographic</option>
            <option value="branded">Branded Announcement</option>
            <option value="text_overlay">Text Overlay</option>
          </select>
          <small>{getImageTypeDescription()}</small>
        </div>

        <div className="form-group">
          <label htmlFor="prompt">
            Image Description/Prompt <span className="required">*</span>
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to create..."
            rows="4"
            disabled={generating}
          />
          <small>
            Example: "Professional image with a quote about estate planning importance"
          </small>
        </div>

        {(imageType === 'quote' || imageType === 'text_overlay') && (
          <div className="form-group">
            <label htmlFor="text">
              Text/Quote to Display
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the text to display on the image..."
              rows="3"
              disabled={generating}
            />
          </div>
        )}

        <div className="form-group">
          <label>
            Image Sizes <span className="required">*</span>
          </label>
          <div className="size-options">
            {Object.entries(IMAGE_SIZES).map(([key, size]) => (
              <label key={key} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(key)}
                  onChange={() => handleSizeToggle(key)}
                  disabled={generating}
                />
                <span>
                  {size.name}
                  <small>{size.width}x{size.height}px</small>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Brand Colors</label>
          <div className="color-inputs">
            <div className="color-input-group">
              <label htmlFor="primaryColor">Primary</label>
              <input
                id="primaryColor"
                type="color"
                value={brandColors.primary}
                onChange={(e) => setBrandColors({...brandColors, primary: e.target.value})}
                disabled={generating}
              />
              <input
                type="text"
                value={brandColors.primary}
                onChange={(e) => setBrandColors({...brandColors, primary: e.target.value})}
                disabled={generating}
              />
            </div>
            <div className="color-input-group">
              <label htmlFor="secondaryColor">Secondary</label>
              <input
                id="secondaryColor"
                type="color"
                value={brandColors.secondary}
                onChange={(e) => setBrandColors({...brandColors, secondary: e.target.value})}
                disabled={generating}
              />
              <input
                type="text"
                value={brandColors.secondary}
                onChange={(e) => setBrandColors({...brandColors, secondary: e.target.value})}
                disabled={generating}
              />
            </div>
          </div>
          <small>These colors will be used in the generated images</small>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <button
          className="btn btn-primary btn-large"
          onClick={handleGenerate}
          disabled={generating || selectedSizes.length === 0}
        >
          {generating ? (
            <>
              <div className="spinner-small"></div>
              Generating Images...
            </>
          ) : (
            'Generate Images'
          )}
        </button>
      </div>

      {generatedImages.length > 0 && (
        <div className="generated-images">
          <h3>Generated Images</h3>
          <div className="images-grid">
            {generatedImages.map((image, index) => (
              <div key={index} className="image-card">
                <img src={image.url} alt={`Generated ${image.size}`} />
                <div className="image-info">
                  <span className="image-size">{image.sizeName}</span>
                  <div className="image-actions">
                    <a
                      href={image.url}
                      download={image.filename}
                      className="btn btn-primary btn-small"
                    >
                      Download
                    </a>
                    {image.driveUrl && (
                      <a
                        href={image.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-small"
                      >
                        View in Drive
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageGenerator;

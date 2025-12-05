import { DISCLAIMERS } from '../constants';

// Generate unique ID
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Add disclaimer to content
export const addDisclaimer = (content, type, language, includeDisclaimer = true) => {
  if (!includeDisclaimer) return content;

  const disclaimer = DISCLAIMERS[type]?.[language] || DISCLAIMERS[type]?.en;

  if (type === 'article') {
    return `${content}\n\n---\n\n${disclaimer}`;
  } else if (type === 'script') {
    return `${content}\n\n${disclaimer}`;
  } else if (type === 'social') {
    return `${content}\n\n${disclaimer}`;
  }

  return content;
};

// Estimate reading time
export const estimateReadingTime = (text) => {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
};

// Count words
export const countWords = (text) => {
  return text.trim().split(/\s+/).length;
};

// Validate URL
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Truncate text
export const truncate = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Download file
export const downloadFile = (content, filename, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    draft: '#6c757d',
    generating: '#007bff',
    ready: '#28a745',
    processing_video: '#ffc107',
    completed: '#28a745',
    failed: '#dc3545'
  };
  return colors[status] || '#6c757d';
};

// Get status label
export const getStatusLabel = (status) => {
  const labels = {
    draft: 'Draft',
    generating: 'Generating...',
    ready: 'Ready',
    processing_video: 'Processing Video',
    completed: 'Completed',
    failed: 'Failed'
  };
  return labels[status] || status;
};

// Parse script to estimate duration
export const estimateScriptDuration = (script) => {
  // Average speaking rate is 150 words per minute
  const wordsPerMinute = 150;
  const words = countWords(script);
  const seconds = Math.round((words / wordsPerMinute) * 60);
  return seconds;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Sanitize filename
export const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

// Generate filename from topic
export const generateFilename = (topic, extension, language = 'en') => {
  const sanitized = sanitizeFilename(topic);
  const timestamp = new Date().toISOString().split('T')[0];
  const langSuffix = language === 'es' ? '_es' : '';
  return `${sanitized}${langSuffix}_${timestamp}.${extension}`;
};

// Parse hashtags
export const parseHashtags = (text) => {
  const hashtagRegex = /#[\w]+/g;
  return text.match(hashtagRegex) || [];
};

// Format hashtags
export const formatHashtags = (tags) => {
  return tags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ');
};

// Validate practice area
export const isValidPracticeArea = (practiceArea, practiceAreas) => {
  return practiceAreas.some(area => area.id === practiceArea);
};

// Get language name
export const getLanguageName = (languageCode) => {
  const languages = {
    en: 'English',
    es: 'Spanish',
    both: 'English & Spanish'
  };
  return languages[languageCode] || languageCode;
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

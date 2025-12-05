import React, { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import ContentGenerator from './components/ContentGenerator';
import BlogImporter from './components/BlogImporter';
import ContentIdeasGenerator from './components/ContentIdeasGenerator';
import ImageGenerator from './components/ImageGenerator';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [contentList, setContentList] = useState([]);

  const addContent = (content) => {
    setContentList([content, ...contentList]);
  };

  const updateContent = (id, updates) => {
    setContentList(contentList.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const renderView = () => {
    switch(currentView) {
      case 'dashboard':
        return <Dashboard
          contentList={contentList}
          onNavigate={setCurrentView}
          onUpdateContent={updateContent}
        />;
      case 'new-content':
        return <ContentGenerator
          onBack={() => setCurrentView('dashboard')}
          onContentCreated={addContent}
        />;
      case 'import-blog':
        return <BlogImporter
          onBack={() => setCurrentView('dashboard')}
          onContentCreated={addContent}
        />;
      case 'content-ideas':
        return <ContentIdeasGenerator
          onBack={() => setCurrentView('dashboard')}
          onTopicSelected={(topic) => {
            setCurrentView('new-content');
            // Pass topic to content generator
          }}
        />;
      case 'image-generator':
        return <ImageGenerator
          onBack={() => setCurrentView('dashboard')}
        />;
      default:
        return <Dashboard
          contentList={contentList}
          onNavigate={setCurrentView}
          onUpdateContent={updateContent}
        />;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Law Firm Content System</h1>
        <p>Law Offices of Rozsa Gyene</p>
      </header>
      <main className="app-main">
        {renderView()}
      </main>
    </div>
  );
}

export default App;

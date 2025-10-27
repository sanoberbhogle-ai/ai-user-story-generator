import React, { useState, useEffect } from 'react';
import UserStoryGenerator from './UserStoryGenerator';
import PrdGenerator from './PrdGenerator';
import AdminDashboard from './AdminDashboard';
import { trackSession } from './analytics';

export default function App() {
  const [currentTool, setCurrentTool] = useState('user-stories');

  useEffect(() => {
    // Track session on app load
    trackSession();
  }, []);

  // Admin access
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleAdminAccess = () => {
    const password = prompt('Enter admin password:');
    
    // Use environment variable
    const correctPassword = process.env.REACT_APP_ADMIN_PASSWORD;
    
    if (!correctPassword) {
      alert('⚠️ You shall not pass!!');
      return;
    }
    
    if (password === correctPassword) {
      setIsAdminMode(true);
    } else {
      alert('Invalid password!');
    }
  };

  if (isAdminMode) {
    return (
      <div>
        <div className="bg-gray-800 text-white py-2 px-4 flex justify-between items-center">
          <span>🔒 Admin Mode</span>
          <button 
            onClick={() => setIsAdminMode(false)}
            className="bg-red-600 px-3 py-1 rounded text-sm"
          >
            Exit Admin
          </button>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  return (
    <div>
      {/* Navigation */}
      <div className="bg-gray-800 text-white py-4 px-8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">AI PM Tools by Sanober</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setCurrentTool('user-stories')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentTool === 'user-stories'
                  ? 'bg-indigo-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              📝 User Stories
            </button>
            <button
              onClick={() => setCurrentTool('prd')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentTool === 'prd'
                  ? 'bg-purple-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              📋 PRD Generator
            </button>
            <button
              onClick={handleAdminAccess}
              className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-xs"
              title="Admin Dashboard"
            >
              👤
            </button>
          </div>
        </div>
      </div>

      {/* Tool Display */}
      {currentTool === 'user-stories' ? <UserStoryGenerator /> : <PrdGenerator />}
    </div>
  );
}
import React, { useState } from 'react';
import UserStoryGenerator from './UserStoryGenerator';
import PrdGenerator from './PrdGenerator';

export default function App() {
  const [currentTool, setCurrentTool] = useState('user-stories');

  return (
    <div>
      {/* Navigation */}
      <div className="bg-gray-800 text-white py-4 px-8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">AI PM Tools by Sanober</h1>
          <div className="flex gap-4">
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
          </div>
        </div>
      </div>

      {/* Tool Display */}
      {currentTool === 'user-stories' ? <UserStoryGenerator /> : <PrdGenerator />}
    </div>
  );
}
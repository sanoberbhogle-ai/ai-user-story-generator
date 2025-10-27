import React, { useState, useEffect } from 'react';
import { trackGenerationWithTokens, getSessionGenerationCountByType } from './analytics';
import { callClaudeAPI, validateContent, calculateCost } from './claudeService';
import { generateUserStoryPrompt } from './prompts';

export default function UserStoryGenerator() {
  const [featureDescription, setFeatureDescription] = useState('');
  const [template, setTemplate] = useState('scrum');
  const [generatedStory, setGeneratedStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);

  const templates = {
    scrum: 'Scrum Format',
    jtbd: 'Jobs-to-be-Done',
    simple: 'Simple Format'
  };

  useEffect(() => {
    // Load generation count on mount
    getSessionGenerationCountByType('user_story').then(count => setGenerationCount(count));
  }, []);

  const generateStory = async () => {
  if (!featureDescription.trim()) {
    alert('Please describe your feature first!');
    return;
  }

  if (generationCount >= 5) {
    alert('🎉 You\'ve used your 5 free user stories!\n\n💡 Good news: You still have 5 free PRD generations!\n\nTry the PRD Generator or sign up for unlimited access to both.');
    return;
  }

  setIsGenerating(true);

  try {
    // Generate prompt
    const prompt = generateUserStoryPrompt(featureDescription, template);
    
    // Call Claude API (or mock)
    const response = await callClaudeAPI(prompt, 1000);
    
    // Validate content
    const validation = validateContent(response.content, 'user_story');
    
    if (!validation.passed) {
      console.warn('⚠️ Generated content failed validation:', validation.checks);
      // Could retry here or show warning to user
    }
    
    // Calculate cost
    const cost = calculateCost(response.usage);
    
    setGeneratedStory(response.content);
    setIsGenerating(false);

    // Track with full data
    await trackGenerationWithTokens({
      type: 'user_story',
      template: template,
      input: featureDescription,
      output: response.content,
      success: true,
      tokensUsed: response.usage,
      cost: cost,
      model: response.model,
      validationScore: validation.passed ? 1 : 0
    });

    // Update count
    const newCount = await getSessionGenerationCountByType('user_story');
    setGenerationCount(newCount);

    // Show warnings
    if (newCount === 3) {
      setTimeout(() => alert('💡 You have 2 free user stories left!'), 500);
    } else if (newCount === 4) {
      setTimeout(() => alert('⚠️ This is your last free user story!'), 500);
    }

    console.log('💰 Generation cost: $' + cost.toFixed(4));
    
  } catch (error) {
    console.error('Error generating story:', error);
    setIsGenerating(false);
    alert(`Error: ${error.message}\n\nPlease try again or check your API configuration.`);
  }
};


  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedStory);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ✨ AI User Story Generator
          </h1>
          <p className="text-gray-600">
            Transform feature ideas into structured user stories in seconds
          </p>
        </div>

        {/* Generation Counter */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
  <div className="flex justify-between items-center mb-2">
    <span className="text-blue-800 font-semibold">
      Free User Stories: {generationCount} / 5 used
    </span>
    <span className="text-blue-600 text-sm">
      {5 - generationCount} remaining
    </span>
  </div>
  <div className="w-full bg-blue-200 rounded-full h-2">
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${(generationCount / 5) * 100}%` }}
    />
  </div>
  {generationCount >= 3 && generationCount < 5 && (
    <p className="text-xs text-blue-700 mt-2">
      ⚡ You're almost at the limit! Sign up for unlimited user stories + 5 free PRDs.
    </p>
  )}
  {generationCount >= 5 && (
    <p className="text-xs text-blue-700 mt-2 font-semibold">
      {/* add feedback here */}
      🎉 User story limit reached! You still have 5 free PRD generations. Sign up for unlimited!  
    </p>
  )}
</div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Describe Your Feature
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows="4"
              placeholder="Example: allow users to login with their Google account"
              value={featureDescription}
              onChange={(e) => setFeatureDescription(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Template
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
            >
              {Object.entries(templates).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={generateStory}
            disabled={isGenerating || generationCount >= 5}
            className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : generationCount >= 5 ? '🔒 Limit Reached - Sign Up' : '🚀 Generate User Story'}
          </button>
        </div>

        {generatedStory && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Generated Story
              </h2>
              <button
                onClick={copyToClipboard}
                className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                📋 Copy to Clipboard
              </button>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {generatedStory}
              </pre>
            </div>
            <div className="mt-4 text-sm text-gray-500 text-center">
              💡 Tip: Review and customize this story based on your specific needs
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Built by Sanober Bhogle | Product Manager</p>
          <p className="mt-2">
            Beta Version - Your feedback shapes this product!
          </p>
        </div>
      </div>
    </div>
  );
}
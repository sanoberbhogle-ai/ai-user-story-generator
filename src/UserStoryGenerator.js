import React, { useState, useEffect } from 'react';
import { trackGeneration, getSessionGenerationCountByType } from './analytics';

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
    getSessionGenerationCountByType('user-story').then(count => setGenerationCount(count));
  }, []);

  const generateStory = async () => {
    if (!featureDescription.trim()) {
      alert('Please describe your feature first!');
      return;
    }

    // Check if user hit the limit (5 free tries)
    if (generationCount >= 5) {
      alert('🎉 You\'ve used your 5 free tries! Sign up to continue generating unlimited user stories.');
      // TODO: Show signup modal here
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation (we'll connect real AI tomorrow)
    setTimeout(async () => {
      let story = '';
      
      if (template === 'scrum') {
        story = `USER STORY:
As a user,
I want to ${featureDescription}
So that I can accomplish my goals more efficiently.

ACCEPTANCE CRITERIA:
- Given I am on the main page
- When I ${featureDescription}
- Then the system should respond appropriately
- And I should see confirmation of the action

DEFINITION OF DONE:
✓ Feature implemented and tested
✓ Code reviewed and merged
✓ Documentation updated
✓ User acceptance testing completed`;
      } else if (template === 'jtbd') {
        story = `JOBS-TO-BE-DONE FORMAT:

When I [situation],
I want to [motivation],
So I can [expected outcome].

CONTEXT:
${featureDescription}

SUCCESS CRITERIA:
- User can complete the job efficiently
- System provides clear feedback
- Edge cases are handled gracefully`;
      } else {
        story = `FEATURE: ${featureDescription}

DESCRIPTION:
This feature allows users to ${featureDescription}.

REQUIREMENTS:
1. User can initiate the action
2. System processes the request
3. User receives feedback
4. Action is logged for tracking

TESTING NOTES:
- Test happy path
- Test edge cases
- Verify error handling`;
      }

      setGeneratedStory(story);
      setIsGenerating(false);

      // Track this generation
      await trackGeneration({
        type: 'user_story',
        template: template,
        input: featureDescription,
        output: story,
        success: true
      });

      // Update count
      const newCount = await getSessionGenerationCountByType('user_story');
      setGenerationCount(newCount);

      // Show warning if approaching limit
      if (newCount === 3) {
        setTimeout(() => {
          alert('💡 You have 2 free generations left. Sign up for unlimited access!');
        }, 500);
      } else if (newCount === 4) {
        setTimeout(() => {
          alert('⚠️ This is your last free generation. Sign up to keep creating!');
        }, 500);
      }
    }, 2000);
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
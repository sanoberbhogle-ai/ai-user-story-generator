import React, { useState, useEffect } from 'react';
import { trackGenerationWithTokens, getSessionGenerationCountByType } from './analytics';
import { callClaudeAPI, validateContent, calculateCost } from './claudeService';
import { generatePRDPrompt } from './prompts';
import { getNotionConfig, batchCreatePages } from './notionService';

export default function PrdGenerator() {
  const [formData, setFormData] = useState({
    productName: '',
    problemStatement: '',
    businessGoal: '',
    customGoal: ''
  });

  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [generationCount, setGenerationCount] = useState(0);

  // Workflow state for generating user stories from PRD
  const [generatedUserStories, setGeneratedUserStories] = useState([]);
  const [isGeneratingStories, setIsGeneratingStories] = useState(false);
  const [workflowStoryCount, setWorkflowStoryCount] = useState(0);

  // Notion integration state
  const [isPushingToNotion, setIsPushingToNotion] = useState(false);
  const [notionPushProgress, setNotionPushProgress] = useState(null);
  const [notionPushResults, setNotionPushResults] = useState(null);

  const businessGoals = {
    revenue: '💰 Increase Revenue',
    enterprise: '🏢 Win Enterprise Customers',
    delight: '✨ Delighters (Improve UX)',
    engagement: '📈 Increase Engagement',
    infrastructure: '🔧 Keep the Lights On',
    acquisition: '🚀 User Acquisition / Growth',
    custom: '✏️ Custom Goal (Define Your Own)'
  };

  const [generatedPrd, setGeneratedPrd] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

   useEffect(() => {
    // Load generation count on mount
    getSessionGenerationCountByType('prd').then(count => setGenerationCount(count));
  }, []);


  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const newDocs = [];

    for (const file of files) {
      try {
        const text = await file.text();
        newDocs.push({
          name: file.name,
          content: text,
          size: file.size,
          type: file.type
        });
      } catch (error) {
        console.error('Error reading file:', file.name, error);
        alert(`Could not read file: ${file.name}`);
      }
    }

    setUploadedDocuments(prev => [...prev, ...newDocs]);
  };

  const removeDocument = (index) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  
  const generatePrd = async () => {
  if (!formData.productName.trim() || !formData.problemStatement.trim() || !formData.businessGoal) {
    alert('Please fill in Product Name, Problem Statement, and Business Goal!');
    return;
  }

  console.log('🔍 Current generation count before check:', generationCount);

  if (generationCount >= 3) {
    alert('🎉 You\'ve used your 3 free PRDs!\n\n💡 Good news: You still have 5 free User Story generations!\n\nTry the User Story Generator or sign up for unlimited access to both.');
    return;
  }

  setIsGenerating(true);

  try {
    // Generate prompt with uploaded documents
    const prompt = generatePRDPrompt(formData, uploadedDocuments);
    
    // Call Claude API
    const response = await callClaudeAPI(prompt, 3000); // PRDs need more tokens
    
    // Validate content
    const validation = validateContent(response.content, 'prd');
    
    if (!validation.passed) {
      console.warn('⚠️ Generated PRD failed validation:', validation.checks);
    }
    
    // Calculate cost
    const cost = calculateCost(response.usage);
    
    setGeneratedPrd(response.content);
    setIsGenerating(false);

    // Track with full data
    await trackGenerationWithTokens({
      type: 'prd',
      template: 'comprehensive',
      businessGoal: formData.businessGoal === 'custom' ? formData.customGoal : formData.businessGoal,
      input: formData.problemStatement,
      output: response.content,
      success: true,
      tokensUsed: response.usage,
      cost: cost,
      model: response.model,
      validationScore: validation.passed ? 1 : 0
    });

    // Update count
    const newCount = await getSessionGenerationCountByType('prd');
    console.log('📊 New count after generation:', newCount);
    setGenerationCount(newCount);

    // Show warnings
    if (newCount === 2) {
      setTimeout(() => alert('💡 You have 1 free PRD left!'), 500);
    } else if (newCount === 3) {
      setTimeout(() => alert('⚠️ This was your last free PRD! Try the User Story Generator or sign up for unlimited access.'), 500);
    }

    console.log('💰 Generation cost: $' + cost.toFixed(4));
    
  } catch (error) {
    console.error('Error generating PRD:', error);
    setIsGenerating(false);
    alert(`Error: ${error.message}\n\nPlease try again or check your API configuration.`);
  }
};

  const generateUserStoriesFromPRD = async () => {
    if (!generatedPrd) {
      alert('Please generate a PRD first!');
      return;
    }

    setIsGeneratingStories(true);
    setGeneratedUserStories([]);
    setWorkflowStoryCount(0);

    try {
      // Ask AI to extract features and generate user stories in batch
      const prompt = `You are an expert Product Manager. Analyze the following PRD and generate user stories for the key features.

PRD:
${generatedPrd}

---

INSTRUCTIONS:
1. Extract the key features from the PRD (from Section 3 or Key Features section)
2. Generate user stories for these features, prioritizing the most important ones first
3. Generate UP TO 10 user stories total across all features
4. If a feature needs many stories, generate what's most important and move to the next feature to reach the 10 total limit
5. Format each user story using the Scrum format:

**User Story [N]:**
As a [type of user],
I want [an action/feature],
So that [benefit/value].

**Acceptance Criteria:**
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]

**Feature:** [Which feature from PRD this relates to]

**Estimated Story Points:** [1, 2, 3, 5, or 8]

---

Generate exactly 10 user stories (or fewer if PRD has limited features). Separate each story with "---STORY_SEPARATOR---" so they can be parsed.`;

      const response = await callClaudeAPI(prompt, 4000);

      // Parse the response to extract individual stories
      const stories = response.content.split('---STORY_SEPARATOR---').map(s => s.trim()).filter(s => s.length > 0);

      setGeneratedUserStories(stories);
      setWorkflowStoryCount(stories.length);

      // Track this workflow generation
      await trackGenerationWithTokens({
        type: 'user_story_workflow',
        template: 'workflow_batch',
        businessGoal: formData.businessGoal === 'custom' ? formData.customGoal : formData.businessGoal,
        input: 'PRD-based workflow',
        output: `Generated ${stories.length} user stories from PRD`,
        success: true,
        tokensUsed: response.usage,
        cost: calculateCost(response.usage),
        model: response.model,
        validationScore: 1
      });

      setIsGeneratingStories(false);
      alert(`✅ Successfully generated ${stories.length} user stories from your PRD!`);

    } catch (error) {
      console.error('Error generating user stories from PRD:', error);
      setIsGeneratingStories(false);
      alert(`Error: ${error.message}\n\nPlease try again or check your API configuration.`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrd);
    alert('PRD copied to clipboard!');
  };

  const copyStoriesToClipboard = () => {
    const allStories = generatedUserStories.join('\n\n---\n\n');
    navigator.clipboard.writeText(allStories);
    alert('All user stories copied to clipboard!');
  };

  const downloadPrd = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedPrd], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${formData.productName.replace(/\s+/g, '-')}-PRD.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadUserStories = () => {
    const allStories = generatedUserStories.join('\n\n---\n\n');
    const element = document.createElement('a');
    const file = new Blob([allStories], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${formData.productName.replace(/\s+/g, '-')}-UserStories.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const pushToNotion = async () => {
    // Check if Notion is configured
    const config = getNotionConfig();
    if (!config.token || !config.databaseId) {
      alert('⚠️ Notion integration not configured!\n\nPlease go to the Admin Dashboard and set up your Notion integration token and database ID first.');
      return;
    }

    if (generatedUserStories.length === 0) {
      alert('No user stories to push! Please generate user stories first.');
      return;
    }

    setIsPushingToNotion(true);
    setNotionPushProgress({ current: 0, total: generatedUserStories.length, success: 0, failed: 0 });
    setNotionPushResults(null);

    try {
      const results = await batchCreatePages(generatedUserStories, (progress) => {
        setNotionPushProgress(progress);
      });

      setNotionPushResults(results);
      setIsPushingToNotion(false);

      if (results.failed === 0) {
        alert(`✅ Success! All ${results.success} user stories have been pushed to Notion!`);
      } else {
        alert(`⚠️ Partially successful:\n✅ ${results.success} stories pushed successfully\n❌ ${results.failed} stories failed\n\nCheck the details below for more information.`);
      }
    } catch (error) {
      console.error('Error pushing to Notion:', error);
      setIsPushingToNotion(false);
      alert(`❌ Error pushing to Notion: ${error.message}\n\nPlease check your Notion configuration in the Admin Dashboard.`);
    }
  };
//adding counter
<div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
  <div className="flex justify-between items-center mb-2">
    <span className="text-purple-800 font-semibold">
      Free Trial: {generationCount} / 5 generations used
    </span>
    <span className="text-purple-600 text-sm">
      {5 - generationCount} remaining
    </span>
  </div>
  <div className="w-full bg-purple-200 rounded-full h-2">
    <div 
      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${(generationCount / 5) * 100}%` }}
    />
  </div>
  {generationCount >= 3 && generationCount < 5 && (
    <p className="text-xs text-purple-700 mt-2">
      ⚡ You're almost at the limit! Sign up for unlimited PRDs.
    </p>
  )}
</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 px-6 py-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            📋 AI PRD Generator
          </h1>
          <p className="text-sm text-gray-600">
            Transform product ideas into comprehensive PRDs in seconds
          </p>
        </div>

        {/* PRD Generation Counter */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-purple-800 font-semibold">
              Free PRDs: {generationCount} / 3 used
            </span>
            <span className="text-purple-600 text-sm">
              {3 - generationCount} remaining
            </span>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(generationCount / 3) * 100}%` }}
            />
          </div>
          {generationCount >= 2 && generationCount < 3 && (
            <p className="text-xs text-purple-700 mt-2">
              ⚡ You're almost at the limit! Sign up for unlimited PRDs.
            </p>
          )}
          {generationCount >= 3 && (
            <p className="text-xs text-purple-700 mt-2 font-semibold">
              🎉 PRD limit reached! You still have 5 free User Story generations. Sign up for unlimited!
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-5 mb-4">
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
            <h3 className="font-bold text-purple-900 mb-3 text-base">📝 Required Fields</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Product/Feature Name *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="e.g., AI User Story Generator"
                  value={formData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Problem Statement *
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                  rows="3"
                  placeholder="Describe the problem your product will solve..."
                  value={formData.problemStatement}
                  onChange={(e) => handleInputChange('problemStatement', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Business Goal *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  value={formData.businessGoal}
                  onChange={(e) => handleInputChange('businessGoal', e.target.value)}
                >
                  <option value="">Select a business goal...</option>
                  {Object.entries(businessGoals).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>

                {/* Custom Goal Input */}
                {formData.businessGoal === 'custom' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-purple-50"
                      placeholder="e.g., Reduce customer support costs by 40%"
                      value={formData.customGoal}
                      onChange={(e) => handleInputChange('customGoal', e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Document Upload Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Supporting Documents (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Upload any relevant documents (user research, competitive analysis, design docs, etc.) that the AI should reference when generating your PRD.
                </p>
                <input
                  type="file"
                  multiple
                  accept=".txt,.md,.doc,.docx,.pdf"
                  onChange={handleFileUpload}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />

                {/* Uploaded Documents List */}
                {uploadedDocuments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Uploaded Documents:</p>
                    {uploadedDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-purple-600">📄</span>
                          <span className="text-sm text-gray-700">{doc.name}</span>
                          <span className="text-xs text-gray-500">({Math.round(doc.size / 1024)} KB)</span>
                        </div>
                        <button
                          onClick={() => removeDocument(index)}
                          className="text-red-600 hover:text-red-800 text-sm font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={generatePrd}
            disabled={isGenerating || generationCount >= 3}
            className="w-full bg-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
          >
            {isGenerating ? 'Generating PRD...' : '🚀 Generate Comprehensive PRD'}
          </button>
        </div>

        {generatedPrd && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h2 className="text-2xl font-bold text-gray-800">
                Generated PRD
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  📋 Copy
                </button>
                <button
                  onClick={downloadPrd}
                  className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  💾 Download
                </button>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-800">
                {generatedPrd}
              </pre>
            </div>
            <div className="mt-4 text-sm text-gray-500 text-center">
              💡 Tip: Review and customize this PRD based on your specific needs
            </div>

            {/* Workflow Button: Generate User Stories */}
            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-purple-200 rounded-lg">
              <h3 className="font-bold text-purple-900 mb-2">🚀 Next Step: Generate User Stories</h3>
              <p className="text-sm text-gray-700 mb-4">
                Automatically extract key features from your PRD and generate up to 10 user stories ready for development!
              </p>
              <button
                onClick={generateUserStoriesFromPRD}
                disabled={isGeneratingStories}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isGeneratingStories ? '✨ Generating User Stories...' : '✨ Generate User Stories for Key Features'}
              </button>
            </div>
          </div>
        )}

        {/* Generated User Stories Display */}
        {generatedUserStories.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h2 className="text-2xl font-bold text-gray-800">
                📝 Generated User Stories ({workflowStoryCount})
              </h2>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={copyStoriesToClipboard}
                  className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  📋 Copy All
                </button>
                <button
                  onClick={downloadUserStories}
                  className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  💾 Download
                </button>
                <button
                  onClick={pushToNotion}
                  disabled={isPushingToNotion}
                  className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isPushingToNotion ? '⏳ Pushing...' : '🔗 Push to Notion'}
                </button>
              </div>
            </div>

            {/* Notion Push Progress */}
            {isPushingToNotion && notionPushProgress && (
              <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-purple-800 font-semibold">
                    Pushing to Notion...
                  </span>
                  <span className="text-purple-600">
                    {notionPushProgress.current} / {notionPushProgress.total}
                  </span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(notionPushProgress.current / notionPushProgress.total) * 100}%` }}
                  />
                </div>
                <div className="mt-2 text-sm text-purple-700">
                  ✅ {notionPushProgress.success} successful | ❌ {notionPushProgress.failed} failed
                </div>
              </div>
            )}

            {/* Notion Push Results */}
            {notionPushResults && (
              <div className={`mb-4 p-4 rounded-lg border ${
                notionPushResults.failed === 0
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="font-semibold mb-2">
                  {notionPushResults.failed === 0 ? '✅ All stories pushed successfully!' : '⚠️ Push completed with some issues'}
                </div>
                <div className="text-sm">
                  <div>✅ Successfully pushed: {notionPushResults.success}</div>
                  {notionPushResults.failed > 0 && <div>❌ Failed: {notionPushResults.failed}</div>}
                </div>
                {notionPushResults.results && notionPushResults.results.some(r => r.success && r.data.url) && (
                  <div className="mt-2">
                    <a
                      href={notionPushResults.results.find(r => r.success)?.data.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      🔗 View in Notion
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              {generatedUserStories.map((story, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Story #{index + 1}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(story);
                        alert(`Story #${index + 1} copied!`);
                      }}
                      className="text-purple-600 hover:text-purple-800 text-sm font-semibold"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                    {story}
                  </pre>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>🎯 Ready for Development!</strong> These user stories are ready to be pushed to your project management tools (Notion, Jira, etc.)
              </p>
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
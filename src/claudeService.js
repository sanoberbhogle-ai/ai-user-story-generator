// Claude API Service
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';

// Check if API key is configured
function getApiKey() {
  return process.env.REACT_APP_ANTHROPIC_API_KEY || '';
}

// Call Claude API
export async function callClaudeAPI(prompt, maxTokens = 2000) {
  const apiKey = getApiKey();

  // If no API key, return mock response for development
  if (!apiKey) {
    console.warn('  No API key configured. Using mock response.');
    return generateMockResponse(prompt, maxTokens);
  }

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.content[0].text,
      usage: data.usage,
      model: data.model
    };
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

// Generate mock response for development/testing
function generateMockResponse(prompt, maxTokens) {
  const isUserStory = prompt.toLowerCase().includes('user story');
  const isPRD = prompt.toLowerCase().includes('product requirements document') || prompt.toLowerCase().includes('prd');

  let mockContent = '';

  if (isUserStory) {
    mockContent = `**User Story:**
As a user,
I want to be able to accomplish this feature,
So that I can gain value and achieve my goals.

**Acceptance Criteria:**
- The feature should work as expected
- The UI should be intuitive and user-friendly
- All edge cases should be handled gracefully
- Performance should be optimized

**Technical Notes:**
- Consider using modern web technologies
- Ensure proper error handling
- Add appropriate logging
- Write comprehensive tests

**Estimated Story Points:** 5

---
*Note: This is a mock response. Configure your Anthropic API key in the .env file for real AI-generated content.*`;
  } else if (isPRD) {
    mockContent = `# Product Requirements Document

## Executive Summary
This document outlines the requirements for building a new feature that will deliver significant value to our users and business.

## Problem Statement
Users currently face challenges that this product will solve, leading to improved efficiency and satisfaction.

## Goals
- Increase user engagement by 20%
- Improve key metrics
- Deliver exceptional user experience

## Non-Goals
- Features that are out of scope for v1
- Integration with legacy systems

## Key Features
1. **Core Functionality**: The main feature that users need
2. **Supporting Features**: Additional capabilities that enhance the experience
3. **Admin Tools**: Management and configuration options

## User Flows
1. User discovers the feature
2. User activates/uses the feature
3. User achieves their goal
4. User returns for repeat usage

## Success Metrics
- User adoption rate > 60%
- Task completion rate > 85%
- User satisfaction score > 4.5/5

## Technical Requirements
- Responsive design for all devices
- Performance: page load < 2 seconds
- Security: follow OWASP best practices
- Scalability: support 10x current user base

## Launch Plan
- Phase 1: Internal alpha testing
- Phase 2: Beta with select users
- Phase 3: Full public launch

## Risks & Mitigations
- **Risk**: Technical complexity
  **Mitigation**: Incremental development approach
- **Risk**: User adoption
  **Mitigation**: Comprehensive onboarding and documentation

---
*Note: This is a mock response. Configure your Anthropic API key in the .env file for real AI-generated content.*`;
  } else {
    mockContent = 'Mock response generated. Please configure your Anthropic API key for real AI content.';
  }

  return {
    content: mockContent,
    usage: {
      input_tokens: Math.floor(prompt.length / 4),
      output_tokens: Math.floor(mockContent.length / 4)
    },
    model: 'mock-model'
  };
}

// Validate generated content
export function validateContent(content, type) {
  const checks = {
    notEmpty: content && content.trim().length > 0,
    minLength: content && content.length >= 100,
    hasStructure: false
  };

  if (type === 'user_story') {
    checks.hasStructure =
      content.includes('User Story') ||
      content.includes('Job Story') ||
      content.includes('Feature:') ||
      content.includes('As a');
  } else if (type === 'prd') {
    checks.hasStructure =
      content.includes('#') ||
      content.includes('Product') ||
      content.includes('Requirements') ||
      content.includes('Goals');
  }

  const passed = Object.values(checks).every(check => check === true);

  return {
    passed,
    checks
  };
}

// Calculate cost based on token usage
export function calculateCost(usage) {
  if (!usage) return 0;

  // Claude 3.5 Sonnet pricing (as of 2024)
  // Input: $3 per million tokens
  // Output: $15 per million tokens
  const inputCostPerToken = 3 / 1_000_000;
  const outputCostPerToken = 15 / 1_000_000;

  const inputCost = (usage.input_tokens || 0) * inputCostPerToken;
  const outputCost = (usage.output_tokens || 0) * outputCostPerToken;

  return inputCost + outputCost;
}

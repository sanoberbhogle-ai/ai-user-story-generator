// User Story Prompt Generation
export function generateUserStoryPrompt(featureDescription, template) {
  const basePrompt = `You are an expert Product Manager. Generate a detailed user story based on the following feature description:\n\n${featureDescription}\n\n`;

  let templateInstructions = '';

  switch(template) {
    case 'scrum':
      templateInstructions = `Format the user story using the Scrum/Agile format:

**User Story:**
As a [type of user],
I want [an action/feature],
So that [benefit/value].

**Acceptance Criteria:**
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]

**Technical Notes:**
[Any technical considerations]

**Estimated Story Points:** [1, 2, 3, 5, 8, 13, or 21]`;
      break;

    case 'jtbd':
      templateInstructions = `Format the user story using the Jobs-to-be-Done (JTBD) format:

**Job Story:**
When [situation/context],
I want to [motivation/goal],
So I can [expected outcome].

**Success Criteria:**
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]

**Forces/Constraints:**
[Any constraints or considerations]

**Estimated Effort:** [Small, Medium, Large, or XL]`;
      break;

    case 'simple':
      templateInstructions = `Format the user story in a simple, straightforward format:

**Feature:** [Feature name]

**Description:**
[Clear description of what needs to be built]

**Why It Matters:**
[Business value and user benefit]

**Key Requirements:**
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

**Success Metrics:**
[How we'll measure success]`;
      break;

    default:
      templateInstructions = templateInstructions || 'Use the Scrum format.';
  }

  return basePrompt + templateInstructions + '\n\nMake the user story specific, actionable, and valuable.';
}

// PRD Prompt Generation
export function generatePRDPrompt(formData) {
  const {
    productName,
    problemStatement,
    businessGoal,
    customGoal,
    targetUsersPrimary,
    targetUsersSecondary,
    narrative,
    impactSizing,
    metrics,
    knownInfo,
    goals,
    nonGoals,
    highLevelApproach,
    solutionAlignment,
    keyFeatures,
    futureConsiderations,
    keyFlows,
    keyLogic,
    technicalReqs,
    dependencies,
    launchPlan,
    milestones,
    risks,
    successCriteria
  } = formData;

  const goalText = businessGoal === 'custom' ? customGoal : businessGoal;

  return `You are an expert Product Manager. Generate a comprehensive Product Requirements Document (PRD) based on the following information:

# Product: ${productName || '[Product Name]'}

## Problem Statement
${problemStatement || '[Define the problem this product solves]'}

## Business Goal
${goalText || '[Define the business objective]'}

## Target Users
**Primary:** ${targetUsersPrimary || '[Define primary users]'}
**Secondary:** ${targetUsersSecondary || '[Define secondary users]'}

## User/Business Narrative
${narrative || '[Describe the user journey and business context]'}

## Impact & Sizing
${impactSizing || '[Estimate the potential impact and effort]'}

## Success Metrics
${metrics || '[Define how success will be measured]'}

## Known Information & Constraints
${knownInfo || '[List any known constraints or requirements]'}

## Goals
${goals || '[What we want to achieve]'}

## Non-Goals
${nonGoals || '[What is explicitly out of scope]'}

## High-Level Approach
${highLevelApproach || '[Describe the general solution approach]'}

## Solution Alignment
${solutionAlignment || '[How this aligns with company strategy]'}

## Key Features
${keyFeatures || '[List the main features to build]'}

## Future Considerations
${futureConsiderations || '[What might come in future iterations]'}

## Key User Flows
${keyFlows || '[Describe critical user flows]'}

## Key Business Logic
${keyLogic || '[Describe important business rules]'}

## Technical Requirements
${technicalReqs || '[List technical specifications]'}

## Dependencies
${dependencies || '[List any dependencies on other systems/teams]'}

## Launch Plan
${launchPlan || '[Describe rollout strategy]'}

## Milestones
${milestones || '[Key dates and checkpoints]'}

## Risks & Mitigations
${risks || '[Identify risks and how to address them]'}

## Success Criteria
${successCriteria || '[Final acceptance criteria]'}

---

Based on the above information, generate a well-structured, comprehensive PRD that fills in any gaps, provides detailed specifications, and ensures all stakeholders have a clear understanding of what needs to be built. Make it actionable and specific.`;
}

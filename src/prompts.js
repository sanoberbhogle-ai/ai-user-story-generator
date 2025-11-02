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
export function generatePRDPrompt(formData, uploadedDocuments = []) {
  const {
    productName,
    problemStatement,
    businessGoal,
    customGoal
  } = formData;

  const goalText = businessGoal === 'custom' ? customGoal : businessGoal;

  // Build supporting documents section if any documents are uploaded
  let documentsSection = '';
  if (uploadedDocuments.length > 0) {
    documentsSection = '\n\n## Supporting Documents\n\nThe following documents have been provided for context. Please analyze and reference them when generating the PRD:\n\n';
    uploadedDocuments.forEach((doc, index) => {
      documentsSection += `### Document ${index + 1}: ${doc.name}\n\`\`\`\n${doc.content}\n\`\`\`\n\n`;
    });
  }

  return `You are an expert Product Manager. Generate a comprehensive Product Requirements Document (PRD) based on the following information:

# Product: ${productName}

## Problem Statement
${problemStatement}

## Business Goal
${goalText}
${documentsSection}
---

**IMPORTANT INSTRUCTIONS:**

Please generate a comprehensive PRD that is well-structured into the following 5 sections. Use the provided information and any uploaded documents to create detailed, actionable content for each section:

## SECTION 1: THE OPPORTUNITY (Why)
- Problem Statement (expand on what was provided)
- Customer Narrative (describe the user journey and pain points)
- Impact Sizing Model (estimate potential impact and revenue)
- Success Metrics (define KPIs and how success will be measured)

## SECTION 2: THE CUSTOMER (Who)
- Target Users (define primary and secondary personas)
- User Research & Known Information (insights, constraints, requirements)
- User Needs & Jobs to be Done

## SECTION 3: THE SOLUTION (What)
- Goals (what we want to achieve, in priority order)
- Non-Goals (what is explicitly out of scope)
- High-Level Approach (solution strategy)
- Solution Alignment (how this aligns with company strategy, what's in/out of scope)
- Key Features (P0, P1, P2 priorities)
- Future Considerations (v2, v3, long-term vision)

## SECTION 4: THE DETAILS (How)
- Key User Flows (screen-by-screen flows)
- Key Business Logic & Edge Cases (business rules, error handling)
- Technical Requirements (tech stack, performance, security, scalability)
- Dependencies & Integrations (external APIs, systems, teams)

## SECTION 5: THE EXECUTION (When)
- Launch Plan (beta phases, launch criteria, rollout strategy)
- Key Milestones (development timeline with dates)
- Risks & Mitigation Strategies (technical, market, operational risks)
- Success Criteria (Month 1, 3, 6 targets)

---

Generate a detailed, professional PRD following this structure. Fill in all sections comprehensively based on the problem statement, business goal, and any supporting documents provided. Make it actionable, specific, and ready for engineering and design teams to implement.`;
}

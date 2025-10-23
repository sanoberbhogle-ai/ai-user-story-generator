import React, { useState } from 'react';

export default function PrdGenerator() {
  const [formData, setFormData] = useState({
    productName: '',
    problemStatement: '',
    businessGoal: '',
    customGoal: '',
    targetUsersPrimary: '',
    targetUsersSecondary: '',
    narrative: '',
    impactSizing: '',
    metrics: '',
    knownInfo: '',
    goals: '',
    nonGoals: '',
    highLevelApproach: '',
    solutionAlignment: '',
    keyFeatures: '',
    futureConsiderations: '',
    keyFlows: '',
    keyLogic: '',
    technicalReqs: '',
    dependencies: '',
    launchPlan: '',
    milestones: '',
    risks: '',
    successCriteria: ''
  });

  const businessGoals = {
    revenue: '💰 Increase Revenue',
    enterprise: '🏢 Win Enterprise Customers',
    delight: '✨ Delighters (Improve UX)',
    engagement: '📈 Increase Engagement',
    infrastructure: '🔧 Keep the Lights On',
    acquisition: '🚀 User Acquisition / Growth',
    custom: '✏️ Custom Goal (Define Your Own)'
  };

  const suggestedMetrics = {
    revenue: `Monthly Recurring Revenue (MRR)
Average Revenue Per User (ARPU)
Conversion Rate to Paid
Upsell/Cross-sell Rate`,
    enterprise: `Enterprise Customer Count ($10K+ contracts)
Average Contract Value (ACV)
Sales Cycle Length
Enterprise Win Rate`,
    delight: `Net Promoter Score (NPS)
Customer Satisfaction Score (CSAT)
Feature Adoption Rate
Time on Platform`,
    engagement: `Weekly Active Users (WAU)
Daily Active Users (DAU)
Session Duration
Feature Usage Frequency`,
    infrastructure: `System Uptime %
Mean Time to Recovery (MTTR)
Bug/Incident Count
Page Load Speed`,
    acquisition: `New User Sign-ups
Activation Rate (% completing key action)
Cost Per Acquisition (CPA)
Viral Coefficient`
  };

  const [openSections, setOpenSections] = useState({
    section1: true,
    section2: false,
    section3: false,
    section4: false,
    section5: false
  });

  const [template, setTemplate] = useState('comprehensive');
  const [generatedPrd, setGeneratedPrd] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const templates = {
    comprehensive: 'Comprehensive PRD (All Sections)',
    executive: 'Executive Summary (C-Suite)',
    technical: 'Technical Spec (Engineering)',
    onepager: 'One-Pager (Quick)'
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-populate metrics when business goal changes
    if (field === 'businessGoal' && value && value !== 'custom' && suggestedMetrics[value]) {
      setFormData(prev => ({ ...prev, metrics: suggestedMetrics[value] }));
    }
    
    // Clear metrics when switching to custom (AI will suggest later)
    if (field === 'businessGoal' && value === 'custom') {
      setFormData(prev => ({ ...prev, metrics: '' }));
    }
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const generatePrd = async () => {
    if (!formData.productName.trim() || !formData.problemStatement.trim() || !formData.businessGoal) {
      alert('Please fill in Product Name, Problem Statement, and Business Goal!');
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const date = new Date().toLocaleDateString();
      let prd = `# PRODUCT REQUIREMENTS DOCUMENT
## ${formData.productName}

**Last Updated:** ${date}
**Status:** Draft
**Version:** 1.0

---

## 🎯 SECTION 1: THE OPPORTUNITY (Why)

### 1.1 Problem Statement
${formData.problemStatement}

### 1.2 Customer Narrative
${formData.narrative || 'Customers currently face challenges with manual processes. This leads to inefficiency and frustration.'}

### 1.3 Impact Sizing Model
${formData.impactSizing || 'Target market: 10,000 users, 20% adoption, $79 ARPU = $189K Year 1 revenue'}

### 1.4 Metrics
**North Star:** ${formData.metrics.split('\n')[0] || 'Weekly Active Users'}
**Secondary:** ${formData.metrics.split('\n').slice(1).join(', ') || 'Activation rate, Time to value, NPS'}

---

## 👥 SECTION 2: THE CUSTOMER (Who)

### 2.1 Target Users
**Primary:** ${formData.targetUsersPrimary || 'Product Managers at tech companies'}
**Secondary:** ${formData.targetUsersSecondary || 'N/A'}

### 2.2 Known Information
${formData.knownInfo || 'User research to be conducted during discovery phase.'}

---

## 🎨 SECTION 3: THE SOLUTION (What)

### 3.1 Goals
${formData.goals || '1. Reduce time by 80%\n2. 500 users in Q1\n3. $10K MRR by month 3'}

### 3.2 Non-Goals
${formData.nonGoals || 'Mobile app in v1, Enterprise features, Legacy integrations'}

### 3.3 High Level Approach
${formData.highLevelApproach || 'Build AI-powered web app with freemium model.'}

### 3.4 Solution Alignment
${formData.solutionAlignment || 'In Scope: Core features, auth, payments. Out of Scope: Mobile apps, enterprise.'}

### 3.5 Key Features
${formData.keyFeatures || 'P0: Core functionality, auth, payment\nP1: History, analytics\nP2: Team features, API'}

### 3.6 Future Considerations
${formData.futureConsiderations || 'v2: Integrations, v3: Mobile apps, Long-term: AI personalization'}

---

## ⚙️ SECTION 4: THE DETAILS (How)

### 4.1 Key Flows
${formData.keyFlows || 'Sign-up → Dashboard → Generate → View results → Export/Save'}

### 4.2 Key Logic
${formData.keyLogic || 'Free: 5/month, Pro: Unlimited. Handle empty input, API failures, rate limits.'}

### 4.3 Technical Requirements
${formData.technicalReqs || 'React, Node.js, PostgreSQL, Claude API. Performance: <2s load, 99.9% uptime.'}

### 4.4 Dependencies
${formData.dependencies || 'Claude API, Stripe, Auth0/Firebase'}

---

## 📅 SECTION 5: THE EXECUTION (When)

### 5.1 Launch Plan
${formData.launchPlan || 'Phase 1: Private beta (6 weeks), Phase 2: Public beta (12 weeks), Phase 3: Full launch'}

### 5.2 Milestones
${formData.milestones || 'Week 1-2: Design, Week 3-6: Build, Week 6: Beta launch, Week 12: Public launch'}

### 5.3 Risks & Mitigation
${formData.risks || 'API costs → caching, Low adoption → freemium, Competition → fast iteration'}

### 5.4 Success Criteria
${formData.successCriteria || 'Month 1: 500 users, Month 3: $5K MRR, Month 6: $15K MRR'}

---

**Document Owner:** Product Team`;

      setGeneratedPrd(prd);
      setIsGenerating(false);
    }, 2500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrd);
    alert('PRD copied to clipboard!');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📋 AI PRD Generator
          </h1>
          <p className="text-gray-600">
            Transform product ideas into comprehensive PRDs in seconds
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select PRD Template
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-purple-900 mb-4 text-lg">📝 Required Fields</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product/Feature Name *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., AI User Story Generator"
                  value={formData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Problem Statement *
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                  rows="3"
                  placeholder="Describe the problem in 1-2 sentences"
                  value={formData.problemStatement}
                  onChange={(e) => handleInputChange('problemStatement', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Goal * <span className="text-xs text-gray-500">(metrics will auto-populate)</span>
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      placeholder="e.g., Reduce customer support costs by 40%, Improve API developer experience, etc."
                      value={formData.customGoal}
                      onChange={(e) => handleInputChange('customGoal', e.target.value)}
                    />
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                      🤖 <strong>AI Feature (Coming Soon):</strong> When connected to AI, the system will analyze your custom goal and suggest relevant metrics automatically!
                    </div>
                  </div>
                )}
                
                {formData.businessGoal && formData.businessGoal !== 'custom' && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                    💡 <strong>Suggested metrics for this goal have been auto-filled below.</strong> You can customize them in Section 1.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 1 */}
          <div className="border border-gray-200 rounded-lg mb-4">
            <button
              onClick={() => toggleSection('section1')}
              className="w-full flex justify-between items-center p-4 bg-blue-50 hover:bg-blue-100 transition-colors rounded-t-lg"
            >
              <span className="font-bold text-blue-900 text-lg">
                🎯 Section 1: The Opportunity (Why)
              </span>
              <span className="text-2xl text-blue-600">
                {openSections.section1 ? '−' : '+'}
              </span>
            </button>
            {openSections.section1 && (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Customer Narrative
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="4"
                    placeholder="Paint a picture of the customer experience"
                    value={formData.narrative}
                    onChange={(e) => handleInputChange('narrative', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Impact Sizing Model
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="4"
                    placeholder="Show calculation for revenue impact"
                    value={formData.impactSizing}
                    onChange={(e) => handleInputChange('impactSizing', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Metrics {formData.businessGoal && formData.businessGoal !== 'custom' && (
                      <span className="text-xs text-purple-600">(auto-populated based on business goal)</span>
                    )}
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="4"
                    placeholder={formData.businessGoal === 'custom' 
                      ? "Define your metrics here, or let AI suggest them when we connect AI tomorrow!" 
                      : "First line: North star. Other lines: Secondary metrics"}
                    value={formData.metrics}
                    onChange={(e) => handleInputChange('metrics', e.target.value)}
                  />
                  {formData.businessGoal && formData.businessGoal !== 'custom' && (
                    <p className="text-xs text-gray-500 mt-1">
                      💡 These metrics were suggested based on your business goal. Feel free to customize!
                    </p>
                  )}
                  {formData.businessGoal === 'custom' && formData.customGoal && (
                    <p className="text-xs text-orange-600 mt-1">
                      🚀 <strong>Tomorrow:</strong> AI will analyze "{formData.customGoal}" and suggest the perfect metrics!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2 */}
          <div className="border border-gray-200 rounded-lg mb-4">
            <button
              onClick={() => toggleSection('section2')}
              className="w-full flex justify-between items-center p-4 bg-green-50 hover:bg-green-100 transition-colors rounded-t-lg"
            >
              <span className="font-bold text-green-900 text-lg">
                👥 Section 2: The Customer (Who)
              </span>
              <span className="text-2xl text-green-600">
                {openSections.section2 ? '−' : '+'}
              </span>
            </button>
            {openSections.section2 && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Primary Persona
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Product Managers"
                      value={formData.targetUsersPrimary}
                      onChange={(e) => handleInputChange('targetUsersPrimary', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Secondary Persona
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Optional"
                      value={formData.targetUsersSecondary}
                      onChange={(e) => handleInputChange('targetUsersSecondary', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Known Information & Research
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                    rows="4"
                    placeholder="User interviews, insights, attachments"
                    value={formData.knownInfo}
                    onChange={(e) => handleInputChange('knownInfo', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3 */}
          <div className="border border-gray-200 rounded-lg mb-4">
            <button
              onClick={() => toggleSection('section3')}
              className="w-full flex justify-between items-center p-4 bg-purple-50 hover:bg-purple-100 transition-colors rounded-t-lg"
            >
              <span className="font-bold text-purple-900 text-lg">
                🎨 Section 3: The Solution (What)
              </span>
              <span className="text-2xl text-purple-600">
                {openSections.section3 ? '−' : '+'}
              </span>
            </button>
            {openSections.section3 && (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Goals
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                    rows="4"
                    placeholder="List goals in priority order"
                    value={formData.goals}
                    onChange={(e) => handleInputChange('goals', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Non-Goals
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                    rows="3"
                    placeholder="What we are NOT building"
                    value={formData.nonGoals}
                    onChange={(e) => handleInputChange('nonGoals', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    High Level Approach
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                    rows="2"
                    placeholder="Solution approach in a few sentences"
                    value={formData.highLevelApproach}
                    onChange={(e) => handleInputChange('highLevelApproach', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Solution Alignment (Scope)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                    rows="3"
                    placeholder="In scope vs out of scope"
                    value={formData.solutionAlignment}
                    onChange={(e) => handleInputChange('solutionAlignment', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Key Features
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                    rows="5"
                    placeholder="P0, P1, P2 features"
                    value={formData.keyFeatures}
                    onChange={(e) => handleInputChange('keyFeatures', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Future Considerations
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                    rows="3"
                    placeholder="v2, v3, long-term vision"
                    value={formData.futureConsiderations}
                    onChange={(e) => handleInputChange('futureConsiderations', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4 */}
          <div className="border border-gray-200 rounded-lg mb-4">
            <button
              onClick={() => toggleSection('section4')}
              className="w-full flex justify-between items-center p-4 bg-orange-50 hover:bg-orange-100 transition-colors rounded-t-lg"
            >
              <span className="font-bold text-orange-900 text-lg">
                ⚙️ Section 4: The Details (How)
              </span>
              <span className="text-2xl text-orange-600">
                {openSections.section4 ? '−' : '+'}
              </span>
            </button>
            {openSections.section4 && (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Key Flows
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none"
                    rows="5"
                    placeholder="Screen-by-screen user flows"
                    value={formData.keyFlows}
                    onChange={(e) => handleInputChange('keyFlows', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Key Logic & Edge Cases
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none"
                    rows="4"
                    placeholder="Business rules, edge cases"
                    value={formData.keyLogic}
                    onChange={(e) => handleInputChange('keyLogic', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Technical Requirements
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none"
                    rows="4"
                    placeholder="Tech stack, performance targets"
                    value={formData.technicalReqs}
                    onChange={(e) => handleInputChange('technicalReqs', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dependencies & Integrations
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none"
                    rows="3"
                    placeholder="External APIs, services"
                    value={formData.dependencies}
                    onChange={(e) => handleInputChange('dependencies', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 5 */}
          <div className="border border-gray-200 rounded-lg mb-6">
            <button
              onClick={() => toggleSection('section5')}
              className="w-full flex justify-between items-center p-4 bg-red-50 hover:bg-red-100 transition-colors rounded-t-lg"
            >
              <span className="font-bold text-red-900 text-lg">
                📅 Section 5: The Execution (When)
              </span>
              <span className="text-2xl text-red-600">
                {openSections.section5 ? '−' : '+'}
              </span>
            </button>
            {openSections.section5 && (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Launch Plan
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                    rows="5"
                    placeholder="Beta phases, launch criteria, A/B tests"
                    value={formData.launchPlan}
                    onChange={(e) => handleInputChange('launchPlan', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Key Milestones
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                    rows="4"
                    placeholder="Development timeline"
                    value={formData.milestones}
                    onChange={(e) => handleInputChange('milestones', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Risks & Mitigation
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                    rows="4"
                    placeholder="Technical, market, operational risks"
                    value={formData.risks}
                    onChange={(e) => handleInputChange('risks', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Success Criteria
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                    rows="4"
                    placeholder="Month 1, 3, 6 targets"
                    value={formData.successCriteria}
                    onChange={(e) => handleInputChange('successCriteria', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={generatePrd}
            disabled={isGenerating}
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
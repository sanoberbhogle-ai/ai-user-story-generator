// src/analytics.js

// Generate unique session ID
export const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// Track new session
export const trackSession = async () => {
  try {
    const sessionId = getSessionId();
    
    // Check if already tracked
    const existing = await window.storage.get(`session:${sessionId}`, true);
    if (existing) return; // Already tracked

    const sessionData = {
      sessionId,
      timestamp: new Date().toISOString(),
      referrer: document.referrer || 'direct',
      userAgent: navigator.userAgent,
      location: 'Unknown', // Can add geolocation later
      screenSize: `${window.screen.width}x${window.screen.height}`
    };

    await window.storage.set(`session:${sessionId}`, JSON.stringify(sessionData), true);
    console.log('📊 Session tracked:', sessionId);
  } catch (error) {
    console.error('Error tracking session:', error);
  }
};

// Track generation
export const trackGeneration = async (data) => {
  try {
    const sessionId = getSessionId();
    const genId = 'gen_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    const generationData = {
      id: genId,
      sessionId,
      type: data.type, // 'user_story' or 'prd'
      template: data.template,
      businessGoal: data.businessGoal || null,
      inputLength: data.input?.length || 0,
      outputLength: data.output?.length || 0,
      timestamp: new Date().toISOString(),
      success: data.success !== false // Default to true unless explicitly false
    };

    await window.storage.set(`generation:${genId}`, JSON.stringify(generationData), true);
    console.log('📊 Generation tracked:', genId);

    return genId;
  } catch (error) {
    console.error('Error tracking generation:', error);
    return null;
  }
};

// Get total generations for current session
export const getSessionGenerationCount = async () => {
  try {
    const sessionId = getSessionId();
    const result = await window.storage.list('generation:', true);
    
    if (!result || !result.keys) return 0;

    let count = 0;
    for (const key of result.keys) {
      const gen = await window.storage.get(key, true);
      if (gen) {
        const data = JSON.parse(gen.value);
        if (data.sessionId === sessionId) {
          count++;
        }
      }
    }
    return count;
  } catch (error) {
    console.error('Error getting session count:', error);
    return 0;
  }
};
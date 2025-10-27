// src/analytics.js - WITH FALLBACK

// Check if window.storage is available, otherwise use localStorage
const storage = {
  async get(key, shared = false) {
    if (window.storage) {
      return await window.storage.get(key, shared);
    }
    // Fallback to localStorage
    const value = localStorage.getItem(key);
    return value ? { key, value, shared } : null;
  },
  
  async set(key, value, shared = false) {
    if (window.storage) {
      return await window.storage.set(key, value, shared);
    }
    // Fallback to localStorage
    localStorage.setItem(key, value);
    return { key, value, shared };
  },
  
  async delete(key, shared = false) {
    if (window.storage) {
      return await window.storage.delete(key, shared);
    }
    // Fallback to localStorage
    localStorage.removeItem(key);
    return { key, deleted: true, shared };
  },
  
  async list(prefix = '', shared = false) {
    if (window.storage) {
      return await window.storage.list(prefix, shared);
    }
    // Fallback to localStorage
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    return { keys, prefix, shared };
  }
};

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
    const existing = await storage.get(`session:${sessionId}`, true);
    if (existing) {
      console.log('📊 Session already tracked:', sessionId);
      return; // Already tracked
    }

    const sessionData = {
      sessionId,
      timestamp: new Date().toISOString(),
      referrer: document.referrer || 'direct',
      userAgent: navigator.userAgent,
      location: 'Unknown',
      screenSize: `${window.screen.width}x${window.screen.height}`
    };

    await storage.set(`session:${sessionId}`, JSON.stringify(sessionData), true);
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
      success: data.success !== false
    };

    await storage.set(`generation:${genId}`, JSON.stringify(generationData), true);
    console.log('📊 Generation tracked:', genId, generationData);

    return genId;
  } catch (error) {
    console.error('Error tracking generation:', error);
    return null;
  }
};

// Get total generations for current session BY TYPE
export const getSessionGenerationCountByType = async (type) => {
  try {
    const sessionId = getSessionId();
    const result = await storage.list('generation:', true);
    
    console.log(`🔍 Checking ${type} generations for session:`, sessionId);
    
    if (!result || !result.keys) {
      console.log(`📊 No ${type} generations found yet`);
      return 0;
    }

    let count = 0;
    for (const key of result.keys) {
      const gen = await storage.get(key, true);
      if (gen) {
        const data = JSON.parse(gen.value);
        if (data.sessionId === sessionId && data.type === type) {
          count++;
        }
      }
    }
    
    console.log(`📊 Total ${type} generations for this session:`, count);
    return count;
  } catch (error) {
    console.error('Error getting session count by type:', error);
    return 0;
  }
};


// Get total generations for current session
export const getSessionGenerationCount = async () => {
  try {
    const sessionId = getSessionId();
    const result = await storage.list('generation:', true);
    
    console.log('🔍 Checking generations for session:', sessionId);
    console.log('🔍 Found keys:', result?.keys);
    
    if (!result || !result.keys) {
      console.log('📊 No generations found yet');
      return 0;
    }

    let count = 0;
    for (const key of result.keys) {
      const gen = await storage.get(key, true);
      if (gen) {
        const data = JSON.parse(gen.value);
        console.log('🔍 Checking generation:', data.sessionId, 'vs', sessionId);
        if (data.sessionId === sessionId) {
          count++;
        }
      }
    }
    
    console.log('📊 Total generations for this session:', count);
    return count;
  } catch (error) {
    console.error('Error getting session count:', error);
    return 0;
  }
};
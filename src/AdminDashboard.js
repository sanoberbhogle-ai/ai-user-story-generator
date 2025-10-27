import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState({
    totalSessions: 0,
    totalGenerations: 0,
    userStories: 0,
    prds: 0,
    todayGenerations: 0,
    thisWeekGenerations: 0,
    avgPerSession: 0,
    topReferrers: [],
    topGoals: [],
    recentActivity: [],
    costMetrics: {
      totalCost: 0,
      avgCostPerGeneration: 0,
      projectedMonthlyCost: 0
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Load all sessions
      const sessionsResult = await window.storage.list('session:', true);
      const sessions = [];
      
      if (sessionsResult && sessionsResult.keys) {
        for (const key of sessionsResult.keys) {
          const result = await window.storage.get(key, true);
          if (result) {
            sessions.push(JSON.parse(result.value));
          }
        }
      }

      // Load all generations
      const gensResult = await window.storage.list('generation:', true);
      const generations = [];
      
      if (gensResult && gensResult.keys) {
        for (const key of gensResult.keys) {
          const result = await window.storage.get(key, true);
          if (result) {
            generations.push(JSON.parse(result.value));
          }
        }
      }

        const totalCost = generations.reduce((sum, g) => {
        // Use actual cost if available, otherwise estimate
        const cost = g.cost ? parseFloat(g.cost) : (g.type === 'user_story' ? 0.006 : 0.033);
        return sum + cost;
        }, 0);

      // Calculate analytics
      const now = new Date();
      const today = now.toDateString();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const todayGens = generations.filter(g => 
        new Date(g.timestamp).toDateString() === today
      ).length;

      const weekGens = generations.filter(g => 
        new Date(g.timestamp) > weekAgo
      ).length;

      const userStories = generations.filter(g => g.type === 'user_story').length;
      const prds = generations.filter(g => g.type === 'prd').length;

      // Top referrers
      const referrerCounts = {};
      sessions.forEach(s => {
        const ref = s.referrer || 'Direct';
        referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
      });
      const topReferrers = Object.entries(referrerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Top goals
      const goalCounts = {};
      generations.forEach(g => {
        if (g.businessGoal) {
          goalCounts[g.businessGoal] = (goalCounts[g.businessGoal] || 0) + 1;
        }
      });
      const topGoals = Object.entries(goalCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Recent activity
      const recentActivity = generations
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);

      setAnalytics({
        totalSessions: sessions.length,
        totalGenerations: generations.length,
        userStories,
        prds,
        todayGenerations: todayGens,
        thisWeekGenerations: weekGens,
        avgPerSession: sessions.length > 0 ? (generations.length / sessions.length).toFixed(1) : 0,
        topReferrers,
        topGoals,
        recentActivity,
        costMetrics: {
          totalCost: totalCost.toFixed(2),
          avgCostPerGeneration: (totalCost / (generations.length || 1)).toFixed(4),
          projectedMonthlyCost: (totalCost * 30 / 7).toFixed(2)
        }
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setIsLoading(false);
    }
  };

  const resetAllData = async () => {
    if (!window.confirm('⚠️ This will delete ALL data. Are you sure?')) return;
    
    try {
      const sessionsResult = await window.storage.list('session:', true);
      if (sessionsResult && sessionsResult.keys) {
        for (const key of sessionsResult.keys) {
          await window.storage.delete(key, true);
        }
      }

      const gensResult = await window.storage.list('generation:', true);
      if (gensResult && gensResult.keys) {
        for (const key of gensResult.keys) {
          await window.storage.delete(key, true);
        }
      }

      alert('✅ All data cleared!');
      loadAnalytics();
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  const generateDemoData = async () => {
    try {
      const demoSessions = 15;
      const demoGenerations = 47;

      // Create demo sessions
      for (let i = 0; i < demoSessions; i++) {
        const sessionData = {
          sessionId: `demo_session_${i}`,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          referrer: ['linkedin.com', 'twitter.com', 'direct', 'google.com'][Math.floor(Math.random() * 4)],
          userAgent: 'Chrome/Mac',
          location: 'Demo Location'
        };
        await window.storage.set(`session:demo_${i}`, JSON.stringify(sessionData), true);
      }

      // Create demo generations
      for (let i = 0; i < demoGenerations; i++) {
        const genData = {
          id: `demo_gen_${i}`,
          sessionId: `demo_session_${Math.floor(Math.random() * demoSessions)}`,
          type: Math.random() > 0.4 ? 'user_story' : 'prd',
          template: ['scrum', 'jtbd', 'simple'][Math.floor(Math.random() * 3)],
          inputLength: Math.floor(Math.random() * 500) + 100,
          outputLength: Math.floor(Math.random() * 1500) + 300,
          businessGoal: ['revenue', 'engagement', 'delight', 'enterprise'][Math.floor(Math.random() * 4)],
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          success: Math.random() > 0.05
        };
        await window.storage.set(`generation:demo_${i}`, JSON.stringify(genData), true);
      }

      alert('✅ Demo data generated!');
      loadAnalytics();
    } catch (error) {
      console.error('Error generating demo data:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">📊 Admin Dashboard</h1>
            <p className="text-gray-400">AI PM Tools Analytics</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadAnalytics}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              🔄 Refresh
            </button>
            <button
              onClick={generateDemoData}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              🎲 Generate Demo Data
            </button>
            <button
              onClick={resetAllData}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
            >
              🗑️ Reset All
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">Total Sessions</div>
            <div className="text-4xl font-bold text-blue-400">{analytics.totalSessions}</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">Total Generations</div>
            <div className="text-4xl font-bold text-green-400">{analytics.totalGenerations}</div>
            <div className="text-xs text-gray-500 mt-1">
              {analytics.userStories} stories, {analytics.prds} PRDs
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">This Week</div>
            <div className="text-4xl font-bold text-purple-400">{analytics.thisWeekGenerations}</div>
            <div className="text-xs text-gray-500 mt-1">
              {analytics.todayGenerations} today
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">Avg per Session</div>
            <div className="text-4xl font-bold text-yellow-400">{analytics.avgPerSession}</div>
          </div>
        </div>

        {/* Cost Metrics */}
        <div className="bg-gradient-to-r from-green-900 to-emerald-900 rounded-lg p-6 mb-8 border border-green-700">
          <h2 className="text-2xl font-bold mb-4">💰 Cost Analysis (API)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-gray-300 text-sm mb-1">Total API Cost</div>
              <div className="text-3xl font-bold text-green-400">
                ${analytics.costMetrics.totalCost}
              </div>
            </div>
            <div>
              <div className="text-gray-300 text-sm mb-1">Avg Cost per Generation</div>
              <div className="text-3xl font-bold text-green-400">
                ${analytics.costMetrics.avgCostPerGeneration}
              </div>
            </div>
            <div>
              <div className="text-gray-300 text-sm mb-1">Projected Monthly</div>
              <div className="text-3xl font-bold text-green-400">
                ${analytics.costMetrics.projectedMonthlyCost}
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-950 rounded text-sm">
            💡 <strong>Profit Potential:</strong> At $29/mo per user, you'd profit ${(29 - parseFloat(analytics.costMetrics.projectedMonthlyCost)).toFixed(2)}/user/month
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Referrers */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">🌐 Top Referrers</h2>
            {analytics.topReferrers.length > 0 ? (
              <div className="space-y-3">
                {analytics.topReferrers.map((ref, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="text-gray-300">{ref.name}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(ref.count / analytics.totalSessions) * 100}%` }}
                        />
                      </div>
                      <div className="text-blue-400 font-bold w-12 text-right">{ref.count}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">No data yet</div>
            )}
          </div>

          {/* Top Business Goals */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">🎯 Top Business Goals</h2>
            {analytics.topGoals.length > 0 ? (
              <div className="space-y-3">
                {analytics.topGoals.map((goal, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="text-gray-300 capitalize">{goal.name}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${(goal.count / analytics.totalGenerations) * 100}%` }}
                        />
                      </div>
                      <div className="text-purple-400 font-bold w-12 text-right">{goal.count}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">No data yet</div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">⚡ Recent Activity</h2>
          {analytics.recentActivity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 px-3 text-gray-400 font-semibold">Time</th>
                    <th className="text-left py-2 px-3 text-gray-400 font-semibold">Type</th>
                    <th className="text-left py-2 px-3 text-gray-400 font-semibold">Template</th>
                    <th className="text-left py-2 px-3 text-gray-400 font-semibold">Goal</th>
                    <th className="text-left py-2 px-3 text-gray-400 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentActivity.map((activity, idx) => (
                    <tr key={idx} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="py-3 px-3 text-sm text-gray-400">
                        {new Date(activity.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          activity.type === 'user_story' 
                            ? 'bg-blue-900 text-blue-300' 
                            : 'bg-purple-900 text-purple-300'
                        }`}>
                          {activity.type === 'user_story' ? '📝 Story' : '📋 PRD'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-sm text-gray-300 capitalize">
                        {activity.template}
                      </td>
                      <td className="py-3 px-3 text-sm text-gray-300 capitalize">
                        {activity.businessGoal || 'N/A'}
                      </td>
                      <td className="py-3 px-3">
                        {activity.success ? (
                          <span className="text-green-400">✓ Success</span>
                        ) : (
                          <span className="text-red-400">✗ Failed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">No activity yet</div>
          )}
        </div>

        {/* Interview Stats Box */}
        <div className="mt-8 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-lg p-6 border border-indigo-700">
          <h2 className="text-2xl font-bold mb-4">🎤 Interview Ready Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-indigo-300">Total Usage:</strong>
              <div className="text-white mt-1">
                "{analytics.totalGenerations} items generated across {analytics.totalSessions} user sessions"
              </div>
            </div>
            <div>
              <strong className="text-indigo-300">Engagement:</strong>
              <div className="text-white mt-1">
                "Average {analytics.avgPerSession} generations per session, showing strong product-market fit"
              </div>
            </div>
            <div>
              <strong className="text-indigo-300">Cost Efficiency:</strong>
              <div className="text-white mt-1">
                "Built profitable SaaS with 90%+ margins (${analytics.costMetrics.avgCostPerGeneration} per generation)"
              </div>
            </div>
            <div>
              <strong className="text-indigo-300">User Behavior:</strong>
              <div className="text-white mt-1">
                "{((analytics.userStories / analytics.totalGenerations) * 100).toFixed(0)}% user stories, {((analytics.prds / analytics.totalGenerations) * 100).toFixed(0)}% PRDs"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
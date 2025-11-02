// Notion API Integration Service

const NOTION_API_URL = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

// Get Notion credentials from localStorage
export function getNotionConfig() {
  const token = localStorage.getItem('notion_integration_token');
  const databaseId = localStorage.getItem('notion_database_id');
  return { token, databaseId };
}

// Save Notion credentials to localStorage
export function saveNotionConfig(token, databaseId) {
  localStorage.setItem('notion_integration_token', token);
  localStorage.setItem('notion_database_id', databaseId);
}

// Clear Notion credentials
export function clearNotionConfig() {
  localStorage.removeItem('notion_integration_token');
  localStorage.removeItem('notion_database_id');
}

// Test Notion connection and verify database access
export async function testNotionConnection() {
  const { token, databaseId } = getNotionConfig();

  if (!token || !databaseId) {
    throw new Error('Notion integration token and database ID are required');
  }

  try {
    const response = await fetch(`${NOTION_API_URL}/databases/${databaseId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to connect to Notion: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      databaseTitle: data.title?.[0]?.plain_text || 'Untitled Database',
      properties: Object.keys(data.properties || {})
    };
  } catch (error) {
    console.error('Notion connection test failed:', error);
    throw error;
  }
}

// Parse user story content to extract structured data
function parseUserStory(storyContent) {
  const lines = storyContent.split('\n').filter(line => line.trim());

  const result = {
    title: '',
    fullContent: storyContent,
    type: 'scrum', // default
    storyPoints: null,
    priority: null,
    acceptanceCriteria: []
  };

  // Extract title (first non-empty line or from ## heading)
  for (const line of lines) {
    if (line.startsWith('##')) {
      result.title = line.replace(/^##\s*/, '').trim();
      break;
    } else if (line.trim() && !result.title) {
      result.title = line.trim();
      break;
    }
  }

  // Detect story type
  if (storyContent.includes('Job Story:') || storyContent.includes('When [')) {
    result.type = 'jtbd';
  } else if (storyContent.includes('**Feature:**')) {
    result.type = 'simple';
  }

  // Extract story points (for Scrum)
  const storyPointsMatch = storyContent.match(/\*\*Estimated Story Points:\*\*\s*(\d+)/i);
  if (storyPointsMatch) {
    result.storyPoints = parseInt(storyPointsMatch[1]);
  }

  // Extract priority if mentioned
  const priorityMatch = storyContent.match(/\*\*Priority:\*\*\s*(P[0-2])/i);
  if (priorityMatch) {
    result.priority = priorityMatch[1];
  }

  // Extract acceptance criteria
  const criteriaSection = storyContent.match(/\*\*(?:Acceptance|Success) Criteria:\*\*([\s\S]*?)(?:\*\*|$)/i);
  if (criteriaSection) {
    const criteria = criteriaSection[1]
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim());
    result.acceptanceCriteria = criteria;
  }

  return result;
}

// Create a single page in Notion database
export async function createNotionPage(storyContent) {
  const { token, databaseId } = getNotionConfig();

  if (!token || !databaseId) {
    throw new Error('Notion integration token and database ID are required');
  }

  const parsedStory = parseUserStory(storyContent);

  // Build the properties object
  const properties = {
    // Title property (usually called "Name" or "Title" in databases)
    'Name': {
      title: [
        {
          text: {
            content: parsedStory.title || 'Untitled User Story'
          }
        }
      ]
    }
  };

  // Add optional properties if they exist in the database
  if (parsedStory.type) {
    properties['Type'] = {
      select: {
        name: parsedStory.type
      }
    };
  }

  if (parsedStory.storyPoints) {
    properties['Story Points'] = {
      number: parsedStory.storyPoints
    };
  }

  if (parsedStory.priority) {
    properties['Priority'] = {
      select: {
        name: parsedStory.priority
      }
    };
  }

  // Add Status as "To Do" by default
  properties['Status'] = {
    select: {
      name: 'To Do'
    }
  };

  // Build the page content (children blocks)
  const children = [
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: parsedStory.fullContent
            }
          }
        ]
      }
    }
  ];

  // Add acceptance criteria as checklist if available
  if (parsedStory.acceptanceCriteria.length > 0) {
    children.push({
      object: 'block',
      type: 'heading_3',
      heading_3: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: 'Acceptance Criteria'
            }
          }
        ]
      }
    });

    parsedStory.acceptanceCriteria.forEach(criterion => {
      children.push({
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: criterion
              }
            }
          ],
          checked: false
        }
      });
    });
  }

  try {
    const response = await fetch(`${NOTION_API_URL}/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: {
          database_id: databaseId
        },
        properties,
        children
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Notion API error:', error);
      throw new Error(error.message || `Failed to create Notion page: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      pageId: data.id,
      url: data.url,
      title: parsedStory.title
    };
  } catch (error) {
    console.error('Failed to create Notion page:', error);
    throw error;
  }
}

// Batch create multiple user stories in Notion
export async function batchCreatePages(userStories, onProgress) {
  const { token, databaseId } = getNotionConfig();

  if (!token || !databaseId) {
    throw new Error('Notion integration token and database ID are required');
  }

  const results = [];
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < userStories.length; i++) {
    const story = userStories[i];

    try {
      // Add a small delay to respect rate limits (3 requests per second)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 350));
      }

      const result = await createNotionPage(story);
      results.push({
        index: i,
        success: true,
        data: result
      });
      successCount++;

      // Call progress callback if provided
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: userStories.length,
          success: successCount,
          failed: failureCount,
          latestResult: result
        });
      }
    } catch (error) {
      results.push({
        index: i,
        success: false,
        error: error.message
      });
      failureCount++;

      // Call progress callback if provided
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: userStories.length,
          success: successCount,
          failed: failureCount,
          error: error.message
        });
      }
    }
  }

  return {
    total: userStories.length,
    success: successCount,
    failed: failureCount,
    results
  };
}

// Get database schema to understand available properties
export async function getDatabaseSchema() {
  const { token, databaseId } = getNotionConfig();

  if (!token || !databaseId) {
    throw new Error('Notion integration token and database ID are required');
  }

  try {
    const response = await fetch(`${NOTION_API_URL}/databases/${databaseId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to get database schema: ${response.status}`);
    }

    const data = await response.json();
    return {
      title: data.title?.[0]?.plain_text || 'Untitled',
      properties: data.properties
    };
  } catch (error) {
    console.error('Failed to get database schema:', error);
    throw error;
  }
}

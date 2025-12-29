/**
 * API Configuration and Validation
 * 
 * Provides utilities to check API connection and configuration
 */

export interface ApiHealth {
  status: string;
  port: number;
  apiPort: string | null;
  portEnv: string | null;
  usingParser: boolean;
  timestamp: string;
}

/**
 * Check API health and return configuration info
 */
export async function checkApiHealth(): Promise<ApiHealth | null> {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.warn('Failed to check API health:', error);
    return null;
  }
}

/**
 * Validate that the API is using the expected port
 * @param expectedPort - The expected API port (from env or config)
 */
export async function validateApiPort(expectedPort?: number): Promise<boolean> {
  const health = await checkApiHealth();
  if (!health) {
    return false;
  }
  
  if (expectedPort !== undefined) {
    return health.port === expectedPort;
  }
  
  // If no expected port provided, just check that health is ok
  return health.status === 'ok';
}

/**
 * Check if API is using parseProject (not static files)
 * This is indicated by the usingParser flag in the health endpoint
 */
export async function isUsingParser(): Promise<boolean> {
  const health = await checkApiHealth();
  return health?.usingParser === true;
}

/**
 * Get API configuration info for debugging
 */
export async function getApiConfig(): Promise<{
  health: ApiHealth | null;
  expectedPort: number | null;
  actualPort: number | null;
  usingParser: boolean;
  proxyConfigured: boolean;
}> {
  const health = await checkApiHealth();
  
  // Try to determine expected port from environment
  // In browser, we can't access process.env, so we check the health endpoint
  const expectedPort = health?.port || null;
  const actualPort = health?.port || null;
  
  return {
    health,
    expectedPort,
    actualPort,
    usingParser: health?.usingParser || false,
    proxyConfigured: health !== null, // If we can reach /api/health, proxy is working
  };
}


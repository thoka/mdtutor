import { expect, APIRequestContext } from '@playwright/test';

export async function checkSystemHealth(request: APIRequestContext) {
  const achievementsBase = process.env.ACHIEVEMENTS_URL || 'http://localhost:3102';
  const ssoBase = process.env.SSO_URL || 'http://localhost:3103';

  // 1. Check Achievements Server
  const achieRes = await request.get(`${achievementsBase}/api/v1/system/stats`);
  expect(achieRes.ok(), `Achievements Server is not reachable at ${achievementsBase}`).toBeTruthy();
  
  const achieStats = await achieRes.json();
  console.log('[Health] Achievements Stats:', achieStats);
  
  // Verify Alice has data
  const aliceActions = achieStats.user_stats?.student_a || 0;
  if (aliceActions < 50) {
    throw new Error(`Insufficient test data for Alice: Found ${aliceActions} actions, expected at least 50. Run 'npm run seed:test' in the root.`);
  }

  // 2. Check SSO Server
  const ssoRes = await request.get(`${ssoBase}/api/system/stats`);
  expect(ssoRes.ok(), `SSO Server is not reachable at ${ssoBase}`).toBeTruthy();
  
  const ssoStats = await ssoRes.json();
  console.log('[Health] SSO Stats:', ssoStats);
  
  // Verify Alice exists in config
  if (!ssoStats.config?.users_loaded?.includes('student_a')) {
    throw new Error("User 'student_a' (Alice) is not loaded in SSO config.");
  }
}


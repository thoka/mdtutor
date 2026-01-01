/**
 * Pre-test data consistency check.
 * Verifies that Achievements and SSO servers are reachable and have expected test data.
 */

import http from 'http';

const ACHIEVEMENTS_URL = 'http://localhost:3102/api/v1/system/stats';
const SSO_URL = 'http://localhost:3103/api/system/stats';

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Status ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function runCheck() {
  console.log('🔍 Checking test data status...');
  let hasErrors = false;

  // 1. Achievements Server
  try {
    const stats = await fetchJson(ACHIEVEMENTS_URL);
    console.log('✅ Achievements Server: Online');
    
    if (stats.rails_env !== 'test') {
      console.warn(`⚠️  Warning: Achievements Server is in '${stats.rails_env}' mode, not 'test'.`);
    }

    const aliceActions = stats.user_stats?.student_a || 0;
    if (aliceActions < 50) {
      console.error(`❌ Data Error: Alice (student_a) has only ${aliceActions} actions. Expected >= 50.`);
      hasErrors = true;
    } else {
      console.log(`✅ Alice Data: ${aliceActions} actions found.`);
    }

    // Check GID consistency
    const hasCorrectGids = stats.alice_projects?.some(gid => gid.includes(':PROJ:'));
    if (!hasCorrectGids && aliceActions > 0) {
      console.warn('⚠️  Warning: Alice projects GIDs might be missing ":PROJ:" namespace.');
    }

  } catch (e) {
    console.error(`❌ Achievements Server: Offline (${e.message})`);
    hasErrors = true;
  }

  // 2. SSO Server
  try {
    const stats = await fetchJson(SSO_URL);
    console.log('✅ SSO Server: Online');

    if (stats.rails_env !== 'test') {
      console.warn(`⚠️  Warning: SSO Server is in '${stats.rails_env}' mode, not 'test'.`);
    }

    if (!stats.config?.users_loaded?.includes('student_a')) {
      console.error('❌ Config Error: Alice (student_a) not loaded in SSO.');
      hasErrors = true;
    } else {
      console.log('✅ SSO Users: Alice is loaded.');
    }
  } catch (e) {
    console.error(`❌ SSO Server: Offline (${e.message})`);
    hasErrors = true;
  }

  if (hasErrors) {
    console.log('\n❌ PRE-TEST CHECK FAILED');
    console.log('💡 Tip: Make sure the servers are running and you ran: npm run seed:test');
    process.exit(1);
  } else {
    console.log('\n✅ PRE-TEST CHECK PASSED. Ready for E2E tests.\n');
  }
}

runCheck();

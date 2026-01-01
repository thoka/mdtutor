import { auth } from './auth';
import { get } from 'svelte/store';

export async function trackAction(actionType: string, gid?: string, metadata: Record<string, any> = {}) {
  const user = get(auth);
  if (!user) {
    console.warn('Cannot track action: No user logged in');
    return;
  }

  try {
    const res = await fetch('/api/v1/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        action_type: actionType,
        gid,
        metadata
      })
    });
    if (!res.ok) {
      console.error('Failed to track action', await res.text());
    }
  } catch (e) {
    console.error('Error tracking action', e);
  }
}


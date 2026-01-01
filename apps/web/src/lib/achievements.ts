import { auth } from './auth';
import { get } from 'svelte/store';

export async function trackAction(actionType: string, gid?: string, metadata: Record<string, any> = {}) {
  const token = localStorage.getItem('sso_token');
  if (!token) {
    console.warn('Cannot track action: No token found');
    return;
  }

  try {
    const res = await fetch('/api/v1/actions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
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

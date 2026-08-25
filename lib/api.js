export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function apiFetch(url, options = {}) {
  const { headers, ...rest } = options;
  return fetch(url, {
    credentials: 'include',
    ...rest,
    headers: { ...(headers || {}) },
  });
}

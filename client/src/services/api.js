export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers)
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  // Attach token from localStorage for resilience
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  } catch {}

  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
    credentials: 'include',
    body: options.body && !(options.body instanceof FormData)
      ? JSON.stringify(options.body)
      : options.body
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new ApiError(result.message || 'Request failed.', response.status)
  return result
}
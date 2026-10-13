import * as SecureStore from 'expo-secure-store';

// Expo inlines EXPO_PUBLIC_* values from mobile/.env into the application bundle.
// Never put server-side secrets in these variables.
const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

if (!configuredApiUrl) {
  throw new Error(
    'EXPO_PUBLIC_API_URL is missing. Copy mobile/.env.example to mobile/.env and set your Laravel API address.',
  );
}

// Normalize a trailing slash so every endpoint is consistently `${API_URL}/path`.
export const API_URL = configuredApiUrl.replace(/\/$/, '');
const REQUEST_TIMEOUT_MS = 12_000;

const TOKEN_KEY = 'stitchflow_token';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string | null) {
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'AbortError';
    throw new ApiError(
      timedOut
        ? `The StitchFlow server at ${API_URL} did not respond within 12 seconds.`
        : `Could not reach the StitchFlow server at ${API_URL}. Is the backend running?`,
      0
    );
  } finally {
    clearTimeout(timeout);
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiError(data?.message ?? `Request failed (${response.status})`, response.status, data?.errors);
  }

  return (data?.data ?? data) as T;
}

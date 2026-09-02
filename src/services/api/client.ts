interface ApiRequestParams {
  action: string;
  payload?: object;
}

interface ApiResponse<T> {
  ok: boolean;
  result?: T;
  error?: string;
}

export async function apiRequest<T>({ action, payload }: ApiRequestParams): Promise<T> {
  const response = await fetch('/.netlify/functions/kj-api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });

  const data: ApiResponse<T> = await response.json();

  if (!data.ok) {
    throw new Error(data.error || 'Request gagal');
  }

  return data.result as T;
}

export async function pingApi(): Promise<{ message: string }> {
  return apiRequest<{ message: string }>({ action: 'ping' });
}

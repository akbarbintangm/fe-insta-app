import { useAuthStore } from '@/stores/auth';

export const fetchWrapper = {
  get: request('GET'),
  post: request('POST'),
  put: request('PUT'),
  delete: request('DELETE')
};

interface temp {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

function request(method: string) {
  return (url: string, body?: any, isFormData = false) => {
    const headers: Record<string, string> = authHeader(url);
    const requestOptions: RequestInit = { method, headers };

    if (body && !isFormData) {
      headers['Content-Type'] = 'application/json';
      requestOptions.body = JSON.stringify(body);
    }

    if (body && isFormData) {
      requestOptions.body = body;
    }

    return fetch(url, requestOptions).then(handleResponse);
  };
}

// helper functions

function authHeader(url: string): Record<string, string> {
  // return auth header with jwt if user is logged in and request is to the api url
  const { user } = useAuthStore();
  const isLoggedIn = !!user?.token;
  const isApiUrl = url.startsWith(import.meta.env.VITE_API_URL);
  if (isLoggedIn && isApiUrl) {
    return { Authorization: `Bearer ${user.token}` };
  } else {
    return {};
  }
}

function handleResponse(response: Response): Promise<any> {
  return response.text().then((text: string) => {
    const data = text && JSON.parse(text);
    if (!response.ok) {
      const { user, logout } = useAuthStore();
      if ([401, 403].includes(response.status) && user) {
        logout();
      }
      const error = (data && data.error) || (data && data.message) || response.statusText;
      return Promise.reject(error);
    }
    return data;
  });
}

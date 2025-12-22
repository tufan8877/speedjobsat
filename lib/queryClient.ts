import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {

  console.log(`apiRequest: ${method} ${url}`, { 
    data, 
    existingCookies: document.cookie,
    userAgent: navigator.userAgent,
    location: window.location.href
  });
  
  // TOKEN-UNTERSTÜTZUNG: Authorization Header hinzufügen
  const authToken = localStorage.getItem('authToken');
  
  const res = await fetch(url, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      // Explizit Cache-busting für Session-Requests
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      // Token für Backend-Auth
      ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    // same-origin für Session-Cookies
    mode: "same-origin",
  });

  console.log('Request sent with token:', authToken ? `Yes (${authToken.substring(0, 20)}...)` : 'No');

  console.log(`apiRequest response: ${method} ${url} -> ${res.status}`, {
    cookiesBefore: document.cookie,
    setCookieHeaders: res.headers.get('set-cookie'),
    allHeaders: Object.fromEntries(res.headers.entries())
  });

  // Nach Login/Register Cookie-Änderungen abwarten
  if ((url.includes('/api/login') || url.includes('/api/register')) && res.ok) {
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('Cookies after login/register:', document.cookie);
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    
    // TOKEN-UNTERSTÜTZUNG für GET-Requests
    const authToken = localStorage.getItem('authToken');
    console.log(`getQueryFn for ${url}: Token available:`, authToken ? 'Yes' : 'No');
    
    const headers = authToken ? { "Authorization": `Bearer ${authToken}` } : {};
    console.log(`getQueryFn headers:`, headers);
    
    const res = await fetch(url, {
      credentials: "include",
      mode: "same-origin",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: 0, // Sofort veraltet - immer vom Server abrufen
      gcTime: 0, // Sofort aus Cache entfernen (garbage collection)
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

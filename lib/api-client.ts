// API base URL

import { baseUrl } from "@/config/env";

// Get token from localStorage
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("costly_auth_token");
}

// API fetch wrapper with authentication
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("costly_auth_token");
        localStorage.removeItem("costly_user_data");
        window.location.href = "/login";
      }
    }

    const error = await response.json().catch(() => ({
      message: "An error occurred",
    }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  const json = await response.json();

  // If response has a 'data' property, unwrap it
  if (json && typeof json === "object" && "data" in json && json.success) {
    return json.data as T;
  }

  return json;
}

// GET request
export async function get<T>(endpoint: string): Promise<T> {
  return apiClient<T>(endpoint, { method: "GET" });
}

// POST request
export async function post<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiClient<T>(endpoint, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

// PUT request
export async function put<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiClient<T>(endpoint, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
}

// DELETE request
export async function del<T>(endpoint: string): Promise<T> {
  return apiClient<T>(endpoint, { method: "DELETE" });
}

// PATCH request
export async function patch<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiClient<T>(endpoint, {
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
  });
}

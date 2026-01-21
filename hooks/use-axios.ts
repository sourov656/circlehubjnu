import { useAuth } from "@/contexts/auth-context";
import axios, { AxiosInstance } from "axios";
import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Custom hook to create an axios instance with authentication
 * Automatically attaches the access token to all requests
 * Handles token expiration and redirects to login
 */
export default function useAxios(): AxiosInstance {
  const { accessToken, logout } = useAuth();
  const router = useRouter();

  const instance = useMemo(() => {
    const axiosInstance = axios.create();

    // Add request interceptor to always use latest token
    axiosInstance.interceptors.request.use(
      (config) => {
        // Get the latest token from localStorage
        const token = localStorage.getItem("campus_connect_access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Add response interceptor to handle token expiration
    axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Check if error response indicates token expiration
        if (error.response?.data) {
          const { success, error: errorCode, message } = error.response.data;

          // Handle token expired error
          if (
            success === false &&
            (errorCode === "INVALID_TOKEN" || errorCode === "TOKEN_EXPIRED") &&
            (message?.toLowerCase().includes("token expired") ||
              message?.toLowerCase().includes("invalid token"))
          ) {
            console.warn("Token expired, logging out...");

            // Clear auth data
            logout();

            // Redirect to login page
            router.push("/login");

            return Promise.reject(new Error("Token expired"));
          }
        }

        return Promise.reject(error);
      },
    );

    return axiosInstance;
  }, [logout, router]); // Include dependencies

  // Update headers when accessToken changes
  useEffect(() => {
    if (accessToken) {
      instance.defaults.headers.common["Authorization"] =
        `Bearer ${accessToken}`;
    } else {
      delete instance.defaults.headers.common["Authorization"];
    }
  }, [accessToken, instance]);

  return instance;
}

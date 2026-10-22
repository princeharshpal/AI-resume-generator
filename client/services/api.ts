import axios, { AxiosError } from "axios";
import { toast } from "@/components/ui/sonner";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipErrorToast?: boolean;
  }
}

interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  errors?: Array<{ field?: string; message?: string } | string>;
}

export function extractApiErrorMessage(error: unknown): {
  title: string;
  description?: string;
} {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const data = axiosError.response?.data;
    const status = axiosError.response?.status;

    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      const messages = data.errors
        .map((e) => (typeof e === "string" ? e : e?.message || ""))
        .filter(Boolean);

      const title = data.message || "Validation Error";
      const description =
        messages.length > 0 ? messages.join(" • ") : undefined;
      return { title, description };
    }

    if (data?.message && typeof data.message === "string") {
      return { title: data.message };
    }

    if (status) {
      switch (status) {
        case 400:
          return {
            title: "Bad Request",
            description: "Please check your input and try again.",
          };
        case 401:
          return {
            title: "Authentication Required",
            description: "Please sign in to continue.",
          };
        case 403:
          return {
            title: "Access Denied",
            description: "You do not have permission to perform this action.",
          };
        case 404:
          return {
            title: "Not Found",
            description: "The requested resource could not be found.",
          };
        case 409:
          return {
            title: "Conflict",
            description: "This record or resource already exists.",
          };
        case 413:
          return {
            title: "File Too Large",
            description: "The uploaded file exceeds the allowed size limit.",
          };
        case 422:
          return {
            title: "Unprocessable Request",
            description: "The submitted data could not be processed.",
          };
        case 429:
          return {
            title: "Too Many Requests",
            description: "Please wait a moment before trying again.",
          };
        case 500:
          return {
            title: "Server Error",
            description:
              "Something went wrong on the server. Please try again.",
          };
        case 502:
          return {
            title: "Bad Gateway",
            description: "Server is temporarily unreachable. Please retry.",
          };
        case 503:
          return {
            title: "Service Unavailable",
            description: "The server is temporarily unavailable.",
          };
        default:
          return {
            title: `Request Failed (${status})`,
            description: "An unexpected server response was received.",
          };
      }
    }

    if (
      axiosError.code === "ERR_NETWORK" ||
      axiosError.message === "Network Error"
    ) {
      return {
        title: "Network Error",
        description:
          "Unable to connect to the server. Please check your internet connection.",
      };
    }

    if (
      axiosError.code === "ECONNABORTED" ||
      axiosError.message?.toLowerCase().includes("timeout")
    ) {
      return {
        title: "Request Timeout",
        description: "The server took too long to respond. Please try again.",
      };
    }

    return {
      title: axiosError.message || "An unexpected error occurred",
    };
  }

  if (error instanceof Error) {
    return { title: error.message };
  }

  return {
    title: typeof error === "string" ? error : "An unexpected error occurred",
  };
}

const baseURL =
  (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000") + "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;

    const isAuthEndpoint =
      originalRequest?.url?.includes("/users/login") ||
      originalRequest?.url?.includes("/users/register") ||
      originalRequest?.url?.includes("/users/refresh-token");

    if (
      error?.response?.status === 401 &&
      !originalRequest?._retry &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${baseURL}/users/refresh-token`,
          {},
          { withCredentials: true },
        );

        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("smartresume_user");
          if (typeof document !== "undefined") {
            document.cookie =
              "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie =
              "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          }
          window.dispatchEvent(new Event("auth:session-expired"));

          if (!originalRequest?.skipErrorToast) {
            toast.error("Session Expired", {
              description: "Your session has expired. Please log in again.",
              id: "session-expired",
            });
          }
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (!originalRequest?.skipErrorToast && typeof window !== "undefined") {
      const { title, description } = extractApiErrorMessage(error);
      toast.error(title, {
        description,
        id: `${title}-${description || ""}`,
      });
    }

    return Promise.reject(error);
  },
);

export default api;

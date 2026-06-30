import axios from "axios";
import { toast } from "sonner";

import { CONFIG } from "@/config";
import { decrypt } from "@/utils/encryption";

const V1_URL = `${CONFIG.SERVER_URL}/api/v1`;

function createErrorHandler(redirectPath: string, clearKeys: string[]) {
  return async (err: any) => {
    try {
      if (err?.response?.status === 401 && typeof window !== "undefined") {
        toast.error("Session expired. Please login again.");
        clearKeys.forEach((key) => localStorage.removeItem(key));
        window.location.replace(redirectPath);
      }
    } catch {}
    return Promise.reject(err);
  };
}

export const baseApi = axios.create({
  baseURL: CONFIG.SERVER_URL,
  headers: {
    "ngrok-skip-browser-warning": "any",
    "Content-Type": "application/json",
  },
});

export const v1Api = axios.create({
  baseURL: V1_URL,
  headers: {
    "ngrok-skip-browser-warning": "any",
    "Content-Type": "application/json",
  },
});

export const authenticatedApi = () => {
  const token = decrypt(localStorage.getItem("TOKEN") ?? "") ?? null;
  const instance = axios.create({
    baseURL: CONFIG.SERVER_URL,
    headers: {
      "ngrok-skip-browser-warning": "any",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  instance.interceptors.response.use(
    (res) => res,
    createErrorHandler("/", ["TOKEN", "USER"])
  );

  return instance;
};

export const v1AuthenticatedApi = () => {
  const token = decrypt(localStorage.getItem("TOKEN") ?? "") ?? null;
  const instance = axios.create({
    baseURL: V1_URL,
    headers: {
      "ngrok-skip-browser-warning": "any",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  instance.interceptors.response.use(
    (res) => res,
    createErrorHandler("/", ["TOKEN", "USER"])
  );

  return instance;
};

export const v1AdminAuthenticatedApi = () => {
  const token = decrypt(localStorage.getItem("admin_token") ?? "") ?? null;
  const instance = axios.create({
    baseURL: V1_URL,
    headers: {
      "ngrok-skip-browser-warning": "any",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  instance.interceptors.response.use(
    (res) => res,
    createErrorHandler("/admin/login", ["admin_token", "admin_user"])
  );

  return instance;
};

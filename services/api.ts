import axios from "axios";
import { toast } from "sonner";

import { CONFIG } from "@/config";
import { decrypt } from "@/utils/encryption";

const V1_URL = `${CONFIG.SERVER_URL}/v1`;

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
    async (err) => {
      if (err?.response?.status === 401 && typeof window !== "undefined") {
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        window.location.replace("/");
      }
      return Promise.reject(err);
    }
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
    async (err) => {
      if (err?.response?.status === 401 && typeof window !== "undefined") {
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        window.location.replace("/");
      }
      return Promise.reject(err);
    }
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
    async (err) => {
      if (err?.response?.status === 401 && typeof window !== "undefined") {
        toast.error("Admin session expired. Please login again.");
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        window.location.replace("/admin/login");
      }
      return Promise.reject(err);
    }
  );

  return instance;
};

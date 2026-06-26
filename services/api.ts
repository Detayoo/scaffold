import axios from "axios";
import { toast } from "sonner";

import { CONFIG } from "@/config";
import { decrypt } from "@/utils/encryption";

export const baseApi = axios.create({
  baseURL: CONFIG.SERVER_URL,
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

import { AxiosRequestConfig } from "axios";
import { authenticatedApi, baseApi } from "./api";

export * from "./api";
export * from "./queries";

export const extractError = (error: unknown): string => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as any;
    return (
      axiosError?.response?.data?.message ??
      axiosError?.message ??
      "Something went wrong"
    );
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
};

export const getData = async <T = any>(
  endpoint: string,
  params?: Record<string, any> | null,
  authenticated: boolean = true,
  versioned: boolean = true
): Promise<T> => {
  const path = versioned ? `/api/v1${endpoint}` : endpoint;
  const api = authenticated ? authenticatedApi() : baseApi;
  const { data } = await api.get<T>(path, { params });
  return data;
};

export const postData = async <T = any>(
  endpoint: string,
  payload?: Record<string, any> | null,
  authenticated: boolean = true,
  config?: AxiosRequestConfig,
  versioned: boolean = true
): Promise<T> => {
  const path = versioned ? `/api/v1${endpoint}` : endpoint;
  const api = authenticated ? authenticatedApi() : baseApi;
  const { data } = await api.post<T>(path, payload ?? undefined, config);
  return data;
};

export const patchData = async <T = any>(
  endpoint: string,
  payload?: Record<string, any> | null,
  versioned: boolean = true
): Promise<T> => {
  const path = versioned ? `/api/v1${endpoint}` : endpoint;
  const { data } = await authenticatedApi().patch<T>(path, payload);
  return data;
};

export const putData = async <T = any>(
  endpoint: string,
  payload?: Record<string, any> | null,
  versioned: boolean = true
): Promise<T> => {
  const path = versioned ? `/api/v1${endpoint}` : endpoint;
  const { data } = await authenticatedApi().put<T>(path, payload);
  return data;
};

export const deleteData = async <T = any>(
  endpoint: string,
  payload?: Record<string, any> | null,
  authenticated: boolean = true,
  versioned: boolean = true
): Promise<T> => {
  const path = versioned ? `/api/v1${endpoint}` : endpoint;
  const api = authenticated ? authenticatedApi() : baseApi;
  const { data } = await api.delete<T>(path, { data: payload });
  return data;
};

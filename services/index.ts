import { AxiosRequestConfig } from "axios";
import { v1Api, v1AuthenticatedApi } from "./api";

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
  authenticated: boolean = true
): Promise<T> => {
  const api = authenticated ? v1AuthenticatedApi() : v1Api;
  const { data } = await api.get<T>(endpoint, { params });
  return data;
};

export const postData = async <T = any>(
  endpoint: string,
  payload?: Record<string, any> | null,
  authenticated: boolean = true,
  config?: AxiosRequestConfig
): Promise<T> => {
  const api = authenticated ? v1AuthenticatedApi() : v1Api;
  const { data } = await api.post<T>(endpoint, payload ?? undefined, config);
  return data;
};

export const patchData = async <T = any>(
  endpoint: string,
  payload?: Record<string, any> | null
): Promise<T> => {
  const { data } = await v1AuthenticatedApi().patch<T>(endpoint, payload);
  return data;
};

export const putData = async <T = any>(
  endpoint: string,
  payload?: Record<string, any> | null
): Promise<T> => {
  const { data } = await v1AuthenticatedApi().put<T>(endpoint, payload);
  return data;
};

export const deleteData = async <T = any>(
  endpoint: string,
  payload?: Record<string, any> | null,
  authenticated: boolean = true
): Promise<T> => {
  const api = authenticated ? v1AuthenticatedApi() : v1Api;
  const { data } = await api.delete<T>(endpoint, { data: payload });
  return data;
};

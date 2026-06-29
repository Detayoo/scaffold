import { v1AuthenticatedApi } from "../api";
import type { ExportResponse, ExportsListResponse } from "@/types/operations";

export const createExportFn = async ({
  exportType,
  environment,
  filters,
}: {
  exportType: string;
  environment?: string;
  filters?: Record<string, string>;
}) => {
  const { data } = await v1AuthenticatedApi().post<ExportResponse>("/exports", {
    exportType,
    environment,
    filters,
  });
  return data;
};

export const getExportsFn = async ({
  exportType,
  status,
}: {
  exportType?: string;
  status?: string;
} = {}) => {
  const params: Record<string, string> = {};
  if (exportType) params.exportType = exportType;
  if (status) params.status = status;
  const { data } = await v1AuthenticatedApi().get<ExportsListResponse>("/exports", { params });
  return data;
};

export const getExportDownloadFn = async ({ id }: { id: string }) => {
  const { data } = await v1AuthenticatedApi().get<ExportResponse>(`/exports/${id}/download`);
  return data;
};

export const getReadModelsFn = async () => {
  const { data } = await v1AuthenticatedApi().get("/operations/read-models");
  return data;
};

export const getRunbooksFn = async () => {
  const { data } = await v1AuthenticatedApi().get("/operations/runbooks");
  return data;
};

export type ExportType = "transactions" | "settlements" | "refunds" | "disputes";

export type ExportJob = {
  id: string;
  exportType: ExportType;
  status: "pending" | "processing" | "completed" | "failed";
  rowCount?: number;
  content?: string;
  storageRef?: string;
  expiresAt?: string;
  createdAt: string;
};

export type ExportResponse = {
  status: boolean;
  data: ExportJob;
};

export type ExportsListResponse = {
  status: boolean;
  data: ExportJob[];
};

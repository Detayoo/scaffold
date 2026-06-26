/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from "date-fns";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { Duration } from "@/types";

export const naira = <>&#8358;</>;

export const formatNumber = (text: any): string => {
  const dotted = text?.toString()?.includes(".");
  if (dotted) {
    return Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(text));
  }
  return Intl.NumberFormat("en-NG").format(Number(text));
};

export const formatMoney = (text: any): string => {
  return Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(text));
};

export const formatMoneyWithCurrency = (
  amount: number,
  currency: string
) => {
  const symbol = currency === "USD" ? "$" : "₦";
  return `${symbol}${formatMoney(amount ?? 0)}`;
};

export const formatDate = (date: string) => {
  if (!date) return "N/A";
  return format(new Date(date), "dd MMM yyyy | p");
};

export const toastMessage = (
  status: "error" | "success",
  message: string
) => {
  toast[status](message);
};

export const extractError = (error: unknown) => {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message ??
      error?.message ??
      "Something went wrong"
    );
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
};

export const handleScrollToTop = (div: React.RefObject<HTMLDivElement | null>) => {
  if (div.current) {
    div.current.scrollTo({ top: 0, behavior: "smooth" });
  }
};

export const triggerFileDownload = (
  url: string,
  filename = "receipt.pdf"
) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const previewFile = (val: any) => {
  if (val?.type) {
    const file = new Blob([val], { type: val?.type });
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL);
    return;
  }
  window.open(val);
};

export const computeDate = (
  duration: Duration
): { startDate: Date; endDate: Date } => {
  const endDate = new Date();
  switch (duration) {
    case "LAST_WEEK":
      return {
        startDate: new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate() - 7
        ),
        endDate,
      };
    case "LAST_MONTH":
      return {
        startDate: new Date(
          endDate.getFullYear(),
          endDate.getMonth() - 1,
          endDate.getDate()
        ),
        endDate,
      };
    case "LAST_3_MONTHS":
      return {
        startDate: new Date(
          endDate.getFullYear(),
          endDate.getMonth() - 3,
          endDate.getDate()
        ),
        endDate,
      };
    case "CUSTOM":
      return {
        startDate: new Date(endDate.getFullYear(), endDate.getMonth(), 1),
        endDate,
      };
  }
};

export const handleNoAlphabetInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, "");
};

export const getFileSize = (value: any) => {
  const size =
    typeof value === "string" ? 2 : value?.size / (1024 * 1024);
  const sizeArray = `${size}`?.includes(".")
    ? `${size}`?.split(".")
    : `${size}`;
  return typeof sizeArray === "object"
    ? `${sizeArray[0]}.${sizeArray[1]?.slice(0, 2)}`
    : size;
};

export const getFileType = (value: any) => {
  const fileType = value?.name
    ? value?.name?.split(".").pop()
    : value?.split(".").pop();
  return fileType;
};

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

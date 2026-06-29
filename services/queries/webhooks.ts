import { authenticatedApi } from "../api";
import type {
  WebhookEndpointsResponse,
  WebhookEndpointResponse,
  WebhookDeliveriesResponse,
  WebhookDeliveryDetailResponse,
  ReplayResponse,
} from "@/types/webhooks";

export const getWebhookEndpointsFn = async ({
  status,
}: {
  status?: string;
} = {}) => {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  const { data } = await authenticatedApi().get<WebhookEndpointsResponse>("/v1/webhook-endpoints", { params });
  return data;
};

export const createWebhookEndpointFn = async ({
  url,
  environment,
  eventFilter,
}: {
  url: string;
  environment: string;
  eventFilter?: string[];
}) => {
  const { data } = await authenticatedApi().post<WebhookEndpointResponse>("/v1/webhook-endpoints", {
    url,
    environment,
    eventFilter,
  });
  return data;
};

export const pauseWebhookEndpointFn = async ({ id }: { id: string }) => {
  const { data } = await authenticatedApi().post<WebhookEndpointResponse>(`/v1/webhook-endpoints/${id}/pause`);
  return data;
};

export const resumeWebhookEndpointFn = async ({ id }: { id: string }) => {
  const { data } = await authenticatedApi().post<WebhookEndpointResponse>(`/v1/webhook-endpoints/${id}/resume`);
  return data;
};

export const getWebhookDeliveriesFn = async ({
  endpointId,
  eventId,
  status,
}: {
  endpointId?: string;
  eventId?: string;
  status?: string;
} = {}) => {
  const params: Record<string, string> = {};
  if (endpointId) params.endpointId = endpointId;
  if (eventId) params.eventId = eventId;
  if (status) params.status = status;
  const { data } = await authenticatedApi().get<WebhookDeliveriesResponse>("/v1/webhook-deliveries", { params });
  return data;
};

export const getWebhookDeliveryDetailFn = async ({ id }: { id: string }) => {
  const { data } = await authenticatedApi().get<WebhookDeliveryDetailResponse>(`/v1/webhook-deliveries/${id}`);
  return data;
};

export const replayWebhookDeliveryFn = async ({
  id,
  forceResend,
}: {
  id: string;
  forceResend?: boolean;
}) => {
  const { data } = await authenticatedApi().post<ReplayResponse>(`/v1/webhook-deliveries/${id}/replay`, {
    forceResend,
  });
  return data;
};

export const replayWebhookEventFn = async ({ id }: { id: string }) => {
  const { data } = await authenticatedApi().post<ReplayResponse>(`/v1/webhook-events/${id}/replay`);
  return data;
};

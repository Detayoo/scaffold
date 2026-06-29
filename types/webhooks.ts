export type WebhookEndpoint = {
  id: string;
  merchantId: string;
  environment: "test" | "live";
  url: string;
  status: "active" | "paused" | "inactive";
  secretRef?: string;
  eventFilter?: string[];
  createdAt: string;
  updatedAt: string;
};

export type WebhookEndpointsResponse = {
  status: boolean;
  data: WebhookEndpoint[];
};

export type WebhookEndpointResponse = {
  status: boolean;
  data: WebhookEndpoint;
};

export type WebhookDelivery = {
  id: string;
  eventId: string;
  endpointId: string;
  endpointUrl: string;
  attempts: number;
  status: string;
  responseStatus?: number;
  responseBodyRef?: string;
  nextRetryAt?: string;
  replayAvailable?: boolean;
  createdAt: string;
};

export type WebhookDeliveriesResponse = {
  status: boolean;
  data: WebhookDelivery[];
};

export type WebhookDeliveryDetail = {
  id: string;
  eventId: string;
  endpointId: string;
  attemptNo: number;
  status: string;
  responseCode?: number;
  requestBody?: string;
  signatureHeaders?: Record<string, string>;
  lastAttemptAt?: string;
  nextRetryAt?: string;
};

export type WebhookDeliveryDetailResponse = {
  status: boolean;
  data: WebhookDeliveryDetail;
};

export type ReplayResponse = {
  status: boolean;
  data: {
    replayId?: string;
    eventId?: string;
    deliveriesQueued?: number;
    status: string;
  };
};

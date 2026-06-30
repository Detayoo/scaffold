/* eslint-disable @typescript-eslint/no-explicit-any */
export type BareResponse = {
  message: string;
  status: boolean;
};

export type MerchantStatus =
  | "PENDING"
  | "ACTIVE"
  | "SUSPENDED"
  | "CLOSED"
  | "APPROVED"
  | "INACTIVE";

export type LoginResponse = {
  status: true;
  message: string;
  data: {
    token: string;
    user: User;
  };
};

export type User = {
  id: string;
  merchantId: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Merchant = {
  id: string;
  name: string;
  email: string;
  accountNumber: string;
  status: MerchantStatus;
  address: string;
  slug: string;
  webhookURL: string | null;
  collectionOptions: Array<string>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isPaylinkEnabled: boolean;
  isInvoiceEnabled: boolean;
  isReusablePaylinkEnabled: boolean;
};

export type PaginatedResponse = {
  perPage: number;
  currentPage: number;
  totalRecords: number;
  totalPages: number;
};

export type Duration = "LAST_WEEK" | "LAST_MONTH" | "LAST_3_MONTHS" | "CUSTOM";

export type FileType = {
  id: string;
  file: File;
};

export type FileUploadsType = (FileType | string)[];

export type State = {
  type: "card" | "bank-transfer";
  status: string;
  loading: boolean;
};

export type RegistrationDTO = {
  businessName: string;
  name: string;
  email: string;
  password: string;
};

export type Collections = {
  data: {
    collectionOptions: Array<{
      id: string;
      type: string;
      status: string;
      metadata: Record<string, any>;
    }>;
  };
};

export type ConfigureCollectionOptions = {
  type: string;
  status: string;
  metadata: Record<string, any>;
};

export type Transaction = {
  reference: string;
  created_at: string;
  status: string;
  amount: number;
  currency: string;
  customer?: { name?: string; email?: string; phone?: string };
  settlement_status: string;
  settlement_available_at?: string;
  channel: string;
  provider?: string;
  provider_reference?: string;
  financials?: {
    gross_amount_minor: number;
    fee_amount_minor: number;
    net_amount_minor: number;
    settlement_status: string;
    settlement_available_at?: string;
    ledger_status: string;
  };
};

export type TimelineEntry = {
  occurred_at: string;
  source: string;
  type: string;
  source_id: string;
  data?: Record<string, any>;
};

export type TransactionDetail = {
  status: boolean;
  data: {
    paymentIntent: Record<string, any>;
    attempts: any[];
    refunds: any[];
    disputes: any[];
    credits: any[];
    splitAllocations: any[];
    splitLiabilities: any[];
    financials: Record<string, any>;
    timeline: TimelineEntry[];
  };
};

export type AuditLogEntry = {
  id: string;
  actorType: string;
  actorId: string;
  merchantId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, string>;
  createdAt: string;
};

export type SettlementBatch = {
  id: string;
  merchantId?: string;
  currency: string;
  channel?: string;
  provider?: string;
  status: string;
  netAmountMinor: number;
  itemCount?: number;
  approvedAt?: string;
  payoutEvidence?: Record<string, string>;
};

export type SettlementPayout = {
  id: string;
  provider: string;
  currency: string;
  amountMinor: number;
  status: string;
  evidence?: Record<string, string>;
};

export type ReconciliationException = {
  id: string;
  type: string;
  status: string;
  provider: string;
  environment: string;
  accountNumber?: string;
  providerReference?: string;
  expectedAmountMinor?: number;
  receivedAmountMinor?: number;
  currency: string;
  context?: Record<string, any>;
  ownerId?: string;
  ownerName?: string;
};

export type AccountCreditEntry = {
  id: string;
  amountMinor: number;
  currency: string;
  status: string;
  customerId?: string;
  merchantId?: string;
  createdAt?: string;
};

export type ProviderHealthEntry = {
  id: string;
  provider: string;
  channel: string;
  environment: string;
  status: string;
  reason?: string;
  metadata?: Record<string, any>;
};

export type CollectionOption = {
  id: string;
  merchantId: string;
  environment: string;
  channel: string;
  enabled: boolean;
  routingPolicyId?: string;
  settlementPolicyId?: string;
  riskPolicyId?: string;
  createdAt?: string;
};

export type Refund = {
  id: string;
  reference: string;
  amountMinor: number;
  currency: string;
  status: string;
  reason?: string;
};

export type RefundAttempt = {
  id: string;
  provider: string;
  channel: string;
  executionMode: string;
  amountMinor: number;
  currency: string;
  status: string;
};

export type RefundDetails = {
  status: boolean;
  data: {
    refund: Refund;
    attempts: RefundAttempt[];
  };
};

export type CreateRefundPayload = {
  amount: number;
  reference: string;
  currency: string;
  paymentIntentId?: string;
  reason?: string;
  executionMode?: string;
  feePolicy?: string;
  evidence?: Record<string, any>;
  metadata?: Record<string, any>;
};

export type DisputeCase = {
  id: string;
  reference: string;
  amountMinor: number;
  currency: string;
  status: string;
  reason?: string;
};

export type DisputeEvidenceItem = {
  evidenceType: string;
  note?: string;
};

export type DisputeHold = {
  amountMinor: number;
  currency: string;
  status: string;
};

export type DisputeEvidencePack = {
  customer: { name: string };
  split_liabilities: Array<{ amountMinor: number; currency: string }>;
  settlement_status: string;
};

export type DisputeDetail = {
  status: boolean;
  data: {
    dispute: DisputeCase;
    evidence: DisputeEvidenceItem[];
    holds: DisputeHold[];
    evidencePack: DisputeEvidencePack;
  };
};

export type SubmitEvidencePayload = {
  evidenceType: string;
  note?: string;
  files?: Array<{ file_name: string; url: string }>;
  metadata?: Record<string, string>;
};

export type GatewayCustomer = {
  id: string;
  reference: string;
  email?: string;
  name?: string;
  status: string;
  metadata?: Record<string, string>;
};

export type VirtualAccount = {
  id: string;
  customerId?: string;
  provider?: string;
  environment?: string;
  accountType: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  currency: string;
  status: string;
};

export type CreateCustomerPayload = {
  reference: string;
  email?: string;
  name?: string;
  status?: string;
  metadata?: Record<string, string>;
};

export type Subaccount = {
  id: string;
  merchantId: string;
  environment: string;
  name: string;
  settlementBankAccountId: string;
  status: string;
  metadata?: Record<string, string>;
};

export type CreateSubaccountPayload = {
  name: string;
  settlementBankAccountId: string;
  metadata?: Record<string, string>;
};

export type SplitRuleRecipientInput = {
  subaccountId: string;
  role?: string;
  percentageBps?: number;
  flatAmountMinor?: number;
  feeBearer?: string;
};

export type CreateSplitRulePayload = {
  name: string;
  ruleType: "percentage" | "flat" | "hybrid";
  basis: "net" | "gross";
  feeBearer: "customer" | "merchant";
  liabilityMode?: string;
  environment?: string;
  recipients: SplitRuleRecipientInput[];
  remainderRecipientSubaccountId?: string;
  metadata?: Record<string, string>;
};

export type CreateInviteType = {
  email: string;
  firstName: string;
  lastName: string;
};

export type Invite = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  createdAt: string;
};

export type Member = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
};

export type Members = {
  data: {
    members: Member[];
  } & PaginatedResponse;
};

export type Invites = {
  data: {
    invites: Invite[];
  } & PaginatedResponse;
};

export type SingleInvite = {
  data: Invite & { merchantName?: string };
};

export type AcceptInvite = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  reference: string;
};

export type CreatePaymentLinkPayload = {
  amount: number | string;
  currency: string;
  reason?: string;
  isReusable?: boolean;
};

export type CreatePaymentLinkResponse = {
  data: {
    paylink: {
      id: string;
      reference: string;
      url: string;
      amount: number;
      currency: string;
      reason: string;
      isReusable: boolean;
      status: string;
    };
  };
};

export type PaymentLink = {
  id: string;
  reference: string;
  url: string;
  amount: number;
  currency: string;
  reason: string;
  status: string;
  isActive: boolean;
  isReusable: boolean;
  createdAt: string;
};

export type PaymentLinks = {
  data: {
    paylinks: PaymentLink[];
  } & PaginatedResponse;
};

export type PaymentLinkTransaction = {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  customerEmail: string;
  createdAt: string;
};

export type PaymentLinksTransaction = {
  data: {
    transactions: PaymentLinkTransaction[];
    paylink: PaymentLink;
  } & PaginatedResponse;
};

export type CreateCustomer = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
};

export type Customers = {
  data: {
    customers: Customer[];
  };
};

export type UpdateCustomer = Partial<CreateCustomer> & { id: string };

export type CustomerDetails = {
  data: {
    customer: Customer;
  };
};

export type Tax = {
  id: string;
  name: string;
  rate: number;
  createdAt: string;
};

export type Taxes = {
  data: {
    taxes: Tax[];
  } & PaginatedResponse;
};

export type CreateInvoiceDTO = {
  customerId: string;
  dueDate: string;
  invoiceDate?: string;
  items: Array<{
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  taxes?: Array<{ id: string; name: string; rate: number }>;
  currency: string;
  discount?: string;
  notes?: string;
  invoiceNumber?: string;
};

export type IInvoiceItem = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type TaxInvoiceRepr = {
  id: string;
  name: string;
  rate: number;
  amount: number;
};

export type InvoiceStatus =
  | "DRAFT"
  | "PENDING"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export type Invoice = {
  id: string;
  invoiceNumber: string;
  customerId: string;
  status: InvoiceStatus;
  totalAmount: number;
  currency: string;
  dueDate: string;
  createdAt: string;
  customer?: Customer;
};

export type Invoices = {
  data: {
    invoices: Invoice[];
  } & PaginatedResponse;
};

export type InvoiceDetails = {
  data: {
    invoice: Invoice & {
      items: IInvoiceItem[];
      taxes: TaxInvoiceRepr[];
      discount: number;
      notes: string;
      subTotal: number;
    };
  };
};

export type UpdateInvoice = {
  id: string;
  customerId?: string;
  dueDate?: string;
  items?: Array<{
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  taxes?: Array<{ id: string; name: string; rate: number }>;
  currency?: string;
  discount?: string;
  notes?: string;
};

export type DownloadInvoiceResponse = {
  data: {
    url: string;
  };
};

export type DownloadInvoiceTemplateResponse = {
  data: {
    url: string;
  };
};

export type GetMerchantProfileResponse = {
  data: {
    merchant: Merchant;
    owner: User;
  };
};

export type ApiKey = {
  id: string;
  merchantId: string;
  environment: "test" | "live";
  type: "public" | "secret";
  keyPrefix: string;
  maskedKey: string;
  status: "active" | "revoked";
  createdAt: string;
};

export type ApiKeysListResponse = {
  status: boolean;
  data: ApiKey[];
};

export type APIKeyResponse = {
  status: boolean;
  data: {
    publicKey: string;
    secretKey: string;
  };
};

export * from "./webhooks";
export * from "./finance";
export * from "./operations";

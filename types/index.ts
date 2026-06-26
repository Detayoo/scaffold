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
    merchant: Merchant;
  };
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  merchantId: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isPrimaryMerchant: boolean;
  isPaylinkEnabled?: boolean;
  isInvoiceEnabled?: boolean;
  isReusablePaylinkEnabled?: boolean;
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
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address: string;
  accountNumber?: string;
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
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  cardScheme?: string;
  scheme?: string;
  customerEmail?: string;
  customerName?: string;
  createdAt: string;
  updatedAt: string;
};

export type Transactions = {
  data: {
    transactions: Transaction[];
  } & PaginatedResponse;
};

export type TransactionDetails = {
  data: {
    transaction: Transaction & {
      fee?: number;
      netAmount?: number;
      channel?: string;
      merchantId?: string;
    };
  };
};

export type ExportTransactions = {
  startDate?: string;
  endDate?: string;
  status?: string;
};

export type InitiateRefundResponse = {
  type: string;
  amount: number;
  reference: string;
  reason?: string;
};

export type Refund = {
  id: string;
  type: string;
  amount: number;
  reference: string;
  transactionReference: string;
  status: string;
  reason: string;
  createdAt: string;
};

export type Refunds = {
  data: {
    refunds: Refund[];
  } & PaginatedResponse;
};

export type RefundDetails = {
  data: {
    refund: Refund & {
      merchantId: string;
      transactionId: string;
      updatedAt: string;
    };
  };
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
  amount: number;
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

export type APIKeysResponse = {
  data: {
    public: string;
    secret: string;
  };
};

# Malimbe Nigeria Payment Gateway API — Complete Agent Reference

**Version:** 0.1.0
**Base URLs:**
- Local dev: `http://localhost:3000`
- Production: `https://api.malimbe.example`

**Currency:** All money amounts are in **kobo** (NGN minor units) unless a field explicitly says otherwise.
e.g. ₦12,500 = `1250000` kobo

---

## Table of Contents

1. [Authentication](#authentication)
2. [Global Error Responses](#global-error-responses)
3. [Enums & Shared Types](#enums--shared-types)
4. [System](#system)
5. [Auth](#auth)
6. [API Keys](#api-keys)
7. [Transactions](#transactions)
8. [Checkout](#checkout)
9. [Webhooks](#webhooks)
10. [Finance](#finance)
11. [Operations](#operations)
12. [Collection Options](#collection-options)
13. [Provider Events](#provider-events)
14. [Paylinks](#paylinks)
15. [Refunds](#refunds)
16. [Disputes](#disputes)
17. [Customers](#customers)
18. [Splits](#splits)
19. [Admin](#admin)

---

## Authentication

All protected endpoints use HTTP Bearer auth:

```
Authorization: Bearer <token>
```

Token types:
- **JWT** from `POST /v1/auth/login` or `POST /v1/admin/auth/login`
- **Secret key** `sk_test_...` or `sk_live_...` (server-to-server calls)
- **Public key** `pk_test_...` or `pk_live_...` (frontend/checkout calls)

Each endpoint notes which auth type it requires under `x-auth`.

---

## Global Error Responses

All errors follow this envelope:

```json
{
  "status": false,
  "message": "Human-readable error message",
  "errors": [],      // optional array of field-level errors
  "data": {}         // optional extra context
}
```

| HTTP Code | Name | Typical Cause |
|-----------|------|---------------|
| 400 | Bad Request | Invalid input, e.g. non-integer amount |
| 401 | Unauthorized | Missing or invalid token/key |
| 403 | Forbidden | Authenticated but wrong role/key type |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate reference, invalid state transition |

---

## Enums & Shared Types

### Environment
```
"test" | "live"
```

### Currency
```
"NGN"
```
All amount fields in kobo.

### KeyType
```
"public" | "secret"
```

### Channel
```
"card" | "bank_transfer"
```

### Provider
```
"INTERSWITCH" | "VPS" | "MPGS"
```

### PaymentIntentStatus
```
"created" | "requires_action" | "processing" | "succeeded" |
"failed" | "expired" | "canceled" | "refunded" | "disputed"
```

### PaymentAttemptStatus
```
"initialized" | "requires_action" | "processing" |
"succeeded" | "failed" | "expired" | "abandoned"
```

### PaymentEventType (all 31 types)
```
payment.intent.created
payment.checkout.opened
payment.attempt.created
payment.attempt.requires_action
payment.attempt.processing
payment.succeeded
payment.failed
payment.expired
webhook.delivery.failed
refund.requested
refund.approved
refund.rejected
refund.processing
refund.succeeded
refund.failed
dispute.opened
dispute.evidence_required
dispute.evidence_submitted
dispute.won
dispute.lost
dispute.closed
dedicated_account.assigned
dedicated_account.suspended
account_credit.received
account_credit.applied
account_credit.refunded
split_rule.created
payment.split_allocated
split.settlement.created
split.refund_allocated
split.dispute_held
```

### RefundStatus
```
"requested" | "approved" | "processing" | "succeeded" | "failed" | "rejected"
```

### DisputeStatus
```
"opened" | "evidence_required" | "evidence_submitted" |
"under_review" | "won" | "lost" | "accepted" | "closed"
```

### VirtualAccountStatus
```
"assigned" | "active" | "pending_provider" |
"suspended" | "deactivated" | "credited" | "expired"
```

### AccountCreditStatus
```
"unapplied" | "held" | "applied" | "refunded"
```

### SplitRuleType
```
"percentage" | "flat" | "hybrid"
```

### SplitBasis
```
"net" | "gross"
```

### ProviderEventStatus
```
"received" | "rejected" | "duplicate" | "accepted" | "processed" | "needs_review"
```

---

## Shared Object Schemas

### CustomerProfile
```json
{
  "name": "Chinedu Okafor",
  "email": "chinedu.okafor@example.ng",
  "phone": "08034561234"
}
```

### TransferInstructions
```json
{
  "bank_name": "Providus Bank",
  "account_number": "9976543210",
  "account_name": "MALIMBE / CHINEDU OKAFOR",
  "amount": 1250000,
  "currency": "NGN",
  "provider_reference": "vps_init_lagos_100045",
  "expires_at": "2026-06-29T11:10:00.000Z"
}
```

### FinancialSummary
```json
{
  "ledger_group_id": "875f4211-...",
  "gross_amount_minor": 1250000,
  "fee_amount_minor": 25000,
  "net_amount_minor": 1225000,
  "settlement_status": "split_allocated",
  "settlement_available_at": "2026-06-30T10:40:00.000Z",
  "ledger_status": "split_allocated"
}
```

### PaymentIntent (full object)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Unique ID |
| merchantId | uuid | Owning merchant |
| environment | Environment | test / live |
| reference | string | Merchant-supplied reference |
| amountMinor | integer | Amount in kobo |
| currency | Currency | NGN |
| status | PaymentIntentStatus | Current status |
| channels | Channel[] | Enabled channels |
| customer | CustomerProfile | Payer info |
| metadata | object | Arbitrary key-value |
| splitRuleId | uuid | Applied split rule |
| callbackUrl | URI | Redirect after payment |
| expiresAt | datetime | Intent expiry |
| settlementStatus | string | Settlement state |
| settlementAvailableAt | datetime | When funds available |
| createdAt | datetime | |
| updatedAt | datetime | |

### PaymentAttempt (full object)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | |
| channel | Channel | card / bank_transfer |
| provider | Provider | INTERSWITCH / VPS / MPGS |
| status | PaymentAttemptStatus | |
| amountMinor | integer | kobo |
| currency | Currency | |
| providerReference | string | Provider's transaction ref |
| actionRequired | object | Next action for checkout |
| cardMetadata | object | Card details if card channel |
| transferInstructions | TransferInstructions | Bank transfer if bank_transfer |

---

## System

### GET /
**Auth:** None
**Summary:** Gateway welcome text

**Response 200** `text/plain`
```
Welcome to Malimbe Gateway
```

---

### GET /health
**Auth:** None
**Summary:** Database and provider adapter health check

**Response 200**
```json
{
  "status": true,
  "data": {
    "database": "ok",
    "providers": { "INTERSWITCH": "ok", "VPS": "ok" }
  }
}
```

---

### GET /checkout/{access_code}
**Auth:** None
**Summary:** Render the hosted checkout HTML page

**Path Params:**
| Param | Type | Example |
|-------|------|---------|
| access_code | string | `ac_test_lagos_7ZQ9M4R2` |

**Response 200** `text/html` — Full checkout HTML page

---

## Auth

### POST /v1/auth/register
**Auth:** None
**Summary:** Register a new merchant and owner user

**Request Body:**
```json
{
  "displayName": "Alausa Market Foods",
  "legalName": "Alausa Market Foods Limited",
  "email": "finance@alausamarket.ng",
  "password": "securepassword123",
  "ownerName": "Kemi Adebayo"
}
```

**Response 200:**
```json
{
  "status": true,
  "data": {
    "merchant": {
      "id": "87fb27f1-...",
      "displayName": "Alausa Market Foods",
      "legalName": "Alausa Market Foods Limited",
      "email": "finance@alausamarket.ng",
      "status": "pending",
      "riskTier": "standard",
      "defaultCurrency": "NGN",
      "settlementBankAccountId": null,
      "createdAt": "2026-06-28T08:30:00.000Z",
      "updatedAt": "2026-06-28T08:30:00.000Z"
    },
    "user": {
      "id": "9a45cb36-...",
      "merchantId": "87fb27f1-...",
      "email": "kemi@alausamarket.ng",
      "name": "Kemi Adebayo",
      "role": "owner",
      "status": "active"
    }
  }
}
```

**Response 409:** Email already registered

---

### POST /v1/auth/login
**Auth:** None
**Summary:** Login a merchant user

**Request Body:**
```json
{
  "email": "kemi@alausamarket.ng",
  "password": "securepassword123"
}
```

**Response 200:**
```json
{
  "status": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "9a45cb36-...",
      "merchantId": "87fb27f1-...",
      "email": "kemi@alausamarket.ng",
      "name": "Kemi Adebayo",
      "role": "owner",
      "status": "active"
    }
  }
}
```

**Response 401:** Invalid credentials

---

## API Keys

### GET /v1/keys
**Auth:** Merchant dashboard session or secret key
**Summary:** List merchant API keys

**Query Params:**
| Param | Type | Example |
|-------|------|---------|
| environment | Environment | `test` |
| type | KeyType | `secret` |

**Response 200:**
```json
{
  "status": true,
  "data": [
    {
      "id": "uuid",
      "merchantId": "uuid",
      "environment": "test",
      "type": "secret",
      "keyPrefix": "sk_test_",
      "maskedKey": "sk_test_****XYZ",
      "status": "active",
      "createdAt": "2026-06-28T09:00:00.000Z"
    }
  ]
}
```

---

### POST /v1/keys
**Auth:** Merchant dashboard session
**Summary:** Create new test or live public/secret API keys

**Request Body:**
```json
{
  "environment": "test"
}
```

**Response 200:**
```json
{
  "status": true,
  "data": {
    "publicKey": "pk_test_abc123...",
    "secretKey": "sk_test_xyz789..."
  }
}
```

---

### POST /v1/keys/{id}/rotate
**Auth:** Merchant dashboard session
**Summary:** Rotate an API key (old key invalidated, new key returned)

**Path Params:** `id` (uuid)

**Response 200:**
```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "newKey": "sk_test_newkey...",
    "rotatedAt": "2026-06-29T10:00:00.000Z"
  }
}
```

**Response 404:** Key not found

---

### POST /v1/keys/{id}/revoke
**Auth:** Merchant dashboard session
**Summary:** Permanently revoke an API key

**Path Params:** `id` (uuid)

**Response 200:**
```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "status": "revoked",
    "revokedAt": "2026-06-29T10:05:00.000Z"
  }
}
```

**Response 404:** Key not found

---

## Transactions

### POST /v1/transactions/initialize
**Auth:** Merchant secret key
**Summary:** Create a payment intent and hosted checkout session
**Required Header:** `X-Idempotency-Key: <unique_string>`

**Request Body:**
```json
{
  "amount": 1250000,
  "currency": "NGN",
  "reference": "ord_lagos_ikeja_100045",
  "channels": ["card", "bank_transfer"],
  "customer": {
    "name": "Chinedu Okafor",
    "email": "chinedu.okafor@example.ng",
    "phone": "08034561234"
  },
  "metadata": {
    "order_id": "IKJ-100045",
    "delivery_city": "Ikeja"
  },
  "splitRuleId": "f4bb7096-...",
  "callbackUrl": "https://alausamarket.ng/payments/callback"
}
```

**Fields:**
| Field | Required | Type | Notes |
|-------|----------|------|-------|
| amount | Yes | integer | Kobo |
| currency | Yes | Currency | Must be "NGN" |
| reference | Yes | string | Must be unique per merchant |
| channels | No | Channel[] | Defaults to all enabled channels |
| customer | Yes | CustomerProfile | |
| metadata | No | object | Arbitrary key-value pairs |
| splitRuleId | No | uuid | ID of split rule to apply |
| callbackUrl | No | URI | Redirect URL after payment |

**Response 200:**
```json
{
  "status": true,
  "data": {
    "paymentIntent": {
      "id": "5d0e3a43-...",
      "reference": "ord_lagos_ikeja_100045",
      "amountMinor": 1250000,
      "currency": "NGN",
      "status": "created",
      "channels": ["card", "bank_transfer"],
      "customer": { "name": "Chinedu Okafor", "email": "chinedu.okafor@example.ng", "phone": "08034561234" },
      "metadata": {},
      "expiresAt": "2026-06-29T11:40:00.000Z",
      "createdAt": "2026-06-29T10:40:00.000Z"
    },
    "accessCode": "ac_test_lagos_7ZQ9M4R2",
    "checkoutUrl": "https://api.malimbe.example/checkout/ac_test_lagos_7ZQ9M4R2"
  }
}
```

**Response 400:** Invalid amount or missing required field
**Response 409:** Reference already exists

---

### GET /v1/transactions
**Auth:** Merchant dashboard session or secret key
**Summary:** Search/list merchant transactions

**Query Params:**
| Param | Type | Example |
|-------|------|---------|
| reference | string | `ord_lagos_ikeja_100045` |
| status | PaymentIntentStatus | `succeeded` |
| settlementStatus | string | `pending` |
| channel | Channel | `bank_transfer` |
| customerEmail | email | `chinedu.okafor@example.ng` |
| createdFrom | datetime | `2026-06-01T00:00:00.000Z` |
| createdTo | datetime | `2026-06-29T23:59:59.000Z` |
| amountMin | integer | `500000` |
| amountMax | integer | `2500000` |

**Response 200:**
```json
{
  "status": true,
  "data": [
    {
      "reference": "ord_lagos_ikeja_100045",
      "created_at": "2026-06-29T10:40:00.000Z",
      "status": "succeeded",
      "amount": 1250000,
      "currency": "NGN",
      "customer": { "name": "Chinedu Okafor", "email": "chinedu.okafor@example.ng", "phone": "08034561234" },
      "settlement_status": "split_allocated",
      "settlement_available_at": "2026-06-30T10:40:00.000Z",
      "channel": "bank_transfer",
      "provider": "VPS",
      "provider_reference": "vps_init_lagos_100045",
      "financials": {
        "ledger_group_id": "875f4211-...",
        "gross_amount_minor": 1250000,
        "fee_amount_minor": 25000,
        "net_amount_minor": 1225000,
        "settlement_status": "split_allocated",
        "settlement_available_at": "2026-06-30T10:40:00.000Z",
        "ledger_status": "split_allocated"
      }
    }
  ]
}
```

---

### GET /v1/transactions/{reference}
**Auth:** Merchant key or session
**Summary:** Retrieve a single payment by reference

**Path Params:** `reference` (string)

**Response 200:** Same as VerifyPayment below
**Response 404:** Not found

---

### GET /v1/transactions/{reference}/verify
**Auth:** Merchant key or session
**Summary:** Verify current state and ledger summary for a payment

**Path Params:** `reference` (string)

**Response 200:**
```json
{
  "status": true,
  "data": {
    "paymentIntent": { /* PaymentIntent object */ },
    "latestAttempt": { /* PaymentAttempt object or null */ },
    "financials": { /* FinancialSummary object */ }
  }
}
```

**Response 404:** Not found

---

### POST /v1/transactions/{reference}/attempts
**Auth:** Merchant secret key
**Summary:** Create a payment attempt for an existing intent

**Path Params:** `reference` (string)

**Request Body:**
```json
{
  "channel": "bank_transfer",
  "provider": "VPS"
}
```

**Response 200:**
```json
{
  "status": true,
  "data": {
    "attempt": {
      "id": "dccf0368-...",
      "channel": "bank_transfer",
      "provider": "VPS",
      "status": "requires_action",
      "amountMinor": 1250000,
      "currency": "NGN",
      "providerReference": "vps_init_lagos_100045",
      "actionRequired": { "type": "bank_transfer", "message": "Transfer the exact amount..." },
      "transferInstructions": {
        "bank_name": "Providus Bank",
        "account_number": "9976543210",
        "account_name": "MALIMBE / CHINEDU OKAFOR",
        "amount": 1250000,
        "currency": "NGN",
        "provider_reference": "vps_init_lagos_100045",
        "expires_at": "2026-06-29T11:10:00.000Z"
      }
    }
  }
}
```

**Response 409:** Intent already succeeded or in terminal state

---

### GET /v1/transactions/{reference}/split
**Auth:** Merchant dashboard session or secret key
**Summary:** Retrieve immutable split allocation and liability snapshots

**Path Params:** `reference` (string)

**Response 200:**
```json
{
  "status": true,
  "data": {
    "allocations": [ /* PaymentSplitAllocation[] */ ],
    "liabilities": [ /* SplitLiabilityAllocation[] */ ]
  }
}
```

---

### GET /v1/transactions/{reference}/timeline
**Auth:** Merchant dashboard session or secret key
**Summary:** Get operational timeline for a payment

**Path Params:** `reference` (string)

**Response 200:**
```json
{
  "status": true,
  "data": {
    "timeline": [
      {
        "occurred_at": "2026-06-29T10:45:02.000Z",
        "source": "split_allocation",
        "type": "payment.split_allocated",
        "source_id": "0bd0d947-...",
        "data": {
          "amountMinor": 1102500,
          "currency": "NGN",
          "subaccountId": "0c9db9fb-..."
        }
      }
    ]
  }
}
```

---

### GET /v1/transactions/{reference}/detail
**Auth:** Merchant dashboard session or secret key
**Summary:** Get full payment detail — attempts, refunds, disputes, credits, splits, financials, timeline

**Path Params:** `reference` (string)

**Response 200:**
```json
{
  "status": true,
  "data": {
    "paymentIntent": { /* PaymentIntent */ },
    "attempts": [ /* PaymentAttempt[] */ ],
    "refunds": [ /* Refund[] */ ],
    "disputes": [ /* DisputeCase[] */ ],
    "credits": [ /* AccountCredit[] */ ],
    "splitAllocations": [ /* PaymentSplitAllocation[] */ ],
    "splitLiabilities": [ /* SplitLiabilityAllocation[] */ ],
    "financials": { /* FinancialSummary */ },
    "timeline": [ /* TimelineEntry[] */ ]
  }
}
```

---

### GET /v1/collection-options
**Auth:** Merchant key or session
**Summary:** List merchant collection channel policies

**Response 200:**
```json
{
  "status": true,
  "data": [
    {
      "id": "66f9f9d5-...",
      "merchantId": "87fb27f1-...",
      "environment": "test",
      "channel": "bank_transfer",
      "enabled": true,
      "routingPolicyId": "default_vps_transfer",
      "settlementPolicyId": "4ab3e632-...",
      "riskPolicyId": "standard_ngn"
    }
  ]
}
```

---

### POST /v1/collection-options
**Auth:** Merchant dashboard session
**Summary:** Enable or disable a collection channel

**Request Body:**
```json
{
  "channel": "card",
  "enabled": false
}
```

**Response 200:**
```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "channel": "card",
    "enabled": false
  }
}
```

---

## Checkout

> These endpoints are called by the **browser checkout page**, not server-to-server. No auth required.

### GET /v1/checkout/{access_code}
**Auth:** None
**Summary:** Load hosted checkout session state

**Path Params:** `access_code` (string)

**Response 200:**
```json
{
  "status": true,
  "data": {
    "access_code": "ac_test_lagos_7ZQ9M4R2",
    "status": "open",
    "browser_status": "requires_action",
    "selected_channel": "bank_transfer",
    "action_state": { "type": "bank_transfer" },
    "merchant": { "id": "87fb27f1-...", "name": "Alausa Market Foods" },
    "payment": {
      "reference": "ord_lagos_ikeja_100045",
      "amount": 1250000,
      "currency": "NGN",
      "status": "requires_action",
      "channels": ["card", "bank_transfer"],
      "customer": { "name": "Chinedu Okafor", "email": "chinedu.okafor@example.ng" },
      "metadata": { "delivery_city": "Ikeja" },
      "expires_at": "2026-06-29T11:40:00.000Z",
      "settlement_status": "none"
    },
    "latest_attempt": { /* PaymentAttempt object */ }
  }
}
```

---

### POST /v1/checkout/{access_code}/card/attempts
**Auth:** None
**Summary:** Start an Interswitch card attempt from hosted checkout

**Path Params:** `access_code` (string)

**Request Body:**
```json
{
  "pan": "5061040000000000094",
  "expiry": "12/27",
  "cvv": "123",
  "pin": "1234"
}
```

**Response 200:** PaymentAttempt object (may include `actionRequired` for OTP/3DS)
**Response 400:** Invalid card details

---

### POST /v1/checkout/{access_code}/bank-transfer/attempts
**Auth:** None
**Summary:** Start a VPS bank-transfer attempt from hosted checkout

**Request Body:** Optional / empty `{}`

**Response 200:** PaymentAttempt object with `transferInstructions`
**Response 400:** Channel not available

---

### POST /v1/checkout/{access_code}/card/actions/otp
**Auth:** None
**Summary:** Submit OTP for Interswitch card challenge

**Request Body:**
```json
{
  "otp": "123456"
}
```

**Response 200:** Updated PaymentAttempt
**Response 400:** Invalid OTP or wrong state

---

### POST /v1/checkout/{access_code}/card/actions/three-ds
**Auth:** None
**Summary:** Submit 3DS browser challenge result

**Request Body:**
```json
{
  "threeDSResult": "Y",
  "eci": "05",
  "cavv": "AAABB...",
  "xid": "MDAwMDA..."
}
```

**Response 200:** Updated PaymentAttempt
**Response 400:** 3DS failed

---

### GET /v1/checkout/{access_code}/status
**Auth:** None
**Summary:** Refresh/poll checkout session status

**Path Params:** `access_code` (string)

**Response 200:** Same as `GET /v1/checkout/{access_code}`

---

## Webhooks

### POST /v1/webhook-endpoints
**Auth:** Merchant dashboard session or secret key
**Summary:** Create or update a merchant webhook endpoint

**Request Body:**
```json
{
  "url": "https://alausamarket.ng/webhooks/malimbe",
  "environment": "test",
  "eventFilter": ["payment.succeeded", "refund.succeeded", "payment.split_allocated"]
}
```

**Fields:**
| Field | Required | Notes |
|-------|----------|-------|
| url | Yes | HTTPS endpoint to receive events |
| environment | Yes | test / live |
| eventFilter | No | Array of PaymentEventType; omit for all events |

**Response 200:**
```json
{
  "status": true,
  "data": {
    "id": "77a6ed31-...",
    "merchantId": "87fb27f1-...",
    "environment": "test",
    "url": "https://alausamarket.ng/webhooks/malimbe",
    "status": "active",
    "secretRef": "whsec_ref_lagos_6R4PNQ8K",
    "eventFilter": ["payment.succeeded", "refund.succeeded"],
    "createdAt": "2026-06-28T09:00:00.000Z",
    "updatedAt": "2026-06-28T09:00:00.000Z"
  }
}
```

---

### GET /v1/webhook-endpoints
**Auth:** Merchant dashboard session or secret key
**Summary:** List merchant webhook endpoints

**Query Params:**
| Param | Type | Example |
|-------|------|---------|
| status | string | `active` |

**Response 200:**
```json
{
  "status": true,
  "data": [ /* WebhookEndpoint[] */ ]
}
```

---

### POST /v1/webhook-endpoints/{id}/pause
**Auth:** Merchant dashboard session or secret key
**Summary:** Pause a webhook endpoint (deliveries queued but not sent)

**Path Params:** `id` (uuid)

**Response 200:** Updated WebhookEndpoint (status: "paused")
**Response 404:** Not found

---

### POST /v1/webhook-endpoints/{id}/resume
**Auth:** Merchant dashboard session or secret key
**Summary:** Resume a paused webhook endpoint

**Path Params:** `id` (uuid)

**Response 200:** Updated WebhookEndpoint (status: "active")
**Response 404:** Not found

---

### GET /v1/webhook-deliveries
**Auth:** Merchant dashboard session or secret key
**Summary:** List webhook delivery attempts

**Query Params:**
| Param | Type | Example |
|-------|------|---------|
| endpointId | uuid | `77a6ed31-...` |
| eventId | uuid | `1ed28f6b-...` |
| status | string | `failed` |

**Response 200:**
```json
{
  "status": true,
  "data": [
    {
      "id": "38f2c4c0-...",
      "event_id": "1ed28f6b-...",
      "endpoint_id": "77a6ed31-...",
      "endpoint_url": "https://alausamarket.ng/webhooks/malimbe",
      "attempts": 1,
      "status": "queued",
      "response_status": 200,
      "response_body_ref": "webhook-response/38f2c4c0-.../1",
      "next_retry_at": "2026-06-29T10:50:00.000Z",
      "replay_available": true,
      "created_at": "2026-06-29T10:45:03.000Z"
    }
  ]
}
```

---

### GET /v1/webhook-deliveries/{id}
**Auth:** Merchant dashboard session or secret key
**Summary:** Get full delivery detail including request body and signature headers

**Path Params:** `id` (uuid)

**Response 200:**
```json
{
  "status": true,
  "data": {
    "id": "38f2c4c0-...",
    "eventId": "1ed28f6b-...",
    "endpointId": "77a6ed31-...",
    "attemptNo": 1,
    "status": "queued",
    "responseCode": 200,
    "requestBody": "{\"event_type\":\"payment.succeeded\",\"reference\":\"ord_lagos_ikeja_100045\",\"amount\":1250000,\"currency\":\"NGN\"}",
    "signatureHeaders": {
      "X-Gateway-Signature": "sha256=abc123",
      "X-Gateway-Timestamp": "1782739502",
      "X-Gateway-Event-Id": "1ed28f6b-..."
    },
    "lastAttemptAt": "2026-06-29T10:45:04.000Z",
    "nextRetryAt": "2026-06-29T10:50:00.000Z"
  }
}
```

---

### POST /v1/webhook-deliveries/{id}/replay
**Auth:** Merchant dashboard session or secret key
**Summary:** Replay a specific webhook delivery

**Path Params:** `id` (uuid)

**Request Body:** Optional
```json
{
  "forceResend": true
}
```

**Response 200:**
```json
{
  "status": true,
  "data": {
    "replayId": "uuid",
    "status": "queued"
  }
}
```

---

### POST /v1/webhook-events/{id}/replay
**Auth:** Merchant dashboard session or secret key
**Summary:** Replay all deliveries for a payment event

**Path Params:** `id` (uuid) — event ID

**Response 200:**
```json
{
  "status": true,
  "data": {
    "eventId": "1ed28f6b-...",
    "deliveriesQueued": 2
  }
}
```

---

## Finance

### GET /v1/balances
**Auth:** Merchant dashboard session or secret key
**Summary:** Get merchant ledger-derived balances

**Query Params:**
| Param | Type | Example |
|-------|------|---------|
| currency | Currency | `NGN` |

**Response 200:**
```json
{
  "status": true,
  "data": [
    {
      "currency": "NGN",
      "pending_amount_minor": 1225000,
      "available_amount_minor": 3100000,
      "held_amount_minor": 0,
      "settlement_payable_amount_minor": 0,
      "paid_amount_minor": 18500000
    }
  ]
}
```

**Balance Field Meanings:**
- `pending_amount_minor` — Succeeded payments not yet available (T+1 or similar delay)
- `available_amount_minor` — Ready for settlement
- `held_amount_minor` — Frozen due to disputes
- `settlement_payable_amount_minor` — In generated settlement batches, awaiting payout
- `paid_amount_minor` — Total historically paid out

---

### GET /v1/settlements
**Auth:** Merchant dashboard session or secret key
**Summary:** List merchant settlement batches

**Query Params:**
| Param | Type | Example |
|-------|------|---------|
| status | string | `generated` |
| currency | Currency | `NGN` |

**Response 200:**
```json
{
  "status": true,
  "data": [
    {
      "id": "a2eb6401-...",
      "merchantId": "87fb27f1-...",
      "environment": "test",
      "currency": "NGN",
      "channel": "bank_transfer",
      "provider": "VPS",
      "status": "generated",
      "reconciliationStatus": "pending",
      "grossAmountMinor": 1250000,
      "feeAmountMinor": 25000,
      "netAmountMinor": 1225000,
      "itemCount": 1,
      "payableLedgerGroupId": "26ab510c-...",
      "approvedAt": "2026-06-30T12:00:00.000Z",
      "paidAt": "2026-06-30T15:00:00.000Z"
    }
  ]
}
```

---

### GET /v1/settlements/{id}
**Auth:** Merchant dashboard session or secret key
**Summary:** Retrieve a full settlement statement

**Path Params:** `id` (uuid)

**Response 200:**
```json
{
  "status": true,
  "data": {
    "batch": { /* SettlementBatch object */ },
    "items": [ /* individual transaction ledger items */ ],
    "payout": { /* SettlementPayout object or null */ }
  }
}
```

---

## Operations

### GET /v1/dashboard/home
**Auth:** Merchant dashboard session or secret key
**Summary:** Merchant dashboard home metrics

**Response 200:**
```json
{
  "status": true,
  "data": {
    "today": {
      "transactionCount": 14,
      "successCount": 12,
      "totalVolumeMinor": 6800000,
      "successVolumeMinor": 6000000
    },
    "pendingSettlementMinor": 1225000,
    "availableBalanceMinor": 3100000,
    "openDisputeCount": 1,
    "pendingRefundCount": 2
  }
}
```

---

### POST /v1/exports
**Auth:** Merchant dashboard session or secret key
**Summary:** Request a CSV export job

**Request Body:**
```json
{
  "exportType": "transactions",
  "environment": "test",
  "filters": {
    "createdFrom": "2026-06-01T00:00:00.000Z",
    "currency": "NGN"
  }
}
```

**exportType values:** `transactions`, `settlements`, `refunds`, `disputes`

**Response 200:**
```json
{
  "status": true,
  "data": {
    "id": "feec0d8e-...",
    "exportType": "transactions",
    "status": "pending",
    "createdAt": "2026-06-29T10:45:00.000Z"
  }
}
```

---

### GET /v1/exports
**Auth:** Merchant dashboard session or secret key
**Summary:** List export jobs

**Query Params:**
| Param | Type | Example |
|-------|------|---------|
| exportType | string | `transactions` |
| status | string | `completed` |

**Response 200:** Array of ExportJob objects

---

### GET /v1/exports/{id}/download
**Auth:** Merchant dashboard session or secret key
**Summary:** Download a completed export

**Path Params:** `id` (uuid)

**Response 200:**
```json
{
  "status": true,
  "data": {
    "id": "feec0d8e-...",
    "exportType": "transactions",
    "status": "completed",
    "rowCount": 1,
    "content": "reference,amount,currency\nord_lagos_ikeja_100045,1250000,NGN",
    "expiresAt": "2026-06-30T10:45:00.000Z"
  }
}
```

**Response 409:** Export not yet completed

---

### GET /v1/operations/read-models
**Auth:** Merchant dashboard session or secret key
**Summary:** List read-model refresh statuses

**Response 200:**
```json
{
  "status": true,
  "data": [
    {
      "modelName": "split_allocation_view",
      "status": "completed",
      "rowCount": 4,
      "lagSeconds": 0,
      "startedAt": "2026-06-29T10:50:00.000Z",
      "finishedAt": "2026-06-29T10:50:00.000Z"
    }
  ]
}
```

---

### POST /v1/operations/read-models/rebuild
**Auth:** Platform admin session
**Summary:** Rebuild read-model refresh markers

**Request Body:** Optional
```json
{
  "models": ["split_allocation_view", "transaction_summary"]
}
```

**Response 200:**
```json
{
  "status": true,
  "data": { "rebuilt": ["split_allocation_view"] }
}
```

---

### GET /v1/operations/runbooks
**Auth:** Merchant dashboard session or secret key
**Summary:** List operational runbooks

**Response 200:**
```json
{
  "status": true,
  "data": [
    {
      "slug": "vps-webhook-delay",
      "title": "VPS webhook delay",
      "triggers": ["Transfer accounts remain pending past expected credit window"],
      "actions": [
        "Inspect VPS provider events",
        "Review transfer exceptions",
        "Run reconciliation import"
      ]
    }
  ]
}
```

---

## Provider Events

### POST /v1/provider-webhooks/interswitch
**Auth:** None (provider to gateway)
**Summary:** Ingest an Interswitch card provider webhook

**Request Body:**
```json
{
  "transactionReference": "ISW_TXN_100045",
  "responseCode": "00",
  "amount": 1250000,
  "currency": "NGN",
  "cardPan": "506104****0094",
  "merchantId": "MID_ALAUSA_001"
}
```

**Response 200:** ProviderEvent object

---

### POST /v1/provider-webhooks/vps
**Auth:** None (provider to gateway)
**Summary:** Ingest a VPS bank-transfer webhook

**Request Body:**
```json
{
  "providerReference": "vps_init_lagos_100045",
  "accountNumber": "9976543210",
  "status": "succeeded",
  "amountMinor": 1250000,
  "currency": "NGN",
  "sourceAccountName": "Chinedu Okafor",
  "sourceBankName": "Access Bank"
}
```

**Response 200:** ProviderEvent object

---

### POST /v1/provider-events/simulate
**Auth:** Any authenticated merchant key or session
**Summary:** Simulate a provider event (test/dev only)

**Request Body:**
```json
{
  "provider": "VPS",
  "environment": "test",
  "providerEventId": "vps_settle_ikj_100045",
  "payload": {
    "providerReference": "vps_init_lagos_100045",
    "accountNumber": "9976543210",
    "status": "succeeded",
    "amountMinor": 1250000,
    "currency": "NGN",
    "sourceAccountName": "Chinedu Okafor",
    "sourceBankName": "Access Bank"
  }
}
```

**Response 200:** ProviderEvent object

---

### POST /v1/provider-events/{id}/replay
**Auth:** Any authenticated merchant key or session
**Summary:** Replay a provider event through the event processor

**Path Params:** `id` (uuid)

**Response 200:**
```json
{
  "status": true,
  "data": {
    "providerEventId": "4aee8af2-...",
    "replayStatus": "processed",
    "paymentIntentId": "5d0e3a43-...",
    "outcome": "payment_succeeded"
  }
}
```

---

## Paylinks

### GET /v1/paylinks
**Auth:** Merchant dashboard session or secret key
**Summary:** List paylinks

**Query Params:**
| Param | Type | Example |
|-------|------|---------|
| reference | string | `pl_lekki_catering_july` |
| status | string | `active` |

**Response 200:**
```json
{
  "status": true,
  "data": [ /* Paylink[] */ ]
}
```

---

### POST /v1/paylinks
**Auth:** Merchant dashboard session or secret key
**Summary:** Create a reusable paylink

**Request Body:**
```json
{
  "reference": "pl_lekki_catering_july",
  "amountMinor": 750000,
  "currency": "NGN",
  "channels": ["card", "bank_transfer"],
  "metadata": {
    "campaign": "Lekki catering deposits"
  }
}
```

**Response 200:**
```json
{
  "status": true,
  "data": {
    "id": "6005298b-...",
    "reference": "pl_lekki_catering_july",
    "amountMinor": 750000,
    "currency": "NGN",
    "channels": ["card", "bank_transfer"],
    "status": "active",
    "metadata": { "campaign": "Lekki catering deposits" },
    "payUrl": "https://pay.malimbe.example/pl_lekki_catering_july"
  }
}
```

---

### POST /v1/paylinks/{id}/status
**Auth:** Merchant dashboard session or secret key
**Summary:** Update paylink status (activate / deactivate)

**Path Params:** `id` (uuid)

**Request Body:**
```json
{
  "status": "inactive"
}
```

**Response 200:** Updated Paylink object
**Response 404:** Not found

---

## Refunds

### GET /v1/refunds
**Auth:** Merchant dashboard session or secret key
**Summary:** List refunds

**Query Params:**
| Param | Type | Example |
|-------|------|---------|
| reference | string | `rf_ikeja_100045_partial` |
| status | RefundStatus | `requested` |

**Response 200:**
```json
{
  "status": true,
  "data": [ /* Refund[] */ ]
}
```

---

### POST /v1/refunds
**Auth:** Merchant dashboard session or secret key
**Summary:** Create a refund request

**Request Body:**
```json
{
  "paymentReference": "ord_lagos_ikeja_100045",
  "amountMinor": 250000,
  "currency": "NGN",
  "reason": "Customer returned damaged rice bag",
  "metadata": {
    "support_ticket": "SUP-LAG-8842"
  }
}
```

**Fields:**
| Field | Required | Notes |
|-------|----------|-------|
| paymentReference | Yes | Original payment reference |
| amountMinor | Yes | Kobo; must be ≤ refundable amount |
| currency | Yes | NGN |
| reason | Yes | Human-readable reason |
| metadata | No | Arbitrary key-value |

**Response 200:**
```json
{
  "status": true,
  "data": {
    "id": "66b2b52f-...",
    "reference": "rf_ikeja_100045_partial",
    "paymentIntentId": "5d0e3a43-...",
    "amountMinor": 250000,
    "currency": "NGN",
    "status": "requested",
    "feeRefundAmountMinor": 5000,
    "merchantDebitAmountMinor": 245000,
    "requiresManualFunding": false,
    "reason": "Customer returned damaged rice bag",
    "metadata": { "remaining_refundable_minor": 1000000 }
  }
}
```

**Response 409:** Amount exceeds refundable balance or payment not refundable

---

### GET /v1/refunds/{id}
**Auth:** Merchant dashboard session or secret key
**Summary:** Get full refund detail including attempts

**Path Params:** `id` (uuid)

**Response 200:**
```json
{
  "status": true,
  "data": {
    "refund": { /* Refund object */ },
    "attempts": [ /* RefundAttempt[] */ ]
  }
}
```

---

## Disputes

### GET /v1/disputes
**Auth:** Merchant dashboard session or secret key
**Summary:** List disputes

**Query Params:**
| Param | Type | Example |
|-------|------|---------|
| reference | string | `dp_ikeja_100045` |
| status | DisputeStatus | `evidence_required` |

**Response 200:**
```json
{
  "status": true,
  "data": [ /* DisputeCase[] */ ]
}
```

---

### GET /v1/disputes/{id}
**Auth:** Merchant dashboard session or secret key
**Summary:** Get dispute detail and evidence pack

**Path Params:** `id` (uuid)

**Response 200:**
```json
{
  "status": true,
  "data": {
    "dispute": { /* DisputeCase object */ },
    "evidence": [ /* DisputeEvidence[] */ ],
    "hold": { /* RiskHold object or null */ }
  }
}
```

---

### POST /v1/disputes/{id}/evidence
**Auth:** Merchant dashboard session or secret key
**Summary:** Submit dispute evidence

**Path Params:** `id` (uuid)

**Request Body:**
```json
{
  "evidenceType": "delivery_proof",
  "note": "Dispatch rider delivered to 12 Allen Avenue, Ikeja; customer signed at reception.",
  "files": [
    {
      "file_name": "ikeja-delivery-slip.pdf",
      "url": "https://alausamarket.ng/evidence/ikeja-delivery-slip.pdf"
    }
  ],
  "metadata": {
    "rider_phone": "08090001122",
    "delivery_area": "Ikeja"
  }
}
```

**Response 200:** DisputeEvidence object
**Response 409:** Evidence deadline passed or wrong dispute state

---

## Customers

### POST /v1/customers
**Auth:** Merchant secret key
**Summary:** Create or update (upsert) a merchant customer

**Request Body:**
```json
{
  "reference": "cus_ikeja_chinedu",
  "email": "chinedu.okafor@example.ng",
  "name": "Chinedu Okafor",
  "metadata": {
    "city": "Ikeja",
    "phone": "08034561234"
  }
}
```

**Response 200:**
```json
{
  "status": true,
  "data": {
    "id": "2f1a27cb-...",
    "merchantId": "87fb27f1-...",
    "reference": "cus_ikeja_chinedu",
    "email": "chinedu.okafor@example.ng",
    "name": "Chinedu Okafor",
    "status": "active",
    "metadata": { "city": "Ikeja", "phone": "08034561234" }
  }
}
```

---

### GET /v1/customers
**Auth:** Merchant dashboard session or secret key
**Summary:** List merchant customers

**Query Params:**
| Param | Type | Example |
|-------|------|---------|
| reference | string | `cus_ikeja_chinedu` |
| email | email | `chinedu.okafor@example.ng` |
| status | string | `active` |

**Response 200:**
```json
{
  "status": true,
  "data": [ /* Customer[] */ ]
}
```

---

### POST /v1/customers/{id}/dedicated-accounts
**Auth:** Merchant secret key
**Summary:** Assign a dedicated virtual account (DVA) to a customer

**Path Params:** `id` (uuid) — customer ID

**Request Body:** Optional
```json
{
  "provider": "VPS",
  "preferredBank": "Providus"
}
```

**Response 200:**
```json
{
  "status": true,
  "data": {
    "id": "c21bd2f1-...",
    "customerId": "2f1a27cb-...",
    "provider": "VPS",
    "accountType": "customer_dedicated",
    "accountNumber": "7701234567",
    "accountName": "CHINEDU OKAFOR",
    "bankName": "VPS Dedicated Bank",
    "status": "active",
    "currency": "NGN",
    "assignedAt": "2026-06-29T08:30:00.000Z"
  }
}
```

---

### GET /v1/customers/{id}/dedicated-accounts
**Auth:** Merchant dashboard session or secret key
**Summary:** List a customer's dedicated virtual accounts

**Path Params:** `id` (uuid) — customer ID

**Response 200:**
```json
{
  "status": true,
  "data": [ /* VirtualAccount[] */ ]
}
```

---

## Splits

### POST /v1/subaccounts
**Auth:** Merchant secret key
**Summary:** Create a split settlement subaccount

**Request Body:**
```json
{
  "name": "Balogun Rice Seller",
  "settlementBankAccountId": "gtb_0123456789",
  "environment": "test",
  "metadata": {
    "bank_name": "GTBank",
    "account_number": "0123456789",
    "market": "Balogun"
  }
}
```

**Response 200:**
```json
{
  "status": true,
  "data": {
    "id": "0c9db9fb-...",
    "merchantId": "87fb27f1-...",
    "environment": "test",
    "name": "Balogun Rice Seller",
    "settlementBankAccountId": "gtb_0123456789",
    "status": "active",
    "metadata": { "bank_name": "GTBank", "account_number": "0123456789", "market": "Balogun" }
  }
}
```

---

### GET /v1/subaccounts
**Auth:** Merchant dashboard session or secret key
**Summary:** List split settlement subaccounts

**Query Params:**
| Param | Type | Example |
|-------|------|---------|
| status | string | `active` |

**Response 200:** Array of Subaccount objects

---

### POST /v1/split-rules
**Auth:** Merchant secret key
**Summary:** Create and validate a split rule

**Request Body:**
```json
{
  "name": "Alausa marketplace 90/10",
  "ruleType": "percentage",
  "basis": "net",
  "feeBearer": "merchant",
  "liabilityMode": "proportional",
  "environment": "test",
  "recipients": [
    {
      "subaccountId": "0c9db9fb-...",
      "role": "seller",
      "percentageBps": 9000,
      "flatAmountMinor": 0,
      "feeBearer": "recipient"
    }
  ],
  "remainderRecipientSubaccountId": "0c9db9fb-...",
  "metadata": {
    "market": "Alausa"
  }
}
```

**Fields:**
| Field | Notes |
|-------|-------|
| ruleType | `percentage`, `flat`, or `hybrid` |
| basis | `net` (after fees) or `gross` (before fees) |
| feeBearer | Who absorbs gateway fees: `merchant` or `recipient` |
| liabilityMode | How refund/dispute liability splits: `proportional` |
| percentageBps | Basis points, e.g. 9000 = 90% |
| remainderRecipientSubaccountId | Who gets leftover after allocations |

**Response 200:**
```json
{
  "status": true,
  "data": {
    "rule": { /* SplitRule object */ },
    "recipients": [ /* SplitRuleRecipient[] */ ]
  }
}
```

---

### GET /v1/split-rules/{id}
**Auth:** Merchant dashboard session or secret key
**Summary:** Retrieve a split rule with all recipients

**Path Params:** `id` (uuid)

**Response 200:**
```json
{
  "status": true,
  "data": {
    "rule": { /* SplitRule object */ },
    "recipients": [ /* SplitRuleRecipient[] */ ]
  }
}
```

---

## Admin

> All admin endpoints require **Platform admin session** (JWT from `POST /v1/admin/auth/login`).

### POST /v1/admin/auth/login
**Auth:** None
**Summary:** Login as platform admin

**Request Body:** Same as `/v1/auth/login`

**Response 200:** Same LoginResponse shape

---

### GET /v1/admin/payments/{reference}/timeline
**Auth:** Platform admin session
**Summary:** Inspect a payment timeline across all merchants

**Path Params:** `reference` (string)

**Response 200:** Full timeline with internal admin events

---

### POST /v1/admin/settlement-runs
**Auth:** Platform admin session
**Summary:** Generate merchant settlement batches from eligible ledger groups

**Request Body:** Optional
```json
{
  "environment": "test",
  "currency": "NGN",
  "channel": "bank_transfer",
  "cutoffDate": "2026-06-29T23:59:59.000Z"
}
```

**Response 200:**
```json
{
  "status": true,
  "data": {
    "batchesGenerated": 3,
    "batches": [ /* SettlementBatch[] */ ]
  }
}
```

---

### POST /v1/admin/settlements/{id}/approve
**Auth:** Platform admin session
**Summary:** Approve a generated settlement batch

**Path Params:** `id` (uuid)

**Response 200:** Updated SettlementBatch (status: "approved")
**Response 409:** Already approved or wrong state

---

### POST /v1/admin/settlements/{id}/mark-paid
**Auth:** Platform admin session
**Summary:** Mark settlement paid and post payout ledger entries

**Path Params:** `id` (uuid)

**Request Body:**
```json
{
  "paidAt": "2026-06-30T15:00:00.000Z",
  "evidence": {
    "bank": "GTBank",
    "nibss_reference": "NIP/GTB/20260630/556677"
  }
}
```

**Response 200:**
```json
{
  "status": true,
  "data": {
    "batch": { /* SettlementBatch object (status: paid) */ },
    "payout": { /* SettlementPayout object */ }
  }
}
```

---

### POST /v1/admin/provider-statements/import
**Auth:** Platform admin session
**Summary:** Import provider/bank statement items for reconciliation

**Request Body:**
```json
{
  "provider": "VPS",
  "environment": "test",
  "items": [
    {
      "providerReference": "vps_init_lagos_100045",
      "accountNumber": "9976543210",
      "amountMinor": 1200000,
      "currency": "NGN",
      "settledAt": "2026-06-29T12:00:00.000Z"
    }
  ]
}
```

**Response 200:**
```json
{
  "status": true,
  "data": {
    "imported": 1,
    "exceptions": 1,
    "exceptionIds": ["483ccdaa-..."]
  }
}
```

---

### POST /v1/admin/reconciliation-runs
**Auth:** Platform admin session
**Summary:** Run payment, settlement, or ledger trial-balance reconciliation

**Request Body:**
```json
{
  "type": "payment",
  "environment": "test",
  "provider": "VPS",
  "dateFrom": "2026-06-29T00:00:00.000Z",
  "dateTo": "2026-06-29T23:59:59.000Z"
}
```

**type values:** `payment`, `settlement`, `ledger_trial_balance`

**Response 200:**
```json
{
  "status": true,
  "data": {
    "matched": 10,
    "exceptions": 1,
    "exceptionIds": ["483ccdaa-..."]
  }
}
```

---

### GET /v1/admin/reconciliation-exceptions
**Auth:** Platform admin session
**Summary:** List reconciliation exceptions

**Query Params:**
| Param | Type | Example |
|-------|------|---------|
| status | string | `open` |
| type | string | `amount_mismatch` |
| ownerId | uuid | |

**Response 200:** Array of ReconciliationException objects

---

### GET /v1/admin/reconciliation-exceptions/{id}
**Auth:** Platform admin session
**Summary:** Get a single reconciliation exception

**Response 200:**
```json
{
  "status": true,
  "data": {
    "id": "483ccdaa-...",
    "type": "amount_mismatch",
    "status": "open",
    "provider": "VPS",
    "environment": "test",
    "accountNumber": "9976543210",
    "providerReference": "vps_init_lagos_100045",
    "expectedAmountMinor": 1250000,
    "receivedAmountMinor": 1200000,
    "currency": "NGN",
    "context": { "reason": "Provider amount or currency does not match ledger" },
    "ownerId": "ops_lagos_01",
    "ownerName": "Finance Ops Lagos"
  }
}
```

---

### POST /v1/admin/reconciliation-exceptions/{id}/assign
**Auth:** Platform admin session
**Summary:** Assign an owner to a reconciliation exception

**Request Body:**
```json
{
  "ownerId": "ops_lagos_01",
  "ownerName": "Finance Ops Lagos"
}
```

---

### POST /v1/admin/reconciliation-exceptions/{id}/resolve
**Auth:** Platform admin session
**Summary:** Resolve a reconciliation exception

**Request Body:**
```json
{
  "resolutionReason": "Provider confirmed amount_minor 1250000; statement entry was a partial posting",
  "resolutionEvidence": { "email_thread": "support-12345" }
}
```

**Response 200:** Updated ReconciliationException (status: resolved)
**Response 400:** Missing required fields

---

### POST /v1/admin/manual-adjustments
**Auth:** Platform admin session
**Summary:** Create an audited balanced manual ledger adjustment

**Request Body:**
```json
{
  "merchantId": "87fb27f1-...",
  "currency": "NGN",
  "amountMinor": 50000,
  "direction": "credit",
  "reason": "Fee correction for June 2026",
  "evidence": { "ticket": "OPS-4421" }
}
```

**Response 200:** LedgerTransactionGroup object

---

### GET /v1/admin/audit-logs
**Auth:** Platform admin session
**Summary:** List audit logs

**Query Params:**
| Param | Type | Example |
|-------|------|---------|
| action | string | `refund.approved` |
| targetType | string | `refund` |
| actorId | string | `ops_user_lagos_01` |

**Response 200:** Array of audit log entries

---

### POST /v1/admin/merchants/{id}/review
**Auth:** Platform admin session
**Summary:** Review and update merchant status and risk tier

**Path Params:** `id` (uuid)

**Request Body:**
```json
{
  "status": "active",
  "riskTier": "standard",
  "note": "KYC documents verified"
}
```

**Response 200:** Updated Merchant object

---

### GET /v1/admin/provider-health
**Auth:** Platform admin session
**Summary:** List provider health states

**Query Params:**
| Param | Type | Example |
|-------|------|---------|
| provider | Provider | `VPS` |
| channel | Channel | `bank_transfer` |
| environment | Environment | `test` |

**Response 200:** Array of ProviderHealth objects

---

### POST /v1/admin/provider-health
**Auth:** Platform admin session
**Summary:** Update provider health and routing status

**Request Body:**
```json
{
  "provider": "VPS",
  "channel": "bank_transfer",
  "environment": "test",
  "status": "degraded",
  "routingEnabled": false,
  "note": "VPS bank transfer experiencing delays"
}
```

**Response 200:** Updated ProviderHealth object

---

### Admin Refunds (Platform-level)

| Endpoint | Method | Summary |
|----------|--------|---------|
| `/v1/admin/refunds` | GET | List refunds across all merchants |
| `/v1/admin/refunds` | POST | Create refund as admin |
| `/v1/admin/refunds/{id}/approve` | POST | Approve a requested refund |
| `/v1/admin/refunds/{id}/reject` | POST | Reject a refund |
| `/v1/admin/refunds/{id}/process` | POST | Start provider/manual processing |
| `/v1/admin/refunds/{id}/mark-succeeded` | POST | Finalize refund, post reversal ledger entries |
| `/v1/admin/refunds/{id}/mark-failed` | POST | Mark processing refund as failed |

**Approve Request Body:**
```json
{ "note": "Approved by Finance Ops" }
```

**Reject Request Body:**
```json
{ "reason": "Refund not eligible — chargeback already filed" }
```

**Process Request Body:**
```json
{ "executionMode": "manual", "provider": "VPS" }
```

**Mark Succeeded Request Body:**
```json
{
  "providerReference": "rf_vps_ikeja_100045",
  "evidence": { "operator": "Finance Ops Lagos" },
  "succeededAt": "2026-06-30T10:00:00.000Z"
}
```

**Mark Failed Request Body:**
```json
{ "reason": "Bank declined reversal", "evidence": {} }
```

---

### Admin Disputes (Platform-level)

| Endpoint | Method | Summary |
|----------|--------|---------|
| `/v1/admin/disputes` | GET | List disputes across all merchants |
| `/v1/admin/disputes` | POST | Open a dispute case |
| `/v1/admin/disputes/{id}/hold` | POST | Post dispute hold against balances |
| `/v1/admin/disputes/{id}/assign` | POST | Assign dispute owner |
| `/v1/admin/disputes/{id}/evidence` | POST | Add admin evidence |
| `/v1/admin/disputes/{id}/outcome` | POST | Record outcome and post ledger entries |
| `/v1/admin/disputes/{id}/close` | POST | Close dispute after outcome |

**Create Dispute Request Body:**
```json
{
  "paymentReference": "ord_lagos_ikeja_100045",
  "amountMinor": 1250000,
  "currency": "NGN",
  "reason": "Customer claims goods were not delivered",
  "evidenceDueAt": "2026-07-02T10:00:00.000Z",
  "metadata": { "issuer": "Access Bank", "customer_city": "Ikeja" }
}
```

**Hold Dispute Request Body:**
```json
{
  "amountMinor": 1250000,
  "currency": "NGN",
  "holdScope": "merchant"
}
```

**Dispute Outcome Request Body:**
```json
{
  "outcome": "won",
  "note": "Delivery proof accepted; dispute resolved in merchant's favour"
}
```

**Close Dispute Request Body:**
```json
{ "note": "Closed after outcome recorded" }
```

---

### Admin Dedicated Accounts & Credits

| Endpoint | Method | Summary |
|----------|--------|---------|
| `/v1/admin/dedicated-accounts/{id}/suspend` | POST | Suspend a DVA |
| `/v1/admin/dedicated-accounts/{id}/deactivate` | POST | Permanently deactivate a DVA |
| `/v1/admin/account-credits` | GET | List unapplied/held account credits |
| `/v1/admin/account-credits/{id}/apply` | POST | Apply credit to a payment intent |
| `/v1/admin/account-credits/{id}/hold` | POST | Move credit to hold state |
| `/v1/admin/account-credits/{id}/refund` | POST | Refund an unapplied credit |

**Apply Credit Request Body:**
```json
{ "paymentIntentId": "5d0e3a43-..." }
```

**Hold Credit Request Body:**
```json
{ "reason": "Suspected duplicate transfer" }
```

**Refund Credit Request Body:**
```json
{
  "destinationAccountNumber": "0123456789",
  "destinationBankCode": "058",
  "reason": "Customer requested return of funds"
}
```

**List Account Credits Query Params:**
| Param | Type | Example |
|-------|------|---------|
| status | AccountCreditStatus | `unapplied` |
| customerId | uuid | |

---

### POST /v1/admin/split-settlements
**Auth:** Platform admin session
**Summary:** Generate split settlement items and payout batches for subaccounts

**Request Body:** Optional
```json
{
  "environment": "test",
  "currency": "NGN",
  "cutoffDate": "2026-06-29T23:59:59.000Z"
}
```

**Response 200:**
```json
{
  "status": true,
  "data": {
    "itemsGenerated": 2,
    "batchesGenerated": 1,
    "items": [ /* SplitSettlementItem[] */ ],
    "batches": [ /* SettlementBatch[] */ ]
  }
}
```

---

## Webhook Event Payload Shape

When Malimbe delivers an event to your endpoint, the request body is:

```json
{
  "event_type": "payment.succeeded",
  "event_id": "1ed28f6b-...",
  "merchant_id": "87fb27f1-...",
  "environment": "test",
  "reference": "ord_lagos_ikeja_100045",
  "occurred_at": "2026-06-29T10:45:02.000Z",
  "data": {
    "reference": "ord_lagos_ikeja_100045",
    "amount": 1250000,
    "currency": "NGN",
    "provider": "VPS"
  }
}
```

**Signature Headers on Delivery:**
```
X-Gateway-Signature: sha256=<hmac>
X-Gateway-Timestamp: <unix_epoch>
X-Gateway-Event-Id: <uuid>
```

---

## Payment Flow Quick Reference

### Standard Payment Flow
```
1. POST /v1/transactions/initialize
   → returns access_code + checkoutUrl

2. [Browser] GET /v1/checkout/{access_code}
   → load session state

3. [Browser] POST /v1/checkout/{access_code}/card/attempts
   OR
   [Browser] POST /v1/checkout/{access_code}/bank-transfer/attempts

4a. Card → may return actionRequired: otp or 3ds
    → POST /v1/checkout/{access_code}/card/actions/otp
    → POST /v1/checkout/{access_code}/card/actions/three-ds

4b. Bank transfer → returns transferInstructions
    → customer sends to the virtual account
    → Malimbe receives VPS webhook → processes payment

5. GET /v1/transactions/{reference}/verify
   → confirm final status

6. Receive webhook event: payment.succeeded
```

### Refund Flow
```
1. POST /v1/refunds  (merchant requests)
2. [Admin] POST /v1/admin/refunds/{id}/approve
3. [Admin] POST /v1/admin/refunds/{id}/process
4. [Admin] POST /v1/admin/refunds/{id}/mark-succeeded
   → ledger reversal entries posted
   → webhook: refund.succeeded
```

### Dispute Flow
```
1. [Admin] POST /v1/admin/disputes  (dispute opened)
2. [Admin] POST /v1/admin/disputes/{id}/hold  (funds frozen)
3. POST /v1/disputes/{id}/evidence  (merchant submits evidence)
4. [Admin] POST /v1/admin/disputes/{id}/outcome  (won/lost)
5. [Admin] POST /v1/admin/disputes/{id}/close
   → hold released (won) or deducted (lost)
```

### Split Settlement Flow
```
1. PaymentIntent created with splitRuleId
2. Payment succeeds → payment.split_allocated event fired
3. [Admin] POST /v1/admin/settlement-runs  (generate batches)
4. [Admin] POST /v1/admin/settlements/{id}/approve
5. [Admin] POST /v1/admin/split-settlements  (generate split items)
6. [Admin] POST /v1/admin/settlements/{id}/mark-paid  (payout posted)
```

---

## Notes for Agent Use

- All UUIDs are `format: uuid` strings.
- All datetime fields are ISO 8601 with timezone (`format: date-time`).
- The `status: true/false` boolean on every response envelope is the success indicator — never rely only on HTTP status codes.
- `amountMinor` / `amount` fields are **always kobo** unless explicitly labeled otherwise.
- Use `X-Idempotency-Key` header on `POST /v1/transactions/initialize` to safely retry without creating duplicate intents.
- `environment` is either `"test"` or `"live"` — keys and data are fully isolated between environments.
- Secret keys (`sk_...`) are for server-to-server. Public keys (`pk_...`) and access codes are for client/browser use.

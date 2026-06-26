# x-noname — Merchant Portal

A modern, minimal merchant portal built with Next.js 16, shadcn/ui, and PP Mori.

## Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** shadcn/ui (radix-nova), Tailwind CSS v4
- **Font:** PP Mori (self-hosted)
- **Animations:** motion/react
- **Forms:** react-hook-form + zod
- **Data:** TanStack Query v5
- **Icons:** Lucide React

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run lint
```

## Pages

| Route | Description |
|---|---|
| `/` | Login |
| `/register` | Registration |
| `/verification` | OTP verification |
| `/forgot-password` | Forgot password |
| `/reset-password` | Reset password |
| `/invite/:reference` | Accept team invite |
| `/home` | Dashboard overview |
| `/transactions` | Transaction list |
| `/refunds` | Refund management |
| `/settings` | Profile, security, API keys, webhook, taxes |
| `/team/members` | Team members |
| `/team/invites` | Team invitations |
| `/payment-links` | Payment link management |
| `/payment-links/:reference` | Payment link details |
| `/invoices` | Invoice management |
| `/invoices/create-invoice` | Create invoice |
| `/invoices/:id` | Invoice details |
| `/invoices/update` | Update invoice |

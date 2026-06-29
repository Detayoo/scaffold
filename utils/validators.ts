import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email" })
    .nonempty({ message: "Email is required" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .nonempty({ message: "Password is required" }),
});

export const registrationSchema = z.object({
  displayName: z.string().nonempty({ message: "Business name is required" }),
  legalName: z.string().nonempty({ message: "Legal name is required" }),
  email: z
    .string()
    .email({ message: "Invalid email" })
    .nonempty({ message: "Email is required" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .nonempty({ message: "Password is required" }),
  ownerName: z.string().nonempty({ message: "Owner name is required" }),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email" })
    .nonempty({ message: "Email is required" }),
});

export const resetPasswordSchema = z
  .object({
    code: z
      .string()
      .nonempty({ message: "Code is required" })
      .length(6, { message: "Code must be 6 digits" }),
    password: z
      .string()
      .nonempty({ message: "Password is required" })
      .min(6, "Password must not be less than 6 characters"),
    confirm_password: z
      .string()
      .nonempty({ message: "Confirm password is required" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().nonempty({ message: "Old password is required" }),
    newPassword: z
      .string()
      .min(6, { message: "New password must be at least 6 characters" })
      .nonempty({ message: "New password is required" }),
    password: z.string().nonempty({ message: "Confirm password is required" }),
  })
  .refine((data) => data.newPassword === data.password, {
    path: ["password"],
    message: "Passwords do not match",
  });

export const createPaymentLinkSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount is required" }),
  currency: z.string().nonempty({ message: "Currency is required" }),
  reason: z.string().optional(),
  isReusable: z.boolean().optional(),
});

export const initiateRefundSchema = (maxPaid: number) =>
  z
    .object({
      type: z.string().nonempty({ message: "Refund type is required" }),
      amount: z.string().nonempty({ message: "Amount is required" }),
      reference: z.string().nonempty({ message: "Reference is required" }),
      reason: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.type === "PARTIAL") {
        const numAmount = Number(data.amount);
        if (Number.isNaN(numAmount)) {
          ctx.addIssue({
            path: ["amount"],
            code: z.ZodIssueCode.custom,
            message: "Amount must be a valid number",
          });
          return;
        }
        if (numAmount >= maxPaid) {
          ctx.addIssue({
            path: ["amount"],
            code: z.ZodIssueCode.custom,
            message: `Amount must be less than ${maxPaid}`,
          });
        }
      }
    });

export const exportTransactionsSchema = z
  .object({
    duration: z.string().optional(),
    status: z.string().optional(),
    startDate: z.union([z.date(), z.string()]).optional(),
    endDate: z.union([z.date(), z.string()]).optional(),
  })
  .refine(
    ({ startDate, endDate }) =>
      (!startDate && !endDate) || (startDate && endDate),
    {
      message: "Provide both start date and end date, or leave both empty",
      path: ["startDate"],
    }
  )
  .refine(
    ({ duration, startDate, endDate }) =>
      duration !== "CUSTOM" || (startDate && endDate),
    {
      message: "Start & End dates are required when duration is CUSTOM",
      path: ["duration"],
    }
  );

export const inviteSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).nonempty({
    message: "Email is required",
  }),
  firstName: z.string().nonempty({ message: "First name is required" }),
  lastName: z.string().nonempty({ message: "Last name is required" }),
});

export const acceptInviteSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).nonempty({
    message: "Email is required",
  }),
  firstName: z.string().nonempty({ message: "First name is required" }),
  lastName: z.string().nonempty({ message: "Last name is required" }),
  password: z.string().min(8).nonempty({ message: "Password is required" }),
});

export const createTaxSchema = z.object({
  name: z.string().nonempty({ message: "Tax name is required" }),
  rate: z.coerce.number().min(0.01, "Rate is required").max(100, "Rate must not exceed 100%"),
});

export const createCustomerSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  email: z.string().email({ message: "Invalid email" }).nonempty({
    message: "Email is required",
  }),
  phone: z
    .string()
    .length(11, { message: "Phone number must be 11 digits" })
    .nonempty({ message: "Phone number is required" }),
  address: z.string().nonempty({ message: "Address is required" }),
});

export const createInvoiceColumnSchema = z.object({
  description: z.string().nonempty({ message: "Description is required" }),
  name: z.string().nonempty({ message: "Name is required" }),
  quantity: z.string().nonempty({ message: "Quantity is required" }),
  unitPrice: z.string().nonempty({ message: "Unit price is required" }),
});

export const createInvoiceSchema = z.object({
  invoiceDate: z.string().optional(),
  dueDate: z.string().nonempty({ message: "Due date is required" }),
  items: z
    .array(
      z.object({
        name: z.string().nonempty({ message: "Item name is required" }),
        description: z
          .string()
          .nonempty({ message: "Item description is required" }),
        quantity: z
          .number()
          .int()
          .positive({ message: "Quantity must be greater than 0" }),
        unitPrice: z
          .number()
          .positive({ message: "Unit price must be greater than 0" }),
      })
    )
    .min(1, { message: "At least one item is required" }),
  taxes: z
    .array(
      z.object({ id: z.string(), name: z.string(), rate: z.number() })
    )
    .optional(),
  currency: z.string().nonempty({ message: "Currency is required" }),
  discount: z
    .string()
    .refine((value) => !value || Number(value) <= 100, {
      message: "Discount must not exceed 100%",
    })
    .optional(),
  notes: z.string().optional(),
  invoiceNumber: z.string().optional(),
});

export const bankTransferCOnfigurationSchema = z.object({
  clientId: z.string().nonempty({ message: "Client ID is required" }),
  clientSecret: z.string().nonempty({ message: "Secret key is required" }),
});

export const internationalCardConfigurationSchema = z.object({
  mid: z.string().nonempty({ message: "MID is required" }),
  webhookSecret: z
    .string()
    .nonempty({ message: "Webhook secret is required" }),
  password: z.string().nonempty({ message: "Password is required" }),
});

export const localCardConfigurationSchema = z.object({
  mid: z.string().nonempty({ message: "MID is required" }),
});

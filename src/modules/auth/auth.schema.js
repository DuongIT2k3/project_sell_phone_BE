import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  password: z.string().min(1, "Password is required"),
  address: z.string().optional(),
  bios: z.string().optional(),
  avatarUrl: z.string().url().optional(),
    social: z.object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      twitter: z.string().optional(),
    }).optional(),
    role: z.enum(["member", "admin", "superAdmin"]).default("member"),
});

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters "),
});

import {z} from 'zod';

// Atom schemas (reusable building blocks)
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address');

export const phoneSchema = z
  .string()
  .trim()
  .min(7, 'Phone number is too short')
  .max(15, 'Phone number is too long')
  .regex(/^\+?[1-9]\d{6,14}$/, 'Enter a valid phone number');

export const nameSchema = z
  .string()
  .trim()
  .min(1, 'This field is required')
  .max(50, 'Maximum 50 characters');

export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Maximum 30 characters')
  .regex(/^[a-zA-Z0-9_.]+$/, 'Only letters, numbers, dot and underscore allowed');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Include at least one uppercase letter')
  .regex(/[a-z]/, 'Include at least one lowercase letter')
  .regex(/[0-9]/, 'Include at least one number')
  .regex(/[^A-Za-z0-9]/, 'Include at least one special character');

export const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only digits');

// Composite form schemas
export const signInSchema = z.object({
  // accepts either email or phone — kept loose intentionally
  identifier: z.string().trim().min(1, 'Email or phone number is required'),
  password: z.string().min(1, 'Password is required'),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  userName: usernameSchema,
});
export type SignUpValues = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({email: emailSchema});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const verifyOtpSchema = z.object({otp: otpSchema});
export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;

export const setPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(d => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type SetPasswordValues = z.infer<typeof setPasswordSchema>;

export const profileAddressSchema = z.object({
  streetAddress: z.string().trim().min(1, 'Street address is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  zipcode: z
    .string()
    .trim()
    .min(3, 'Zipcode is required')
    .max(12, 'Zipcode is too long'),
  country: z.string().trim().min(1, 'Country is required'),
  addressLink: z.string().trim().optional().or(z.literal('')),
  addressTitle: z.string().trim().optional().or(z.literal('')),
});
export type ProfileAddressValues = z.infer<typeof profileAddressSchema>;

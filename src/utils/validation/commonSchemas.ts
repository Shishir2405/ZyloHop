import {z} from 'zod';
import {emailSchema, phoneSchema, nameSchema} from './authSchemas';

// AddAddress + EditProfile share an address shape
export const deliveryAddressSchema = z.object({
  addressTitle: z
    .string()
    .trim()
    .min(1, 'Address title is required')
    .max(40, 'Max 40 characters'),
  streetAddress: z
    .string()
    .trim()
    .min(3, 'Street address is required')
    .max(120, 'Max 120 characters'),
  city: z.string().trim().min(1, 'City is required').max(60, 'Max 60 characters'),
  state: z.string().trim().min(1, 'State is required').max(60, 'Max 60 characters'),
  zipcode: z
    .string()
    .trim()
    .min(3, 'Zipcode is too short')
    .max(12, 'Zipcode is too long')
    .regex(/^[A-Za-z0-9\s\-]+$/, 'Zipcode has invalid characters'),
  country: z
    .string()
    .trim()
    .min(1, 'Country is required')
    .max(60, 'Max 60 characters'),
  addressLink: z.string().trim().optional().or(z.literal('')),
});
export type DeliveryAddressValues = z.infer<typeof deliveryAddressSchema>;

export const editProfileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  userName: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Max 30 characters'),
  email: emailSchema,
  phoneNumber: phoneSchema,
  streetAddress: z.string().trim().min(3, 'Street address is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  zipcode: z
    .string()
    .trim()
    .min(3, 'Zipcode is too short')
    .max(12, 'Zipcode is too long'),
  country: z.string().trim().min(1, 'Country is required'),
});
export type EditProfileValues = z.infer<typeof editProfileSchema>;

export const cardSchema = z.object({
  cardNumber: z
    .string()
    .trim()
    .min(13, 'Card number is too short')
    .max(19, 'Card number is too long')
    .regex(/^\d[\d\s]*\d$/, 'Card number must be digits only'),
  expiryDate: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, 'Expiry must be MM/YY'),
  cvv: z
    .string()
    .trim()
    .regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
  nameOnCard: z
    .string()
    .trim()
    .min(2, 'Name on card is required')
    .max(50, 'Max 50 characters'),
});
export type CardValues = z.infer<typeof cardSchema>;

export const feedbackSchema = z.object({
  rating: z.number().int().min(1, 'Please give a rating').max(5),
  feedback: z
    .string()
    .trim()
    .max(500, 'Feedback can be at most 500 characters')
    .optional()
    .or(z.literal('')),
});
export type FeedbackValues = z.infer<typeof feedbackSchema>;

export const cancelRideSchema = z
  .object({
    reasonId: z.string().min(1, 'Please select a reason'),
    otherReason: z
      .string()
      .trim()
      .max(200, 'Max 200 characters')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    d =>
      d.reasonId !== 'other' ||
      (d.otherReason && d.otherReason.trim().length > 0),
    {
      message: 'Please describe your reason',
      path: ['otherReason'],
    },
  );
export type CancelRideValues = z.infer<typeof cancelRideSchema>;

export const promoCodeSchema = z.object({
  promoCode: z
    .string()
    .trim()
    .min(2, 'Promo code is too short')
    .max(30, 'Promo code is too long')
    .regex(
      /^[A-Z0-9_-]+$/i,
      'Promo code can only contain letters, numbers, dash and underscore',
    ),
});
export type PromoCodeValues = z.infer<typeof promoCodeSchema>;

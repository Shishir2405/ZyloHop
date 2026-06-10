import {z} from 'zod';
import {emailSchema, phoneSchema, nameSchema, usernameSchema} from './authSchemas';

/**
 * Account-flow specific zod schemas.
 *
 * Note: a broader `editProfileSchema` already lives in `commonSchemas.ts`
 * and is consumed by `AccountEditProfileScreen` — we re-export it here so
 * future callers have a single import surface for account-flow forms.
 *
 * The fully-typed version below mirrors `commonSchemas.editProfileSchema`
 * exactly but pulls the username atom from `authSchemas` so a single
 * username-rule change propagates everywhere.
 */
export const editProfileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  userName: usernameSchema,
  email: emailSchema,
  phoneNumber: phoneSchema,
  streetAddress: z.string().trim().min(1, 'Street address is required'),
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

/**
 * Typed-confirmation gate for permanent account deletion.
 * User must literally type the word DELETE (uppercase) to enable submit.
 */
export const deleteAccountSchema = z.object({
  confirmation: z.literal('DELETE', {message: 'Type DELETE to confirm'}),
});
export type DeleteAccountValues = z.infer<typeof deleteAccountSchema>;

/**
 * Post-ride feedback. Rating is 1..5 (selected stars); comment is optional
 * and capped at 500 characters to match the Textarea counter behaviour.
 */
export const bookingRatingSchema = z.object({
  rating: z
    .number({error: 'Please give a rating'})
    .min(1, 'Please give a rating')
    .max(5),
  comment: z
    .string()
    .trim()
    .max(500, 'Comment can be at most 500 characters')
    .optional()
    .or(z.literal('')),
});
export type BookingRatingValues = z.infer<typeof bookingRatingSchema>;

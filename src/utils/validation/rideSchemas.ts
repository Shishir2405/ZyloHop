import {z} from 'zod';

/**
 * Rider-flow zod schemas. Co-located here (separate from `commonSchemas.ts`)
 * so the rider screens own their validation surface without coupling to
 * unrelated forms.
 *
 * NOTE: `cancelRideSchema` and `promoCodeSchema` are intentionally left in
 * `commonSchemas.ts` (already imported by CancelRideScreen and
 * RideCompleteScreen) to avoid duplicating sources of truth.
 */

export const rideFeedbackSchema = z.object({
  rating: z
    .number()
    .min(1, 'Please rate your ride')
    .max(5),
  comment: z
    .string()
    .trim()
    .max(500, 'Maximum 500 characters')
    .optional()
    .or(z.literal('')),
});
export type RideFeedbackValues = z.infer<typeof rideFeedbackSchema>;

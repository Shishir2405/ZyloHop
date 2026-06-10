/**
 * Maps raw backend/technical error messages to user-friendly messages.
 * This ensures users never see internal system details in toasts.
 */

// Pattern-based mappings: [regex pattern, friendly message]
const MESSAGE_PATTERNS: [RegExp, string][] = [
  // ── Auth & Account ──
  [/user not found/i, "We couldn't find your account. Please try again."],
  [/otp is not valid/i, 'The code you entered is incorrect. Please try again.'],
  [/otp expired/i, 'Your verification code has expired. Please request a new one.'],
  [/invalid otp/i, 'The code you entered is incorrect. Please try again.'],
  [/email couldn.*t be verified/i, "We couldn't verify your email. Please try again."],
  [/couldn.*t save otp/i, 'Something went wrong. Please try again later.'],
  [/email is already in use/i, 'This email is already linked to another account.'],
  [/phone number is already in use/i, 'This phone number is already linked to another account.'],
  [/user with that info already exists/i, 'An account with this information already exists.'],
  [/couldn.*t create user/i, "We couldn't create your account. Please try again."],
  [/please verify either email or phone/i, 'Please verify your email or phone number first.'],
  [/forbidden/i, 'Your session has expired. Please sign in again.'],
  [/session expired/i, 'Your session has expired. Please sign in again.'],
  [/couldn.*t remove old token/i, 'Something went wrong. Please try signing in again.'],

  // ── Ride Booking ──
  [/ride session not found/i, "We couldn't find your ride. Please try booking again."],
  [/no ride categor/i, 'No ride options are available for this route right now. Please try again shortly.'],
  [/ride distance not calculated/i, "We're having trouble calculating your route. Please try again."],
  [/route cannot be calculated/i, "We're having trouble calculating your route. Please try again."],
  [/failed to calculate route/i, "We couldn't calculate your route. Please try again."],
  [/failed to confirm ride/i, "We couldn't confirm your locations. Please try again."],
  [/ride type cannot be selected/i, 'This ride option is no longer available. Please go back and try again.'],
  [/failed to select ride type/i, "We couldn't select this ride. Please try again."],
  [/no vehicles available/i, 'No drivers are nearby right now. Please try again in a few minutes.'],
  [/selected vehicle is not available/i, 'This vehicle is no longer available. Please select another one.'],
  [/driver is not available/i, "Your driver isn't available anymore. We'll find you another one."],
  [/unable to assign driver/i, "We're having trouble finding a driver. Please try again shortly."],
  [/no drivers available/i, 'No drivers are nearby right now. Please try again in a few minutes.'],
  [/driver not assigned/i, "We're still looking for a driver. Please hang tight."],
  [/driver not found/i, "We couldn't locate your driver. Please try again."],
  [/driver location not available/i, "We're having trouble tracking your driver's location."],
  [/vehicle not found/i, "We couldn't find the vehicle details. Please try again."],
  [/ride is not in reassign/i, "We can't reassign a driver right now. Please try again."],
  [/ride is not active/i, 'This ride is no longer active.'],
  [/ride is not completed/i, 'Please wait for your ride to be completed.'],
  [/ride cannot be cancelled/i, "This ride can't be cancelled at this stage."],
  [/ride start time not found/i, 'Something went wrong with your ride. Please contact support.'],
  [/otp verification not allowed/i, "Verification isn't available at this point in your ride."],

  // ── Payments & Promos ──
  [/invalid or expired promo/i, "This promo code isn't valid or has expired."],
  [/invalid promo/i, "This promo code isn't valid. Please check and try again."],
  [/promo can be applied only/i, 'The promo code can only be applied after your ride is complete.'],
  [/invalid fare amount/i, 'Something went wrong with the fare. Please try again.'],
  [/invalid payment amount/i, 'Something went wrong with the payment. Please try again.'],
  [/payment failed/i, "Your payment didn't go through. Please try again."],

  // ── Feedback ──
  [/feedback can be submitted only/i, 'You can leave feedback after completing payment.'],
  [/feedback already submitted/i, "You've already submitted feedback for this ride."],
  [/rating must be between/i, 'Please select a rating between 1 and 5 stars.'],

  // ── Orders & Food ──
  [/no orders found/i, "You don't have any orders yet."],
  [/basket not found/i, 'Your cart seems to be empty. Please add items and try again.'],
  [/no items in basket/i, 'Your cart is empty. Please add items before placing an order.'],
  [/basket item not found/i, "This item isn't in your cart anymore."],
  [/failed to place order/i, "We couldn't place your order. Please try again."],
  [/order not found/i, "We couldn't find this order."],
  [/product not found/i, "This item isn't available anymore."],

  // ── Addresses ──
  [/delivery address not found/i, "We couldn't find this address."],
  [/couldn.*t add delivery address/i, "We couldn't save your address. Please try again."],
  [/couldn.*t delete.*delivery address/i, "We couldn't remove this address. Please try again."],

  // ── Vehicle / Driver Profile ──
  [/only users with the rider role/i, "Your account isn't set up for this. Please contact support."],
  [/cannot have more than/i, 'You can only register one vehicle at this time.'],
  [/same license plate already exists/i, 'A vehicle with this license plate is already registered.'],
  [/document expiry.*past/i, "Your document's expiry date must be in the future."],
  [/document expiry.*required/i, 'Please provide the document expiry date.'],
  [/document number.*required/i, 'Please provide the document number.'],
  [/document not found/i, "We couldn't find this document."],
  [/document is already verified/i, 'This document has already been verified.'],
  [/cannot verify an expired/i, "This document has expired and can't be verified."],
  [/rider has no documents/i, 'Please upload your documents to continue.'],
  [/rider is not approved/i, "Your account isn't approved to go online yet."],

  // ── Network & Server ──
  [/network error/i, "Can't connect to the internet. Please check your connection."],
  [/no internet/i, "Can't connect to the internet. Please check your connection."],
  [/internal server error/i, 'Something went wrong on our end. Please try again later.'],
  [/timeout/i, 'The request took too long. Please try again.'],
  [/failed to fetch/i, 'Something went wrong. Please try again.'],

  // ── Profile ──
  [/couldn.*t update user/i, "We couldn't update your profile. Please try again."],
  [/couldn.*t upload.*profile/i, "We couldn't upload your photo. Please try again."],
  [/couldn.*t delete.*profile/i, "We couldn't update your photo. Please try again."],
  [/failed to update/i, "We couldn't save your changes. Please try again."],
];

// Generic fallback for truly unknown errors
const GENERIC_ERROR = 'Something went wrong. Please try again.';

/**
 * Checks if a message looks like a raw backend/technical error
 * that shouldn't be shown to users as-is.
 */
function looksLikeTechnicalMessage(message: string): boolean {
  const technicalPatterns = [
    /couldn.*t/i,
    /not found/i,
    /failed to/i,
    /invalid.*id/i,
    /cannot be/i,
    /is not a/i,
    /null/i,
    /undefined/i,
    /exception/i,
    /stack trace/i,
    /repository/i,
    /entity/i,
    /constraint/i,
    /violat/i,
    /foreign key/i,
    /status code/i,
    /axios/i,
    /request failed/i,
    /ECONNREFUSED/i,
    /ETIMEDOUT/i,
    /ERR_/i,
  ];
  return technicalPatterns.some(p => p.test(message));
}

/**
 * Converts a backend error message to a user-friendly message.
 * Safe to call with any string — already-friendly messages pass through.
 */
export function getUserFriendlyMessage(rawMessage?: string | null): string {
  if (!rawMessage || typeof rawMessage !== 'string') {
    return GENERIC_ERROR;
  }

  const trimmed = rawMessage.trim();
  if (!trimmed) {
    return GENERIC_ERROR;
  }

  // Check against known patterns
  for (const [pattern, friendly] of MESSAGE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return friendly;
    }
  }

  // If it doesn't match a known pattern but looks technical, use generic
  if (looksLikeTechnicalMessage(trimmed)) {
    return GENERIC_ERROR;
  }

  // Message seems already user-friendly (e.g. "Please select both pickup and drop-off locations")
  return trimmed;
}

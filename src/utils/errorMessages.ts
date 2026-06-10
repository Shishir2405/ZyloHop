/**
 * Maps raw backend/network error messages to user-friendly text.
 * Keeps the app from showing technical jargon to users.
 */

const ERROR_MAP: Record<string, string> = {
  // Network errors
  'No internet connection': 'Please check your internet connection and try again',
  'Network Error': 'Unable to connect. Please check your connection',
  'timeout of': 'Request timed out. Please try again',

  // Auth errors
  Forbidden: 'Your session has expired. Please log in again',
  Unauthorized: 'Please log in to continue',

  // Ride errors
  'Ride session not found': 'This ride session has expired. Please start a new ride',
  'Invalid ride session': 'Something went wrong. Please start a new ride',
  'Distance not calculated': 'Unable to calculate route. Please try different locations',
  'No vehicles available': 'No vehicles are available nearby. Please try again shortly',
  'Driver not available': 'No drivers available right now. Please try again in a moment',
  'Ride already cancelled': 'This ride has already been cancelled',
  'Invalid status': 'This action is no longer available for this ride',

  // Payment errors
  'Invalid promo code': 'This promo code is invalid or has expired',
  'Payment failed': 'Payment could not be processed. Please try again',

  // Server errors
  'Internal Server Error': 'Something went wrong on our end. Please try again',
};

export const getFriendlyErrorMessage = (
  rawError: any,
  fallback = 'Something went wrong. Please try again',
): string => {
  if (!rawError) return fallback;

  // Handle different error shapes
  let errorText = '';
  if (typeof rawError === 'string') {
    errorText = rawError;
  } else if (rawError?.message) {
    errorText = rawError.message;
  } else if (typeof rawError === 'object') {
    errorText = JSON.stringify(rawError);
  }

  // Check exact match first
  if (ERROR_MAP[errorText]) {
    return ERROR_MAP[errorText];
  }

  // Check partial match
  for (const [key, friendly] of Object.entries(ERROR_MAP)) {
    if (errorText.toLowerCase().includes(key.toLowerCase())) {
      return friendly;
    }
  }

  // If it looks like a technical error (contains stack trace, status codes, etc.), use fallback
  if (
    errorText.includes('Exception') ||
    errorText.includes('stackTrace') ||
    errorText.includes('at ') ||
    errorText.length > 150
  ) {
    return fallback;
  }

  // If it's a short, readable message from the backend, show it as-is
  if (errorText.length > 0 && errorText.length < 100) {
    return errorText;
  }

  return fallback;
};

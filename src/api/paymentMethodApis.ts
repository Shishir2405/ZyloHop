/**
 * Saved-payment-method API stubs.
 *
 * The backend currently lacks the corresponding endpoints (create setup
 * intent, list saved payment methods, detach, set-default). Rather than
 * call non-existent routes, each function below resolves to a structured
 * `failure` RequestResponse whose error message is prefixed with
 * `NOT_IMPLEMENTED:`. Callers (e.g. the account card screens) detect that
 * marker and surface a friendly placeholder instead of an error toast.
 *
 * When the backend ships these endpoints, swap each body for a real
 * `apiIndex.request(...)` call — the public signatures stay the same.
 */
import { RequestResponse } from './apiIndex';

export type SavedCard = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

export type SetupIntentBundle = {
  /** Stripe SetupIntent client_secret used by initPaymentSheet(setupIntentClientSecret) */
  clientSecret: string;
  /** Stripe Customer id the SetupIntent is attached to */
  customerId: string;
  /** Ephemeral key secret to authorize the mobile client against this customer */
  ephemeralKey: string;
};

/**
 * Sentinel substring callers check for to detect a stubbed endpoint and
 * render a friendly "coming soon" placeholder rather than an error toast.
 */
export const NOT_IMPLEMENTED_MARKER = 'NOT_IMPLEMENTED';

const notImplemented = <T>(name: string): RequestResponse<T> => ({
  remote: 'failure',
  errors: {
    errors: `${NOT_IMPLEMENTED_MARKER}: backend endpoint missing — ${name}`,
  },
  message: `${NOT_IMPLEMENTED_MARKER}: backend endpoint missing — ${name}`,
});

/**
 * Detect whether a failed RequestResponse came from one of these stubs.
 * Used by the card screens to switch from "error" to "coming soon" UI.
 */
export const isNotImplementedError = (response: RequestResponse<any>): boolean => {
  if (response.remote !== 'failure') return false;
  const msg =
    response.message ||
    (typeof response.errors?.errors === 'string'
      ? (response.errors.errors as string)
      : '');
  return typeof msg === 'string' && msg.includes(NOT_IMPLEMENTED_MARKER);
};

export const listSavedCardsApi = async (): Promise<RequestResponse<SavedCard[]>> => {
  return notImplemented<SavedCard[]>('listSavedCardsApi');
};

export const createSetupIntentApi = async (): Promise<
  RequestResponse<SetupIntentBundle>
> => {
  return notImplemented<SetupIntentBundle>('createSetupIntentApi');
};

export const detachPaymentMethodApi = async (
  _paymentMethodId: string,
): Promise<RequestResponse<void>> => {
  return notImplemented<void>('detachPaymentMethodApi');
};

export const setDefaultPaymentMethodApi = async (
  _paymentMethodId: string,
): Promise<RequestResponse<void>> => {
  return notImplemented<void>('setDefaultPaymentMethodApi');
};

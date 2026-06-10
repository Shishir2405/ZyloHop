import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
  InternalAxiosRequestConfig,
} from 'axios';

import { SERVER_URL } from '../config';
import { getAuthToken, hydrateAuthToken, clearAuthToken } from '../services/tokenStorage';
import {
  logApiRequest,
  logApiResponse,
  logApiError,
  type ApiLogContext,
} from '../utils/debug';

// 45s covers Render free-tier cold starts (which can spin up the container
// for 30-40s on the first request after idle). 20s was too aggressive and
// surfaced as "Can't connect to the internet" toasts on otherwise-healthy
// backends.
const REQUEST_TIMEOUT_MS = 45000;

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export const registerUnauthorizedHandler = (handler: UnauthorizedHandler) => {
  onUnauthorized = handler;
};

/**
 * Separate hook for "session has expired" UX (a polite modal). We keep
 * this distinct from `onUnauthorized` so the surfaces are decoupled:
 *   - onUnauthorized: navigate / clear caches (existing behaviour)
 *   - onSessionExpired: dispatch redux flag so the SessionExpiryHandler
 *     component can render its modal.
 * Both fire on a 401. App.tsx wires both at startup.
 */
type SessionExpiredHandler = () => void;
let onSessionExpired: SessionExpiredHandler | null = null;

export const registerSessionExpiredHandler = (handler: SessionExpiredHandler) => {
  onSessionExpired = handler;
};

const instance: AxiosInstance = axios.create({
  baseURL: SERVER_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
  transformResponse: [
    (res: any) => {
      if (typeof res !== 'string') return res;
      try {
        return JSON.parse(res);
      } catch {
        return res;
      }
    },
  ],
});

instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  let token = getAuthToken();
  if (!token) token = await hydrateAuthToken();

  config.headers = config.headers ?? ({} as any);
  if (token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  (config.headers as any)['Client-Time'] = Date.now();
  (config.headers as any)['Client-Time-Zone'] =
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Attach a debug context so we can pair the response/error with this
  // exact request in the log stream. Stash it on the config; axios passes
  // the same object through to the response interceptor.
  (config as any).__debugCtx = logApiRequest(
    config.method,
    `${config.baseURL ?? ''}${config.url ?? ''}`,
    config.data,
    !!token,
  );

  return config;
});

instance.interceptors.response.use(
  res => {
    const ctx = (res.config as any).__debugCtx as ApiLogContext | undefined;
    if (ctx) {
      logApiResponse(
        ctx,
        res.status,
        `${res.config.baseURL ?? ''}${res.config.url ?? ''}`,
        res.data,
      );
    }
    return res;
  },
  async error => {
    const cfg = error?.config ?? {};
    const ctx = (cfg as any).__debugCtx as ApiLogContext | undefined;
    if (ctx) {
      logApiError(
        ctx,
        `${cfg.baseURL ?? ''}${cfg.url ?? ''}`,
        error,
      );
    }
    const status = error?.response?.status;
    if (status === 401) {
      await clearAuthToken();
      // Surface the polite "session expired" modal first; the navigation
      // reset still happens via onUnauthorized so the back-stack is sane
      // by the time the user taps "Sign In" inside the modal.
      onSessionExpired?.();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

const { CancelToken } = axios;

export const createCancelToken = (): {
  token: CancelTokenSource['token'];
  cancel: CancelTokenSource['cancel'];
} => {
  const source = CancelToken.source();
  return { token: source.token, cancel: source.cancel };
};

interface ParsedSuccess<T> {
  remote: 'success';
  data: T;
}
interface ParsedFailure {
  remote: 'failure';
  error: { errors: any };
}
type ParsedResponse<T> = ParsedSuccess<T> | ParsedFailure;

const parseResponse = <T = any>(response: string): ParsedResponse<T> => {
  try {
    const data = JSON.parse(response) || response;
    if (data?.errors) {
      return { remote: 'failure', error: { errors: data.errors } };
    }
    if (data?.success === false) {
      return {
        remote: 'failure',
        error: { errors: data.message || 'Request failed' },
      };
    }
    return { remote: 'success', data };
  } catch {
    return { remote: 'failure', error: { errors: response } };
  }
};

export interface RequestSuccess<T = any> {
  remote: 'success';
  data: T;
}

/**
 * Map of field name -> first error message. Field names are camelCase
 * (converted from the .NET PascalCase). For nested paths each segment is
 * lowercased (e.g. `Address.City` -> `address.city`).
 */
export type ApiFieldErrors = Record<string, string>;

/**
 * RequestError keeps its existing `errors` shape for backward compatibility
 * with all current callers. We *add* two optional slots:
 *   - `fieldErrors`: parsed ValidationProblemDetails.errors as camelCase map
 *   - `message`:     top-level message string when present (ResponseHandler.Fail)
 *
 * Choice: augment the existing interface (additive only). Widening avoids
 * touching every existing call site that destructures `errors`.
 */
export interface RequestError {
  remote: 'failure';
  errors: { status?: number; errors: any };
  fieldErrors?: ApiFieldErrors;
  message?: string;
}
export type RequestResponse<T = any> = RequestSuccess<T> | RequestError;

/**
 * Lowercase the first character of `s`. Used for PascalCase -> camelCase.
 */
const lowercaseFirst = (s: string): string =>
  s.length === 0 ? s : s.charAt(0).toLowerCase() + s.slice(1);

/**
 * Convert a single PascalCase field path to camelCase. Nested segments
 * (separated by `.`) each get their first character lowercased.
 *   `Email`         -> `email`
 *   `PhoneNumber`   -> `phoneNumber`
 *   `Address.City`  -> `address.city`
 */
const pascalPathToCamel = (key: string): string =>
  key.split('.').map(lowercaseFirst).join('.');

/**
 * If `responseData` looks like an ASP.NET ValidationProblemDetails
 * (i.e. `errors` is an object whose values are arrays of strings),
 * convert it to an ApiFieldErrors map. Returns undefined otherwise.
 */
export const parseValidationErrors = (
  responseData: any,
): ApiFieldErrors | undefined => {
  const errs = responseData?.errors;
  if (!errs || typeof errs !== 'object' || Array.isArray(errs)) {
    return undefined;
  }

  const out: ApiFieldErrors = {};
  let matched = false;
  for (const rawKey of Object.keys(errs)) {
    const val = (errs as Record<string, unknown>)[rawKey];
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') {
      out[pascalPathToCamel(rawKey)] = val[0] as string;
      matched = true;
    }
  }
  return matched ? out : undefined;
};

export const request = async <T = any>(
  config: AxiosRequestConfig,
): Promise<RequestResponse<T>> => {
  try {
    const response: AxiosResponse = await instance.request(config);
    const resData = response.data;

    if (resData?.success === false) {
      const msg = resData.message || 'Request failed';
      return {
        remote: 'failure',
        errors: { errors: msg },
        message: msg,
      };
    }

    return { remote: 'success', data: resData };
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

export const requestByToken = request;

function handleAxiosError(error: any): RequestError {
  if (error?.code === 'ECONNABORTED') {
    return {
      remote: 'failure',
      errors: { status: 408, errors: 'Request timed out' },
    };
  }

  if (error?.response) {
    const status = error.response.status;
    const responseData = error.response.data;
    let errorMessage: any;

    if (status === 500) {
      errorMessage = responseData?.error || 'Internal Server Error';
    } else if (status === 401) {
      errorMessage = 'Session expired. Please sign in again.';
    } else {
      errorMessage =
        responseData?.message ||
        responseData?.errors ||
        responseData?.error?.errors ||
        (typeof responseData === 'string' ? responseData : 'Request failed');
    }

    // For 400 responses, try to parse ValidationProblemDetails into a
    // per-field map. We additionally surface a top-level `message` slot
    // (preferring the .NET ResponseHandler.Fail envelope's `message`) so
    // callers can show a fallback toast.
    const fieldErrors =
      status === 400 ? parseValidationErrors(responseData) : undefined;
    const topMessage =
      typeof responseData?.message === 'string'
        ? responseData.message
        : typeof responseData?.title === 'string'
          ? responseData.title
          : typeof errorMessage === 'string'
            ? errorMessage
            : undefined;

    return {
      remote: 'failure',
      errors: { status, errors: errorMessage },
      ...(fieldErrors ? { fieldErrors } : {}),
      ...(topMessage ? { message: topMessage } : {}),
    };
  }

  const errorMessage =
    error?.message === 'Network Error'
      ? 'No internet connection'
      : error?.message ?? 'Network error';

  return { remote: 'failure', errors: { errors: errorMessage } };
}

const toExport = {
  request,
  requestByToken,
  parseResponse,
};

export default toExport;

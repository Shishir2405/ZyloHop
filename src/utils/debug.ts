/**
 * Debug instrumentation for development builds.
 *
 * - `[API]` traces every axios request + response (method, URL, status,
 *   timing, and a compact preview of the response body).
 * - `[NAV]` logs every navigation transition: previous route → next route,
 *   plus the params that triggered the change.
 *
 * Everything in here is a no-op when `__DEV__` is false, so production
 * builds aren't slowed down by JSON.stringify-ing every payload.
 */

type AnyObj = Record<string, unknown>;

const COLORS = {
  api: '\x1b[36m', // cyan
  apiOk: '\x1b[32m', // green
  apiErr: '\x1b[31m', // red
  nav: '\x1b[35m', // magenta
  dim: '\x1b[2m',
  reset: '\x1b[0m',
};

let reqCounter = 0;
const nextReqId = () => `#${(++reqCounter).toString(36).padStart(3, '0')}`;

const truncate = (s: string, n = 600) =>
  s.length > n ? `${s.slice(0, n)}…<${s.length - n} more chars>` : s;

const safePreview = (value: unknown): string => {
  if (value == null) return String(value);
  if (typeof value === 'string') return truncate(value);
  try {
    return truncate(JSON.stringify(value));
  } catch {
    return '[unserializable]';
  }
};

// ─── API ──────────────────────────────────────────────────────────────────

export interface ApiLogContext {
  reqId: string;
  startedAt: number;
}

export const logApiRequest = (
  method: string | undefined,
  url: string | undefined,
  payload: unknown,
  hasAuth: boolean,
): ApiLogContext => {
  const reqId = nextReqId();
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(
      `${COLORS.api}[API ${reqId}] → ${(method ?? 'GET').toUpperCase()} ${url ?? ''}${COLORS.reset}` +
        `${hasAuth ? ` ${COLORS.dim}(auth)${COLORS.reset}` : ''}` +
        (payload !== undefined
          ? `\n${COLORS.dim}  body:${COLORS.reset} ${safePreview(payload)}`
          : ''),
    );
  }
  return { reqId, startedAt: Date.now() };
};

export const logApiResponse = (
  ctx: ApiLogContext,
  status: number,
  url: string | undefined,
  body: unknown,
): void => {
  if (!__DEV__) return;
  const ms = Date.now() - ctx.startedAt;
  const ok = status >= 200 && status < 300;
  const color = ok ? COLORS.apiOk : COLORS.apiErr;
  // eslint-disable-next-line no-console
  console.log(
    `${color}[API ${ctx.reqId}] ← ${status} ${url ?? ''}${COLORS.reset} ${COLORS.dim}(${ms}ms)${COLORS.reset}` +
      `\n${COLORS.dim}  body:${COLORS.reset} ${safePreview(body)}`,
  );
};

export const logApiError = (
  ctx: ApiLogContext,
  url: string | undefined,
  error: unknown,
): void => {
  if (!__DEV__) return;
  const ms = Date.now() - ctx.startedAt;
  const err = error as AnyObj | undefined;
  const status = (err?.response as AnyObj | undefined)?.status as
    | number
    | undefined;
  const message = (err?.message as string | undefined) ?? 'unknown error';
  // eslint-disable-next-line no-console
  console.log(
    `${COLORS.apiErr}[API ${ctx.reqId}] ✕ ${status ?? 'no-response'} ${url ?? ''}${COLORS.reset} ${COLORS.dim}(${ms}ms)${COLORS.reset}` +
      `\n${COLORS.dim}  reason:${COLORS.reset} ${message}` +
      (err?.response
        ? `\n${COLORS.dim}  body:${COLORS.reset} ${safePreview(
            (err.response as AnyObj).data,
          )}`
        : ''),
  );
};

// ─── Navigation ───────────────────────────────────────────────────────────

interface RouteRef {
  name: string;
  params?: AnyObj;
}

let lastRoute: RouteRef | null = null;

const flattenActiveRoute = (state: AnyObj | undefined): RouteRef | null => {
  if (!state) return null;
  const idx = (state.index as number) ?? 0;
  const routes = state.routes as RouteRef[] | undefined;
  if (!routes || !routes[idx]) return null;
  const current = routes[idx] as unknown as AnyObj;
  if (current.state) return flattenActiveRoute(current.state as AnyObj);
  return { name: current.name as string, params: current.params as AnyObj };
};

export const logNavigationState = (state: unknown): void => {
  if (!__DEV__) return;
  const next = flattenActiveRoute(state as AnyObj | undefined);
  if (!next) return;
  if (lastRoute?.name === next.name) {
    // Same screen, just a param change — still useful to surface.
    const beforeParams = safePreview(lastRoute?.params);
    const afterParams = safePreview(next.params);
    if (beforeParams !== afterParams) {
      // eslint-disable-next-line no-console
      console.log(
        `${COLORS.nav}[NAV] ↻ ${next.name}${COLORS.reset} params: ${afterParams}`,
      );
    }
  } else {
    // eslint-disable-next-line no-console
    console.log(
      `${COLORS.nav}[NAV] ${lastRoute ? `${lastRoute.name} → ` : ''}${next.name}${COLORS.reset}` +
        (next.params
          ? ` ${COLORS.dim}params:${COLORS.reset} ${safePreview(next.params)}`
          : ''),
    );
  }
  lastRoute = next;
};

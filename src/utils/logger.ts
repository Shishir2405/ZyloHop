type LoggerFn = (...args: unknown[]) => void;

const noop: LoggerFn = () => {};

export const logger = {
  log: __DEV__ ? console.log.bind(console) : noop,
  info: __DEV__ ? console.info.bind(console) : noop,
  warn: __DEV__ ? console.warn.bind(console) : noop,
  error: __DEV__ ? console.error.bind(console) : noop,
  debug: __DEV__ ? console.debug.bind(console) : noop,
};

export const installProductionConsoleGuard = (): void => {
  if (__DEV__) return;
  const methods: (keyof Console)[] = ['log', 'info', 'warn', 'error', 'debug', 'trace'];
  for (const m of methods) {
    (console as any)[m] = noop;
  }
};

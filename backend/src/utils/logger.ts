import { env } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const configuredLevel = (process.env.LOG_LEVEL as LogLevel | undefined) ?? (env.nodeEnv === 'production' ? 'info' : 'debug');
const minLevel = LEVEL_WEIGHT[configuredLevel] ?? LEVEL_WEIGHT.debug;

const colors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
};

function shouldLog(level: LogLevel): boolean {
  return LEVEL_WEIGHT[level] >= minLevel;
}

function printLines(level: LogLevel, label: string, lines: string[]): void {
  if (!shouldLog(level)) {
    return;
  }

  const color =
    level === 'error' ? colors.red : level === 'warn' ? colors.yellow : level === 'info' ? colors.green : colors.cyan;

  const timestamp = new Date().toISOString();
  const header = `${colors.dim}${timestamp}${colors.reset} ${color}${colors.bold}[${label}]${colors.reset} ${lines[0]}`;
  const body = lines.slice(1).map((line) => `  ${colors.dim}${line}${colors.reset}`).join('\n');
  const output = body ? `${header}\n${body}` : header;

  if (level === 'error') {
    console.error(output);
    return;
  }

  if (level === 'warn') {
    console.warn(output);
    return;
  }

  console.log(output);
}

function write(level: LogLevel, label: string, message: string, meta?: Record<string, unknown>): void {
  if (!meta || !Object.keys(meta).length) {
    printLines(level, label, [message]);
    return;
  }

  const lines = [
    message,
    ...Object.entries(meta).map(([key, value]) => {
      if (value === undefined) {
        return '';
      }

      if (typeof value === 'object') {
        return `${key}: ${JSON.stringify(value)}`;
      }

      return `${key}: ${value}`;
    }),
  ].filter(Boolean);

  printLines(level, label, lines);
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => write('debug', 'DEBUG', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => write('info', 'INFO', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write('warn', 'WARN', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write('error', 'ERROR', message, meta),
  http: (message: string, meta?: Record<string, unknown>) => write('info', 'HTTP', message, meta),
};

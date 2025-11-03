/**
 * Simple logging utility for the application
 *
 * TODO: For production deployments, consider replacing with a more robust
 * logging solution like Winston, Pino, or a cloud logging service.
 *
 * Features to consider:
 * - Structured logging (JSON format)
 * - Log levels with filtering
 * - Log rotation and retention
 * - Integration with monitoring services (Sentry, DataDog, etc.)
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

const LOG_LEVEL = (process.env.LOG_LEVEL || "info") as LogLevel;

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[LOG_LEVEL];
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (context && Object.keys(context).length > 0) {
    return `${prefix} ${message} ${JSON.stringify(context)}`;
  }

  return `${prefix} ${message}`;
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (shouldLog("debug")) {
      console.log(formatMessage("debug", message, context));
    }
  },

  info(message: string, context?: LogContext) {
    if (shouldLog("info")) {
      console.log(formatMessage("info", message, context));
    }
  },

  warn(message: string, context?: LogContext) {
    if (shouldLog("warn")) {
      console.warn(formatMessage("warn", message, context));
    }
  },

  error(message: string, error?: Error | unknown, context?: LogContext) {
    if (shouldLog("error")) {
      const errorContext = {
        ...context,
        error: error instanceof Error ? {
          message: error.message,
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
          name: error.name,
        } : error,
      };
      console.error(formatMessage("error", message, errorContext));
    }
  },
};

// Convenience method for API route errors
export function logApiError(
  method: string,
  path: string,
  error: Error | unknown,
  userId?: string
) {
  logger.error(`API Error: ${method} ${path}`, error, {
    method,
    path,
    userId,
  });
}

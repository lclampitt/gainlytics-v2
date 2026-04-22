/**
 * Universal toast utility.
 * Pass-through wrapper around Sonner so existing imports remain stable
 * and we have a single choke-point if we ever change the toast engine.
 * Per CLAUDE.md, callers MUST import this wrapper — never Sonner directly.
 */
import { toast as sonnerToast } from 'sonner';

function show(type, message, opts = {}) {
  const fn = sonnerToast[type] || sonnerToast;
  fn(message, opts);
}

export const appToast = Object.assign(
  (message, opts) => show('info', message, opts),
  {
    success: (msg, opts) => show('success', msg, opts),
    error:   (msg, opts) => show('error',   msg, opts),
    info:    (msg, opts) => show('info',     msg, opts),
    warning: (msg, opts) => show('warning',  msg, opts),
  }
);

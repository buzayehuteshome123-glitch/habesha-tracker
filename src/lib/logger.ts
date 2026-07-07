// Centralized Security and Audit Logging Utility for Habesha Tracker
export type LogCategory = 'auth' | 'database' | 'validation' | 'security' | 'system';
export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: string;
  category: LogCategory;
  level: LogLevel;
  event: string;
  details?: Record<string, any>;
}

const MAX_LOGS = 100; // Rolling buffer size to prevent storage bloat
const STORAGE_KEY = 'habesha_tracker_security_audit_logs';

class SecurityLogger {
  private getLogs(): LogEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveLogs(logs: LogEntry[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(-MAX_LOGS)));
    } catch (e) {
      console.warn('Failed to persist audit log to localStorage:', e);
    }
  }

  public log(category: LogCategory, level: LogLevel, event: string, details?: Record<string, any>) {
    // Redact any potentially sensitive information
    const sanitizedDetails = details ? { ...details } : undefined;
    if (sanitizedDetails) {
      const sensitiveKeys = ['password', 'newPassword', 'oldPassword', 'token', 'accessToken', 'key', 'secret'];
      for (const key of Object.keys(sanitizedDetails)) {
        if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
          sanitizedDetails[key] = '[REDACTED]';
        }
      }
    }

    const newEntry: LogEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      category,
      level,
      event,
      details: sanitizedDetails
    };

    // Print to console securely
    const consoleMsg = `[HT-${category.toUpperCase()}] [${level.toUpperCase()}] ${event}`;
    if (level === 'error') {
      console.error(consoleMsg, sanitizedDetails || '');
    } else if (level === 'warn') {
      console.warn(consoleMsg, sanitizedDetails || '');
    } else {
      console.log(consoleMsg, sanitizedDetails || '');
    }

    // Save in rolling buffer
    const logs = this.getLogs();
    logs.push(newEntry);
    this.saveLogs(logs);
  }

  public info(category: LogCategory, event: string, details?: Record<string, any>) {
    this.log(category, 'info', event, details);
  }

  public warn(category: LogCategory, event: string, details?: Record<string, any>) {
    this.log(category, 'warn', event, details);
  }

  public error(category: LogCategory, event: string, details?: Record<string, any>) {
    this.log(category, 'error', event, details);
  }

  public exportLogs(): LogEntry[] {
    return this.getLogs();
  }

  public clearLogs() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
}

export const logger = new SecurityLogger();

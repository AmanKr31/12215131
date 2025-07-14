// Logger utility for URL Shortener application
export class Logger {
  constructor() {
    this.logs = []
    this.maxLogs = 1000 // Keep only last 1000 logs
  }

  // Log levels
  static LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  }

  // Current log level (can be configured)
  currentLevel = Logger.LEVELS.DEBUG

  // Create log entry
  createLogEntry(level, message, data = null) {
    const timestamp = new Date()
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      id: Math.random().toString(36).substr(2, 9),
    }

    // Add to logs array
    this.logs.push(logEntry)

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Save to localStorage for persistence
    this.saveLogsToStorage()

    return logEntry
  }

  // Debug level logging
  debug(message, data = null) {
    if (this.currentLevel <= Logger.LEVELS.DEBUG) {
      const logEntry = this.createLogEntry("DEBUG", message, data)
      console.debug(`[DEBUG] ${logEntry.timestamp.toISOString()} - ${message}`, data)
      return logEntry
    }
  }

  // Info level logging
  info(message, data = null) {
    if (this.currentLevel <= Logger.LEVELS.INFO) {
      const logEntry = this.createLogEntry("INFO", message, data)
      console.info(`[INFO] ${logEntry.timestamp.toISOString()} - ${message}`, data)
      return logEntry
    }
  }

  // Warning level logging
  warn(message, data = null) {
    if (this.currentLevel <= Logger.LEVELS.WARN) {
      const logEntry = this.createLogEntry("WARN", message, data)
      console.warn(`[WARN] ${logEntry.timestamp.toISOString()} - ${message}`, data)
      return logEntry
    }
  }

  // Error level logging
  error(message, data = null) {
    if (this.currentLevel <= Logger.LEVELS.ERROR) {
      const logEntry = this.createLogEntry("ERROR", message, data)
      console.error(`[ERROR] ${logEntry.timestamp.toISOString()} - ${message}`, data)
      return logEntry
    }
  }

  // Get all logs
  getLogs() {
    return this.logs
  }

  // Get logs by level
  getLogsByLevel(level) {
    return this.logs.filter((log) => log.level === level)
  }

  // Get logs within time range
  getLogsByTimeRange(startTime, endTime) {
    return this.logs.filter((log) => log.timestamp >= startTime && log.timestamp <= endTime)
  }

  // Clear all logs
  clearLogs() {
    this.logs = []
    localStorage.removeItem("urlShortenerLogs")
    this.info("Logs cleared")
  }

  // Save logs to localStorage
  saveLogsToStorage() {
    try {
      localStorage.setItem("urlShortenerLogs", JSON.stringify(this.logs))
    } catch (error) {
      console.error("Failed to save logs to localStorage:", error)
    }
  }

  // Load logs from localStorage
  loadLogsFromStorage() {
    try {
      const savedLogs = localStorage.getItem("urlShortenerLogs")
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs).map((log) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }))
      }
    } catch (error) {
      console.error("Failed to load logs from localStorage:", error)
      this.logs = []
    }
  }

  // Export logs as JSON
  exportLogs() {
    return JSON.stringify(this.logs, null, 2)
  }

  // Set log level
  setLogLevel(level) {
    this.currentLevel = level
    this.info("Log level changed", { newLevel: level })
  }
}

// Create singleton instance
export const logger = new Logger()

// Load existing logs on initialization
logger.loadLogsFromStorage()

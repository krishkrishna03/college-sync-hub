const fs = require('fs');
const path = require('path');

// Detect if running on Vercel (serverless)
const isVercel = !!process.env.VERCEL;

// Logs directory (only used locally)
const logsDir = isVercel ? null : path.join(__dirname, '../logs');
if (!isVercel) {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'INFO';
  }

  // Format message as JSON line
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    return JSON.stringify({ timestamp, level, message, ...meta }) + '\n';
  }

  // Write logs to local files (skipped on Vercel)
  writeToFile(filename, content) {
    if (!logsDir) return; // Skip file writing on Vercel
    try {
      fs.appendFileSync(path.join(logsDir, filename), content);
    } catch (err) {
      console.error('Failed to write log file:', err.message);
    }
  }

  // Core logging function
  log(level, message, meta = {}) {
    if (LOG_LEVELS[level] <= LOG_LEVELS[this.logLevel]) {
      const formattedMessage = this.formatMessage(level, message, meta);

      // Console output (always shown, works on Vercel)
      const colors = {
        ERROR: '\x1b[31m', // Red
        WARN: '\x1b[33m',  // Yellow
        INFO: '\x1b[36m',  // Cyan
        DEBUG: '\x1b[37m'  // White
      };
      console.log(`${colors[level]}[${level}] ${new Date().toISOString()} - ${message}\x1b[0m`, meta);

      // Only write to file locally
      if (!isVercel) {
        this.writeToFile(`${level.toLowerCase()}.log`, formattedMessage);
        this.writeToFile('combined.log', formattedMessage);
      }
    }
  }

  // Level-specific shortcuts
  error(message, meta = {}) { this.log('ERROR', message, meta); }
  warn(message, meta = {}) { this.log('WARN', message, meta); }
  info(message, meta = {}) { this.log('INFO', message, meta); }
  debug(message, meta = {}) { this.log('DEBUG', message, meta); }

  // Express request logger middleware
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();
      const { method, url, ip, headers } = req;

      this.info('Incoming Request', {
        method,
        url,
        ip,
        userAgent: headers['user-agent'],
        contentType: headers['content-type'],
        authorization: headers.authorization ? 'Bearer ***' : 'None',
        body: ['POST', 'PUT'].includes(method) ? this.sanitizeBody(req.body) : undefined
      });

      const originalJson = res.json;
      res.json = (data) => {
        const duration = Date.now() - start;
        this.info('Outgoing Response', {
          method,
          url,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          responseSize: JSON.stringify(data).length
        });
        return originalJson.call(res, data);
      };

      next();
    };
  }

  // Remove sensitive data
  sanitizeBody(body) {
    if (!body) return body;
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    sensitiveFields.forEach(field => { if (sanitized[field]) sanitized[field] = '***'; });
    return sanitized;
  }

  // DB operation logging
  dbLog(operation, collection, query = {}, result = {}) {
    this.info('Database Operation', {
      operation,
      collection,
      query: this.sanitizeBody(query),
      resultCount: result.length || (result._id ? 1 : 0),
      executionTime: result.executionTime || 'N/A'
    });
  }

  // Auth event logging
  authLog(event, user = {}, meta = {}) {
    this.info('Authentication Event', {
      event,
      userId: user._id || user.id,
      userEmail: user.email,
      userRole: user.role,
      ...meta
    });
  }

  // Error log with stack trace
  errorLog(error, context = {}) {
    this.error('Application Error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context
    });
  }
}

const logger = new Logger();
module.exports = logger;

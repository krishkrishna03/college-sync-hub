const fs = require('fs');
const path = require('path');

// Determine logs directory
const logsDir = process.env.VERCEL ? '/tmp/logs' : path.join(__dirname, '../logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'INFO';
  }

  // Format log messages
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    return JSON.stringify({ timestamp, level, message, ...meta }) + '\n';
  }

  // Async write to file
  async writeToFile(filename, content) {
    const filePath = path.join(logsDir, filename);
    try {
      await fs.promises.appendFile(filePath, content);
    } catch (err) {
      console.error('Failed to write log:', err);
    }
  }

  // Core log method
  async log(level, message, meta = {}) {
    if (LOG_LEVELS[level] <= LOG_LEVELS[this.logLevel]) {
      const formattedMessage = this.formatMessage(level, message, meta);

      // Console output with colors
      const colors = { ERROR: '\x1b[31m', WARN: '\x1b[33m', INFO: '\x1b[36m', DEBUG: '\x1b[37m' };
      console.log(`${colors[level]}[${level}] ${new Date().toISOString()} - ${message}\x1b[0m`, meta);

      // Async file output
      await this.writeToFile(`${level.toLowerCase()}.log`, formattedMessage);
      await this.writeToFile('combined.log', formattedMessage);
    }
  }

  error(message, meta = {}) { return this.log('ERROR', message, meta); }
  warn(message, meta = {}) { return this.log('WARN', message, meta); }
  info(message, meta = {}) { return this.log('INFO', message, meta); }
  debug(message, meta = {}) { return this.log('DEBUG', message, meta); }

  // Request logging middleware
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
        body: (method === 'POST' || method === 'PUT') ? this.sanitizeBody(req.body) : undefined
      });

      // Override res.json and res.send
      const originalJson = res.json.bind(res);
      const originalSend = res.send.bind(res);

      const logResponse = (data) => {
        const duration = Date.now() - start;
        this.info('Outgoing Response', {
          method,
          url,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          responseSize: data ? Buffer.byteLength(JSON.stringify(data)) : 0
        });
      };

      res.json = (data) => { logResponse(data); return originalJson(data); };
      res.send = (data) => { logResponse(data); return originalSend(data); };

      next();
    };
  }

  // Sanitize sensitive data
  sanitizeBody(body) {
    if (!body) return body;
    const sanitized = { ...body };
    ['password', 'token', 'secret', 'key'].forEach(field => {
      if (sanitized[field]) sanitized[field] = '***';
    });
    return sanitized;
  }

  // Database operation logging
  dbLog(operation, collection, query = {}, result = {}) {
    this.info('Database Operation', {
      operation,
      collection,
      query: this.sanitizeBody(query),
      resultCount: Array.isArray(result) ? result.length : result?._id ? 1 : 0,
      executionTime: result.executionTime || 'N/A'
    });
  }

  // Authentication logging
  authLog(event, user = {}, meta = {}) {
    this.info('Authentication Event', {
      event,
      userId: user._id || user.id,
      userEmail: user.email,
      userRole: user.role,
      ...meta
    });
  }

  // Error logging with stack trace
  errorLog(error, context = {}) {
    this.error('Application Error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context
    });
  }
}

// Export singleton
const logger = new Logger();
module.exports = logger;

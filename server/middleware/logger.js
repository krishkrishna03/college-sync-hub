const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = process.env.VERCEL ? '/tmp/logs' : path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
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

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };
    return JSON.stringify(logEntry) + '\n';
  }

  writeToFile(filename, content) {
    const filePath = path.join(logsDir, filename);
    fs.appendFileSync(filePath, content);
  }

  log(level, message, meta = {}) {
    if (LOG_LEVELS[level] <= LOG_LEVELS[this.logLevel]) {
      const formattedMessage = this.formatMessage(level, message, meta);
      
      // Console output with colors
      const colors = {
        ERROR: '\x1b[31m', // Red
        WARN: '\x1b[33m',  // Yellow
        INFO: '\x1b[36m',  // Cyan
        DEBUG: '\x1b[37m'  // White
      };
      
      console.log(`${colors[level]}[${level}] ${new Date().toISOString()} - ${message}\x1b[0m`, meta);
      
      // File output
      this.writeToFile(`${level.toLowerCase()}.log`, formattedMessage);
      this.writeToFile('combined.log', formattedMessage);
    }
  }

  error(message, meta = {}) {
    this.log('ERROR', message, meta);
  }

  warn(message, meta = {}) {
    this.log('WARN', message, meta);
  }

  info(message, meta = {}) {
    this.log('INFO', message, meta);
  }

  debug(message, meta = {}) {
    this.log('DEBUG', message, meta);
  }

  // Request logging middleware
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();
      const { method, url, ip, headers } = req;
      
      // Log request
      this.info('Incoming Request', {
        method,
        url,
        ip,
        userAgent: headers['user-agent'],
        contentType: headers['content-type'],
        authorization: headers.authorization ? 'Bearer ***' : 'None',
        body: req.method === 'POST' || req.method === 'PUT' ? 
          this.sanitizeBody(req.body) : undefined
      });

      // Override res.json to log responses
      const originalJson = res.json;
      res.json = function(data) {
        const duration = Date.now() - start;
        
        // Log response
        logger.info('Outgoing Response', {
          method,
          url,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          responseSize: JSON.stringify(data).length
        });

        return originalJson.call(this, data);
      };

      next();
    };
  }

  // Sanitize sensitive data from logs
  sanitizeBody(body) {
    if (!body) return body;
    
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***';
      }
    });
    
    return sanitized;
  }

  // Database operation logger
  dbLog(operation, collection, query = {}, result = {}) {
    this.info('Database Operation', {
      operation,
      collection,
      query: this.sanitizeBody(query),
      resultCount: result.length || (result._id ? 1 : 0),
      executionTime: result.executionTime || 'N/A'
    });
  }

  // Authentication logger
  authLog(event, user = {}, meta = {}) {
    this.info('Authentication Event', {
      event,
      userId: user._id || user.id,
      userEmail: user.email,
      userRole: user.role,
      ...meta
    });
  }

  // Error logger with stack trace
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

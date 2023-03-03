/* globals  __stack */
import log4js from 'log4js'
// var path = require('path')

function getLogger(category, level) {
  if (level == null) {
    level = 'INFO'
  }

  log4js.configure({
    appenders: {
      console: {
        type: 'console'
      }
    },
    categories: {
      default: {
        appenders: ['console'],
        level
      }
    }
  })

  return log4js.getLogger(category)
}

export class Log {
  constructor(filename, level) {
    this.log = getLogger('', level)
    this.filename = filename
  }
  error(line, text) {
    this.log.error('(' + this.filename + ':' + line + ') ' + text)
  }
  info(line, text) {
    this.log.info('(' + this.filename + ':' + line + ') ' + text)
  }
  warn(line, text) {
    this.log.warn('(' + this.filename + ':' + line + ') ' + text)
  }
  debug(line, text) {
    this.log.debug('(' + this.filename + ':' + line + ') ' + text)
  }
}


Object.defineProperty(global, '__stack', {
  get: function () {
    const orig = Error.prepareStackTrace
    Error.prepareStackTrace = function (_, stack) {
      return stack
    }
    const err = new Error()
    Error.captureStackTrace(err, this.caller) // eslint-disable-line 
    const stack = err.stack
    Error.prepareStackTrace = orig
    return stack
  }
})

Object.defineProperty(global, '__line', {
  get: function () {
    return __stack[1].getLineNumber()
  }
})

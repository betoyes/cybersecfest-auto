'use strict';

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info;

function logger(level, ...args) {
  if ((LEVELS[level] ?? 0) < MIN) return;
  const ts = new Date().toISOString().slice(11, 23);
  const out = level === 'error' ? console.error : console.log;
  out(`[${ts}] [${level.toUpperCase()}]`, ...args);
}

module.exports = {
  debug: (...a) => logger('debug', ...a),
  info:  (...a) => logger('info',  ...a),
  warn:  (...a) => logger('warn',  ...a),
  error: (...a) => logger('error', ...a),
};

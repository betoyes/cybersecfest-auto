'use strict';

function isLocalMode() {
  return ['1', 'true', 'yes'].includes(String(process.env.LOCAL_MODE || '').toLowerCase());
}

module.exports = isLocalMode()
  ? require('./local-fs.js')
  : require('./github.js');

/*

	undici-wrapper

*/

// add tracing
const request = require('./request')

// export handler
module.exports = (tracer) => tracer?.wrap('undici.request', request) || request

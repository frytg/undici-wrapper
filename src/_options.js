/*

	undici-wrapper

*/

// load config
const { name, version } = require('../package.json')

const userAgent = `${name}/${version}`

module.exports = {
	keepAliveTimeout: 180e3,
	headersTimeout: 0,
	bodyTimeout: 0,
	headers: {
		'user-agent': process.env.USER_AGENT || userAgent,
	},
}

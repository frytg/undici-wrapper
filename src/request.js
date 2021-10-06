/* eslint-disable no-underscore-dangle */
/*

	undici-wrapper

*/

// load node utils
const undici = require('undici')
const AbortController = require('abort-controller')

// fetch options and utils
const _options = require('./_options')
const convertReadableStream = require('./convertReadableStream')

// set pool collector
const clientPool = {}

const defaultTimeout = 7e3

module.exports = async (inputUrl, options) => {
	// split host and path
	const url = new URL(inputUrl)
	const host = url.origin
	const path = `${url.pathname}${url.search}`

	// check client for host
	if (!clientPool[host]) clientPool[host] = new undici.Pool(host, _options)

	// use controller for timeouts
	const abortController = new AbortController()
	const abortTimeout = setTimeout(() => {
		abortController.abort()
	}, options?.timeout || defaultTimeout)

	// prepare options
	const requestOptions = {
		..._options,
		path,
		origin: host,
		method: options?.method || 'GET',
		body: options?.body || undefined,
		signal: abortController.signal,
		maxRedirections: options?.maxRedirections || 5,
	}
	if (options?.headers) requestOptions.headers = { ...requestOptions.headers, ...options.headers }

	// make actual request
	const { statusCode, headers, trailers, body } = await clientPool[host].request(requestOptions)

	// remove timeout since request finished beforehand
	clearTimeout(abortTimeout)

	// set ok
	const ok = statusCode >= 200 && statusCode < 300
	if (!ok && (!options || options?.reject !== false)) return Promise.reject({ statusCode, ok, headers, url })

	// turn stream into string
	const { string, buffer } = await convertReadableStream(body)

	// detect/ set redirect
	const redirect =
		statusCode >= 300 && statusCode < 400 && headers.location ? new URL(headers.location, inputUrl) : null

	// fetch header vars
	const contentType = headers['content-type']

	// parse json if set
	let json
	try {
		json = contentType?.indexOf('application/json') !== -1 ? JSON.parse(string) : null
	} catch (error) {
		json = null
	}

	// return data
	return Promise.resolve({
		statusCode,
		ok,
		redirect,
		headers,
		contentType,
		trailers,
		body,
		string,
		buffer,
		json,
	})
}

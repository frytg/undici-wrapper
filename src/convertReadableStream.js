/*

	undici-wrapper

*/

module.exports = async (readable) => {
	// create output details
	let string = ''
	const chunks = []

	// handle each chunk
	for await (const chunk of readable) {
		string += chunk
		chunks.push(chunk)
	}

	// reformat buffer
	let buffer = Buffer.concat(chunks)

	// return data
	return { string, buffer }
}

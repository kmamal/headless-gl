
const fromSource = ![ undefined, '', '0', 'false' ].includes(process.env.GL_FROM_SOURCE)

if (!fromSource) {
	try {
		await import('./download-release.mjs')
		process.exit(0)
	} catch (error) {
		console.log("failed to download release:", error.cause?.message ?? error.message)
	}
} else { console.log("skip download and build from source") }

await import('./build.mjs')

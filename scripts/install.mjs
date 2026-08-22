
if (!process.env.GL_FROM_SOURCE) {
	try {
		await import('./download-release.mjs')
		const { linkVulkanLoader } = await import('./util/link-vulkan.mjs')
		await linkVulkanLoader()
		process.exit(0)
	} catch (_) {
		console.log("failed to download release")
	}
} else {
	console.log("skip download and build from source")
}

await import('./build.mjs')

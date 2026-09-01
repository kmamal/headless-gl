import Fs from 'node:fs'
import Path from 'node:path'
import { execSync } from 'node:child_process'
import C from './common.js'

// ANGLE's Vulkan backend (which serves Wayland windows) dlopens libvulkan.so.1
// only from the directory next to the addon, so the system loader has to be
// linked into dist/. The link points into the local machine, so it is created
// here at build/install time and excluded from release assets.
export const linkVulkanLoader = async () => {
	if (C.platform !== 'linux') { return }

	const linkPath = Path.join(C.dir.dist, 'libvulkan.so.1')
	await Fs.promises.rm(linkPath, { force: true })

	let loaderPath = null
	for (const ldconfig of [ 'ldconfig', '/sbin/ldconfig', '/usr/sbin/ldconfig' ]) {
		try {
			const output = execSync(`${ldconfig} -p`, { encoding: 'utf8', stdio: [ 'ignore', 'pipe', 'ignore' ] })
			loaderPath = output.match(/libvulkan\.so\.1 \([^)]*\) => (.*)/u)?.[1] ?? null
			break
		} catch (_) {}
	}

	if (!loaderPath) {
		console.log("libvulkan.so.1 not found: ANGLE's Vulkan backend (needed for Wayland windows) will be unavailable")
		return
	}

	await Fs.promises.symlink(loaderPath, linkPath)
}

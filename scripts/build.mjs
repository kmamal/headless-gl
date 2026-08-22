import Fs from 'node:fs'
import Path from 'node:path'
import { execSync } from 'node:child_process'
import C from './util/common.js'
import { linkVulkanLoader } from './util/link-vulkan.mjs'

await Promise.all([
	C.dir.build,
	C.dir.dist,
	C.dir.publish,
].map(async (dir) => {
	await Fs.promises.rm(dir, { recursive: true }).catch(() => {})
}))

console.log("build in", C.dir.build)

let archFlag = ''
if (process.env.CROSS_COMPILE_ARCH) {
	archFlag = `--arch ${process.env.CROSS_COMPILE_ARCH}`
}

process.chdir(C.dir.root)
execSync(`npx node-gyp rebuild ${archFlag} -j max --verbose`, { stdio: 'inherit' })

console.log("install to", C.dir.dist)
await Fs.promises.rm(C.dir.dist, { recursive: true }).catch(() => {})
await Fs.promises.mkdir(C.dir.dist, { recursive: true })
await Fs.promises.cp(
	Path.join(C.dir.build, 'Release/webgl.node'),
	Path.join(C.dir.dist, 'webgl.node'),
)

// Include the licenses (covers headless-gl and the bundled ANGLE)
await Fs.promises.cp(
	Path.join(C.dir.root, 'LICENSES'),
	Path.join(C.dir.dist, 'LICENSES'),
)

// Strip binaries on linux
if (C.platform === 'linux') {
	execSync(`strip -s ${Path.join(C.dir.dist, 'webgl.node')}`)
}

// Include the prebuilt ANGLE libraries (copied next to the addon by binding.gyp)
for (const filename of await Fs.promises.readdir(C.dir.release)) {
	if (!/\.(so|dylib|dll)$/u.test(filename)) { continue }
	await Fs.promises.cp(
		Path.join(C.dir.release, filename),
		Path.join(C.dir.dist, filename),
		{ verbatimSymlinks: true },
	)
}

await linkVulkanLoader()

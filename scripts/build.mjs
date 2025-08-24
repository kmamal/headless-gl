import Fs from 'node:fs'
import Path from 'node:path'
import { execSync } from 'node:child_process'
import C from './util/common.js'

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

// Strip binaries on linux
if (C.platform === 'linux') {
	execSync(`strip -s ${Path.join(C.dir.dist, 'webgl.node')}`)
}

// NOTE: Next release will probably include deps for all platforms
if (C.platform === 'win32') {
	const dllDir = Path.join(C.dir.deps, 'windows/dll/x64')
	for await (const filename of await Fs.promises.readdir(dllDir)) {
		await Fs.promises.cp(
			Path.join(dllDir, filename),
			Path.join(C.dir.dist, filename),
			{ verbatimSymlinks: true },
		)
	}
}

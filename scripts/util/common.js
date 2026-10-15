const Fs = require('node:fs')
const Path = require('node:path')

const dir = {}
dir.root = Path.resolve(__dirname, '../..')
dir.build = Path.join(dir.root, 'build')
dir.release = Path.join(dir.build, 'Release')
dir.dist = Path.join(dir.root, 'dist')
dir.publish = Path.join(dir.root, 'publish')
dir.deps = Path.join(dir.root, 'deps')

const pkgPath = Path.join(dir.root, 'package.json')
const pkg = JSON.parse(Fs.readFileSync(pkgPath).toString())
const version = pkg.version
const isPrerelease = version.includes('-')
const [ , owner, repo ] = pkg.repository.url.match(/([^/:]+)\/([^/]+)\.git$/u)

const { platform, arch } = process
const abi = process.versions.modules
const targetArch = process.env.CROSS_COMPILE_ARCH || arch
const assetName = `gl-v${version}-node_v${abi}-${platform}-${targetArch}.tar.gz`

const depsDir = {
	'linux-x64': 'linux/so',
	'linux-arm64': 'linux-arm64/so',
	'darwin-x64': 'darwin/dylib',
	'darwin-arm64': 'darwin/dylib',
	'win32-x64': 'windows/dll',
}[`${platform}-${targetArch}`]
const depsNames = {
	linux: [ 'libEGL.so', 'libGLESv2.so', 'libvulkan.so.1' ],
	darwin: [ 'libEGL.dylib', 'libGLESv2.dylib' ],
	win32: [ 'libEGL.dll', 'libGLESv2.dll', 'd3dcompiler_47.dll' ],
}[platform]
const depsFiles = depsDir ? depsNames.map((name) => `${depsDir}/${name}`) : []

module.exports = {
	dir,
	version,
	isPrerelease,
	owner,
	repo,
	platform,
	arch,
	targetArch,
	assetName,
	depsFiles,
}

const Fs = require('fs')
const Path = require('path')

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
const [ , owner, repo ] = pkg.repository.url.match(/([^/:]+)\/([^/]+).git$/u)

const { platform, arch } = process
const abi = process.versions.modules
const targetArch = process.env.CROSS_COMPILE_ARCH || arch
const assetName = `gl-v${version}-node_v${abi}-${platform}-${targetArch}.tar.gz`

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
}

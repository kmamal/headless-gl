import * as Fs from 'fs'
import * as Path from 'path'
import { fileURLToPath } from 'url'
const dir = {}
const __dirname = Path.dirname(fileURLToPath(import.meta.url))
dir.root = Path.join(__dirname, '../..')
dir.sdl = Path.join(dir.root, 'sdl')
dir.build = Path.join(dir.root, 'build')
dir.dist = Path.join(dir.root, 'dist')
dir.publish = Path.join(dir.root, 'publish')

const pkgPath = Path.join(dir.root, 'package.json')

const pkg = JSON.parse(Fs.readFileSync(pkgPath).toString())
const version = pkg.version.slice(0, pkg.version.indexOf('-'))
const [ , owner, repo ] = pkg.repository.url.match(/([^/:]+)\/([^/]+).git$/u)

const { platform, arch } = process
const abi = process.versions.modules
const targetArch = process.env.CROSS_COMPILE_ARCH || arch
const assetName = `gl-v${version}-node_v${abi}-${platform}-${targetArch}.tar.gz`

export default {
	dir,
	version,
	owner,
	repo,
	platform,
	arch,
	targetArch,
	assetName,
}

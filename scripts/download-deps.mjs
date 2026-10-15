import Fs from 'node:fs'
import Path from 'node:path'
import Stream from 'node:stream'
import C from './util/common.js'

if (C.depsFiles.length === 0) {
	throw new Error(`no prebuilt ANGLE libraries for ${C.platform}-${C.targetArch}`)
}

const baseUrl = `https://raw.githubusercontent.com/${C.owner}/${C.repo}/v${C.version}/deps`

for (const file of C.depsFiles) {
	const path = Path.join(C.dir.deps, file)
	if (Fs.existsSync(path)) { continue }

	const url = `${baseUrl}/${file}`
	console.log("fetch", url)
	const response = await fetch(url)
	if (!response.ok) { throw new Error(`bad status code ${response.status}`) }

	await Fs.promises.mkdir(Path.dirname(path), { recursive: true })
	const partialPath = `${path}.partial`
	await Stream.promises.pipeline(
		Stream.Readable.fromWeb(response.body),
		Fs.createWriteStream(partialPath),
	)
	await Fs.promises.rename(partialPath, path)
}

import { execSync } from 'node:child_process'

await import('./clean.mjs')

process.env.GL_FROM_SOURCE = 1
execSync('npm install', {
	stdio: 'inherit',
})

await import('./upload-release.mjs')

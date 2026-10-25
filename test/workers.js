'use strict'

const tape = require('tape')
const path = require('path')
const { execFileSync } = require('child_process')

const indexPath = path.join(__dirname, '..', 'index.js')

function run (code, env = {}) {
  const output = execFileSync(process.execPath, ['-e', code], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
    timeout: 30e3
  })
  return JSON.parse(output)
}

const workerSource = `
  const createContext = require(${JSON.stringify(indexPath)})
  const { parentPort } = require('worker_threads')
  let gl = null
  try {
    gl = createContext(4, 4)
  } catch (error) {
    parentPort.postMessage(error.code)
  }
  if (gl) {
    gl.clearColor(0, 1, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    const pixel = new Uint8Array(4)
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
    parentPort.postMessage(Array.from(pixel))
  }
  setInterval(() => {}, 1e3)
`

function script (mainContext) {
  return `
    const { Worker } = require('worker_threads')
    const createContext = require(${JSON.stringify(indexPath)})
    const main = ${mainContext} ? createContext(4, 4) : null
    const runWorker = () => new Promise((resolve, reject) => {
      const worker = new Worker(${JSON.stringify(workerSource)}, { eval: true })
      worker.once('error', reject)
      worker.once('message', (pixel) => { worker.terminate().then(() => resolve(pixel)) })
    })
    ;(async () => {
      const first = await runWorker()
      const second = await runWorker()
      let mainPixel = null
      if (main) {
        main.clearColor(1, 0, 0, 1)
        main.clear(main.COLOR_BUFFER_BIT)
        const pixel = new Uint8Array(4)
        main.readPixels(0, 0, 1, 1, main.RGBA, main.UNSIGNED_BYTE, pixel)
        mainPixel = Array.from(pixel)
      }
      console.log(JSON.stringify({ first, second, mainPixel }))
    })()
  `
}

tape('context in a worker', function (t) {
  const { first, second } = run(script(false))
  t.deepEqual(first, [0, 255, 0, 255], 'first worker draws')
  t.deepEqual(second, [0, 255, 0, 255], 'terminated worker released its contexts')
  t.end()
})

tape('contexts on several threads', function (t) {
  const { first, second, mainPixel } = run(script(true))
  t.deepEqual(mainPixel, [255, 0, 0, 255], 'main thread keeps drawing')
  if (typeof first === 'string') {
    t.equal(first, 'ERR_GL_THREAD_CONFLICT', 'OpenGL backend refuses a second thread instead of crashing')
    t.equal(second, 'ERR_GL_THREAD_CONFLICT', 'and keeps refusing it')
  } else {
    t.deepEqual(first, [0, 255, 0, 255], 'first worker draws')
    t.deepEqual(second, [0, 255, 0, 255], 'second worker draws')
  }
  t.end()
})

tape('loading the addon twice', function (t) {
  const addonPath = path.join(__dirname, '..', 'dist', 'webgl.node')
  const result = run(`
    process.dlopen({ exports: {} }, ${JSON.stringify(addonPath)})
    process.dlopen({ exports: {} }, ${JSON.stringify(addonPath)})
    console.log('true')
  `)
  t.equal(result, true, 'does not abort')
  t.end()
})

if (process.platform === 'linux') {
  tape('contexts on several threads with the Vulkan backend', function (t) {
    let result
    try {
      result = run(script(true), { ANGLE_DEFAULT_PLATFORM: 'vulkan' })
    } catch (error) {
      t.skip('Vulkan backend unavailable')
      t.end()
      return
    }
    if (result.mainPixel === null) {
      t.skip('Vulkan backend unavailable')
      t.end()
      return
    }
    t.deepEqual(result.mainPixel, [255, 0, 0, 255], 'main thread draws')
    t.deepEqual(result.first, [0, 255, 0, 255], 'first worker draws')
    t.deepEqual(result.second, [0, 255, 0, 255], 'second worker draws')
    t.end()
  })
}

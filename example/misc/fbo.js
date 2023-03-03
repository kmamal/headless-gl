/* globals __line */
import { basename } from 'path'
import { createContext } from '../../index.js'
import { bufferToFile } from '../common/utils.js'
import { Log } from '../common/utils_log.js'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const log = new Log(basename(__filename), 'DEBUG')

function main() {
  // Create context
  const width = 512
  const height = 512
  const gl = createContext(width, height)

  // Clear screen to red
  gl.clearColor(1.0, 0.0, 0.0, 1.0)
  gl.colorMask(true, true, true, true)
  gl.clear(gl.COLOR_BUFFER_BIT)

  var filename = __filename + '.ppm' // eslint-disable-line
  log.info(__line, 'rendering ' + filename)
  bufferToFile(gl, width, height, filename)
  log.info(__line, 'finished rendering ' + filename)

  gl.destroy()
}

main()

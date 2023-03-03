/* globals __line */
import { basename } from 'path'
import { createContext } from '../../index.js'
import { createProgramFromSources, bufferToFile } from '../common/utils.js'
import { Log } from '../common/utils_log.js'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const log = new Log(basename(__filename), 'DEBUG')

function main() {
  // Create context
  const width = 512
  const height = 512
  const gl = createContext(width, height)

  const vertexSrc = `
  attribute vec2 a_position;

  void main() {
    gl_Position = vec4(a_position, 0, 1);
  }
  `

  const fragmentSrc = `
  void main() {
    gl_FragColor = vec4(0, 1, 0, 1);  // green
  }
  `

  // setup a GLSL program
  const program = createProgramFromSources(gl, [vertexSrc, fragmentSrc])
  gl.useProgram(program)

  // look up where the vertex data needs to go.
  const positionLocation = gl.getAttribLocation(program, 'a_position')

  // Create a buffer and put a single clipspace rectangle in
  // it (2 triangles)
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1.0, -1.0,
      1.0, -1.0,
      -1.0, 1.0,
      -1.0, 1.0,
      1.0, -1.0,
      1.0, 1.0]),
    gl.STATIC_DRAW)
  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

  // draw
  gl.drawArrays(gl.TRIANGLES, 0, 6)

  var filename = __filename + '.ppm' // eslint-disable-line
  log.info(__line, 'rendering ' + filename)
  bufferToFile(gl, width, height, filename)
  log.info(__line, 'finished rendering ' + filename)

  gl.destroy()
}

main()

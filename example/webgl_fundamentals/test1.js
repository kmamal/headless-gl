/* globals __line */
import { basename } from 'path'
import { createContext } from '../../index.js'
import { createProgramFromSources, bufferToFile } from '../common/utils.js'
import { Log } from '../common/utils_log.js'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const log = new Log(basename(__filename), 'DEBUG')

function main () {
  // Create context
  const width = 512
  const height = 512
  const gl = createContext(width, height)

  const vertexSrc = `
  attribute vec2 a_position;

  uniform vec2 u_resolution;

  void main() {
    // convert the rectangle from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;

    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // convert from 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace, 0, 1);
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

  // set the resolution
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
  gl.uniform2f(resolutionLocation, width, height)

  // Create a buffer and put a single clipspace rectangle in
  // it (2 triangles)
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    10, 20,
    80, 20,
    10, 30,
    10, 30,
    80, 20,
    80, 30
  ]), gl.STATIC_DRAW)
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

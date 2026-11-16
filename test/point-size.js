'use strict'

const tape = require('tape')
const createContext = require('../index')
const makeProgram = require('./util/make-program')

const SIZES = [-1, 0, 0.01, 0.5, 1]

for (const size of SIZES) {
  tape('point-size ' + size, function (t) {
    const width = 16
    const height = 16
    const gl = createContext(width, height)

    const vertexSrc = [
      'attribute vec2 position;',
      'uniform float size;',
      'void main() {',
      '  gl_Position = vec4(position, 0, 1);',
      '  gl_PointSize = size;',
      '}'
    ].join('\n')

    const fragmentSrc = [
      'precision mediump float;',
      'void main() { gl_FragColor = vec4(0, 1, 0, 1); }'
    ].join('\n')

    const program = makeProgram(gl, vertexSrc, fragmentSrc)
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1 / width, 1 / height]), gl.STATIC_DRAW)
    const location = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(location)
    gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0)
    gl.uniform1f(gl.getUniformLocation(program, 'size'), size)

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.POINTS, 0, 1)

    const pixels = new Uint8Array(width * height * 4)
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

    let lit = 0
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 1] !== 0) {
        lit++
      }
    }
    t.equals(lit, 1, 'draws exactly one pixel')

    gl.getExtension('STACKGL_destroy_context').destroy()
    t.end()
  })
}

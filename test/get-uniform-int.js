'use strict'

const tape = require('tape')
const createContext = require('../index')
const makeProgram = require('./util/make-program')

tape('getUniform returns exact integers', function (t) {
  const gl = createContext(4, 4)
  const program = makeProgram(gl, [
    'uniform int i;',
    'uniform ivec2 v;',
    'void main() { gl_Position = vec4(float(i), float(v.x), float(v.y), 1); }'
  ].join('\n'), 'void main() { gl_FragColor = vec4(1); }')
  gl.useProgram(program)

  const big = 16777217
  gl.uniform1i(gl.getUniformLocation(program, 'i'), big)
  t.equal(gl.getUniform(program, gl.getUniformLocation(program, 'i')), big, 'int')
  gl.uniform2i(gl.getUniformLocation(program, 'v'), -big, big + 2)
  t.deepEqual(Array.from(gl.getUniform(program, gl.getUniformLocation(program, 'v'))), [-big, big + 2], 'ivec2')
  t.equal(gl.getError(), gl.NO_ERROR)

  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

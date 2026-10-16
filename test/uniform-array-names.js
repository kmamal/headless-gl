'use strict'

const tape = require('tape')
const createContext = require('../index')
const makeProgram = require('./util/make-program')

tape('uniform array names', function (t) {
  const gl = createContext(4, 4)
  const program = makeProgram(gl, [
    'uniform float arr[4];',
    'uniform vec2 pairs[2];',
    'void main() { gl_Position = vec4(arr[0] + arr[1] + arr[2] + arr[3] + pairs[0].x + pairs[1].y); }'
  ].join('\n'), 'void main() { gl_FragColor = vec4(1); }')
  gl.useProgram(program)

  const plain = gl.getUniformLocation(program, 'arr')
  t.ok(plain, 'plain array name resolves')
  t.equal(gl.getUniform(program, plain), gl.getUniform(program, gl.getUniformLocation(program, 'arr[0]')))
  gl.uniform1fv(plain, [1, 2, 3, 4])
  t.equal(gl.getError(), gl.NO_ERROR, 'plain name sets the whole array')
  for (let i = 0; i < 4; ++i) {
    t.equal(gl.getUniform(program, gl.getUniformLocation(program, 'arr[' + i + ']')), i + 1)
  }

  gl.uniform2fv(gl.getUniformLocation(program, 'pairs'), [1, 2, 3, 4])
  t.equal(gl.getError(), gl.NO_ERROR)
  t.deepEqual(Array.from(gl.getUniform(program, gl.getUniformLocation(program, 'pairs[1]'))), [3, 4])

  t.equal(gl.getUniformLocation(program, 'arr[4]'), null, 'index past the end')
  t.equal(gl.getUniformLocation(program, 'arr]'), null, 'malformed name')
  t.equal(gl.getUniformLocation(program, 'missing'), null, 'unknown name')
  t.equal(gl.getError(), gl.NO_ERROR)

  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

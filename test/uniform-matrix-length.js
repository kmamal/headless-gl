'use strict'

const tape = require('tape')
const createContext = require('../index')
const makeProgram = require('./util/make-program')

tape('uniform matrix arrays must hold whole matrices', function (t) {
  const gl = createContext(4, 4)
  const program = makeProgram(gl, [
    'uniform mat4 m[2];',
    'uniform mat4 single;',
    'void main() { gl_Position = m[0][0] + m[1][0] + single[0]; }'
  ].join('\n'), 'void main() { gl_FragColor = vec4(1); }')
  gl.useProgram(program)
  const location = gl.getUniformLocation(program, 'm')

  gl.uniformMatrix4fv(location, false, new Float32Array(20))
  t.equal(gl.getError(), gl.INVALID_VALUE, 'partial matrix is rejected')
  gl.uniformMatrix4fv(location, false, new Float32Array(32))
  t.equal(gl.getError(), gl.NO_ERROR, 'whole matrices are accepted')
  gl.uniformMatrix4fv(gl.getUniformLocation(program, 'single'), false, new Float32Array(32))
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'several matrices for a non-array uniform')

  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

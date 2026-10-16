'use strict'

const tape = require('tape')
const createContext = require('../index')
const makeProgram = require('./util/make-program')
const drawTriangle = require('./util/draw-triangle')

const VERT_SRC = [
  '#version 300 es',
  'layout(location = 0) in vec2 position;',
  'void main () {',
  '  gl_Position = vec4(position, 0.0, 1.0);',
  '}'
].join('\n')

const FRAG_SRC = [
  '#version 300 es',
  'precision mediump float;',
  'out vec4 fragColor;',
  'void main () {',
  '  fragColor = vec4(1.0, 0.0, 0.0, 1.0);',
  '}'
].join('\n')

function destroy (gl) {
  gl.getExtension('STACKGL_destroy_context').destroy()
}

function waitForResult (gl, query, onResult) {
  gl.finish()
  let attempts = 0
  const poll = function () {
    if (gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE)) {
      onResult(true)
    } else if (++attempts > 1000) {
      onResult(false)
    } else {
      setImmediate(poll)
    }
  }
  setImmediate(poll)
}

tape('occlusion queries', function (t) {
  const gl = createContext(8, 8, { createWebGL2Context: true })
  const program = makeProgram(gl, VERT_SRC, FRAG_SRC)
  t.ok(gl.getProgramParameter(program, gl.LINK_STATUS), gl.getProgramInfoLog(program))
  gl.useProgram(program)

  const query = gl.createQuery()
  t.ok(query, 'created')
  t.equal(gl.getQuery(gl.ANY_SAMPLES_PASSED, gl.CURRENT_QUERY), null)
  gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'a query that was never begun has no result')

  gl.beginQuery(gl.ANY_SAMPLES_PASSED, query)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.isQuery(query), true)
  t.equal(gl.getQuery(gl.ANY_SAMPLES_PASSED, gl.CURRENT_QUERY), query)
  t.equal(gl.getQuery(gl.ANY_SAMPLES_PASSED_CONSERVATIVE, gl.CURRENT_QUERY), null)
  gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'an active query has no result')
  gl.beginQuery(gl.ANY_SAMPLES_PASSED, gl.createQuery())
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'a target has one active query')
  gl.beginQuery(gl.ANY_SAMPLES_PASSED_CONSERVATIVE, query)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'an active query cannot begin again')
  drawTriangle(gl)
  gl.endQuery(gl.ANY_SAMPLES_PASSED)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.getQuery(gl.ANY_SAMPLES_PASSED, gl.CURRENT_QUERY), null)
  gl.endQuery(gl.ANY_SAMPLES_PASSED)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'nothing to end')

  gl.finish()
  t.equal(gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE), false, 'results are never available in the same task')
  waitForResult(gl, query, function (available) {
    t.ok(available, 'result becomes available')
    t.equal(typeof gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE), 'boolean')
    t.equal(gl.getQueryParameter(query, gl.QUERY_RESULT), 1, 'samples passed')

    const empty = gl.createQuery()
    gl.beginQuery(gl.ANY_SAMPLES_PASSED_CONSERVATIVE, empty)
    gl.endQuery(gl.ANY_SAMPLES_PASSED_CONSERVATIVE)
    waitForResult(gl, empty, function (available) {
      t.ok(available)
      t.equal(gl.getQueryParameter(empty, gl.QUERY_RESULT), 0, 'no samples passed')
      rest()
    })
  })

  function rest () {
    gl.beginQuery(gl.ANY_SAMPLES_PASSED_CONSERVATIVE, query)
    t.equal(gl.getError(), gl.INVALID_OPERATION, 'queries keep their target')
    gl.beginQuery(gl.TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN, gl.createQuery())
    t.equal(gl.getError(), gl.NO_ERROR, 'transform feedback target')
    gl.endQuery(gl.TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN)

    gl.beginQuery(gl.TEXTURE_2D, query)
    t.equal(gl.getError(), gl.INVALID_ENUM, 'bad target')
    gl.endQuery(gl.TEXTURE_2D)
    t.equal(gl.getError(), gl.INVALID_ENUM)
    gl.getQuery(gl.ANY_SAMPLES_PASSED, gl.QUERY_RESULT)
    t.equal(gl.getError(), gl.INVALID_ENUM, 'bad query parameter')
    gl.getQueryParameter(query, gl.CURRENT_QUERY)
    t.equal(gl.getError(), gl.INVALID_ENUM, 'bad result parameter')
    t.throws(function () {
      gl.beginQuery(gl.ANY_SAMPLES_PASSED, 5)
    }, TypeError)
    t.throws(function () {
      gl.getQueryParameter(5, gl.QUERY_RESULT)
    }, TypeError)

    const other = createContext(8, 8, { createWebGL2Context: true })
    gl.beginQuery(gl.ANY_SAMPLES_PASSED, other.createQuery())
    t.equal(gl.getError(), gl.INVALID_OPERATION, 'query of another context')
    destroy(other)

    const active = gl.createQuery()
    gl.beginQuery(gl.ANY_SAMPLES_PASSED, active)
    gl.deleteQuery(active)
    t.equal(gl.getError(), gl.NO_ERROR)
    t.equal(gl.getQuery(gl.ANY_SAMPLES_PASSED, gl.CURRENT_QUERY), null, 'deleting an active query ends it')
    t.equal(gl.isQuery(active), false)
    gl.getQueryParameter(active, gl.QUERY_RESULT)
    t.equal(gl.getError(), gl.INVALID_VALUE, 'deleted queries are invalid')
    gl.deleteQuery(query)
    gl.deleteQuery(query)
    t.equal(gl.getError(), gl.NO_ERROR, 'double delete is ignored')

    destroy(gl)
    t.end()
  }
})

tape('query methods require a query', function (t) {
  const gl = createContext(8, 8, { createWebGL2Context: true })
  t.throws(() => gl.beginQuery(gl.ANY_SAMPLES_PASSED, null), TypeError, 'beginQuery')
  t.throws(() => gl.getQueryParameter(null, gl.QUERY_RESULT), TypeError, 'getQueryParameter')
  t.equal(gl.getError(), gl.NO_ERROR)
  destroy(gl)
  t.end()
})

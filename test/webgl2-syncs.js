'use strict'

const tape = require('tape')
const createContext = require('../index')

function destroy (gl) {
  gl.getExtension('STACKGL_destroy_context').destroy()
}

tape('sync objects', function (t) {
  const gl = createContext(8, 8, { createWebGL2Context: true })

  const max = gl.getParameter(gl.MAX_CLIENT_WAIT_TIMEOUT_WEBGL)
  t.ok(max > 0, 'client waits are allowed')

  gl.clearColor(1, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0)
  t.ok(sync, 'created')
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.isSync(sync), true)
  t.equal(gl.isSync(null), false)
  t.equal(gl.getSyncParameter(sync, gl.OBJECT_TYPE), gl.SYNC_FENCE)
  t.equal(gl.getSyncParameter(sync, gl.SYNC_CONDITION), gl.SYNC_GPU_COMMANDS_COMPLETE)
  t.equal(gl.getSyncParameter(sync, gl.SYNC_FLAGS), 0)
  const status = gl.getSyncParameter(sync, gl.SYNC_STATUS)
  t.ok(status === gl.SIGNALED || status === gl.UNSIGNALED, 'status is a sync status')

  gl.waitSync(sync, 0, gl.TIMEOUT_IGNORED)
  t.equal(gl.getError(), gl.NO_ERROR, 'waitSync')
  gl.finish()
  t.equal(gl.getSyncParameter(sync, gl.SYNC_STATUS), gl.UNSIGNALED, 'never signaled in the task that created it')
  t.equal(gl.clientWaitSync(sync, 0, 0), gl.TIMEOUT_EXPIRED, 'never satisfied in the task that created it')
  setImmediate(function () {
    let result = gl.clientWaitSync(sync, 0, 0)
    t.ok(result === gl.ALREADY_SIGNALED || result === gl.CONDITION_SATISFIED, 'signaled after finish: ' + result)
    t.equal(gl.getSyncParameter(sync, gl.SYNC_STATUS), gl.SIGNALED)
    result = gl.clientWaitSync(sync, gl.SYNC_FLUSH_COMMANDS_BIT, 1000000)
    t.ok(result === gl.ALREADY_SIGNALED || result === gl.CONDITION_SATISFIED, 'flush flag and timeout')
    t.equal(gl.getError(), gl.NO_ERROR)
    rest()
  })

  function rest () {
    t.equal(gl.fenceSync(gl.SYNC_FENCE, 0), null)
    t.equal(gl.getError(), gl.INVALID_ENUM, 'bad condition')
    t.equal(gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 1), null)
    t.equal(gl.getError(), gl.INVALID_VALUE, 'bad flags')
    t.equal(gl.clientWaitSync(sync, 2, 0), gl.WAIT_FAILED)
    t.equal(gl.getError(), gl.INVALID_VALUE, 'bad wait flags')
    t.equal(gl.clientWaitSync(sync, 0, max + 1), gl.WAIT_FAILED)
    t.equal(gl.getError(), gl.INVALID_OPERATION, 'timeout too large')
    t.equal(gl.clientWaitSync(sync, 0, -1), gl.WAIT_FAILED)
    t.equal(gl.getError(), gl.INVALID_OPERATION, 'negative timeout')
    gl.waitSync(sync, 1, gl.TIMEOUT_IGNORED)
    t.equal(gl.getError(), gl.INVALID_VALUE, 'waitSync flags must be zero')
    gl.waitSync(sync, 0, 0)
    t.equal(gl.getError(), gl.INVALID_VALUE, 'waitSync timeout must be ignored')
    gl.getSyncParameter(sync, gl.SYNC_FENCE)
    t.equal(gl.getError(), gl.INVALID_ENUM, 'bad parameter')
    t.throws(function () {
      gl.clientWaitSync(5, 0, 0)
    }, TypeError)
    t.throws(function () {
      gl.deleteSync(5)
    }, TypeError)

    const other = createContext(8, 8, { createWebGL2Context: true })
    const foreign = other.fenceSync(other.SYNC_GPU_COMMANDS_COMPLETE, 0)
    gl.clientWaitSync(foreign, 0, 0)
    t.equal(gl.getError(), gl.INVALID_OPERATION, 'sync of another context')
    gl.deleteSync(foreign)
    t.equal(gl.getError(), gl.INVALID_OPERATION)
    destroy(other)

    gl.deleteSync(null)
    t.equal(gl.getError(), gl.NO_ERROR, 'deleting null is ignored')
    gl.deleteSync(sync)
    t.equal(gl.getError(), gl.NO_ERROR)
    t.equal(gl.isSync(sync), false)
    gl.deleteSync(sync)
    t.equal(gl.getError(), gl.NO_ERROR, 'double delete is ignored')
    t.equal(gl.clientWaitSync(sync, 0, 0), gl.WAIT_FAILED)
    t.equal(gl.getError(), gl.INVALID_VALUE, 'deleted syncs are invalid')

    destroy(gl)
    t.end()
  }
})

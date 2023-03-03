import fs from "fs"

export function bufferToStdout(gl, width, height) {
  // Write output
  const pixels = new Uint8Array(width * height * 4)
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  process.stdout.write(['P3\n# gl.ppm\n', width, ' ', height, '\n255\n'].join(''))
  for (let i = 0; i < pixels.length; i += 4) {
    process.stdout.write(pixels[i] + ' ' + pixels[i + 1] + ' ' + pixels[i + 2] + ' ')
  }
}

export function bufferToFile(gl, width, height, filename) {
  const file = fs.createWriteStream(filename)

  // Write output
  const pixels = new Uint8Array(width * height * 4)
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  file.write(['P3\n# gl.ppm\n', width, ' ', height, '\n255\n'].join(''))
  for (let i = 0; i < pixels.length; i += 4) {
    file.write(pixels[i] + ' ' + pixels[i + 1] + ' ' + pixels[i + 2] + ' ')
  }
}

export function drawTriangle(gl) {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-2, -2, -2, 4, 4, -2]), gl.STREAM_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  gl.disableVertexAttribArray(0)
  gl.deleteBuffer(buffer)
}

export function loadShader(gl, shaderSource, shaderType) {
  const shader = gl.createShader(shaderType)
  gl.shaderSource(shader, shaderSource)
  gl.compileShader(shader)

  // Check the compile status
  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (!compiled) {
    // Something went wrong during compilation; get the error
    const lastError = gl.getShaderInfoLog(shader)
    console.log("*** Error compiling shader '" + shader + "':" + lastError)
    gl.deleteShader(shader)
    return null
  }

  return shader
}

export function createProgram(gl, shaders, optAttribs, optLocations) {
  const program = gl.createProgram()
  shaders.forEach(function (shader) {
    gl.attachShader(program, shader)
  })
  if (optAttribs) {
    optAttribs.forEach(function (attrib, ndx) {
      gl.bindAttribLocation(
        program,
        optLocations ? optLocations[ndx] : ndx,
        attrib)
    })
  }
  gl.linkProgram(program)

  // Check the link status
  const linked = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (!linked) {
    // something went wrong with the link
    const lastError = gl.getProgramInfoLog(program)
    console.log('Error in program linking:' + lastError)

    gl.deleteProgram(program)
    return null
  }
  return program
}

export function createProgramFromSources(gl, shaderSources, optAttribs, optLocations) {
  const defaultShaderType = [
    'VERTEX_SHADER',
    'FRAGMENT_SHADER'
  ]

  const shaders = []
  for (let ii = 0; ii < shaderSources.length; ++ii) {
    shaders.push(loadShader(gl, shaderSources[ii], gl[defaultShaderType[ii]]))
  }
  return createProgram(gl, shaders, optAttribs, optLocations)
}
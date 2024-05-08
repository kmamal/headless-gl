
export type GLenum = number;
export type GLboolean = boolean;
export type GLbitfield = number;
export type GLbyte = number;
export type GLshort = number;
export type GLint = number;
export type GLsizei = number;
export type GLintptr = number;
export type GLsizeiptr = number;
export type GLubyte = number;
export type GLushort = number;
export type GLuint = number;
export type GLfloat = number;
export type GLclampf = number;

export type WebGLPowerPreference = 'default' | 'low-power' | 'high-performance';

export interface WebGLContextAttributes {
	alpha?: boolean;
	depth?: boolean;
	stencil?: boolean;
	antialias?: boolean;
	premultipliedAlpha?: boolean;
	preserveDrawingBuffer?: boolean;
	powerPreference?: WebGLPowerPreference;
	failIfMajorPerformanceCaveat?: boolean;
	desynchronized?: boolean;
	window?: any;
}

export interface WebGLObject {}

export interface WebGLBuffer extends WebGLObject {}

export interface WebGLFramebuffer extends WebGLObject {}

export interface WebGLProgram extends WebGLObject {}

export interface WebGLRenderbuffer extends WebGLObject {}

export interface WebGLShader extends WebGLObject {}

export interface WebGLTexture extends WebGLObject {}

export interface WebGLUniformLocation {}

export interface WebGLActiveInfo {
	readonly size: GLint;
	readonly type: GLenum;
	readonly name: string;
}

export interface WebGLShaderPrecisionFormat {
	readonly rangeMin: GLint;
	readonly rangeMax: GLint;
	readonly precision: GLint;
}

export type Float32List = Float32Array | Array<GLfloat>;

export type Int32List = Int32Array | Array<GLint>;

export interface WebGLRenderingContextBase {
	readonly DEPTH_BUFFER_BIT: GLenum;
	readonly STENCIL_BUFFER_BIT: GLenum;
	readonly COLOR_BUFFER_BIT: GLenum;

	readonly POINTS: GLenum;
	readonly LINES: GLenum;
	readonly LINE_LOOP: GLenum;
	readonly LINE_STRIP: GLenum;
	readonly TRIANGLES: GLenum;
	readonly TRIANGLE_STRIP: GLenum;
	readonly TRIANGLE_FAN: GLenum;

	readonly ZERO: GLenum;
	readonly ONE: GLenum;
	readonly SRC_COLOR: GLenum;
	readonly ONE_MINUS_SRC_COLOR: GLenum;
	readonly SRC_ALPHA: GLenum;
	readonly ONE_MINUS_SRC_ALPHA: GLenum;
	readonly DST_ALPHA: GLenum;
	readonly ONE_MINUS_DST_ALPHA: GLenum;
	readonly DST_COLOR: GLenum;
	readonly ONE_MINUS_DST_COLOR: GLenum;
	readonly SRC_ALPHA_SATURATE: GLenum;

	readonly FUNC_ADD: GLenum;
	readonly BLEND_EQUATION: GLenum;
	readonly BLEND_EQUATION_RGB: GLenum;
	readonly BLEND_EQUATION_ALPHA: GLenum;

	readonly FUNC_SUBTRACT: GLenum;
	readonly FUNC_REVERSE_SUBTRACT: GLenum;

	readonly BLEND_DST_RGB: GLenum;
	readonly BLEND_SRC_RGB: GLenum;
	readonly BLEND_DST_ALPHA: GLenum;
	readonly BLEND_SRC_ALPHA: GLenum;
	readonly CONSTANT_COLOR: GLenum;
	readonly ONE_MINUS_CONSTANT_COLOR: GLenum;
	readonly CONSTANT_ALPHA: GLenum;
	readonly ONE_MINUS_CONSTANT_ALPHA: GLenum;
	readonly BLEND_COLOR: GLenum;

	readonly ARRAY_BUFFER: GLenum;
	readonly ELEMENT_ARRAY_BUFFER: GLenum;
	readonly ARRAY_BUFFER_BINDING: GLenum;
	readonly ELEMENT_ARRAY_BUFFER_BINDING: GLenum;

	readonly STREAM_DRAW: GLenum;
	readonly STATIC_DRAW: GLenum;
	readonly DYNAMIC_DRAW: GLenum;

	readonly BUFFER_SIZE: GLenum;
	readonly BUFFER_USAGE: GLenum;

	readonly CURRENT_VERTEX_ATTRIB: GLenum;

	readonly FRONT: GLenum;
	readonly BACK: GLenum;
	readonly FRONT_AND_BACK: GLenum;

	readonly CULL_FACE: GLenum;
	readonly BLEND: GLenum;
	readonly DITHER: GLenum;
	readonly STENCIL_TEST: GLenum;
	readonly DEPTH_TEST: GLenum;
	readonly SCISSOR_TEST: GLenum;
	readonly POLYGON_OFFSET_FILL: GLenum;
	readonly SAMPLE_ALPHA_TO_COVERAGE: GLenum;
	readonly SAMPLE_COVERAGE: GLenum;

	readonly NO_ERROR: GLenum;
	readonly INVALID_ENUM: GLenum;
	readonly INVALID_VALUE: GLenum;
	readonly INVALID_OPERATION: GLenum;
	readonly OUT_OF_MEMORY: GLenum;

	readonly CW: GLenum;
	readonly CCW: GLenum;

	readonly LINE_WIDTH: GLenum;
	readonly ALIASED_POINT_SIZE_RANGE: GLenum;
	readonly ALIASED_LINE_WIDTH_RANGE: GLenum;
	readonly CULL_FACE_MODE: GLenum;
	readonly FRONT_FACE: GLenum;
	readonly DEPTH_RANGE: GLenum;
	readonly DEPTH_WRITEMASK: GLenum;
	readonly DEPTH_CLEAR_VALUE: GLenum;
	readonly DEPTH_FUNC: GLenum;
	readonly STENCIL_CLEAR_VALUE: GLenum;
	readonly STENCIL_FUNC: GLenum;
	readonly STENCIL_FAIL: GLenum;
	readonly STENCIL_PASS_DEPTH_FAIL: GLenum;
	readonly STENCIL_PASS_DEPTH_PASS: GLenum;
	readonly STENCIL_REF: GLenum;
	readonly STENCIL_VALUE_MASK: GLenum;
	readonly STENCIL_WRITEMASK: GLenum;
	readonly STENCIL_BACK_FUNC: GLenum;
	readonly STENCIL_BACK_FAIL: GLenum;
	readonly STENCIL_BACK_PASS_DEPTH_FAIL: GLenum;
	readonly STENCIL_BACK_PASS_DEPTH_PASS: GLenum;
	readonly STENCIL_BACK_REF: GLenum;
	readonly STENCIL_BACK_VALUE_MASK: GLenum;
	readonly STENCIL_BACK_WRITEMASK: GLenum;
	readonly VIEWPORT: GLenum;
	readonly SCISSOR_BOX: GLenum;
	readonly COLOR_CLEAR_VALUE: GLenum;
	readonly COLOR_WRITEMASK: GLenum;
	readonly UNPACK_ALIGNMENT: GLenum;
	readonly PACK_ALIGNMENT: GLenum;
	readonly MAX_TEXTURE_SIZE: GLenum;
	readonly MAX_VIEWPORT_DIMS: GLenum;
	readonly SUBPIXEL_BITS: GLenum;
	readonly RED_BITS: GLenum;
	readonly GREEN_BITS: GLenum;
	readonly BLUE_BITS: GLenum;
	readonly ALPHA_BITS: GLenum;
	readonly DEPTH_BITS: GLenum;
	readonly STENCIL_BITS: GLenum;
	readonly POLYGON_OFFSET_UNITS: GLenum;
	readonly POLYGON_OFFSET_FACTOR: GLenum;
	readonly TEXTURE_BINDING_2D: GLenum;
	readonly SAMPLE_BUFFERS: GLenum;
	readonly SAMPLES: GLenum;
	readonly SAMPLE_COVERAGE_VALUE: GLenum;
	readonly SAMPLE_COVERAGE_INVERT: GLenum;

	readonly COMPRESSED_TEXTURE_FORMATS: GLenum;

	readonly DONT_CARE: GLenum;
	readonly FASTEST: GLenum;
	readonly NICEST: GLenum;

	readonly GENERATE_MIPMAP_HINT: GLenum;

	readonly BYTE: GLenum;
	readonly UNSIGNED_BYTE: GLenum;
	readonly SHORT: GLenum;
	readonly UNSIGNED_SHORT: GLenum;
	readonly INT: GLenum;
	readonly UNSIGNED_INT: GLenum;
	readonly FLOAT: GLenum;

	readonly DEPTH_COMPONENT: GLenum;
	readonly ALPHA: GLenum;
	readonly RGB: GLenum;
	readonly RGBA: GLenum;
	readonly LUMINANCE: GLenum;
	readonly LUMINANCE_ALPHA: GLenum;

	readonly UNSIGNED_SHORT_4_4_4_4: GLenum;
	readonly UNSIGNED_SHORT_5_5_5_1: GLenum;
	readonly UNSIGNED_SHORT_5_6_5: GLenum;

	readonly FRAGMENT_SHADER: GLenum;
	readonly VERTEX_SHADER: GLenum;
	readonly MAX_VERTEX_ATTRIBS: GLenum;
	readonly MAX_VERTEX_UNIFORM_VECTORS: GLenum;
	readonly MAX_VARYING_VECTORS: GLenum;
	readonly MAX_COMBINED_TEXTURE_IMAGE_UNITS: GLenum;
	readonly MAX_VERTEX_TEXTURE_IMAGE_UNITS: GLenum;
	readonly MAX_TEXTURE_IMAGE_UNITS: GLenum;
	readonly MAX_FRAGMENT_UNIFORM_VECTORS: GLenum;
	readonly SHADER_TYPE: GLenum;
	readonly DELETE_STATUS: GLenum;
	readonly LINK_STATUS: GLenum;
	readonly VALIDATE_STATUS: GLenum;
	readonly ATTACHED_SHADERS: GLenum;
	readonly ACTIVE_UNIFORMS: GLenum;
	readonly ACTIVE_ATTRIBUTES: GLenum;
	readonly SHADING_LANGUAGE_VERSION: GLenum;
	readonly CURRENT_PROGRAM: GLenum;

	readonly NEVER: GLenum;
	readonly LESS: GLenum;
	readonly EQUAL: GLenum;
	readonly LEQUAL: GLenum;
	readonly GREATER: GLenum;
	readonly NOTEQUAL: GLenum;
	readonly GEQUAL: GLenum;
	readonly ALWAYS: GLenum;
	readonly KEEP: GLenum;

	readonly REPLACE: GLenum;
	readonly INCR: GLenum;
	readonly DECR: GLenum;
	readonly INVERT: GLenum;
	readonly INCR_WRAP: GLenum;
	readonly DECR_WRAP: GLenum;

	readonly VENDOR: GLenum;
	readonly RENDERER: GLenum;
	readonly VERSION: GLenum;

	readonly NEAREST: GLenum;
	readonly LINEAR: GLenum;

	readonly NEAREST_MIPMAP_NEAREST: GLenum;
	readonly LINEAR_MIPMAP_NEAREST: GLenum;
	readonly NEAREST_MIPMAP_LINEAR: GLenum;
	readonly LINEAR_MIPMAP_LINEAR: GLenum;

	readonly TEXTURE_MAG_FILTER: GLenum;
	readonly TEXTURE_MIN_FILTER: GLenum;
	readonly TEXTURE_WRAP_S: GLenum;
	readonly TEXTURE_WRAP_T: GLenum;

	readonly TEXTURE_2D: GLenum;
	readonly TEXTURE: GLenum;

	readonly TEXTURE_CUBE_MAP: GLenum;
	readonly TEXTURE_BINDING_CUBE_MAP: GLenum;
	readonly TEXTURE_CUBE_MAP_POSITIVE_X: GLenum;
	readonly TEXTURE_CUBE_MAP_NEGATIVE_X: GLenum;
	readonly TEXTURE_CUBE_MAP_POSITIVE_Y: GLenum;
	readonly TEXTURE_CUBE_MAP_NEGATIVE_Y: GLenum;
	readonly TEXTURE_CUBE_MAP_POSITIVE_Z: GLenum;
	readonly TEXTURE_CUBE_MAP_NEGATIVE_Z: GLenum;
	readonly MAX_CUBE_MAP_TEXTURE_SIZE: GLenum;

	readonly TEXTURE0: GLenum;
	readonly TEXTURE1: GLenum;
	readonly TEXTURE2: GLenum;
	readonly TEXTURE3: GLenum;
	readonly TEXTURE4: GLenum;
	readonly TEXTURE5: GLenum;
	readonly TEXTURE6: GLenum;
	readonly TEXTURE7: GLenum;
	readonly TEXTURE8: GLenum;
	readonly TEXTURE9: GLenum;
	readonly TEXTURE10: GLenum;
	readonly TEXTURE11: GLenum;
	readonly TEXTURE12: GLenum;
	readonly TEXTURE13: GLenum;
	readonly TEXTURE14: GLenum;
	readonly TEXTURE15: GLenum;
	readonly TEXTURE16: GLenum;
	readonly TEXTURE17: GLenum;
	readonly TEXTURE18: GLenum;
	readonly TEXTURE19: GLenum;
	readonly TEXTURE20: GLenum;
	readonly TEXTURE21: GLenum;
	readonly TEXTURE22: GLenum;
	readonly TEXTURE23: GLenum;
	readonly TEXTURE24: GLenum;
	readonly TEXTURE25: GLenum;
	readonly TEXTURE26: GLenum;
	readonly TEXTURE27: GLenum;
	readonly TEXTURE28: GLenum;
	readonly TEXTURE29: GLenum;
	readonly TEXTURE30: GLenum;
	readonly TEXTURE31: GLenum;
	readonly ACTIVE_TEXTURE: GLenum;

	readonly REPEAT: GLenum;
	readonly CLAMP_TO_EDGE: GLenum;
	readonly MIRRORED_REPEAT: GLenum;

	readonly FLOAT_VEC2: GLenum;
	readonly FLOAT_VEC3: GLenum;
	readonly FLOAT_VEC4: GLenum;
	readonly INT_VEC2: GLenum;
	readonly INT_VEC3: GLenum;
	readonly INT_VEC4: GLenum;
	readonly BOOL: GLenum;
	readonly BOOL_VEC2: GLenum;
	readonly BOOL_VEC3: GLenum;
	readonly BOOL_VEC4: GLenum;
	readonly FLOAT_MAT2: GLenum;
	readonly FLOAT_MAT3: GLenum;
	readonly FLOAT_MAT4: GLenum;
	readonly SAMPLER_2D: GLenum;
	readonly SAMPLER_CUBE: GLenum;

	readonly VERTEX_ATTRIB_ARRAY_ENABLED: GLenum;
	readonly VERTEX_ATTRIB_ARRAY_SIZE: GLenum;
	readonly VERTEX_ATTRIB_ARRAY_STRIDE: GLenum;
	readonly VERTEX_ATTRIB_ARRAY_TYPE: GLenum;
	readonly VERTEX_ATTRIB_ARRAY_NORMALIZED: GLenum;
	readonly VERTEX_ATTRIB_ARRAY_POINTER: GLenum;
	readonly VERTEX_ATTRIB_ARRAY_BUFFER_BINDING: GLenum;

	readonly IMPLEMENTATION_COLOR_READ_TYPE: GLenum;
	readonly IMPLEMENTATION_COLOR_READ_FORMAT: GLenum;

	readonly COMPILE_STATUS: GLenum;

	readonly LOW_FLOAT: GLenum;
	readonly MEDIUM_FLOAT: GLenum;
	readonly HIGH_FLOAT: GLenum;
	readonly LOW_INT: GLenum;
	readonly MEDIUM_INT: GLenum;
	readonly HIGH_INT: GLenum;

	readonly FRAMEBUFFER: GLenum;
	readonly RENDERBUFFER: GLenum;

	readonly RGBA4: GLenum;
	readonly RGB5_A1: GLenum;
	readonly RGBA8: GLenum;
	readonly RGB565: GLenum;
	readonly DEPTH_COMPONENT16: GLenum;
	readonly STENCIL_INDEX8: GLenum;
	readonly DEPTH_STENCIL: GLenum;

	readonly RENDERBUFFER_WIDTH: GLenum;
	readonly RENDERBUFFER_HEIGHT: GLenum;
	readonly RENDERBUFFER_INTERNAL_FORMAT: GLenum;
	readonly RENDERBUFFER_RED_SIZE: GLenum;
	readonly RENDERBUFFER_GREEN_SIZE: GLenum;
	readonly RENDERBUFFER_BLUE_SIZE: GLenum;
	readonly RENDERBUFFER_ALPHA_SIZE: GLenum;
	readonly RENDERBUFFER_DEPTH_SIZE: GLenum;
	readonly RENDERBUFFER_STENCIL_SIZE: GLenum;

	readonly FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE: GLenum;
	readonly FRAMEBUFFER_ATTACHMENT_OBJECT_NAME: GLenum;
	readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL: GLenum;
	readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE: GLenum;

	readonly COLOR_ATTACHMENT0: GLenum;
	readonly DEPTH_ATTACHMENT: GLenum;
	readonly STENCIL_ATTACHMENT: GLenum;
	readonly DEPTH_STENCIL_ATTACHMENT: GLenum;

	readonly NONE: GLenum;

	readonly FRAMEBUFFER_COMPLETE: GLenum;
	readonly FRAMEBUFFER_INCOMPLETE_ATTACHMENT: GLenum;
	readonly FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: GLenum;
	readonly FRAMEBUFFER_INCOMPLETE_DIMENSIONS: GLenum;
	readonly FRAMEBUFFER_UNSUPPORTED: GLenum;

	readonly FRAMEBUFFER_BINDING: GLenum;
	readonly RENDERBUFFER_BINDING: GLenum;
	readonly MAX_RENDERBUFFER_SIZE: GLenum;

	readonly INVALID_FRAMEBUFFER_OPERATION: GLenum;

	readonly UNPACK_FLIP_Y_WEBGL: GLenum;
	readonly UNPACK_PREMULTIPLY_ALPHA_WEBGL: GLenum;
	readonly CONTEXT_LOST_WEBGL: GLenum;
	readonly UNPACK_COLORSPACE_CONVERSION_WEBGL: GLenum;
	readonly BROWSER_DEFAULT_WEBGL: GLenum;

	readonly drawingBufferWidth: GLsizei;
	readonly drawingBufferHeight: GLsizei;
	readonly drawingBufferFormat: GLenum;

	drawingBufferColorSpace: PredefinedColorSpace;
	unpackColorSpace: PredefinedColorSpace;

	getContextAttributes(): WebGLContextAttributes;
	isContextLost(): boolean;
	getSupportedExtensions(): Array<string>;
	drawingBufferStorage(sizedFormat: GLenum, width: number, height: number): undefined;
	activeTexture(texture: GLenum): undefined;
	attachShader(program: WebGLProgram, shader: WebGLShader): undefined;
	bindAttribLocation(program: WebGLProgram, index: GLuint, name: string): undefined;
	bindBuffer(target: GLenum, buffer: WebGLBuffer): undefined;
	bindFramebuffer(target: GLenum, framebuffer: WebGLFramebuffer): undefined;
	bindRenderbuffer(target: GLenum, renderbuffer: WebGLRenderbuffer): undefined;
	bindTexture(target: GLenum, texture: WebGLTexture): undefined;
	blendColor(red: GLclampf, green: GLclampf, blue: GLclampf, alpha: GLclampf): undefined;
	blendEquation(mode: GLenum): undefined;
	blendEquationSeparate(modeRGB: GLenum, modeAlpha: GLenum): undefined;
	blendFunc(sfactor: GLenum, dfactor: GLenum): undefined;
	blendFuncSeparate(srcRGB: GLenum, dstRGB: GLenum, srcAlpha: GLenum, dstAlpha: GLenum): undefined;
	checkFramebufferStatus(target: GLenum): GLenum;
	clear(mask: GLbitfield): undefined;
	clearColor(red: GLclampf, green: GLclampf, blue: GLclampf, alpha: GLclampf): undefined;
	clearDepth(depth: GLclampf): undefined;
	clearStencil(s: GLint): undefined;
	colorMask(red: GLboolean, green: GLboolean, blue: GLboolean, alpha: GLboolean): undefined;
	compileShader(shader: WebGLShader): undefined;
	copyTexImage2D(target: GLenum, level: GLint, internalformat: GLenum, x: GLint, y: GLint, width: GLsizei, height: GLsizei, border: GLint): undefined;
	copyTexSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, x: GLint, y: GLint, width: GLsizei, height: GLsizei): undefined;
	createBuffer(): WebGLBuffer;
	createFramebuffer(): WebGLFramebuffer;
	createProgram(): WebGLProgram;
	createRenderbuffer(): WebGLRenderbuffer;
	createShader(type: GLenum): WebGLShader;
	createTexture(): WebGLTexture;
	cullFace(mode: GLenum): undefined;
	deleteBuffer(buffer: WebGLBuffer): undefined;
	deleteFramebuffer(framebuffer: WebGLFramebuffer): undefined;
	deleteProgram(program: WebGLProgram): undefined;
	deleteRenderbuffer(renderbuffer: WebGLRenderbuffer): undefined;
	deleteShader(shader: WebGLShader): undefined;
	deleteTexture(texture: WebGLTexture): undefined;
	depthFunc(func: GLenum): undefined;
	depthMask(flag: GLboolean): undefined;
	depthRange(zNear: GLclampf, zFar: GLclampf): undefined;
	detachShader(program: WebGLProgram, shader: WebGLShader): undefined;
	disable(cap: GLenum): undefined;
	disableVertexAttribArray(index: GLuint): undefined;
	drawArrays(mode: GLenum, first: GLint, count: GLsizei): undefined;
	drawElements(mode: GLenum, count: GLsizei, type: GLenum, offset: GLintptr): undefined;
	enable(cap: GLenum): undefined;
	enableVertexAttribArray(index: GLuint): undefined;
	finish(): undefined;
	flush(): undefined;
	framebufferRenderbuffer(target: GLenum, attachment: GLenum, renderbuffertarget: GLenum, renderbuffer: WebGLRenderbuffer): undefined;
	framebufferTexture2D(target: GLenum, attachment: GLenum, textarget: GLenum, texture: WebGLTexture, level: GLint): undefined;
	frontFace(mode: GLenum): undefined;
	generateMipmap(target: GLenum): undefined;
	getActiveAttrib(program: WebGLProgram, index: GLuint): WebGLActiveInfo;
	getActiveUniform(program: WebGLProgram, index: GLuint): WebGLActiveInfo;
	getAttachedShaders(program: WebGLProgram): Array<WebGLShader>;
	getAttribLocation(program: WebGLProgram, name: string): GLint;
	getBufferParameter(target: GLenum, pname: GLenum): any;
	getParameter(pname: GLenum): any;
	getError(): GLenum;
	getFramebufferAttachmentParameter(target: GLenum, attachment: GLenum, pname: GLenum): any;
	getProgramParameter(program: WebGLProgram, pname: GLenum): any;
	getProgramInfoLog(program: WebGLProgram): string;
	getRenderbufferParameter(target: GLenum, pname: GLenum): any;
	getShaderParameter(shader: WebGLShader, pname: GLenum): any;
	getShaderPrecisionFormat(shadertype: GLenum, precisiontype: GLenum): WebGLShaderPrecisionFormat;
	getShaderInfoLog(shader: WebGLShader): string;
	getShaderSource(shader: WebGLShader): string;
	getTexParameter(target: GLenum, pname: GLenum): any;
	getUniform(program: WebGLProgram, location: WebGLUniformLocation): any;
	getUniformLocation(program: WebGLProgram, name: string): WebGLUniformLocation;
	getVertexAttrib(index: GLuint, pname: GLenum): any;
	getVertexAttribOffset(index: GLuint, pname: GLenum): GLintptr;
	hint(target: GLenum, mode: GLenum): undefined;
	isBuffer(buffer: WebGLBuffer): GLboolean;
	isEnabled(cap: GLenum): GLboolean;
	isFramebuffer(framebuffer: WebGLFramebuffer): GLboolean;
	isProgram(program: WebGLProgram): GLboolean;
	isRenderbuffer(renderbuffer: WebGLRenderbuffer): GLboolean;
	isShader(shader: WebGLShader): GLboolean;
	isTexture(texture: WebGLTexture): GLboolean;
	lineWidth(width: GLfloat): undefined;
	linkProgram(program: WebGLProgram): undefined;
	pixelStorei(pname: GLenum, param: GLint): undefined;
	polygonOffset(factor: GLfloat, units: GLfloat): undefined;
	renderbufferStorage(target: GLenum, internalformat: GLenum, width: GLsizei, height: GLsizei): undefined;
	sampleCoverage(value: GLclampf, invert: GLboolean): undefined;
	scissor(x: GLint, y: GLint, width: GLsizei, height: GLsizei): undefined;
	shaderSource(shader: WebGLShader, source: string): undefined;
	stencilFunc(func: GLenum, ref: GLint, mask: GLuint): undefined;
	stencilFuncSeparate(face: GLenum, func: GLenum, ref: GLint, mask: GLuint): undefined;
	stencilMask(mask: GLuint): undefined;
	stencilMaskSeparate(face: GLenum, mask: GLuint): undefined;
	stencilOp(fail: GLenum, zfail: GLenum, zpass: GLenum): undefined;
	stencilOpSeparate(face: GLenum, fail: GLenum, zfail: GLenum, zpass: GLenum): undefined;
	texParameterf(target: GLenum, pname: GLenum, param: GLfloat): undefined;
	texParameteri(target: GLenum, pname: GLenum, param: GLint): undefined;
	uniform1f(location: WebGLUniformLocation, x: GLfloat): undefined;
	uniform2f(location: WebGLUniformLocation, x: GLfloat, y: GLfloat): undefined;
	uniform3f(location: WebGLUniformLocation, x: GLfloat, y: GLfloat, z: GLfloat): undefined;
	uniform4f(location: WebGLUniformLocation, x: GLfloat, y: GLfloat, z: GLfloat, w: GLfloat): undefined;
	uniform1i(location: WebGLUniformLocation, x: GLint): undefined;
	uniform2i(location: WebGLUniformLocation, x: GLint, y: GLint): undefined;
	uniform3i(location: WebGLUniformLocation, x: GLint, y: GLint, z: GLint): undefined;
	uniform4i(location: WebGLUniformLocation, x: GLint, y: GLint, z: GLint, w: GLint): undefined;
	useProgram(program: WebGLProgram): undefined;
	validateProgram(program: WebGLProgram): undefined;
	vertexAttrib1f(index: GLuint, x: GLfloat): undefined;
	vertexAttrib2f(index: GLuint, x: GLfloat, y: GLfloat): undefined;
	vertexAttrib3f(index: GLuint, x: GLfloat, y: GLfloat, z: GLfloat): undefined;
	vertexAttrib4f(index: GLuint, x: GLfloat, y: GLfloat, z: GLfloat, w: GLfloat): undefined;
	vertexAttrib1fv(index: GLuint, values: Float32List): undefined;
	vertexAttrib2fv(index: GLuint, values: Float32List): undefined;
	vertexAttrib3fv(index: GLuint, values: Float32List): undefined;
	vertexAttrib4fv(index: GLuint, values: Float32List): undefined;
	vertexAttribPointer(index: GLuint, size: GLint, type: GLenum, normalized: GLboolean, stride: GLsizei, offset: GLintptr): undefined;
	viewport(x: GLint, y: GLint, width: GLsizei, height: GLsizei): undefined;

	getExtension(name: 'STACKGL_resize_drawingbuffer'): STACKGL_resize_drawingbuffer | null;
	getExtension(name: 'ANGLE_instanced_arrays '): ANGLE_instanced_arrays | null;
	getExtension(name: 'OES_element_index_uint'): {} | null;
	getExtension(name: 'OES_texture_float'): OES_texture_float | null;
	getExtension(name: 'OES_texture_float_linear'): {} | null;
	getExtension(name: 'OES_vertex_array_object'): OES_vertex_array_object | null;
	getExtension(name: 'OES_standard_derivatives'): OES_standard_derivatives | null;
	getExtension(name: 'WEBGL_draw_buffers'): WEBGL_draw_buffers | null;
	getExtension(name: 'EXT_blend_minmax '): EXT_blend_minmax  | null;
	getExtension(name: 'EXT_texture_filter_anisotropic'): EXT_texture_filter_anisotropic | null;

	swap(): undefined;
}

export interface STACKGL_resize_drawingbuffer {
	resize(width: GLint, height: GLint): undefined;
}
export interface ANGLE_instanced_arrays {}
export interface OES_texture_float {}
export interface OES_vertex_array_object {}
export interface OES_standard_derivatives {}
export interface WEBGL_draw_buffers {}
export interface EXT_blend_minmax {}
export interface EXT_texture_filter_anisotropic {}

export interface WebGLRenderingContextOverloads {
	bufferData(target: GLenum, size: GLsizeiptr, usage: GLenum): undefined;
	bufferData(target: GLenum, data: AllowSharedBufferSource, usage: GLenum): undefined;
	bufferSubData(target: GLenum, offset: GLintptr, data: AllowSharedBufferSource): undefined;
	compressedTexImage2D(target: GLenum, level: GLint, internalformat: GLenum, width: GLsizei, height: GLsizei, border: GLint, data: ArrayBufferView): undefined;
	compressedTexSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei, format: GLenum, data: ArrayBufferView): undefined;
	readPixels(x: GLint, y: GLint, width: GLsizei, height: GLsizei, format: GLenum, type: GLenum, pixels: ArrayBufferView): undefined;
	texImage2D(target: GLenum, level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, border: GLint, format: GLenum, type: GLenum, pixels: ArrayBufferView): undefined;
	texSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei, format: GLenum, type: GLenum, pixels: ArrayBufferView): undefined;
	uniform1fv(location: WebGLUniformLocation, v: Float32List): undefined;
	uniform2fv(location: WebGLUniformLocation, v: Float32List): undefined;
	uniform3fv(location: WebGLUniformLocation, v: Float32List): undefined;
	uniform4fv(location: WebGLUniformLocation, v: Float32List): undefined;
	uniform1iv(location: WebGLUniformLocation, v: Int32List): undefined;
	uniform2iv(location: WebGLUniformLocation, v: Int32List): undefined;
	uniform3iv(location: WebGLUniformLocation, v: Int32List): undefined;
	uniform4iv(location: WebGLUniformLocation, v: Int32List): undefined;
	uniformMatrix2fv(location: WebGLUniformLocation, transpose: GLboolean, value: Float32List): undefined;
	uniformMatrix3fv(location: WebGLUniformLocation, transpose: GLboolean, value: Float32List): undefined;
	uniformMatrix4fv(location: WebGLUniformLocation, transpose: GLboolean, value: Float32List): undefined;
}

export interface WebGLRenderingContext extends WebGLRenderingContextBase, WebGLRenderingContextOverloads {}

export type CreateContext = (
	width: number,
	height: number,
	contextAttributes?: WebGLContextAttributes,
) => WebGLRenderingContext | null

var createContext: CreateContext;

export default createContext;

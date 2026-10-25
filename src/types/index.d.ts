declare function createContext(width: number, height: number, contextAttributes: createContext.WebGLContextAttributes & { createWebGL2Context: true, window: createContext.SDLWindow }): createContext.WebGL2RenderingContext & createContext.WindowRenderingContext | null;
declare function createContext(width: number, height: number, contextAttributes: createContext.WebGLContextAttributes & { createWebGL2Context?: false, window: createContext.SDLWindow }): createContext.WebGLRenderingContext & createContext.WindowRenderingContext | null;
declare function createContext(width: number, height: number, contextAttributes: createContext.WebGLContextAttributes & { window: createContext.SDLWindow }): (createContext.WebGLRenderingContext | createContext.WebGL2RenderingContext) & createContext.WindowRenderingContext | null;
declare function createContext(width: number, height: number, contextAttributes: createContext.WebGLContextAttributes & { createWebGL2Context: true }): createContext.WebGL2RenderingContext | null;
declare function createContext(width: number, height: number, contextAttributes?: createContext.WebGLContextAttributes & { createWebGL2Context?: false }): createContext.WebGLRenderingContext | null;
declare function createContext(width: number, height: number, contextAttributes?: createContext.WebGLContextAttributes): createContext.WebGLRenderingContext | createContext.WebGL2RenderingContext | null;

declare namespace createContext {
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

	export interface WebGLContextAttributes {
		alpha?: boolean;
		depth?: boolean;
		stencil?: boolean;
		antialias?: boolean;
		premultipliedAlpha?: boolean;
		preserveDrawingBuffer?: boolean;
		preferLowPowerToHighPerformance?: boolean;
		failIfMajorPerformanceCaveat?: boolean;
		createWebGL2Context?: boolean;
		window?: SDLWindow;
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
	export type Uint32List = Uint32Array | Array<GLuint>;
	export type GLint64 = number;
	export type GLuint64 = number;
	export type AllowSharedBufferSource = ArrayBuffer | ArrayBufferView;

	export interface SDLWindow {
		readonly destroyed?: boolean;
		readonly native: unknown;
	}

	export interface ImageDataLike {
		readonly width: number;
		readonly height: number;
		readonly data: Uint8ClampedArray | Uint8Array;
	}

	export interface CanvasLike {
		readonly width: number;
		readonly height: number;
		getContext(contextId: '2d'): { getImageData(sx: number, sy: number, sw: number, sh: number): ImageDataLike } | null;
	}

	export type TexImageSource = ImageDataLike | CanvasLike;

	export interface WebGLQuery extends WebGLObject {}
	export interface WebGLSampler extends WebGLObject {}
	export interface WebGLSync extends WebGLObject {}
	export interface WebGLTransformFeedback extends WebGLObject {}
	export interface WebGLVertexArrayObject extends WebGLObject {}

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
		canvas: any;


		getContextAttributes(): WebGLContextAttributes | null;
		isContextLost(): boolean;
		destroy(): undefined;
		resize(width: GLint, height: GLint): undefined;
		getSupportedExtensions(): Array<string> | null;
		activeTexture(texture: GLenum): undefined;
		attachShader(program: WebGLProgram, shader: WebGLShader): undefined;
		bindAttribLocation(program: WebGLProgram, index: GLuint, name: string): undefined;
		bindBuffer(target: GLenum, buffer: WebGLBuffer | null): undefined;
		bindFramebuffer(target: GLenum, framebuffer: WebGLFramebuffer | null): undefined;
		bindRenderbuffer(target: GLenum, renderbuffer: WebGLRenderbuffer | null): undefined;
		bindTexture(target: GLenum, texture: WebGLTexture | null): undefined;
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
		createBuffer(): WebGLBuffer | null;
		createFramebuffer(): WebGLFramebuffer | null;
		createProgram(): WebGLProgram | null;
		createRenderbuffer(): WebGLRenderbuffer | null;
		createShader(type: GLenum): WebGLShader | null;
		createTexture(): WebGLTexture | null;
		cullFace(mode: GLenum): undefined;
		deleteBuffer(buffer: WebGLBuffer | null): undefined;
		deleteFramebuffer(framebuffer: WebGLFramebuffer | null): undefined;
		deleteProgram(program: WebGLProgram | null): undefined;
		deleteRenderbuffer(renderbuffer: WebGLRenderbuffer | null): undefined;
		deleteShader(shader: WebGLShader | null): undefined;
		deleteTexture(texture: WebGLTexture | null): undefined;
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
		framebufferRenderbuffer(target: GLenum, attachment: GLenum, renderbuffertarget: GLenum, renderbuffer: WebGLRenderbuffer | null): undefined;
		framebufferTexture2D(target: GLenum, attachment: GLenum, textarget: GLenum, texture: WebGLTexture | null, level: GLint): undefined;
		frontFace(mode: GLenum): undefined;
		generateMipmap(target: GLenum): undefined;
		getActiveAttrib(program: WebGLProgram, index: GLuint): WebGLActiveInfo | null;
		getActiveUniform(program: WebGLProgram, index: GLuint): WebGLActiveInfo | null;
		getAttachedShaders(program: WebGLProgram): Array<WebGLShader> | null;
		getAttribLocation(program: WebGLProgram, name: string): GLint;
		getBufferParameter(target: GLenum, pname: GLenum): any;
		getParameter(pname: GLenum): any;
		getError(): GLenum;
		getFramebufferAttachmentParameter(target: GLenum, attachment: GLenum, pname: GLenum): any;
		getProgramParameter(program: WebGLProgram, pname: GLenum): any;
		getProgramInfoLog(program: WebGLProgram): string | null;
		getRenderbufferParameter(target: GLenum, pname: GLenum): any;
		getShaderParameter(shader: WebGLShader, pname: GLenum): any;
		getShaderPrecisionFormat(shadertype: GLenum, precisiontype: GLenum): WebGLShaderPrecisionFormat | null;
		getShaderInfoLog(shader: WebGLShader): string | null;
		getShaderSource(shader: WebGLShader): string | null;
		getTexParameter(target: GLenum, pname: GLenum): any;
		getUniform(program: WebGLProgram, location: WebGLUniformLocation): any;
		getUniformLocation(program: WebGLProgram, name: string): WebGLUniformLocation | null;
		getVertexAttrib(index: GLuint, pname: GLenum): any;
		getVertexAttribOffset(index: GLuint, pname: GLenum): GLintptr;
		hint(target: GLenum, mode: GLenum): undefined;
		isBuffer(buffer: WebGLBuffer | null): GLboolean;
		isEnabled(cap: GLenum): GLboolean;
		isFramebuffer(framebuffer: WebGLFramebuffer | null): GLboolean;
		isProgram(program: WebGLProgram | null): GLboolean;
		isRenderbuffer(renderbuffer: WebGLRenderbuffer | null): GLboolean;
		isShader(shader: WebGLShader | null): GLboolean;
		isTexture(texture: WebGLTexture | null): GLboolean;
		lineWidth(width: GLfloat): undefined;
		linkProgram(program: WebGLProgram): undefined;
		pixelStorei(pname: GLenum, param: GLint | GLboolean): undefined;
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
		uniform1f(location: WebGLUniformLocation | null, x: GLfloat): undefined;
		uniform2f(location: WebGLUniformLocation | null, x: GLfloat, y: GLfloat): undefined;
		uniform3f(location: WebGLUniformLocation | null, x: GLfloat, y: GLfloat, z: GLfloat): undefined;
		uniform4f(location: WebGLUniformLocation | null, x: GLfloat, y: GLfloat, z: GLfloat, w: GLfloat): undefined;
		uniform1i(location: WebGLUniformLocation | null, x: GLint): undefined;
		uniform2i(location: WebGLUniformLocation | null, x: GLint, y: GLint): undefined;
		uniform3i(location: WebGLUniformLocation | null, x: GLint, y: GLint, z: GLint): undefined;
		uniform4i(location: WebGLUniformLocation | null, x: GLint, y: GLint, z: GLint, w: GLint): undefined;
		useProgram(program: WebGLProgram | null): undefined;
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

		getExtension(name: 'STACKGL_destroy_context'): STACKGL_destroy_context | null;
		getExtension(name: 'STACKGL_resize_drawingbuffer'): STACKGL_resize_drawingbuffer | null;
		getExtension(name: 'ANGLE_instanced_arrays'): ANGLE_instanced_arrays | null;
		getExtension(name: 'OES_element_index_uint'): OES_element_index_uint | null;
		getExtension(name: 'OES_texture_float'): OES_texture_float | null;
		getExtension(name: 'OES_texture_float_linear'): OES_texture_float_linear | null;
		getExtension(name: 'OES_vertex_array_object'): OES_vertex_array_object | null;
		getExtension(name: 'OES_standard_derivatives'): OES_standard_derivatives | null;
		getExtension(name: 'WEBGL_draw_buffers'): WEBGL_draw_buffers | null;
		getExtension(name: 'EXT_blend_minmax'): EXT_blend_minmax | null;
		getExtension(name: 'EXT_texture_filter_anisotropic'): EXT_texture_filter_anisotropic | null;
		getExtension(name: 'EXT_shader_texture_lod'): EXT_shader_texture_lod | null;
		getExtension(name: 'EXT_color_buffer_float'): EXT_color_buffer_float | null;
		getExtension(name: 'EXT_color_buffer_half_float'): EXT_color_buffer_half_float | null;
		getExtension(name: 'WEBGL_lose_context'): WEBGL_lose_context | null;
		getExtension(name: 'WEBGL_compressed_texture_s3tc'): WEBGL_compressed_texture_s3tc | null;
		getExtension(name: 'WEBGL_compressed_texture_s3tc_srgb'): WEBGL_compressed_texture_s3tc_srgb | null;
		getExtension(name: 'WEBGL_compressed_texture_etc'): WEBGL_compressed_texture_etc | null;
		getExtension(name: 'WEBGL_compressed_texture_astc'): WEBGL_compressed_texture_astc | null;
		getExtension(name: 'EXT_texture_compression_bptc'): EXT_texture_compression_bptc | null;
		getExtension(name: 'EXT_texture_compression_rgtc'): EXT_texture_compression_rgtc | null;
		getExtension(name: string): object | null;
	}

	export interface WindowRenderingContext {
		swap(): undefined;
	}

	export interface STACKGL_destroy_context {
		destroy(): undefined;
	}
	export interface STACKGL_resize_drawingbuffer {
		resize(width: GLint, height: GLint): undefined;
	}
	export interface ANGLE_instanced_arrays {
		readonly VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE: GLenum;
		drawArraysInstancedANGLE(mode: GLenum, first: GLint, count: GLsizei, primcount: GLsizei): undefined;
		drawElementsInstancedANGLE(mode: GLenum, count: GLsizei, type: GLenum, offset: GLintptr, primcount: GLsizei): undefined;
		vertexAttribDivisorANGLE(index: GLuint, divisor: GLuint): undefined;
	}
	export interface OES_element_index_uint {}
	export interface OES_texture_float {}
	export interface OES_texture_float_linear {}
	export interface OES_vertex_array_object {
		readonly VERTEX_ARRAY_BINDING_OES: GLenum;
		createVertexArrayOES(): WebGLVertexArrayObject | null;
		deleteVertexArrayOES(arrayObject: WebGLVertexArrayObject | null): undefined;
		isVertexArrayOES(arrayObject: WebGLVertexArrayObject | null): GLboolean;
		bindVertexArrayOES(arrayObject: WebGLVertexArrayObject | null): undefined;
	}
	export interface OES_standard_derivatives {
		readonly FRAGMENT_SHADER_DERIVATIVE_HINT_OES: GLenum;
	}
	export interface WEBGL_draw_buffers {
		readonly COLOR_ATTACHMENT0_WEBGL: GLenum;
		readonly COLOR_ATTACHMENT1_WEBGL: GLenum;
		readonly COLOR_ATTACHMENT2_WEBGL: GLenum;
		readonly COLOR_ATTACHMENT3_WEBGL: GLenum;
		readonly COLOR_ATTACHMENT4_WEBGL: GLenum;
		readonly COLOR_ATTACHMENT5_WEBGL: GLenum;
		readonly COLOR_ATTACHMENT6_WEBGL: GLenum;
		readonly COLOR_ATTACHMENT7_WEBGL: GLenum;
		readonly COLOR_ATTACHMENT8_WEBGL: GLenum;
		readonly COLOR_ATTACHMENT9_WEBGL: GLenum;
		readonly COLOR_ATTACHMENT10_WEBGL: GLenum;
		readonly COLOR_ATTACHMENT11_WEBGL: GLenum;
		readonly COLOR_ATTACHMENT12_WEBGL: GLenum;
		readonly COLOR_ATTACHMENT13_WEBGL: GLenum;
		readonly COLOR_ATTACHMENT14_WEBGL: GLenum;
		readonly COLOR_ATTACHMENT15_WEBGL: GLenum;
		readonly DRAW_BUFFER0_WEBGL: GLenum;
		readonly DRAW_BUFFER1_WEBGL: GLenum;
		readonly DRAW_BUFFER2_WEBGL: GLenum;
		readonly DRAW_BUFFER3_WEBGL: GLenum;
		readonly DRAW_BUFFER4_WEBGL: GLenum;
		readonly DRAW_BUFFER5_WEBGL: GLenum;
		readonly DRAW_BUFFER6_WEBGL: GLenum;
		readonly DRAW_BUFFER7_WEBGL: GLenum;
		readonly DRAW_BUFFER8_WEBGL: GLenum;
		readonly DRAW_BUFFER9_WEBGL: GLenum;
		readonly DRAW_BUFFER10_WEBGL: GLenum;
		readonly DRAW_BUFFER11_WEBGL: GLenum;
		readonly DRAW_BUFFER12_WEBGL: GLenum;
		readonly DRAW_BUFFER13_WEBGL: GLenum;
		readonly DRAW_BUFFER14_WEBGL: GLenum;
		readonly DRAW_BUFFER15_WEBGL: GLenum;
		readonly MAX_COLOR_ATTACHMENTS_WEBGL: GLenum;
		readonly MAX_DRAW_BUFFERS_WEBGL: GLenum;
		drawBuffersWEBGL(buffers: GLenum[]): undefined;
	}
	export interface EXT_blend_minmax {
		readonly MIN_EXT: GLenum;
		readonly MAX_EXT: GLenum;
	}
	export interface EXT_texture_filter_anisotropic {
		readonly TEXTURE_MAX_ANISOTROPY_EXT: GLenum;
		readonly MAX_TEXTURE_MAX_ANISOTROPY_EXT: GLenum;
	}
	export interface EXT_shader_texture_lod {}
	export interface EXT_color_buffer_float {}
	export interface EXT_color_buffer_half_float {
		readonly RGBA16F_EXT: GLenum;
		readonly RGB16F_EXT: GLenum;
		readonly FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT: GLenum;
		readonly UNSIGNED_NORMALIZED_EXT: GLenum;
	}
	export interface WEBGL_lose_context {
		loseContext(): undefined;
		restoreContext(): undefined;
	}
	export interface WEBGL_compressed_texture_s3tc {
		readonly COMPRESSED_RGB_S3TC_DXT1_EXT: GLenum;
		readonly COMPRESSED_RGBA_S3TC_DXT1_EXT: GLenum;
		readonly COMPRESSED_RGBA_S3TC_DXT3_EXT: GLenum;
		readonly COMPRESSED_RGBA_S3TC_DXT5_EXT: GLenum;
	}
	export interface WEBGL_compressed_texture_s3tc_srgb {
		readonly COMPRESSED_SRGB_S3TC_DXT1_EXT: GLenum;
		readonly COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT: GLenum;
		readonly COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT: GLenum;
		readonly COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT: GLenum;
	}
	export interface WEBGL_compressed_texture_etc {
		readonly COMPRESSED_R11_EAC: GLenum;
		readonly COMPRESSED_SIGNED_R11_EAC: GLenum;
		readonly COMPRESSED_RG11_EAC: GLenum;
		readonly COMPRESSED_SIGNED_RG11_EAC: GLenum;
		readonly COMPRESSED_RGB8_ETC2: GLenum;
		readonly COMPRESSED_SRGB8_ETC2: GLenum;
		readonly COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2: GLenum;
		readonly COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2: GLenum;
		readonly COMPRESSED_RGBA8_ETC2_EAC: GLenum;
		readonly COMPRESSED_SRGB8_ALPHA8_ETC2_EAC: GLenum;
	}
	export interface WEBGL_compressed_texture_astc {
		readonly COMPRESSED_RGBA_ASTC_4x4_KHR: GLenum;
		readonly COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR: GLenum;
		readonly COMPRESSED_RGBA_ASTC_5x4_KHR: GLenum;
		readonly COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR: GLenum;
		readonly COMPRESSED_RGBA_ASTC_5x5_KHR: GLenum;
		readonly COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR: GLenum;
		readonly COMPRESSED_RGBA_ASTC_6x5_KHR: GLenum;
		readonly COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR: GLenum;
		readonly COMPRESSED_RGBA_ASTC_6x6_KHR: GLenum;
		readonly COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR: GLenum;
		readonly COMPRESSED_RGBA_ASTC_8x5_KHR: GLenum;
		readonly COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR: GLenum;
		readonly COMPRESSED_RGBA_ASTC_8x6_KHR: GLenum;
		readonly COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR: GLenum;
		readonly COMPRESSED_RGBA_ASTC_8x8_KHR: GLenum;
		readonly COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR: GLenum;
		readonly COMPRESSED_RGBA_ASTC_10x5_KHR: GLenum;
		readonly COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR: GLenum;
		readonly COMPRESSED_RGBA_ASTC_10x6_KHR: GLenum;
		readonly COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR: GLenum;
		readonly COMPRESSED_RGBA_ASTC_10x8_KHR: GLenum;
		readonly COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR: GLenum;
		readonly COMPRESSED_RGBA_ASTC_10x10_KHR: GLenum;
		readonly COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR: GLenum;
		readonly COMPRESSED_RGBA_ASTC_12x10_KHR: GLenum;
		readonly COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR: GLenum;
		readonly COMPRESSED_RGBA_ASTC_12x12_KHR: GLenum;
		readonly COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR: GLenum;
		getSupportedProfiles(): string[];
	}
	export interface EXT_texture_compression_bptc {
		readonly COMPRESSED_RGBA_BPTC_UNORM_EXT: GLenum;
		readonly COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT: GLenum;
		readonly COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT: GLenum;
		readonly COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT: GLenum;
	}
	export interface EXT_texture_compression_rgtc {
		readonly COMPRESSED_RED_RGTC1_EXT: GLenum;
		readonly COMPRESSED_SIGNED_RED_RGTC1_EXT: GLenum;
		readonly COMPRESSED_RED_GREEN_RGTC2_EXT: GLenum;
		readonly COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT: GLenum;
	}

	export interface WebGLRenderingContextOverloads {
		bufferData(target: GLenum, size: GLsizeiptr, usage: GLenum): undefined;
		bufferData(target: GLenum, data: AllowSharedBufferSource, usage: GLenum): undefined;
		bufferSubData(target: GLenum, offset: GLintptr, data: AllowSharedBufferSource): undefined;
		compressedTexImage2D(target: GLenum, level: GLint, internalformat: GLenum, width: GLsizei, height: GLsizei, border: GLint, data: ArrayBufferView): undefined;
		compressedTexSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei, format: GLenum, data: ArrayBufferView): undefined;
		readPixels(x: GLint, y: GLint, width: GLsizei, height: GLsizei, format: GLenum, type: GLenum, pixels: ArrayBufferView): undefined;
		texImage2D(target: GLenum, level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, border: GLint, format: GLenum, type: GLenum, pixels: ArrayBufferView | null): undefined;
		texImage2D(target: GLenum, level: GLint, internalformat: GLint, format: GLenum, type: GLenum, source: TexImageSource): undefined;
		texSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei, format: GLenum, type: GLenum, pixels: ArrayBufferView | null): undefined;
		texSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, format: GLenum, type: GLenum, source: TexImageSource): undefined;
		uniform1fv(location: WebGLUniformLocation | null, v: Float32List): undefined;
		uniform2fv(location: WebGLUniformLocation | null, v: Float32List): undefined;
		uniform3fv(location: WebGLUniformLocation | null, v: Float32List): undefined;
		uniform4fv(location: WebGLUniformLocation | null, v: Float32List): undefined;
		uniform1iv(location: WebGLUniformLocation | null, v: Int32List): undefined;
		uniform2iv(location: WebGLUniformLocation | null, v: Int32List): undefined;
		uniform3iv(location: WebGLUniformLocation | null, v: Int32List): undefined;
		uniform4iv(location: WebGLUniformLocation | null, v: Int32List): undefined;
		uniformMatrix2fv(location: WebGLUniformLocation | null, transpose: GLboolean, value: Float32List): undefined;
		uniformMatrix3fv(location: WebGLUniformLocation | null, transpose: GLboolean, value: Float32List): undefined;
		uniformMatrix4fv(location: WebGLUniformLocation | null, transpose: GLboolean, value: Float32List): undefined;
	}

	export interface WebGLRenderingContext extends WebGLRenderingContextBase, WebGLRenderingContextOverloads {}

	export interface WebGL2RenderingContextBase {
		readonly RGBA8: GLenum;
		beginQuery(target: GLenum, query: WebGLQuery): undefined;
		beginTransformFeedback(primitiveMode: GLenum): undefined;
		bindBufferBase(target: GLenum, index: GLuint, buffer: WebGLBuffer | null): undefined;
		bindBufferRange(target: GLenum, index: GLuint, buffer: WebGLBuffer | null, offset: GLintptr, size: GLsizeiptr): undefined;
		bindSampler(unit: GLuint, sampler: WebGLSampler | null): undefined;
		bindTransformFeedback(target: GLenum, tf: WebGLTransformFeedback | null): undefined;
		bindVertexArray(array: WebGLVertexArrayObject | null): undefined;
		blitFramebuffer(srcX0: GLint, srcY0: GLint, srcX1: GLint, srcY1: GLint, dstX0: GLint, dstY0: GLint, dstX1: GLint, dstY1: GLint, mask: GLbitfield, filter: GLenum): undefined;
		clearBufferfi(buffer: GLenum, drawbuffer: GLint, depth: GLfloat, stencil: GLint): undefined;
		clearBufferfv(buffer: GLenum, drawbuffer: GLint, values: Float32List, srcOffset?: number): undefined;
		clearBufferiv(buffer: GLenum, drawbuffer: GLint, values: Int32List, srcOffset?: number): undefined;
		clearBufferuiv(buffer: GLenum, drawbuffer: GLint, values: Uint32List, srcOffset?: number): undefined;
		clientWaitSync(sync: WebGLSync, flags: GLbitfield, timeout: GLuint64): GLenum;
		compressedTexImage3D(target: GLenum, level: GLint, internalformat: GLenum, width: GLsizei, height: GLsizei, depth: GLsizei, border: GLint, imageSize: GLsizei, offset: GLintptr): undefined;
		compressedTexImage3D(target: GLenum, level: GLint, internalformat: GLenum, width: GLsizei, height: GLsizei, depth: GLsizei, border: GLint, srcData: ArrayBufferView, srcOffset?: number, srcLengthOverride?: GLuint): undefined;
		compressedTexSubImage3D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, zoffset: GLint, width: GLsizei, height: GLsizei, depth: GLsizei, format: GLenum, imageSize: GLsizei, offset: GLintptr): undefined;
		compressedTexSubImage3D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, zoffset: GLint, width: GLsizei, height: GLsizei, depth: GLsizei, format: GLenum, srcData: ArrayBufferView, srcOffset?: number, srcLengthOverride?: GLuint): undefined;
		copyBufferSubData(readTarget: GLenum, writeTarget: GLenum, readOffset: GLintptr, writeOffset: GLintptr, size: GLsizeiptr): undefined;
		copyTexSubImage3D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, zoffset: GLint, x: GLint, y: GLint, width: GLsizei, height: GLsizei): undefined;
		createQuery(): WebGLQuery | null;
		createSampler(): WebGLSampler | null;
		createTransformFeedback(): WebGLTransformFeedback | null;
		createVertexArray(): WebGLVertexArrayObject | null;
		deleteQuery(query: WebGLQuery | null): undefined;
		deleteSampler(sampler: WebGLSampler | null): undefined;
		deleteSync(sync: WebGLSync | null): undefined;
		deleteTransformFeedback(tf: WebGLTransformFeedback | null): undefined;
		deleteVertexArray(vertexArray: WebGLVertexArrayObject | null): undefined;
		drawArraysInstanced(mode: GLenum, first: GLint, count: GLsizei, instanceCount: GLsizei): undefined;
		drawBuffers(buffers: GLenum[]): undefined;
		drawElementsInstanced(mode: GLenum, count: GLsizei, type: GLenum, offset: GLintptr, instanceCount: GLsizei): undefined;
		drawRangeElements(mode: GLenum, start: GLuint, end: GLuint, count: GLsizei, type: GLenum, offset: GLintptr): undefined;
		endQuery(target: GLenum): undefined;
		endTransformFeedback(): undefined;
		fenceSync(condition: GLenum, flags: GLbitfield): WebGLSync | null;
		framebufferTextureLayer(target: GLenum, attachment: GLenum, texture: WebGLTexture | null, level: GLint, layer: GLint): undefined;
		getActiveUniformBlockName(program: WebGLProgram, uniformBlockIndex: GLuint): string | null;
		getActiveUniformBlockParameter(program: WebGLProgram, uniformBlockIndex: GLuint, pname: GLenum): any;
		getActiveUniforms(program: WebGLProgram, uniformIndices: Iterable<GLuint>, pname: GLenum): any;
		getBufferSubData(target: GLenum, srcByteOffset: GLintptr, dstBuffer: ArrayBufferView, dstOffset?: number, length?: GLuint): undefined;
		getFragDataLocation(program: WebGLProgram, name: string): GLint;
		getIndexedParameter(target: GLenum, index: GLuint): any;
		getInternalformatParameter(target: GLenum, internalformat: GLenum, pname: GLenum): any;
		getQuery(target: GLenum, pname: GLenum): WebGLQuery | null;
		getQueryParameter(query: WebGLQuery, pname: GLenum): any;
		getSamplerParameter(sampler: WebGLSampler, pname: GLenum): any;
		getSyncParameter(sync: WebGLSync, pname: GLenum): any;
		getTransformFeedbackVarying(program: WebGLProgram, index: GLuint): WebGLActiveInfo | null;
		getUniformBlockIndex(program: WebGLProgram, uniformBlockName: string): GLuint;
		getUniformIndices(program: WebGLProgram, uniformNames: Iterable<string>): GLuint[] | null;
		invalidateFramebuffer(target: GLenum, attachments: GLenum[]): undefined;
		invalidateSubFramebuffer(target: GLenum, attachments: GLenum[], x: GLint, y: GLint, width: GLsizei, height: GLsizei): undefined;
		isQuery(query: WebGLQuery | null): GLboolean;
		isSampler(sampler: WebGLSampler | null): GLboolean;
		isSync(sync: WebGLSync | null): GLboolean;
		isTransformFeedback(tf: WebGLTransformFeedback | null): GLboolean;
		isVertexArray(vertexArray: WebGLVertexArrayObject | null): GLboolean;
		pauseTransformFeedback(): undefined;
		readBuffer(src: GLenum): undefined;
		renderbufferStorageMultisample(target: GLenum, samples: GLsizei, internalformat: GLenum, width: GLsizei, height: GLsizei): undefined;
		resumeTransformFeedback(): undefined;
		samplerParameterf(sampler: WebGLSampler, pname: GLenum, param: GLfloat): undefined;
		samplerParameteri(sampler: WebGLSampler, pname: GLenum, param: GLint): undefined;
		texImage3D(target: GLenum, level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, depth: GLsizei, border: GLint, format: GLenum, type: GLenum, srcData: ArrayBufferView | null): undefined;
		texImage3D(target: GLenum, level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, depth: GLsizei, border: GLint, format: GLenum, type: GLenum, pboOffset: GLintptr): undefined;
		texImage3D(target: GLenum, level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, depth: GLsizei, border: GLint, format: GLenum, type: GLenum, source: TexImageSource): undefined;
		texImage3D(target: GLenum, level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, depth: GLsizei, border: GLint, format: GLenum, type: GLenum, srcData: ArrayBufferView, srcOffset: number): undefined;
		texStorage2D(target: GLenum, levels: GLsizei, internalformat: GLenum, width: GLsizei, height: GLsizei): undefined;
		texStorage3D(target: GLenum, levels: GLsizei, internalformat: GLenum, width: GLsizei, height: GLsizei, depth: GLsizei): undefined;
		texSubImage3D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, zoffset: GLint, width: GLsizei, height: GLsizei, depth: GLsizei, format: GLenum, type: GLenum, srcData: ArrayBufferView | null): undefined;
		texSubImage3D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, zoffset: GLint, width: GLsizei, height: GLsizei, depth: GLsizei, format: GLenum, type: GLenum, pboOffset: GLintptr): undefined;
		texSubImage3D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, zoffset: GLint, width: GLsizei, height: GLsizei, depth: GLsizei, format: GLenum, type: GLenum, source: TexImageSource): undefined;
		texSubImage3D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, zoffset: GLint, width: GLsizei, height: GLsizei, depth: GLsizei, format: GLenum, type: GLenum, srcData: ArrayBufferView, srcOffset: number): undefined;
		transformFeedbackVaryings(program: WebGLProgram, varyings: string[], bufferMode: GLenum): undefined;
		uniform1ui(location: WebGLUniformLocation | null, v0: GLuint): undefined;
		uniform1uiv(location: WebGLUniformLocation | null, data: Uint32List, srcOffset?: number, srcLength?: GLuint): undefined;
		uniform2ui(location: WebGLUniformLocation | null, v0: GLuint, v1: GLuint): undefined;
		uniform2uiv(location: WebGLUniformLocation | null, data: Uint32List, srcOffset?: number, srcLength?: GLuint): undefined;
		uniform3ui(location: WebGLUniformLocation | null, v0: GLuint, v1: GLuint, v2: GLuint): undefined;
		uniform3uiv(location: WebGLUniformLocation | null, data: Uint32List, srcOffset?: number, srcLength?: GLuint): undefined;
		uniform4ui(location: WebGLUniformLocation | null, v0: GLuint, v1: GLuint, v2: GLuint, v3: GLuint): undefined;
		uniform4uiv(location: WebGLUniformLocation | null, data: Uint32List, srcOffset?: number, srcLength?: GLuint): undefined;
		uniformBlockBinding(program: WebGLProgram, uniformBlockIndex: GLuint, uniformBlockBinding: GLuint): undefined;
		uniformMatrix2x3fv(location: WebGLUniformLocation | null, transpose: GLboolean, data: Float32List, srcOffset?: number, srcLength?: GLuint): undefined;
		uniformMatrix2x4fv(location: WebGLUniformLocation | null, transpose: GLboolean, data: Float32List, srcOffset?: number, srcLength?: GLuint): undefined;
		uniformMatrix3x2fv(location: WebGLUniformLocation | null, transpose: GLboolean, data: Float32List, srcOffset?: number, srcLength?: GLuint): undefined;
		uniformMatrix3x4fv(location: WebGLUniformLocation | null, transpose: GLboolean, data: Float32List, srcOffset?: number, srcLength?: GLuint): undefined;
		uniformMatrix4x2fv(location: WebGLUniformLocation | null, transpose: GLboolean, data: Float32List, srcOffset?: number, srcLength?: GLuint): undefined;
		uniformMatrix4x3fv(location: WebGLUniformLocation | null, transpose: GLboolean, data: Float32List, srcOffset?: number, srcLength?: GLuint): undefined;
		vertexAttribDivisor(index: GLuint, divisor: GLuint): undefined;
		vertexAttribI4i(index: GLuint, x: GLint, y: GLint, z: GLint, w: GLint): undefined;
		vertexAttribI4iv(index: GLuint, values: Int32List): undefined;
		vertexAttribI4ui(index: GLuint, x: GLuint, y: GLuint, z: GLuint, w: GLuint): undefined;
		vertexAttribI4uiv(index: GLuint, values: Uint32List): undefined;
		vertexAttribIPointer(index: GLuint, size: GLint, type: GLenum, stride: GLsizei, offset: GLintptr): undefined;
		waitSync(sync: WebGLSync, flags: GLbitfield, timeout: GLint64): undefined;
		readonly READ_BUFFER: 0x0C02;
		readonly UNPACK_ROW_LENGTH: 0x0CF2;
		readonly UNPACK_SKIP_ROWS: 0x0CF3;
		readonly UNPACK_SKIP_PIXELS: 0x0CF4;
		readonly PACK_ROW_LENGTH: 0x0D02;
		readonly PACK_SKIP_ROWS: 0x0D03;
		readonly PACK_SKIP_PIXELS: 0x0D04;
		readonly COLOR: 0x1800;
		readonly DEPTH: 0x1801;
		readonly STENCIL: 0x1802;
		readonly RED: 0x1903;
		readonly RGB8: 0x8051;
		readonly RGB10_A2: 0x8059;
		readonly TEXTURE_BINDING_3D: 0x806A;
		readonly UNPACK_SKIP_IMAGES: 0x806D;
		readonly UNPACK_IMAGE_HEIGHT: 0x806E;
		readonly TEXTURE_3D: 0x806F;
		readonly TEXTURE_WRAP_R: 0x8072;
		readonly MAX_3D_TEXTURE_SIZE: 0x8073;
		readonly UNSIGNED_INT_2_10_10_10_REV: 0x8368;
		readonly MAX_ELEMENTS_VERTICES: 0x80E8;
		readonly MAX_ELEMENTS_INDICES: 0x80E9;
		readonly TEXTURE_MIN_LOD: 0x813A;
		readonly TEXTURE_MAX_LOD: 0x813B;
		readonly TEXTURE_BASE_LEVEL: 0x813C;
		readonly TEXTURE_MAX_LEVEL: 0x813D;
		readonly MIN: 0x8007;
		readonly MAX: 0x8008;
		readonly DEPTH_COMPONENT24: 0x81A6;
		readonly MAX_TEXTURE_LOD_BIAS: 0x84FD;
		readonly TEXTURE_COMPARE_MODE: 0x884C;
		readonly TEXTURE_COMPARE_FUNC: 0x884D;
		readonly CURRENT_QUERY: 0x8865;
		readonly QUERY_RESULT: 0x8866;
		readonly QUERY_RESULT_AVAILABLE: 0x8867;
		readonly STREAM_READ: 0x88E1;
		readonly STREAM_COPY: 0x88E2;
		readonly STATIC_READ: 0x88E5;
		readonly STATIC_COPY: 0x88E6;
		readonly DYNAMIC_READ: 0x88E9;
		readonly DYNAMIC_COPY: 0x88EA;
		readonly MAX_DRAW_BUFFERS: 0x8824;
		readonly DRAW_BUFFER0: 0x8825;
		readonly DRAW_BUFFER1: 0x8826;
		readonly DRAW_BUFFER2: 0x8827;
		readonly DRAW_BUFFER3: 0x8828;
		readonly DRAW_BUFFER4: 0x8829;
		readonly DRAW_BUFFER5: 0x882A;
		readonly DRAW_BUFFER6: 0x882B;
		readonly DRAW_BUFFER7: 0x882C;
		readonly DRAW_BUFFER8: 0x882D;
		readonly DRAW_BUFFER9: 0x882E;
		readonly DRAW_BUFFER10: 0x882F;
		readonly DRAW_BUFFER11: 0x8830;
		readonly DRAW_BUFFER12: 0x8831;
		readonly DRAW_BUFFER13: 0x8832;
		readonly DRAW_BUFFER14: 0x8833;
		readonly DRAW_BUFFER15: 0x8834;
		readonly MAX_FRAGMENT_UNIFORM_COMPONENTS: 0x8B49;
		readonly MAX_VERTEX_UNIFORM_COMPONENTS: 0x8B4A;
		readonly SAMPLER_3D: 0x8B5F;
		readonly SAMPLER_2D_SHADOW: 0x8B62;
		readonly FRAGMENT_SHADER_DERIVATIVE_HINT: 0x8B8B;
		readonly PIXEL_PACK_BUFFER: 0x88EB;
		readonly PIXEL_UNPACK_BUFFER: 0x88EC;
		readonly PIXEL_PACK_BUFFER_BINDING: 0x88ED;
		readonly PIXEL_UNPACK_BUFFER_BINDING: 0x88EF;
		readonly FLOAT_MAT2x3: 0x8B65;
		readonly FLOAT_MAT2x4: 0x8B66;
		readonly FLOAT_MAT3x2: 0x8B67;
		readonly FLOAT_MAT3x4: 0x8B68;
		readonly FLOAT_MAT4x2: 0x8B69;
		readonly FLOAT_MAT4x3: 0x8B6A;
		readonly SRGB: 0x8C40;
		readonly SRGB8: 0x8C41;
		readonly SRGB8_ALPHA8: 0x8C43;
		readonly COMPARE_REF_TO_TEXTURE: 0x884E;
		readonly RGBA32F: 0x8814;
		readonly RGB32F: 0x8815;
		readonly RGBA16F: 0x881A;
		readonly RGB16F: 0x881B;
		readonly VERTEX_ATTRIB_ARRAY_INTEGER: 0x88FD;
		readonly MAX_ARRAY_TEXTURE_LAYERS: 0x88FF;
		readonly MIN_PROGRAM_TEXEL_OFFSET: 0x8904;
		readonly MAX_PROGRAM_TEXEL_OFFSET: 0x8905;
		readonly MAX_VARYING_COMPONENTS: 0x8B4B;
		readonly TEXTURE_2D_ARRAY: 0x8C1A;
		readonly TEXTURE_BINDING_2D_ARRAY: 0x8C1D;
		readonly R11F_G11F_B10F: 0x8C3A;
		readonly UNSIGNED_INT_10F_11F_11F_REV: 0x8C3B;
		readonly RGB9_E5: 0x8C3D;
		readonly UNSIGNED_INT_5_9_9_9_REV: 0x8C3E;
		readonly TRANSFORM_FEEDBACK_BUFFER_MODE: 0x8C7F;
		readonly MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS: 0x8C80;
		readonly TRANSFORM_FEEDBACK_VARYINGS: 0x8C83;
		readonly TRANSFORM_FEEDBACK_BUFFER_START: 0x8C84;
		readonly TRANSFORM_FEEDBACK_BUFFER_SIZE: 0x8C85;
		readonly TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN: 0x8C88;
		readonly RASTERIZER_DISCARD: 0x8C89;
		readonly MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS: 0x8C8A;
		readonly MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS: 0x8C8B;
		readonly INTERLEAVED_ATTRIBS: 0x8C8C;
		readonly SEPARATE_ATTRIBS: 0x8C8D;
		readonly TRANSFORM_FEEDBACK_BUFFER: 0x8C8E;
		readonly TRANSFORM_FEEDBACK_BUFFER_BINDING: 0x8C8F;
		readonly RGBA32UI: 0x8D70;
		readonly RGB32UI: 0x8D71;
		readonly RGBA16UI: 0x8D76;
		readonly RGB16UI: 0x8D77;
		readonly RGBA8UI: 0x8D7C;
		readonly RGB8UI: 0x8D7D;
		readonly RGBA32I: 0x8D82;
		readonly RGB32I: 0x8D83;
		readonly RGBA16I: 0x8D88;
		readonly RGB16I: 0x8D89;
		readonly RGBA8I: 0x8D8E;
		readonly RGB8I: 0x8D8F;
		readonly RED_INTEGER: 0x8D94;
		readonly RGB_INTEGER: 0x8D98;
		readonly RGBA_INTEGER: 0x8D99;
		readonly SAMPLER_2D_ARRAY: 0x8DC1;
		readonly SAMPLER_2D_ARRAY_SHADOW: 0x8DC4;
		readonly SAMPLER_CUBE_SHADOW: 0x8DC5;
		readonly UNSIGNED_INT_VEC2: 0x8DC6;
		readonly UNSIGNED_INT_VEC3: 0x8DC7;
		readonly UNSIGNED_INT_VEC4: 0x8DC8;
		readonly INT_SAMPLER_2D: 0x8DCA;
		readonly INT_SAMPLER_3D: 0x8DCB;
		readonly INT_SAMPLER_CUBE: 0x8DCC;
		readonly INT_SAMPLER_2D_ARRAY: 0x8DCF;
		readonly UNSIGNED_INT_SAMPLER_2D: 0x8DD2;
		readonly UNSIGNED_INT_SAMPLER_3D: 0x8DD3;
		readonly UNSIGNED_INT_SAMPLER_CUBE: 0x8DD4;
		readonly UNSIGNED_INT_SAMPLER_2D_ARRAY: 0x8DD7;
		readonly DEPTH_COMPONENT32F: 0x8CAC;
		readonly DEPTH32F_STENCIL8: 0x8CAD;
		readonly FLOAT_32_UNSIGNED_INT_24_8_REV: 0x8DAD;
		readonly FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING: 0x8210;
		readonly FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE: 0x8211;
		readonly FRAMEBUFFER_ATTACHMENT_RED_SIZE: 0x8212;
		readonly FRAMEBUFFER_ATTACHMENT_GREEN_SIZE: 0x8213;
		readonly FRAMEBUFFER_ATTACHMENT_BLUE_SIZE: 0x8214;
		readonly FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE: 0x8215;
		readonly FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE: 0x8216;
		readonly FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE: 0x8217;
		readonly FRAMEBUFFER_DEFAULT: 0x8218;
		readonly UNSIGNED_INT_24_8: 0x84FA;
		readonly DEPTH24_STENCIL8: 0x88F0;
		readonly UNSIGNED_NORMALIZED: 0x8C17;
		readonly DRAW_FRAMEBUFFER_BINDING: 0x8CA6;
		readonly READ_FRAMEBUFFER: 0x8CA8;
		readonly DRAW_FRAMEBUFFER: 0x8CA9;
		readonly READ_FRAMEBUFFER_BINDING: 0x8CAA;
		readonly RENDERBUFFER_SAMPLES: 0x8CAB;
		readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER: 0x8CD4;
		readonly MAX_COLOR_ATTACHMENTS: 0x8CDF;
		readonly COLOR_ATTACHMENT1: 0x8CE1;
		readonly COLOR_ATTACHMENT2: 0x8CE2;
		readonly COLOR_ATTACHMENT3: 0x8CE3;
		readonly COLOR_ATTACHMENT4: 0x8CE4;
		readonly COLOR_ATTACHMENT5: 0x8CE5;
		readonly COLOR_ATTACHMENT6: 0x8CE6;
		readonly COLOR_ATTACHMENT7: 0x8CE7;
		readonly COLOR_ATTACHMENT8: 0x8CE8;
		readonly COLOR_ATTACHMENT9: 0x8CE9;
		readonly COLOR_ATTACHMENT10: 0x8CEA;
		readonly COLOR_ATTACHMENT11: 0x8CEB;
		readonly COLOR_ATTACHMENT12: 0x8CEC;
		readonly COLOR_ATTACHMENT13: 0x8CED;
		readonly COLOR_ATTACHMENT14: 0x8CEE;
		readonly COLOR_ATTACHMENT15: 0x8CEF;
		readonly FRAMEBUFFER_INCOMPLETE_MULTISAMPLE: 0x8D56;
		readonly MAX_SAMPLES: 0x8D57;
		readonly HALF_FLOAT: 0x140B;
		readonly RG: 0x8227;
		readonly RG_INTEGER: 0x8228;
		readonly R8: 0x8229;
		readonly RG8: 0x822B;
		readonly R16F: 0x822D;
		readonly R32F: 0x822E;
		readonly RG16F: 0x822F;
		readonly RG32F: 0x8230;
		readonly R8I: 0x8231;
		readonly R8UI: 0x8232;
		readonly R16I: 0x8233;
		readonly R16UI: 0x8234;
		readonly R32I: 0x8235;
		readonly R32UI: 0x8236;
		readonly RG8I: 0x8237;
		readonly RG8UI: 0x8238;
		readonly RG16I: 0x8239;
		readonly RG16UI: 0x823A;
		readonly RG32I: 0x823B;
		readonly RG32UI: 0x823C;
		readonly VERTEX_ARRAY_BINDING: 0x85B5;
		readonly R8_SNORM: 0x8F94;
		readonly RG8_SNORM: 0x8F95;
		readonly RGB8_SNORM: 0x8F96;
		readonly RGBA8_SNORM: 0x8F97;
		readonly SIGNED_NORMALIZED: 0x8F9C;
		readonly COPY_READ_BUFFER: 0x8F36;
		readonly COPY_WRITE_BUFFER: 0x8F37;
		readonly COPY_READ_BUFFER_BINDING: 0x8F36;
		readonly COPY_WRITE_BUFFER_BINDING: 0x8F37;
		readonly UNIFORM_BUFFER: 0x8A11;
		readonly UNIFORM_BUFFER_BINDING: 0x8A28;
		readonly UNIFORM_BUFFER_START: 0x8A29;
		readonly UNIFORM_BUFFER_SIZE: 0x8A2A;
		readonly MAX_VERTEX_UNIFORM_BLOCKS: 0x8A2B;
		readonly MAX_FRAGMENT_UNIFORM_BLOCKS: 0x8A2D;
		readonly MAX_COMBINED_UNIFORM_BLOCKS: 0x8A2E;
		readonly MAX_UNIFORM_BUFFER_BINDINGS: 0x8A2F;
		readonly MAX_UNIFORM_BLOCK_SIZE: 0x8A30;
		readonly MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS: 0x8A31;
		readonly MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS: 0x8A33;
		readonly UNIFORM_BUFFER_OFFSET_ALIGNMENT: 0x8A34;
		readonly ACTIVE_UNIFORM_BLOCKS: 0x8A36;
		readonly UNIFORM_TYPE: 0x8A37;
		readonly UNIFORM_SIZE: 0x8A38;
		readonly UNIFORM_BLOCK_INDEX: 0x8A3A;
		readonly UNIFORM_OFFSET: 0x8A3B;
		readonly UNIFORM_ARRAY_STRIDE: 0x8A3C;
		readonly UNIFORM_MATRIX_STRIDE: 0x8A3D;
		readonly UNIFORM_IS_ROW_MAJOR: 0x8A3E;
		readonly UNIFORM_BLOCK_BINDING: 0x8A3F;
		readonly UNIFORM_BLOCK_DATA_SIZE: 0x8A40;
		readonly UNIFORM_BLOCK_ACTIVE_UNIFORMS: 0x8A42;
		readonly UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES: 0x8A43;
		readonly UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER: 0x8A44;
		readonly UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER: 0x8A46;
		readonly INVALID_INDEX: 0xFFFFFFFF;
		readonly MAX_VERTEX_OUTPUT_COMPONENTS: 0x9122;
		readonly MAX_FRAGMENT_INPUT_COMPONENTS: 0x9125;
		readonly MAX_SERVER_WAIT_TIMEOUT: 0x9111;
		readonly OBJECT_TYPE: 0x9112;
		readonly SYNC_CONDITION: 0x9113;
		readonly SYNC_STATUS: 0x9114;
		readonly SYNC_FLAGS: 0x9115;
		readonly SYNC_FENCE: 0x9116;
		readonly SYNC_GPU_COMMANDS_COMPLETE: 0x9117;
		readonly UNSIGNALED: 0x9118;
		readonly SIGNALED: 0x9119;
		readonly ALREADY_SIGNALED: 0x911A;
		readonly TIMEOUT_EXPIRED: 0x911B;
		readonly CONDITION_SATISFIED: 0x911C;
		readonly WAIT_FAILED: 0x911D;
		readonly SYNC_FLUSH_COMMANDS_BIT: 0x00000001;
		readonly VERTEX_ATTRIB_ARRAY_DIVISOR: 0x88FE;
		readonly ANY_SAMPLES_PASSED: 0x8C2F;
		readonly ANY_SAMPLES_PASSED_CONSERVATIVE: 0x8D6A;
		readonly SAMPLER_BINDING: 0x8919;
		readonly RGB10_A2UI: 0x906F;
		readonly INT_2_10_10_10_REV: 0x8D9F;
		readonly TRANSFORM_FEEDBACK: 0x8E22;
		readonly TRANSFORM_FEEDBACK_PAUSED: 0x8E23;
		readonly TRANSFORM_FEEDBACK_ACTIVE: 0x8E24;
		readonly TRANSFORM_FEEDBACK_BINDING: 0x8E25;
		readonly TEXTURE_IMMUTABLE_FORMAT: 0x912F;
		readonly MAX_ELEMENT_INDEX: 0x8D6B;
		readonly TEXTURE_IMMUTABLE_LEVELS: 0x82DF;
		readonly TIMEOUT_IGNORED: -1;
		readonly MAX_CLIENT_WAIT_TIMEOUT_WEBGL: 0x9247;
	}

	export interface WebGL2RenderingContextOverloads {
		bufferData(target: GLenum, size: GLsizeiptr, usage: GLenum): undefined;
		bufferData(target: GLenum, srcData: AllowSharedBufferSource | null, usage: GLenum): undefined;
		bufferData(target: GLenum, srcData: ArrayBufferView, usage: GLenum, srcOffset: number, length?: GLuint): undefined;
		bufferSubData(target: GLenum, dstByteOffset: GLintptr, srcData: AllowSharedBufferSource): undefined;
		bufferSubData(target: GLenum, dstByteOffset: GLintptr, srcData: ArrayBufferView, srcOffset: number, length?: GLuint): undefined;
		compressedTexImage2D(target: GLenum, level: GLint, internalformat: GLenum, width: GLsizei, height: GLsizei, border: GLint, imageSize: GLsizei, offset: GLintptr): undefined;
		compressedTexImage2D(target: GLenum, level: GLint, internalformat: GLenum, width: GLsizei, height: GLsizei, border: GLint, srcData: ArrayBufferView, srcOffset?: number, srcLengthOverride?: GLuint): undefined;
		compressedTexSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei, format: GLenum, imageSize: GLsizei, offset: GLintptr): undefined;
		compressedTexSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei, format: GLenum, srcData: ArrayBufferView, srcOffset?: number, srcLengthOverride?: GLuint): undefined;
		readPixels(x: GLint, y: GLint, width: GLsizei, height: GLsizei, format: GLenum, type: GLenum, dstData: ArrayBufferView): undefined;
		readPixels(x: GLint, y: GLint, width: GLsizei, height: GLsizei, format: GLenum, type: GLenum, offset: GLintptr): undefined;
		readPixels(x: GLint, y: GLint, width: GLsizei, height: GLsizei, format: GLenum, type: GLenum, dstData: ArrayBufferView, dstOffset: number): undefined;
		texImage2D(target: GLenum, level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, border: GLint, format: GLenum, type: GLenum, pixels: ArrayBufferView | null): undefined;
		texImage2D(target: GLenum, level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, border: GLint, format: GLenum, type: GLenum, pboOffset: GLintptr): undefined;
		texImage2D(target: GLenum, level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, border: GLint, format: GLenum, type: GLenum, source: TexImageSource): undefined;
		texImage2D(target: GLenum, level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, border: GLint, format: GLenum, type: GLenum, srcData: ArrayBufferView, srcOffset: number): undefined;
		texImage2D(target: GLenum, level: GLint, internalformat: GLint, format: GLenum, type: GLenum, source: TexImageSource): undefined;
		texSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei, format: GLenum, type: GLenum, pixels: ArrayBufferView | null): undefined;
		texSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei, format: GLenum, type: GLenum, pboOffset: GLintptr): undefined;
		texSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei, format: GLenum, type: GLenum, source: TexImageSource): undefined;
		texSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei, format: GLenum, type: GLenum, srcData: ArrayBufferView, srcOffset: number): undefined;
		texSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, format: GLenum, type: GLenum, source: TexImageSource): undefined;
		uniform1fv(location: WebGLUniformLocation | null, data: Float32List, srcOffset?: number, srcLength?: GLuint): undefined;
		uniform1iv(location: WebGLUniformLocation | null, data: Int32List, srcOffset?: number, srcLength?: GLuint): undefined;
		uniform2fv(location: WebGLUniformLocation | null, data: Float32List, srcOffset?: number, srcLength?: GLuint): undefined;
		uniform2iv(location: WebGLUniformLocation | null, data: Int32List, srcOffset?: number, srcLength?: GLuint): undefined;
		uniform3fv(location: WebGLUniformLocation | null, data: Float32List, srcOffset?: number, srcLength?: GLuint): undefined;
		uniform3iv(location: WebGLUniformLocation | null, data: Int32List, srcOffset?: number, srcLength?: GLuint): undefined;
		uniform4fv(location: WebGLUniformLocation | null, data: Float32List, srcOffset?: number, srcLength?: GLuint): undefined;
		uniform4iv(location: WebGLUniformLocation | null, data: Int32List, srcOffset?: number, srcLength?: GLuint): undefined;
		uniformMatrix2fv(location: WebGLUniformLocation | null, transpose: GLboolean, data: Float32List, srcOffset?: number, srcLength?: GLuint): undefined;
		uniformMatrix3fv(location: WebGLUniformLocation | null, transpose: GLboolean, data: Float32List, srcOffset?: number, srcLength?: GLuint): undefined;
		uniformMatrix4fv(location: WebGLUniformLocation | null, transpose: GLboolean, data: Float32List, srcOffset?: number, srcLength?: GLuint): undefined;
	}

	export interface WebGL2RenderingContext extends WebGLRenderingContextBase, WebGL2RenderingContextBase, WebGL2RenderingContextOverloads {}

	export const WebGLRenderingContext: {
		prototype: WebGLRenderingContext;
		new (): WebGLRenderingContext;
	};

	export const WebGL2RenderingContext: {
		prototype: WebGL2RenderingContext;
		new (): WebGL2RenderingContext;
	};
}

export = createContext;

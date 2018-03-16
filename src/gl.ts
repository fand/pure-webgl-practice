import { mat4 as M } from 'gl-matrix';
import Slot from './slot';
import TextureLoader from './texture';
import Target from './target';
import AudioLoader from './audio-loader';
import CameraLoader from './camera-loader';

declare const require: any;
const DEFAULT_SHADER = {
    vs: require('./shaders/shader1.vert'),
    fs: require('./shaders/shader1.frag'),
};

const TIME_STARTED = Date.now() / 1000;

export default class GL {
    canvas: HTMLCanvasElement;
    resizeObserver: any;
    gl: WebGLRenderingContext;

    slot: Slot;
    textureLoader: TextureLoader;
    backbuffer: Target;

    audioLoader: AudioLoader;
    cameraLoader: CameraLoader;

    isPlaying = false;
    isLoading = false;
    program: WebGLProgram;
    mvpMatrix: M;

    frame = 0;

    constructor(public element: HTMLElement) {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        element.appendChild(this.canvas);

        this.gl = this.canvas.getContext('webgl2') as WebGLRenderingContext;

        this.slot = new Slot(this.gl);
        this.textureLoader = new TextureLoader(this.gl, this.slot);
        this.backbuffer = new Target(
            this.gl,
            this.slot,
            this.canvas.offsetWidth,
            this.canvas.offsetHeight,
        );

        this.audioLoader = new AudioLoader(this.gl, this.slot, {});
        this.cameraLoader = new CameraLoader(this.gl, this.slot);

        // Clear canvas
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clearDepth(1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.program = this.createProgramFromShaders(DEFAULT_SHADER);

        this.mvpMatrix = this.createMvpMatrix();

        this.resize();
        this.resizeObserver = new (window as any).ResizeObserver(this.resize);
        this.resizeObserver.observe(this.canvas);

        this.canvas.addEventListener('mousemove', this.onMouseMove);
    }

    private onMouseMove = (e: MouseEvent) => {
        this.setUniform('mouse', 'v2', {
            x: e.offsetX / this.canvas.offsetWidth,
            y: 1 - e.offsetY / this.canvas.offsetHeight,
        });
    };

    loadShader({ vs, fs }: { vs: string; fs: string }): void {
        this.isLoading = true;
        this.program = this.createProgramFromShaders({ vs, fs });
    }

    private createProgramFromShaders({
        vs,
        fs,
    }: {
        vs: string;
        fs: string;
    }): WebGLProgram {
        const vso = this.createVs(vs);
        const fso = this.createFs(fs);

        const program = this.createProgram(vso, fso);

        const points = [
            ...[1, 1, 0],
            ...[1, -1, 0],
            ...[-1, -1, 0],
            ...[-1, -1, 0],
            ...[-1, 1, 0],
            ...[1, 1, 0],
        ].map(x => x * 9999);

        const vbo = this.createVbo(points);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);

        const attLocation = this.gl.getAttribLocation(program, 'position');
        this.gl.enableVertexAttribArray(attLocation);
        this.gl.vertexAttribPointer(attLocation, 3, this.gl.FLOAT, false, 0, 0);

        return program;
    }

    loadTexture(name: string, url: string): Promise<any> {
        return this.textureLoader.loadTexture(name, url);
    }

    unloadTexture(name: string): void {
        this.textureLoader.unloadTexture(name);
    }

    createVs(src: string): WebGLShader {
        const shader = this.gl.createShader(this.gl.VERTEX_SHADER);
        if (!shader) {
            throw new Error('Failed to run gl.createShader');
        }

        this.gl.shaderSource(shader, src);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.log(this.gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    createFs(src: string): WebGLShader {
        const shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        if (!shader) {
            throw new Error('Failed to run gl.createShader');
        }

        this.gl.shaderSource(shader, src);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.log(this.gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    createProgram(vs: WebGLShader, fs: WebGLShader): WebGLProgram {
        const program = this.gl.createProgram();
        if (!program) {
            throw new Error('Failed to run gl.createProgram');
        }

        this.gl.attachShader(program, vs);
        this.gl.attachShader(program, fs);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error(this.gl.getProgramInfoLog(program));
        }

        this.gl.useProgram(program);

        return program;
    }

    createVbo(data: any[]): WebGLVertexArrayObjectOES {
        const vbo = this.gl.createBuffer();
        if (!vbo) {
            throw new Error('Failed to run gl.createBuffer');
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(data),
            this.gl.STATIC_DRAW,
        );
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        return vbo;
    }

    setUniform(name: string, type: string, value: any): void {
        const location = this.gl.getUniformLocation(this.program, name);

        // Return if the name is not used in shaders
        if (!location) {
            return;
        }

        switch (type) {
            case 'f':
                this.gl.uniform1f(location, value);
                break;
            case 'v2':
                this.gl.uniform2f(location, value.x, value.y);
                break;
            case 'm4':
                this.gl.uniformMatrix4fv(location, false, value);
                break;
            case 't':
                this.gl.activeTexture(this.gl.TEXTURE0 + value.id);
                this.gl.bindTexture(this.gl.TEXTURE_2D, value.texture);
                this.gl.uniform1i(location, value.id);
                break;
            default:
                console.log(`Uniform type "${type}" is unsupported`);
        }
    }

    updateUniforms(): void {
        this.setUniform('mvpMatrix', 'm4', this.mvpMatrix);
        this.setUniform('time', 'f', Date.now() / 1000 - TIME_STARTED);
        this.setUniform('resolution', 'v2', {
            x: this.canvas.offsetWidth,
            y: this.canvas.offsetHeight,
        });

        this.textureLoader.getUpdatedTextures().forEach(t => {
            this.setUniform(t.name, 't', t);
        });

        this.audioLoader.update(this.program);
        this.cameraLoader.update(this.program);

        this.backbuffer.update();
        const location = this.gl.getUniformLocation(this.program, 'backbuffer');
        this.gl.activeTexture(this.gl.TEXTURE0 + this.backbuffer.slot);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.backbuffer.textures[1]);
        this.gl.uniform1i(location, this.backbuffer.slot);
    }

    render = () => {
        this.frame++;

        if (!this.isPlaying) {
            return;
        }
        if (this.frame % 1 !== 0) {
            requestAnimationFrame(this.render);
            return;
        }

        this.updateUniforms();

        this.gl.bindFramebuffer(
            this.gl.FRAMEBUFFER,
            this.backbuffer.framebuffer,
        );
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
        this.gl.drawArrays(this.gl.TRIANGLES, 3, 3);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
        this.gl.drawArrays(this.gl.TRIANGLES, 3, 3);
        this.gl.flush();

        requestAnimationFrame(this.render);
    };

    start(): void {
        this.isPlaying = true;
        requestAnimationFrame(this.render);
    }

    stop(): void {
        this.isPlaying = false;
    }

    createMvpMatrix(): M {
        const modelMatrix = M.create();
        const viewMatrix = M.create();
        const projectionMatrix = M.create();
        const mvpMatrix = M.create();

        M.lookAt(
            viewMatrix,
            [0, 0, 1], // Camera position
            [0, 0, 0], // Camera target
            [0, 1, 0], // Camera up
        );

        M.perspective(
            projectionMatrix,
            Math.PI * 0.5, // fov = 90deg
            this.canvas.offsetWidth / this.canvas.offsetHeight,
            0.1,
            1000,
        );

        M.mul(mvpMatrix, projectionMatrix, viewMatrix);
        M.mul(mvpMatrix, modelMatrix, mvpMatrix);

        return mvpMatrix;
    }

    toggleAudio(enable: boolean): void {
        enable ? this.audioLoader.enable() : this.audioLoader.disable();
    }

    toggleCamera(enable: boolean): void {
        enable ? this.cameraLoader.enable() : this.cameraLoader.disable();
    }

    resize = () => {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.backbuffer.resize(
            this.canvas.offsetWidth,
            this.canvas.offsetHeight,
        );
        this.mvpMatrix = this.createMvpMatrix();
    };
}

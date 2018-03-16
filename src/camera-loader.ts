import { getCtx } from './get-ctx';
import Slot from './slot';

export default class CameraLoader {
    texture: WebGLTexture;
    video: HTMLVideoElement;

    isEnabled: boolean = false;

    private slot?: number;
    private stream: any;
    private willPlay: Promise<any> | null = null;

    constructor(
        private gl: WebGLRenderingContext,
        private slotAllocator: Slot,
    ) {
        this.video = document.createElement('video');
        this.video.classList.add('veda-video-source');
        this.video.loop = true;
        this.video.muted = true;
        this.video.style.position = 'fixed';
        this.video.style.top = '-100000%';
        this.video.style.left = '-100000%';
        (document.body as any).appendChild(this.video);

        this.texture = this.createTexture(1, 1);
    }

    private createTexture(width: number, height: number): WebGLTexture {
        const texture = this.gl.createTexture();
        if (!texture) {
            throw new Error('Failed to run gl.createTexture');
        }

        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGB,
            this.gl.RGB,
            this.gl.UNSIGNED_BYTE,
            this.video,
        );
        this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_WRAP_S,
            this.gl.CLAMP_TO_EDGE,
        );
        this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_WRAP_T,
            this.gl.CLAMP_TO_EDGE,
        );
        this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_MAG_FILTER,
            this.gl.LINEAR,
        );
        this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_MIN_FILTER,
            this.gl.LINEAR,
        );
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        return texture;
    }

    enable(): void {
        this.willPlay = new Promise<void>((resolve, reject) => {
            navigator.mediaDevices.getUserMedia({ video: true }).then(
                stream => {
                    this.stream = stream;
                    this.video.src = window.URL.createObjectURL(stream);
                    this.video.play();
                    this.slot = this.slotAllocator.getNewSlot();
                    this.isEnabled = true;
                    resolve();
                },
                err => {
                    console.error(err);
                    reject();
                },
            );
        });
    }

    disable(): void {
        if (this.isEnabled && this.willPlay) {
            this.willPlay.then(() => {
                this.isEnabled = false;
                this.stream
                    .getTracks()
                    .forEach((t: MediaStreamTrack) => t.stop());
                this.slotAllocator.freeSlot(this.slot!);
            });
        }
    }

    update(program: WebGLProgram): void {
        if (!this.isEnabled) {
            return;
        }

        const location = this.gl.getUniformLocation(program, 'camera');
        this.gl.activeTexture(this.gl.TEXTURE0 + this.slot!);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGB,
            this.gl.RGB,
            this.gl.UNSIGNED_BYTE,
            this.video,
        );
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);
        this.gl.uniform1i(location, this.slot!);
    }
}

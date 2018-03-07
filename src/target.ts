import Slot from './slot';

export default class Target {
    slot: number;
    framebuffer: WebGLFramebuffer;
    textures: WebGLTexture[];

    constructor(
        private gl: WebGLRenderingContext,
        private slotAllocator: Slot,
        public width: number,
        public height: number,
    ) {
        this.slot = slotAllocator.getNewSlot();
        this.framebuffer = this.createFramebuffer();
        this.textures = [this.createTexture(), this.createTexture()];
        this.bindTextureToFramebuffer();
    }

    private createFramebuffer(): WebGLFramebuffer {
        const framebuffer = this.gl.createFramebuffer();
        if (!framebuffer) {
            throw new Error('Failed to run gl.createFramebuffer');
        }
        return framebuffer;
    }

    private createTexture(): WebGLTexture {
        const texture = this.gl.createTexture();
        if (!texture) {
            throw new Error('Failed to run gl.createTexture');
        }

        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            this.width,
            this.height,
            0,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            null,
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
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        return texture;
    }

    private bindTextureToFramebuffer(): void {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
        this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,
            this.gl.COLOR_ATTACHMENT0,
            this.gl.TEXTURE_2D,
            this.textures[0],
            0,
        );
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    update(): void {
        this.textures = [this.textures[1], this.textures[0]];
        this.bindTextureToFramebuffer();
    }

    resize(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.textures.forEach(t => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, t);
            this.gl.texImage2D(
                this.gl.TEXTURE_2D,
                0,
                this.gl.RGBA,
                width,
                height,
                0,
                this.gl.RGBA,
                this.gl.UNSIGNED_BYTE,
                null,
            );
        });

        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    destroy() {
        this.slotAllocator.freeSlot(this.slot);
    }
}

import { ClampToEdgeWrapping, NearestFilter, LinearFilter } from './constants';

declare const require: any;
const isVideo = require('is-video');

const DUMMY_IMAGE = new Image();
DUMMY_IMAGE.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

class ImageTexture {
    type = 'image';
    constructor(
        public name: string,
        public texture: WebGLTexture,
        public id: number,
        public data: HTMLImageElement,
    ) {}
}

class VideoTexture {
    type = 'video';
    constructor(
        public name: string,
        public texture: WebGLTexture,
        public id: number,
        public data: HTMLVideoElement,
    ) {}
}

type Texture = ImageTexture | VideoTexture;

function isImageTexture(t: Texture): t is ImageTexture {
    return t.type === 'image';
}
function isVideoTexture(t: Texture): t is VideoTexture {
    return t.type === 'video';
}

export default class TextureLoader {
    maxTextures: number;
    textures: (Texture | null)[] = [];
    isTextureLoaded: { [name: number]: boolean } = {};
    isTextureUpdated: { [name: number]: boolean } = {};
    isTextureVideo: { [name: number]: boolean } = {};

    private canvas = document.createElement('canvas');
    private ctx = this.canvas.getContext('2d')!;

    constructor(private gl: WebGLRenderingContext) {
        this.maxTextures = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    }

    loadTexture(name: string, url: string): Promise<Texture> {
        if (isVideo(url)) {
            return this.loadVideoTexture(name, url);
        } else {
            return this.loadImageTexture(name, url);
        }
    }

    private loadImageTexture(name: string, url: string): Promise<Texture> {
        const texture = this.gl.createTexture();
        if (!texture) {
            throw new Error('Failed to run gl.createTexture');
        }

        let id = 0;
        while (this.isTextureLoaded[id]) {
            id++;
        }

        const img = new Image();
        img.src = url;
        this.isTextureLoaded[id] = true;

        return new Promise(resolve => {
            img.onload = () => {
                const t = new ImageTexture(name, texture, id, img);
                this.textures[id] = t;

                this.bindTexture(texture, img);
                this.isTextureUpdated[id] = true;
                resolve(t);
            };
        });
    }

    private loadVideoTexture(name: string, url: string): Promise<Texture> {
        const texture = this.gl.createTexture();
        if (!texture) {
            throw new Error('Failed to run gl.createTexture');
        }
        const cached = this.textures.find(t => !!t && t.name === name);
        if (cached) {
            return Promise.resolve(cached);
        }

        let id = 0;
        while (this.isTextureLoaded[id]) {
            id++;
        }

        const video = document.createElement('video');
        video.src = url;
        video.muted = true;
        video.loop = true;
        video.style.position = 'fixed';
        video.style.top = '-100000%';
        video.style.left = '-100000%';

        // video.style.bottom = '0';
        // video.style.left = (60 * id).toString() + 'px';
        // video.style.width = '60px';

        document.body.appendChild(video);

        this.isTextureLoaded[id] = true;

        return new Promise(resolve => {
            video.addEventListener('canplaythrough', () => {
                video.play();
                const t = new VideoTexture(name, texture, id, video);
                this.textures[id] = t;

                this.bindTexture(texture, video);

                this.isTextureUpdated[id] = true;
                this.isTextureVideo[id] = true;
                resolve(t);
            });
        });
    }

    /**
     * Bind an image or a video to WebGLTexture
     */
    private bindTexture(
        texture: WebGLTexture,
        data: HTMLImageElement | HTMLVideoElement,
    ) {
        if (!this.gl.isTexture(texture)) {
            // console.log('Thes texture seems to be deleted', texture);
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            data,
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
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    unloadTexture(name: string): void {
        this.textures.forEach(t => {
            if (!!t && t.name === name) {
                this.isTextureLoaded[t.id] = false;
                this.gl.deleteTexture(t.texture);
                if (isVideoTexture(t)) {
                    t.data.pause();
                    t.data.remove();
                }
                this.textures[t.id] = null;
            }
        });
    }

    getUpdatedTextures(): Texture[] {
        this.textures.forEach(t => {
            if (t && this.isTextureVideo[t.id] && this.isTextureLoaded[t.id]) {
                this.bindTexture(t.texture, t.data);
                this.isTextureUpdated[t.id] = true;
            }
        });

        const updatedTextures = this.textures.filter(
            t => t && this.isTextureUpdated[t.id],
        ) as Texture[];
        this.isTextureUpdated = {};

        return updatedTextures;
    }
}

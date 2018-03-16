import { getCtx } from './get-ctx';
import Slot from './slot';

export interface IAudioOptions {
    fftSize?: number;
    fftSmoothingTimeConstant?: number;
}

const DEFAULT_AUDIO_OPTIONS = {
    fftSize: 2048,
    fftSmoothingTimeConstant: 0.8,
};

export default class AudioLoader {
    samples: WebGLTexture;
    spectrum: WebGLTexture;

    isEnabled: boolean = false;

    private ctx: AudioContext;
    private gain: GainNode;
    private analyser: AnalyserNode;
    private input: MediaStreamAudioSourceNode | null = null;

    private samplesArray: Uint8Array;
    private spectrumArray: Uint8Array;
    private samplesSlot?: number;
    private spectrumSlot?: number;

    private stream: any;

    private willPlay: Promise<any> | null = null;

    constructor(
        private gl: WebGLRenderingContext,
        private slotAllocator: Slot,
        rcOpt: IAudioOptions,
    ) {
        const rc = {
            ...DEFAULT_AUDIO_OPTIONS,
            ...rcOpt,
        };

        this.ctx = getCtx();
        this.gain = this.ctx.createGain();
        this.analyser = this.ctx.createAnalyser();
        this.analyser.connect(this.gain);
        this.gain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.gain.connect(this.ctx.destination);

        this.analyser.fftSize = rc.fftSize;
        this.analyser.smoothingTimeConstant = rc.fftSmoothingTimeConstant;
        this.samplesArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.spectrumArray = new Uint8Array(this.analyser.frequencyBinCount);

        this.samples = this.createTexture(this.analyser.frequencyBinCount, 1);
        this.spectrum = this.createTexture(this.analyser.frequencyBinCount, 1);
    }

    private createTexture(width: number, height: number): WebGLTexture {
        const texture = this.gl.createTexture();
        if (!texture) {
            throw new Error('Failed to run gl.createTexture');
        }

        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.LUMINANCE,
            width,
            height,
            0,
            this.gl.LUMINANCE,
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

    enable(): void {
        this.willPlay = new Promise<void>((resolve, reject) => {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(
                stream => {
                    this.stream = stream;
                    this.input = (this.ctx.createMediaStreamSource as (
                        s: any,
                    ) => MediaStreamAudioSourceNode)(stream);
                    this.input.connect(this.analyser);
                    this.isEnabled = true;

                    this.samplesSlot = this.slotAllocator.getNewSlot();
                    this.spectrumSlot = this.slotAllocator.getNewSlot();

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
                this.input && this.input.disconnect();
                this.stream
                    .getTracks()
                    .forEach((t: MediaStreamTrack) => t.stop());

                this.slotAllocator.freeSlot(this.samplesSlot!);
                this.slotAllocator.freeSlot(this.spectrumSlot!);
            });
        }
    }

    update(program: WebGLProgram): void {
        if (!this.isEnabled) {
            return;
        }

        this.analyser.getByteTimeDomainData(this.samplesArray);
        this.analyser.getByteFrequencyData(this.spectrumArray);

        const samplesLocation = this.gl.getUniformLocation(program, 'samples');
        this.gl.activeTexture(this.gl.TEXTURE0 + this.samplesSlot!);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.samples);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.LUMINANCE,
            this.samplesArray.length,
            1,
            0,
            this.gl.LUMINANCE,
            this.gl.UNSIGNED_BYTE,
            this.samplesArray,
        );
        this.gl.uniform1i(samplesLocation, this.samplesSlot!);

        const spectrumLocation = this.gl.getUniformLocation(
            program,
            'spectrum',
        );
        this.gl.activeTexture(this.gl.TEXTURE0 + this.spectrumSlot!);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.spectrum);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.LUMINANCE,
            this.spectrumArray.length,
            1,
            0,
            this.gl.LUMINANCE,
            this.gl.UNSIGNED_BYTE,
            this.spectrumArray,
        );
        this.gl.uniform1i(spectrumLocation, this.spectrumSlot!);
    }

    getVolume(): number {
        return (
            this.spectrumArray.reduce((x, y) => x + y, 0) /
            this.spectrumArray.length
        );
    }

    setFftSize(fftSize: number): void {
        this.gl.deleteTexture(this.samples);
        this.gl.deleteTexture(this.spectrum);

        this.analyser.fftSize = fftSize;
        this.samplesArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.spectrumArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.samples = this.createTexture(this.analyser.frequencyBinCount, 1);
        this.spectrum = this.createTexture(this.analyser.frequencyBinCount, 1);
    }

    setFftSmoothingTimeConstant(fftSmoothingTimeConstant: number): void {
        this.analyser.smoothingTimeConstant = fftSmoothingTimeConstant;
    }
}

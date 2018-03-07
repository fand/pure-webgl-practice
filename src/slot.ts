export default class SlotAllocator {
    maxTextures: number;

    isSlotUsed: { [slot: number]: boolean } = {};

    constructor(private gl: WebGLRenderingContext) {
        this.maxTextures = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    }

    getNewSlot(): number {
        let id = 0;
        while (this.isSlotUsed[id]) {
            id++;
        }

        if (id === this.maxTextures) {
            console.warn('Max slots exceeded');
        }

        this.isSlotUsed[id] = true;
        return id;
    }

    freeSlot(slot: number): void {
        if (slot > this.maxTextures) {
            throw new RangeError('Invalid slot number');
        }

        this.isSlotUsed[slot] = false;
    }
}

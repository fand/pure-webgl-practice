export const actionTypes = {
    INIT_VEDA: 'INIT_VEDA',
};

export function initVeda(veda: any) {
    return { type: actionTypes.INIT_VEDA, payload: veda };
}

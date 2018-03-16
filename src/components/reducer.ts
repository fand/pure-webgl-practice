import { actionTypes } from './actions';

export const exampleInitialState = {
    veda: null,
};

export default function reducer(state = exampleInitialState, action: any) {
    switch (action.type) {
        case actionTypes.INIT_VEDA:
            return {
                ...state,
                veda: action.payload,
            };
        default:
            return state;
    }
}

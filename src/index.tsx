import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/app';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createHistory from 'history/createHashHistory';
import { Route } from 'react-router';
import { Link } from 'react-router-dom';
import {
    ConnectedRouter,
    routerReducer,
    routerMiddleware,
    push,
} from 'react-router-redux';
import rootReducer, { exampleInitialState } from './components/reducer';

const history = createHistory();
const middleware = routerMiddleware(history);
const store = createStore(
    combineReducers({
        app: rootReducer,
        router: routerReducer,
    }),
    applyMiddleware(middleware),
);

ReactDOM.render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <App />
        </ConnectedRouter>
    </Provider>,
    document.querySelector('#app'),
);

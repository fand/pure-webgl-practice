import * as React from 'react';
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
import rootReducer, { exampleInitialState } from './reducer';

const history = createHistory();
const middleware = routerMiddleware(history);
const store = createStore(
    combineReducers({
        app: rootReducer,
        router: routerReducer,
    }),
    applyMiddleware(middleware),
);

import Sidebar from './sidebar';
import Background from './background';
import Main from './main';

const App = () => (
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <div>
                <Sidebar />
                <Background />
                <Main />
            </div>
        </ConnectedRouter>
    </Provider>
);

export default App;

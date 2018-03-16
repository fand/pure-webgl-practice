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

const history = createHistory();
const middleware = routerMiddleware(history);
const store = createStore(
    combineReducers({
        router: routerReducer,
    }),
    applyMiddleware(middleware),
);

const Home = () => <div>HOME</div>;
const Hoi = () => <div>HOIIIIIIII</div>;

const App = () => (
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <div style={{ zIndex: 10000, background: '#FFF' }}>
                <nav>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/hoi">Bubblegum</Link>
                        </li>
                    </ul>
                </nav>

                <Route exact path="/" component={Home} />
                <Route exact path="/hoi" component={Hoi} />
            </div>
        </ConnectedRouter>
    </Provider>
);

export default App;

import * as React from 'react';
import Sidebar from './sidebar';
import Background from './background';
import Main from './main';

import * as styledComponents from 'styled-components';
const { injectGlobal } = styledComponents;

injectGlobal`
    * {
        font-family: serif;
    }
`;

const App = () => (
    <div>
        <Sidebar />
        <Background />
        <Main />
    </div>
);

export default App;

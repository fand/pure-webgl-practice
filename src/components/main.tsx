import * as React from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router';
import Home from '../pages/home';
import Backbuffer from '../pages/backbuffer';
import Image from '../pages/image';
import Video from '../pages/video';
import Mouse from '../pages/mouse';
import Audio from '../pages/audio';
import Camera from '../pages/camera';

import * as styledComponents from 'styled-components';
const styled = styledComponents.default;

const Div = styled.div`
    position: fixed;
    width: calc(100% - 240px);
    height: 100%;
    top: 0;
    right: 0;
`;

class Main extends React.Component<any> {
    render() {
        if (!this.props.app.veda) {
            return <div />;
        }

        return (
            <Div>
                <Route exact path="/" component={Home} />
                <Route exact path="/backbuffer" component={Backbuffer} />
                <Route exact path="/image" component={Image} />
                <Route exact path="/video" component={Video} />
                <Route exact path="/mouse" component={Mouse} />
                <Route exact path="/audio" component={Audio} />
                <Route exact path="/camera" component={Camera} />
            </Div>
        );
    }
}

export default connect(s => s)(Main);

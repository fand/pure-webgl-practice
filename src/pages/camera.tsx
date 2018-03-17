import * as React from 'react';
import { connect } from 'react-redux';

const vs = require('../shaders/shader1.vert');
const fs = require('../shaders/camera.frag');

class Camera extends React.Component<any> {
    componentDidMount() {
        const { veda } = this.props.app;
        this.props.app.veda.toggleCamera(true);
        veda.loadShader({ vs, fs });
        veda.start();
    }

    componentWillUnmount() {
        const { veda } = this.props.app;
        veda.toggleCamera(false);
    }

    render() {
        return <div>ホームだよ</div>;
    }
}

export default connect(s => s)(Camera);

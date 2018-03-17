import * as React from 'react';
import { connect } from 'react-redux';
import Editor from '../components/editor';

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

    onChange = (editor: any, data: any, value: any) => {
        const { veda } = this.props.app;
        veda.loadShader({ vs, fs: value });
    };

    render() {
        return <Editor initValue={fs} onChange={this.onChange} />;
    }
}

export default connect(s => s)(Camera);

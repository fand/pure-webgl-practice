import * as React from 'react';
import { connect } from 'react-redux';

const vs = require('../shaders/shader1.vert');
const fs = require('../shaders/audio.frag');

class Audio extends React.Component<any> {
    componentDidMount() {
        const { veda } = this.props.app;
        veda.toggleAudio(true);
        veda.loadShader({ vs, fs });
        veda.start();
    }

    componentWillUnmount() {
        const { veda } = this.props.app;
        veda.toggleAudio(false);
    }

    render() {
        return <div>ホームだよ</div>;
    }
}

export default connect(s => s)(Audio);

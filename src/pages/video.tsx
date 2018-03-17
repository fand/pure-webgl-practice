import * as React from 'react';
import { connect } from 'react-redux';

const vs = require('../shaders/shader1.vert');
const fs = require('../shaders/video.frag');

class Image extends React.Component<any> {
    componentDidMount() {
        const { veda } = this.props.app;
        Promise.all([
            veda.loadTexture('video1', './videos/1.mp4'),
            veda.loadTexture('video2', './videos/2.mp4'),
            veda.loadTexture('video3', './videos/3.mp4'),
        ]).then(() => {
            veda.loadShader({ vs, fs });
            veda.start();
        });
    }

    componentWillUnmount() {
        const { veda } = this.props.app;
        veda.unloadTexture('video1');
        veda.unloadTexture('video2');
        veda.unloadTexture('video3');
    }

    render() {
        return <div>ホームだよ</div>;
    }
}

export default connect(s => s)(Image);

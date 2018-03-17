import * as React from 'react';
import { connect } from 'react-redux';

const vs = require('../shaders/shader1.vert');
const fs = require('../shaders/image.frag');

class Image extends React.Component<any> {
    componentDidMount() {
        const { veda } = this.props.app;
        veda.loadTexture('lena', './cat.jpg').then(() => {
            veda.loadShader({ vs, fs });
            veda.start();
        });
    }

    componentWillUnmount() {
        const { veda } = this.props.app;
        veda.unloadTexture('lena');
    }

    render() {
        return <div>ホームだよ</div>;
    }
}

export default connect(s => s)(Image);

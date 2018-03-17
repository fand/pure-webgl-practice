import * as React from 'react';
import { connect } from 'react-redux';
import Editor from '../components/editor';

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

    onChange = (editor: any, data: any, value: any) => {
        const { veda } = this.props.app;
        veda.loadShader({ vs, fs: value });
    };

    render() {
        return <Editor initValue={fs} onChange={this.onChange} />;
    }
}

export default connect(s => s)(Image);

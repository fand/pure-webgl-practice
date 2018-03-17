import * as React from 'react';
import { connect } from 'react-redux';

const vs = require('../shaders/shader1.vert');
const fs = require('../shaders/mouse.frag');

class Mouse extends React.Component<any> {
    componentDidMount() {
        const { veda } = this.props.app;
        veda.loadShader({ vs, fs });
        veda.start();
    }

    componentWillUnmount() {}

    render() {
        return <div>ホームだよ</div>;
    }
}

export default connect(s => s)(Mouse);

import * as React from 'react';
import { connect } from 'react-redux';

const vs = require('../shaders/shader1.vert');
const fs = require('../shaders/shader1.frag');

class Home extends React.Component<any> {
    componentDidMount() {
        // console.log(this.props);
    }

    componentWillReceiveProps(nextProps: any) {
        console.log('>>?', nextProps);
        if (nextProps.app.veda) {
            console.log('>>!');
            const { veda } = nextProps.app;
            veda.loadShader({ vs, fs });
            veda.start();
        }
    }

    componentWillUnmount() {}

    render() {
        return <div>ホームだよ</div>;
    }
}

export default connect(s => s)(Home);

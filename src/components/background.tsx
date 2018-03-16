import * as React from 'react';
import { Link } from 'react-router-dom';
import * as styledComponents from 'styled-components';
const styled = styledComponents.default;
import { initVeda } from './actions';
import GL from '../gl';
import { connect } from 'react-redux';

const Div = styled.div`
    position: fixed;
    width: calc(100% - 240px);
    height: 100%;
    top: 0;
    right: 0;
`;

class Background extends React.Component<any, any> {
    el?: HTMLElement;

    componentDidMount() {
        const gl = new GL(this.el!);
        this.props.dispatch(initVeda(gl));
    }

    setRef = (el: HTMLElement) => {
        this.el = el;
    };

    render() {
        return <Div innerRef={this.setRef} />;
    }
}

export default connect()(Background);

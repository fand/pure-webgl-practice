import * as React from 'react';
import { Link } from 'react-router-dom';
import * as styledComponents from 'styled-components';
const styled = styledComponents.default;
import { initVeda } from './actions';
import GL from '../gl';
import { connect } from 'react-redux';

const Div = styled.div`
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    right: 0;
`;

class Background extends React.Component<any, any> {
    el?: HTMLElement;
    gl?: GL;

    componentDidMount() {
        const gl = new GL(this.el!);
        this.props.dispatch(initVeda(gl));

        if (typeof window !== 'undefined') {
            window.addEventListener('mousemove', (e: MouseEvent) => {
                gl.setUniform('mouse', 'v2', {
                    x: e.pageX / window.innerWidth,
                    y: 1 - e.pageY / window.innerHeight,
                });
            });
        }
    }

    setRef = (el: HTMLElement) => {
        this.el = el;
    };

    render() {
        return <Div innerRef={this.setRef} />;
    }
}

export default connect()(Background);

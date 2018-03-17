import * as React from 'react';
import { Link } from 'react-router-dom';
import * as styledComponents from 'styled-components';
const styled = styledComponents.default;

const Nav = styled.nav`
    position: fixed;
    width: 240px;
    height: 100%;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2;

    li {
        line-height: 1.8em;
        list-style: none;
    }
    a,
    a:active,
    a:visited {
        color: #0ff;
    }
`;

export default () => (
    <Nav>
        <ul>
            <li>
                <Link to="/">Home</Link>
            </li>
            <li>
                <Link to="/mouse">Mouse Position</Link>
            </li>
            <li>
                <Link to="/backbuffer">backbuffer</Link>
            </li>
            <li>
                <Link to="/image">Image Texture</Link>
            </li>
            <li>
                <Link to="/video">Video Texture</Link>
            </li>
            <li>
                <Link to="/audio">Audio Input</Link>
            </li>
            <li>
                <Link to="/camera">WebCam</Link>
            </li>
        </ul>
    </Nav>
);

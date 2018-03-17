import * as React from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
require('codemirror/mode/clike/clike');
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';

import * as styledComponents from 'styled-components';
const { injectGlobal } = styledComponents;

injectGlobal`
    .CodeMirror {
        height: 100% !important;
        background: rgba(30, 30, 30, 0.5) !important;
    }
    .CodeMirror-gutters {
        background: none !important;
    }
    .Codemirror * {
        font-family: sans-serif !important;
    }
`;

interface IProps {
    initValue: string;
    onChange: (editor: any, data: any, value: any) => void;
}

const Editor = (props: IProps) => (
    <CodeMirror
        value={props.initValue}
        options={{
            mode: 'clike',
            theme: 'material',
            lineNumbers: true,
        }}
        onChange={props.onChange}
    />
);

export default Editor;

import React from 'react';
import block from 'propmods';

const b = block('{{name}}');

export default class {{name}} extends React.Component {
    render() {
        return <div {...b()}>
        </div>;
    }
}
import React from 'react';

export default function withProps(Component, extraProps) {
    return function withPropsComponent(props) {
        return <Component {...props} {...extraProps} />;
    };
}

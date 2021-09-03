import React from 'react';
import css from './styles.css';
import PropTypes from 'prop-types';

export default function Spacer(props) {
    let rootStyle = { width: props.width };
    return (
        <div className={css.root} style={rootStyle}>
            <div className={css.inner} />
        </div>
    );
}

Spacer.propTypes = {
    width: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]).isRequired,
};

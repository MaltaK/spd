import React from 'react';
import PropTypes from 'prop-types';
import Block from '../block';
import cn from 'classnames';
import css from './styles.css';

function Label({
    pure,
    bold,
    italic,
    wrap,
    selectable,
    className: userClassName,
    caption,
    inline,
    width,
    ...userProps
}) {
    let className = cn({
        [css.bold]: bold,
        [css.italic]: italic,
        [css.wrap]: wrap,
        [css.noSelect]: !selectable,
    }, css.caption, userClassName);
    let label = (<div className={className} {...userProps}>{caption}</div>);
    return pure ? label : (<Block inline={inline} width={width}>{label}</Block>);
}

Label.propTypes = {
    pure: PropTypes.bool,
    bold: PropTypes.bool,
    italic: PropTypes.bool,
    wrap: PropTypes.bool,
    selectable: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object,
    caption: PropTypes.node,
};

export default Label;

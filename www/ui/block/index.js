import React from 'react';
import cn from 'classnames';
import css from './styles.css';
import PropTypes from 'prop-types';

function Block({
    rootStyle,
    rootClassName,
    className: userClassName,
    width,
    height,
    inline = true,
    pure,
    container,
    children,
    ...userProps
}, ref) {
    let className = cn(rootClassName, css.root, {
        [css.inline]: inline,
        [css.notPure]: !pure,
    });
    let wrapperClassName = cn(userClassName, css.wrapper, {
        [css.fullWidth]: width != null,
        [css.fullHeight]: height != null,
        [css.container]: container,
    });
    let style = { ...rootStyle, width, height };
    return (
        <div className={className} style={style} ref={ref}>
            <div {...userProps} className={wrapperClassName}>
                {children}
            </div>
        </div>
    );
}

let BlockRef = React.forwardRef(Block);

BlockRef.propTypes = {
    rootClassName: PropTypes.string,
    className: PropTypes.string,
    width: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
    height: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
    inline: PropTypes.bool,
    pure: PropTypes.bool,
    container: PropTypes.bool,
};

export default React.memo(BlockRef);

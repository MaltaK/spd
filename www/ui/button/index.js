import React, { useState, useRef, useEffect } from 'react';
import Block from '../block';
import css from './styles.css';
import cn from 'classnames';
import PropTypes from 'prop-types';

function Button({
    disabled,
    pure,
    focus,
    img,
    imgStyle,
    caption,
    className: customClassName,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    tooltip,
    tooltipPos = 'topright',
    width,
    inline = true,
    ...userProps
}) {

    let ref = useRef();

    useEffect(() => {
        window.setTimeout(() => {
            if (focus && ref.current)
                ref.current.focus();
        }, 0);
    }, [focus]);

    let [ pressed, setPressed ] = useState(false);

    function handleClick(event) {
        if (disabled || !onClick)
            return;
        onClick(event);
    }

    function handleMouseDown(event) {
        setPressed(true);
        if (onMouseDown)
            onMouseDown(event);
    }

    function handleMouseUp() {
        setPressed(false);
        if (onMouseUp)
            onMouseUp(event);
    }

    function handleMouseLeave() {
        setPressed(false);
        if (onMouseLeave)
            onMouseLeave(event);
    }

    let className = cn(customClassName, css.button, {
        [css.pressed]: pressed,
        [css.disabled]: disabled,
        [css.tooltip]: tooltip != null && !disabled,
        [css.tooltipTopRight]: tooltip != null && !disabled && tooltipPos === 'topright',
        [css.tooltipTopLeft]: tooltip != null && !disabled && tooltipPos === 'topleft',
        [css.tooltipBootom]: tooltip != null && !disabled && tooltipPos === 'bootom',
    });

    let btn = (
        <button
            ref={ref}
            className={className}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            disabled={disabled}
            {...userProps}
            { ...{'data-tooltip': tooltip } }
        >
            <div className={css.caption}>{ img ?
                <React.Fragment>
                    <img style={imgStyle ? imgStyle : { width: '18px', margin: '0px', position: 'absolute' }} src={img} />
                    <span style={{ paddingLeft: '30px' }}>{caption}</span>
                </React.Fragment> : caption}
            </div>
        </button>
    );

    return pure ? btn : (
        <Block width={width} inline={inline}>
            {btn}
        </Block>
    );

}

Button.propTypes = {
    disabled: PropTypes.bool,
    pure: PropTypes.bool,
    focus: PropTypes.bool,
    caption: PropTypes.string,
    onClick: PropTypes.func,
    tooltip: PropTypes.string,
    tooltipPos: PropTypes.oneOf([ 'topright', 'topleft', 'bootom' ]),
    width: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
};

export default Button;

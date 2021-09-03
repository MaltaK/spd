import React, { useRef, useEffect } from 'react';
import cn from 'classnames';
import Block from '../block';
import css from './styles.css';
import PropTypes from 'prop-types';

function TextArea({
    width = 300,
    height = 100,
    value,
    onChange,
    className,
    pure,
    inline = true,
    focus,
    style: userStyle,
    resize = 'none',
    ...userProps
}) {

    let ref = useRef();

    useEffect(() => {
        if (focus)
            ref.current.focus();
    }, [focus]);

    function handleChange(event) {
        if (onChange)
            onChange(event.target.value);
    }

    let style = {
        ...userStyle,
        resize,
    };

    let textarea = (
        <textarea
            {...userProps}
            ref={ref}
            spellCheck="false"
            style={style}
            className={cn(css.textarea, className)}
            value={value || ''}
            onChange={handleChange}
        />
    );

    return pure ? textarea : (
        <Block
            width={width}
            height={height}
            inline={inline}
        >
            {textarea}
        </Block>
    );

}

TextArea.propTypes = {
    inline: PropTypes.bool,
    pure: PropTypes.bool,
    focus: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func,
    width: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
    height: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
    className: PropTypes.string,
    resize: PropTypes.oneOf([ 'none', 'both', 'horizontal', 'vertical' ]),
};

export default TextArea;


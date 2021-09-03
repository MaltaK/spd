import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Block from '../block';
import css from './styles.css';

function TextInput({
    className: userClassName,
    width,
    focus = false,
    inline = true,
    onChange,
    value,
    pure,
    invalid,
    ...userProps
}, fref) {

    let ref = useRef();

    useEffect(() => {
        if (!fref)
            return;
        if (typeof fref === 'function')
            fref(ref.current);
        fref.current = ref.current;
    }, [fref]);

    useEffect(() => {
        if (focus)
            ref.current.focus();
    }, [focus]);

    function handleChange(event) {
        if (onChange)
            onChange(event.target.value);
    }

    const className = cn(css.input, userClassName, { [css.invalid]: invalid });
    let input = <input
        {...userProps}
        ref={ref}
        className={className}
        type="text"
        value={value || ''}
        onChange={handleChange}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
    />;
    return pure ? input : <Block width={width} inline={inline}>{input}</Block>;
}

let TextInputRef = React.forwardRef(TextInput);

TextInputRef.propTypes = {
    focus: PropTypes.bool,
    onChange: PropTypes.func,
    refInput: PropTypes.func,
    value: PropTypes.string,
    pure: PropTypes.bool,
    invalid: PropTypes.bool,
};

export default React.memo(TextInputRef);

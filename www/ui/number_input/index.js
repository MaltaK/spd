import React, { useRef, useState, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import css from './style.css';
import TextInput from '../text_input';
import Block from '../block';
import Spin, { DIRS } from './spin';
import { KEYCODE } from 'hooks/useHotkeys';

const floatReg = /^-?(([1-9]\d*)?\d)?\.0*$/;

function valueToText(value) {
    return value === null ? '' : String(value);
}

function textToValue(text) {
    return (text.trim() === '' || isNaN(Number(text))) ? null : Number(text);
}

function isText(text, float) {
    return text === '-' || (float && floatReg.test(text));
}

function textToNearestValue(text, float) {
    if (float && floatReg.test(text))
        return Number(text);
    return text === '-' ? 0 : textToValue(text);
}

function valueToNumber(value) {
    return value === null ? 0 : value;
}

function valueToRoundedValue(value, float) {
    if (value === null)
        return null;
    let n = 10 ** float;
    return Math.round(value * n) / n;
}

function NumberInput({
    value = null,
    disabled = false,
    min = null,
    max = null,
    step = 1,
    float = 0,
    pure,
    width,
    inline,
    onChange,
    className,
    ...userProps
}) {

    let ref = useRef();

    let [ focused, setFocused ] = useState(false);

    let [ text, setText ] = useState(valueToText(value));

    useLayoutEffect(() => {
        setText(valueToText(value));
    }, [value]);

    function getBoundaryValue(value) {
        if (value === null)
            return null;
        if (min !== null && value < min)
            return min;
        if (max !== null && value > max)
            return max;
        return value;
    }

    function getChangeRegExp() {
        let int = '(([1-9]\\d*)?\\d)?';
        if (float)
            return new RegExp(`^-?${int}(\\d\\.)?\\d{0,${float}}$`);
        return new RegExp(`^-?${int}$`);
    }

    function handleChange(data) {
        if (!getChangeRegExp().test(data))
            return;
        if (isText(data, float)) {
            setText(data);
        } else {
            let value = valueToRoundedValue(getBoundaryValue(textToValue(data)), float);
            onChange(value);
            setText(valueToText(value));
        }
    }

    function changeValueByStep(directedStep) {
        let nearestNumber = valueToNumber(textToNearestValue(text, float));
        onChange(valueToRoundedValue(getBoundaryValue(nearestNumber + directedStep), float));
    }

    function handleWheel({ deltaY }) {
        if (focused && deltaY !== 0)
            changeValueByStep(deltaY > 0 ? -step : step);
    }

    function handleKeyDown(event) {
        if (event.keyCode === KEYCODE.UP) {
            event.preventDefault();
            changeValueByStep(step);
        }
        if (event.keyCode === KEYCODE.DOWN) {
            event.preventDefault();
            changeValueByStep(-step);
        }
    }

    function handleSpinClick(directedStep) {
        if (!focused)
            ref.current.focus();
        changeValueByStep(directedStep);
    }

    function handleFocus() {
        setFocused(true);
    }

    function handleBlur() {
        setFocused(false);
    }

    function handlePaste(event) {
        event.preventDefault();
        let data = (event.clipboardData || window.clipboardData).getData('text');
        if (!getChangeRegExp().test(data))
            return;
        if (!isText(data, float)) {
            let value = valueToRoundedValue(getBoundaryValue(textToValue(data)), float);
            onChange(value);
            setText(valueToText(value));
        }
    }

    function render() {
        return (
            <div className={cn(css.wrapper, className)}>
                <TextInput
                    pure
                    value={text}
                    onChange={handleChange}
                    className={css.input}
                    disabled={disabled}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onWheel={handleWheel}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    ref={ref}
                    {...userProps}
                />
                <Spin dir={DIRS.UP} disabled={disabled} onClick={handleSpinClick.bind(null, step)} />
                <Spin dir={DIRS.DOWN} disabled={disabled} onClick={handleSpinClick.bind(null, -step)} />
            </div>
        );
    }

    return pure ? render() : <Block width={width} inline={inline}>{render()}</Block>;
}

NumberInput.propTypes = {
    value: PropTypes.number,
    disabled: PropTypes.bool,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    float: PropTypes.number,
    pure: PropTypes.bool,
    width: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
    inline: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default NumberInput;

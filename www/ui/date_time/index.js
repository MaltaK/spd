import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import moment from 'moment';
import TextInput from '../text_input';
import Popup from '../popup';
import Picker from './picker';
import css from './style.css';

moment.locale('ru');

function instanceOfMoment(props, propName, componentName) {
    if (props[propName] != null && !moment.isMoment(props[propName])) {
        return new Error(`Invalid prop ${'`' + propName + '`'} of type ${'`' + (typeof props[propName]) + '`'} supplied to ${'`' + componentName + '`'}, expected instance of \`Moment Date\``);
    }
}

function isTargetInParent(target, parent) {
    let i = target;
    while (i) {
        if (i === parent)
            return true;
        i = i.parentNode;
    }
    return false;
}

function DateTime({
    format = 'DD.MM.YYYY HH:mm:ss',
    dateOnly = false,
    value,
    canReset = true,
    canNowset = true,
    min,
    max,
    onChange,
    disabled,
    className,
    onClick,
    ...userProps
}) {

    let ref = useRef();

    let pickerRef = useRef();

    let [ popup, setPopup ] = useState({ open: false });

    let [ temp, setTemp ] = useState(value);

    useEffect(() => {
        setTemp(value);
    }, [value]);

    useEffect(() => {
        if (!disabled)
            return;
        setTemp(value);
        setPopup({ open: false });
    }, [ disabled, value ]);

    useEffect(() => {
        function handleFocusIn({ target }) {
            if (target !== ref.current && !isTargetInParent(target, pickerRef.current)) {
                setTemp(value);
                setPopup({ open: false });
            }
        }
        window.addEventListener('focusin', handleFocusIn);
        return () => window.removeEventListener('focusin', handleFocusIn);
    }, [value]);

    function handleInputFocus() {
        let { left: x, bottom: y } = ref.current.getClientRects()[0];
        setPopup({ x, y, open: true });
    }

    function handleClick(event) {
        event.stopPropagation();
        if (onClick)
            onClick(event);
    }

    function isOutOfBoundaries(date) {
        return (min && min.isAfter(date)) || (max && max.isBefore(date));
    }

    function validatedInterval(value) {
        if (min && min.isAfter(value))
            return min;
        if (max && max.isBefore(value))
            return max;
        return value;
    }

    function handleChange(value) {
        setTemp(validatedInterval(value));
    }

    function handleRequestClose() {
        setPopup({ open: false });
        setTemp(value);
    }

    function handleSelect() {
        setPopup({ open: false });
        if (onChange)
            onChange(moment.isMoment(temp) ? temp.clone() : null);
    }

    return (
        <React.Fragment>
            <TextInput
                onFocus={handleInputFocus}
                ref={ref}
                value={moment.isMoment(temp) ? temp.format(format) : ''}
                className={cn(css.input, className)}
                disabled={disabled}
                onClick={handleClick}
                {...userProps}
            />
            <Popup x={popup.x} y={popup.y} open={popup.open} onRequestClose={handleRequestClose}>
                <div className={css.picker} ref={pickerRef}>
                    <Picker
                        onChange={handleChange}
                        onSelect={handleSelect}
                        value={temp}
                        isOutOfBoundaries={isOutOfBoundaries}
                        canReset={canReset}
                        canNowset={canNowset}
                        dateOnly={dateOnly}
                    />
                </div>
            </Popup>
        </React.Fragment>
    );
}

DateTime.propTypes = {
    format: PropTypes.string,
    dateOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    canReset: PropTypes.bool,
    value: instanceOfMoment,
    min: instanceOfMoment,
    max: instanceOfMoment,
    onChange: PropTypes.func.isRequired,
};

export default DateTime;

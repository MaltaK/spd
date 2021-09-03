import React, { useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import moment from 'moment';
import TextInput from '../text_input';
import TextInputMasked from '../text_input_masked';
import { KEYCODE } from 'hooks/useHotkeys';
import css from './style.css';

const nullTime = moment('00:00:00', 'HH:mm:ss');

const masks = {
    'HH:mm:ss': [
        { valid: /\d*/, length: 2, next: /\d{2}/ }, ':',
        { valid: /\d*/, length: 2, next: /\d{2}/ }, ':',
        { valid: /\d*/, length: 2 },
    ],
    'HH:mm': [
        { valid: /\d*/, length: 2, next: /\d{2}/ }, ':',
        { valid: /\d*/, length: 2 },
    ],
};

function complete(parts, format) {
    return moment(parts.join(':'), format).isValid();
}

function getPartByPosition(position) {
    if (position <= 2)
        return 'hours';
    if (position >= 6)
        return 'seconds';
    return 'minutes';
}

function Time({ value, onChange, format = 'HH:mm:ss', className: userClassName, ...userProps }) {

    let maskedInputRef = useRef();

    let focused = useRef(false);

    let doFocus = useRef(false);

    let cursor = useRef();

    let completeFormated = useCallback(parts => complete(parts, format), [format]);

    useEffect(() => {
        if (doFocus.current)
            doFocus.current = false;
    });

    function handleChange(str) {
        onChange(str.replace('_', '0'));
    }

    function initTime() {
        doFocus.current = true;
        onChange(nullTime.format(format));
    }

    function handleFocus() {
        focused.current = true;
    }

    function handleBlur() {
        focused.current = false;
    }

    function chagePartByHelper(action) {
        let date = moment(value, format);
        let part = getPartByPosition(cursor.current);
        date[action](1, part);
        onChange(date.format(format));
    }

    function handleKeyDown(event) {
        let up = event.keyCode === KEYCODE.UP;
        if (up || event.keyCode === KEYCODE.DOWN) {
            event.preventDefault();
            chagePartByHelper(up ? 'add' : 'subtract');
        }
    }

    function handleCursorChange(position) {
        cursor.current = position;
    }

    function handleWheel({ deltaY, pageX, target }) {
        if (deltaY === 0 || !focused.current)
            return;
        let { left } = target.getBoundingClientRect();
        let pos = Math.max(0, Math.round((pageX - left - 3) / 6));
        maskedInputRef.current.setInputPos(pos);
        chagePartByHelper(deltaY < 0 ? 'add' : 'subtract');
    }

    let className = cn(css.timeInput, userClassName, {
        [css.large]: format === 'HH:mm:ss',
        [css.small]: format === 'HH:mm',
    });

    if (!value)
        return (
            <TextInput
                {...userProps}
                className={className}
                value=""
                onFocus={initTime}
            />
        );

    return (
        <TextInputMasked
            {...userProps}
            className={className}
            ref={maskedInputRef}
            focus={doFocus.current}
            mask={masks[format]}
            complete={completeFormated}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onCursorChange={handleCursorChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onWheel={handleWheel}
        />
    );

}

Time.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    format: PropTypes.oneOf([ 'HH:mm:ss', 'HH:mm' ]),
};

export default Time;

import React, { useCallback, useState, useRef } from 'react';
import cn from 'classnames';
import css from './style.css';
import { useHotkeys, KEYCODE } from 'hooks/useHotkeys';

function Items({ hints, hintsPart, hintsRef, setOpen, scrollTo, onChange }) {

    const changing = useRef(false);

    const [ selected, setSelected ] = useState();

    const handleUpDown = useCallback((event, dtIndex) => {
        event.preventDefault();
        const index = hints.findIndex(hint => hint.key === selected);
        const hint = index === -1 ? hints[0] : hints[index + dtIndex];
        if (!hint)
            return;
        changing.current = true;
        scrollTo(hint.key);
        setSelected(hint.key);
    }, [ hints, scrollTo, selected ]);

    useHotkeys([KEYCODE.DOWN], useCallback(event => {
        handleUpDown(event, 1);
    }, [handleUpDown]));

    useHotkeys([KEYCODE.UP], useCallback(event => {
        handleUpDown(event, -1);
    }, [handleUpDown]));

    useHotkeys([KEYCODE.ENTER], useCallback(event => {
        event.preventDefault();
        if (selected !== undefined) {
            setOpen(false);
            onChange(selected);
        }
    }, [ onChange, selected, setOpen ]));

    function handleMouseEnter(key) {
        if (!changing.current)
            setSelected(key);
    }

    function handleClick(key) {
        hintsRef.current.focus();
        setOpen(false);
        onChange(key);
    }

    function handleMouseLeave() {
        if (!changing.current)
            setSelected(null);
    }

    function handleMouseMove() {
        changing.current = false;
    }

    return hintsPart.map(({ className: userClassName, key, style, caption }) => {
        const className = cn(css.hint, userClassName, {
            [css.selected]: key === selected,
        });
        return (
            <div
                key={key}
                className={className}
                onClick={handleClick.bind(null, key)}
                onMouseEnter={handleMouseEnter.bind(null, key)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={style}
                title={caption}
            >{caption}</div>
        );
    });
}

export default Items;

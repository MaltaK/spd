import React, { useState, useEffect } from 'react';
import cn from 'classnames';
import css from './style.css';
import spinUpImage from '../../images/triangle_up.png';
import spinDownImage from '../../images/triangle_down.png';

export const DIRS = Object.freeze({
    UP: 'UP',
    DOWN: 'DOWN',
});

function Spin({ dir, disabled, onClick }) {

    let [ pressed, setPressed ] = useState(false);

    useEffect(() => {
        if (disabled)
            setPressed(false);
    }, [disabled]);

    let className = cn(css.spin, {
        [css.up]: dir === DIRS.UP,
        [css.down]: dir === DIRS.DOWN,
        [css.pressed]: pressed,
        [css.disabled]: disabled,
    });

    function handleMouseDown(event) {
        event.preventDefault();
        setPressed(true);
    }

    function handleMouseUp() {
        setPressed(false);
    }

    return (
        <img
            src={dir === DIRS.UP ? spinUpImage : spinDownImage}
            className={className}
            onMouseDown={disabled ? undefined : handleMouseDown}
            onMouseUp={disabled ? undefined : handleMouseUp}
            onClick={onClick}
            draggable={false}
        />
    );
}


export default Spin;

import React from 'react';
import cn from 'classnames';
import crossImage from '../../images/cross.png';
import triangleDownImage from '../../images/triangle_down_small.png';
import css from './style.css';

function Actions({ showCross, showArrow, inputRef, onClear: handleClear }) {

    const crossClassName = cn(css.action, {
        [css.first]: showArrow,
        [css.second]: !showArrow,
        [css.hidden]: !showCross,
    });

    const arrowClassName = cn(css.action, css.second, {
        [css.hidden]: !showArrow,
    });

    function handleArrowClick() {
        inputRef.current.focus();
    }

    return (
        <React.Fragment>
            <img src={crossImage} className={crossClassName} onMouseDown={handleClear} />
            <img src={triangleDownImage} className={arrowClassName} onClick={handleArrowClick} />
        </React.Fragment>
    );
}

export default Actions;

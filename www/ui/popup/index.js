import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Portal from '../portal';
import css from './styles.css';

function Popup({
    open = false,
    x = 0,
    y = 0,
    pure,
    up = false,
    style: userStyle,
    className: userClassName,
    onContextMenu,
    onRequestClose,
    onClick,
    children,
    ...userProps
}) {

    let handleReuestClose = useRef(onRequestClose);

    useEffect(() => {
        handleReuestClose.current = onRequestClose;
    });

    let ref = useRef();

    let [ offset, setOffset ] = useState({ x: 0, y: 0 });

    useLayoutEffect(() => {
        if (!open)
            return;
        let width = Math.max(document.documentElement.clientWidth, window.innerWidth, 0);
        let height = Math.max(document.documentElement.clientHeight, window.innerHeight, 0);
        let { width: elWidth, height: elHeight } = ref.current.getClientRects()[0];
        setOffset(offset => {
            let dX = -Math.max(0, x + offset.x + elWidth - width);
            let dY = -Math.max(0, y + offset.y + (up ? 0 : elHeight) - height);
            if (Math.abs(dX) >= 0.01 || Math.abs(dY) >= 0.01)
                return { x: offset.x + dX, y: offset.y + dY };
            return offset;
        });
        return () => setOffset({ x: 0, y: 0 });
    }, [ open, up, x, y ]);

    useEffect(() => {
        if (!open)
            return;
        function handleClick(event) {
            if (event.button === 2) {
                event.preventDefault();
                return;
            }
            if (handleReuestClose.current)
                handleReuestClose.current();
        }
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [open]);

    if (!open)
        return null;

    function handleClick(event) {
        event.stopPropagation();
        if (onClick)
            onClick(event);
    }

    function handleContextMenu(event) {
        if (event.button == 2 && onContextMenu)
            onContextMenu(event);
    }

    let style = {
        ...userStyle,
        left: x + offset.x,
        top: y + offset.y,
    };

    let className = cn(css.root, userClassName, {
        [css.face]: !pure,
        [css.up]: up,
    });

    return (
        <Portal target={document.body}>
            <div
                {...userProps}
                className={className}
                style={style}
                ref={ref}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
            >{children}</div>
        </Portal>
    );
}

Popup.propTypes = {
    open: PropTypes.bool,
    x: PropTypes.number,
    y: PropTypes.number,
    pure: PropTypes.bool,
    up: PropTypes.bool,
    style: PropTypes.object,
    className: PropTypes.string,
    onContextMenu: PropTypes.func,
    onRequestClose: PropTypes.func,
    onClick: PropTypes.func,
    children: PropTypes.node,
};

export default Popup;

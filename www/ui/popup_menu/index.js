import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Popup from '../popup';
import Item from './item';
import css from './styles.css';

function PopupMenu({ items, open, onSelect, onContextMenu, x, y, ...userProps }) {

    const [ mores, setMores ] = useState([]);

    useEffect(() => {
        setMores([]);
    }, [ open, x, y ]);

    if (!open)
        return null;

    function handleContextMenu(item, event) {
        if (onContextMenu)
            onContextMenu(event, item);
        else
            event.preventDefault();
    }

    function handleMouseEnter(key) {
        setMores(mores => {
            let more = mores.find(data => data.key === key);
            if (!more || more.locked)
                return mores;
            const nextMores = [...mores];
            do {
                const index = nextMores.findIndex(data => data.key === more.key);
                nextMores[index] = { ...nextMores[index], locked: true };
                more = more.parent;
            } while (more);
            return nextMores;
        });
    }

    function handleMouseLeave(key) {
        setMores(mores => {
            let index = mores.findIndex(data => data.key === key);
            if (index === -1)
                return mores;
            const nextMores = [...mores];
            nextMores[index] = { ...nextMores[index], locked: false };
            return nextMores;
        });
    }

    function renderItem(item) {
        return (
            <Item
                key={item.key}
                item={item}
                onContextMenu={handleContextMenu}
                onMouseDown={onSelect}
                setMores={setMores}
            />
        );
    }

    function renderMore(more) {
        return (
            <Popup
                key={more.key}
                open x={more.x}
                y={more.y}
                onContextMenu={handleContextMenu.bind(null, null)}
                onMouseEnter={handleMouseEnter.bind(null, more.key)}
                onMouseLeave={handleMouseLeave.bind(null, more.key)}
            >
                <div className={css.more}>
                    {more.items.map(renderItem)}
                </div>
            </Popup>
        );
    }

    return (
        <React.Fragment>
            {mores.map(renderMore)}
            <Popup {...userProps } open x={x} y={y} onContextMenu={handleContextMenu.bind(null, null)}>
                <div className={css.items}>
                    {items.map(renderItem)}
                </div>
            </Popup>
        </React.Fragment>
    );
}

const itemShape = {
    key: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]).isRequired,
    caption: PropTypes.string.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
};
itemShape.children = PropTypes.arrayOf(PropTypes.shape(itemShape));

PopupMenu.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape(itemShape)).isRequired,
    open: PropTypes.bool,
    onSelect: PropTypes.func,
    onContextMenu: PropTypes.func,
};

export default PopupMenu;

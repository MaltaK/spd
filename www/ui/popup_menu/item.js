import React from 'react';
import cn from 'classnames';
import css from './styles.css';
import triangleRightImage from '../images/triangle_right.png';

function Item({ item, onContextMenu, onMouseDown, setMores }) {

    const hasMore = Array.isArray(item.children) && item.children.length;

    const className = cn(css.item, item.className, {
        [css.moreItem]: hasMore,
    });

    function handleContextMenu(event) {
        event.stopPropagation();
        onContextMenu(item, event);
    }

    function handleMouseDown(event) {
        if (onMouseDown && event.button === 0)
            onMouseDown(item, event);
    }

    function handleMouseEnter({ target }) {
        const { top } = target.getBoundingClientRect();
        const { left, width } = target.parentElement.getBoundingClientRect();
        const x = left + width;
        const y = top - 1;
        setMores(mores => {
            const more = {
                key: item.key,
                locked: false,
                x,
                y,
                items: item.children,
                parent: mores.find(more => more.items.find(i => i.key === item.key)),
            };
            let nextMores = [more];
            let parent = more.parent;
            while (parent) {
                nextMores.push(parent);
                parent = parent.parent;
            }
            return nextMores;
        });
    }

    function handleMouseLeave() {
        window.setTimeout(() => {
            setMores(mores => {
                const more = mores.find(data => data.key === item.key);
                if (!more || more.locked)
                    return mores;
                const nextMores = [...mores];
                const index = nextMores.findIndex(data => data.key === item.key);
                nextMores.splice(index, 1);
                return nextMores;
            });
        }, 0);
    }

    function renderCaption() {
        if (!hasMore)
            return item.caption;
        return (
            <React.Fragment>
                <span>{item.caption}</span>
                <img className={css.moreArrow} src={triangleRightImage} />
            </React.Fragment>
        );
    }

    return (
        <div
            className={className}
            onContextMenu={handleContextMenu}
            onMouseDown={handleMouseDown}
            onMouseEnter={hasMore ? handleMouseEnter : undefined}
            onMouseLeave={hasMore ? handleMouseLeave : undefined}
            style={item.style}
        >{renderCaption()}</div>
    );
}

export default Item;

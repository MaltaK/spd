import React, { useRef, useState, useLayoutEffect, useCallback } from 'react';
import css from './style.css';
import Portal from '../../portal';
import Items from './items';

const hintHeight = parseInt(css.hintHeight, 10);

function Hint({ pos, hints, setOpen, onChange }) {

    const ref = useRef();

    const [ scroll, setScroll ] = useState(0);

    useLayoutEffect(() => {
        setScroll(0);
        if (ref.current)
            ref.current.scrollTop = 0;
    }, [hints]);

    const hintsHeight = Math.min((hints.length + 1) * hintHeight, 180);

    const winHeight = Math.max(document.documentElement.clientHeight, window.innerHeight, 0);

    const style = {
        left: pos.left,
        width: pos.width + 1,
        top: (hintsHeight + pos.top > winHeight) ? pos.bottom - hintsHeight : pos.top,
    };

    let isHeightInView = useCallback(height => {
        const hintsHeight = Math.min((hints.length + 1) * hintHeight, 180);
        let scroll = ref.current ? ref.current.scrollTop : 0;
        const dtscroll = scroll % hintHeight;
        scroll -= dtscroll;
        return scroll <= height && (scroll + hintsHeight) > height;
    }, [hints.length]);

    function handleScroll() {
        if (!ref.current)
            return setScroll(0);
        let scroll = ref.current.scrollTop;
        let dtscroll = scroll % hintHeight;
        scroll -= dtscroll;
        setScroll(scroll);
    }

    const scrollTo = useCallback(key => {
        const index = hints.findIndex(hint => hint.key === key);
        if (index === -1 || isHeightInView(index * hintHeight))
            return;
        if (isHeightInView((index - 1) * hintHeight)) {
            ref.current.scrollTop += hintHeight;
            handleScroll();
        } else if (isHeightInView((index + 1) * hintHeight)) {
            ref.current.scrollTop -= hintHeight;
            handleScroll();
        }
    }, [ hints, isHeightInView ]);

    function handleBlur() {
        setOpen(false);
    }

    function handleFocus() {
        setOpen(true);
    }

    if (hints.length === 0)
        return null;

    const hintsPart = hints.filter((item, index) => isHeightInView(index * hintHeight));

    return (
        <Portal target={document.body}>
            <div
                style={style}
                className={css.hints}
                tabIndex={0}
                onBlur={handleBlur}
                onFocus={handleFocus}
                onScroll={handleScroll}
                ref={ref}
            >
                <div style={{ height: hints.length * hintHeight }}>
                    <div style={{ paddingTop: scroll }} className={css.wrapper}>
                        <Items
                            hints={hints}
                            hintsPart={hintsPart}
                            scrollTo={scrollTo}
                            setOpen={setOpen}
                            onChange={onChange}
                            hintsRef={ref}
                        />
                    </div>
                </div>
            </div>
        </Portal>
    );
}

export default Hint;

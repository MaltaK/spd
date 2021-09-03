import React, { useLayoutEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import css from './styles.css';
import { Block, Portal, Select, Panel, ColorSelect, TextInput } from 'ui';

const fontItems = [
    { caption: 'Arial', value: 'Arial' },
    { caption: 'Times New Roman', value: 'Times New Roman' },
    { caption: 'Courier New', value: 'Courier New' },
    { caption: 'Verdana', value: 'Verdana' },
    { caption: 'Georgia', value: 'Georgia' },
    { caption: 'Tahoma', value: 'Tahoma' },
    { caption: 'SansSerif', value: 'SansSerif' },
];

const minWidth = '20px';
const minHeight = '15px';

function TextFont({
    value = '',
    font = 'Arial',
    size = 11,
    maxFontSize = 500,
    minFontSize = 1,
    transparent = true,
    focus,
    onChange,
    onSizeChange,
    onFontChange,
    onColorChange,
    color,
    className,
    onResize,
    onFocus,
    onBlur,
    ...userProps
}) {

    let onResizeRef = useRef(onResize);
    let [ panelVisible, setPanelVisible ] = useState(false);
    let ref = useRef();
    let textareaFocused = useRef(false);
    let panelFocused = useRef(false);

    useLayoutEffect(() => {
        window.setTimeout(() => {
            if (ref.current && focus) {
                ref.current.focus();
                textareaFocused.current = true;
            }
        }, 0);
    }, [focus]);

    useLayoutEffect(() => {
        onResizeRef.current = onResize;
    });

    useLayoutEffect(() => {
        window.setTimeout(() => {
            if (!ref.current)
                return;
            let { width: oldWidth, height: oldHeight } = ref.current.getBoundingClientRect();
            ref.current.style.width = minWidth;
            ref.current.style.height = minHeight;
            let width = ref.current.scrollWidth;
            let height = ref.current.scrollHeight;
            ref.current.style.width = `${width + 2}px`;
            ref.current.style.height = `${height + 2}px`;
            if ((parseInt(oldWidth, 10) !== width || parseInt(oldHeight, 10) !== height) && onResizeRef.current)
                onResizeRef.current(width, height);
        }, 0);
    }, [ size, font, value ]);

    function handleSizeChange(value) {
        let s = value ? Number(value) : null;
        if (!isNaN(s) || !s)
            onSizeChange(s);
    }

    function handleFontChange(value) {
        onFontChange(value);
    }

    function handleColorChange(value) {
        onColorChange(value);
    }

    function handlePanelFocus() {
        panelFocused.current = true;
    }

    function hidePanel() {
        setPanelVisible(false);
    }

    function handlePanelBlur() {
        panelFocused.current = false;
        window.setTimeout(() => {
            if (!panelFocused.current && !textareaFocused.current)
                hidePanel();
        }, 0);
    }

    function handleFocus() {
        textareaFocused.current = true;
        setPanelVisible(true);
        onFocus();
    }

    function handleBlur() {
        textareaFocused.current = false;
        window.setTimeout(() => {
            if (!panelFocused.current)
                hidePanel();
        }, 0);
        onBlur();
    }

    function handleChange(event) {
        onChange(event.target.value);
    }

    function getSizeValue() {
        if (!size)
            return minFontSize;
        let value = size.toFixed(0);
        if (value < minFontSize)
            return minFontSize;
        if (value > maxFontSize)
            return maxFontSize;
        return value;
    }

    function isSizeInvlalid() {
        return !(/\d*(.\d+)?/).test(size) || Math.abs(Number(size)) > maxFontSize || Math.abs(Number(size)) < minFontSize;
    }

    function renderPanel() {
        if (!panelVisible)
            return null;
        let { top, left } = ref.current.getBoundingClientRect();
        let style = {
            position: 'absolute',
            zIndex: 2000,
            top: (top - 40) + 'px',
            left: (left - 10) + 'px',
        };
        return (
            <Portal target={document.body}>
                <div className={css.blocker} onMouseDown={handlePanelBlur} />
                <div style={style} onMouseDown={handlePanelFocus}>
                    <Panel>
                        <TextInput
                            width={50}
                            value={String(size || '')}
                            onChange={handleSizeChange}
                            invalid={isSizeInvlalid()}
                        />
                        <Select
                            items={fontItems}
                            width={150}
                            value={font}
                            onChange={handleFontChange}
                        />
                        <ColorSelect
                            value={color}
                            onChange={handleColorChange}
                        />
                    </Panel>
                </div>
            </Portal>
        );
    }

    let style = {
        color,
        fontFamily: font,
        fontSize: getSizeValue(),
        minWidth,
        minHeight,
    };
    return (
        <Block className={css.root}>
            {renderPanel()}
            <textarea
                {...userProps}
                style={style}
                ref={ref}
                wrap="off"
                spellCheck="false"
                className={cn(css.textarea, className, { [css.transparent]: transparent })}
                value={value}
                onFocus={handleFocus}
                onChange={handleChange}
                onBlur={handleBlur}
            />
        </Block>
    );
}

TextFont.propTypes = {
    focus: PropTypes.bool,
    transparent: PropTypes.bool,
    size: PropTypes.number,
    font: PropTypes.string,
    maxFontSize: PropTypes.number,
    minFontSize: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    onSizeChange: PropTypes.func.isRequired,
    onFontChange: PropTypes.func.isRequired,
    onColorChange: PropTypes.func.isRequired,
    onResize: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    color: PropTypes.string,
    value: PropTypes.string,
};

export default React.memo(TextFont);

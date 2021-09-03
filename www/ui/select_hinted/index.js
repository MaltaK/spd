import React, { useRef, useState, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import Block from '../block';
import cn from 'classnames';
import css from './style.css';
import Actions from './actions';
import Hint from './hint';

function sortByCaption(sort, a, b) {
    const aCaption = a.caption.toLowerCase();
    const bCaption = b.caption.toLowerCase();
    if (aCaption > bCaption)
        return sort;
    if (aCaption < bCaption)
        return -sort;
    return 0;
}

function filterByCaption(search, item) {
    return item.caption.toLowerCase().indexOf(search.toLowerCase()) !== -1;
}

function searchHint(hints, search) {
    const strict = hints.find(({caption}) => caption === search);
    return strict || hints.find(({caption}) => caption.toLowerCase() === search.toLowerCase());
}

function SelectHinted({
    width = 160,
    value = null,
    onChange,
    hints: hints,
    sort,
    emptyCaption,
    focus = false,
    inline,
    pure,
    className: userClassName,
    style: userStyle,
    ...userProps
}) {

    const openRef = useRef(false);

    const onChangeRef = useRef(onChange);

    const [ open, setOpen ] = useState(false);

    const [ search, setSearch ] = useState(null);

    const [ pos, setPos ] = useState({});

    const inputRef = useRef();

    const selected = hints.find(({key}) => key === value);

    const hintsSorted = useMemo(() => sort ? hints.slice().sort(sortByCaption.bind(null, sort)) : hints, [ hints, sort ]);

    const hintsFiltered = useMemo(() => {
        if (search)
            return hintsSorted.filter(filterByCaption.bind(null, search));
        if (selected)
            return hintsSorted.filter(filterByCaption.bind(null, selected.caption));
        return hintsSorted;
    }, [ hintsSorted, search, selected ]);

    useEffect(() => {
        onChangeRef.current = onChange;
    });

    useEffect(() => {
        setSearch(null);
    }, [value]);

    useEffect(() => {
        if (focus)
            inputRef.current.focus();
    }, [focus]);

    useEffect(() => {
        function handleAnyScroll() {
            setOpen(false);
        }
        function addListener(item) {
            item.addEventListener('scroll', handleAnyScroll);
            if (item.parentNode)
                addListener(item.parentNode);
        }
        function removeListener(item) {
            item.removeEventListener('scroll', handleAnyScroll);
            if (item.parentNode)
                removeListener(item.parentNode);
        }
        let inputNode = inputRef.current;
        addListener(inputNode.parentNode);
        return () => removeListener(inputNode.parentNode);
    }, []);

    const updateHintsPosition = useCallback(() => {
        let { bottom: top, top: bottom, left, width } = inputRef.current.getBoundingClientRect();
        setPos({ top, bottom, left, width });
    }, []);

    useLayoutEffect(() => {
        updateHintsPosition();
    }, [ updateHintsPosition, search ]);

    function handleChange({target}) {
        if (target.value === '') {
            if (value !== null)
                onChange(null);
            setSearch(null);
            return;
        }
        const search = searchHint(hintsFiltered, target.value);
        if (search && value !== search.key)
            onChange(search.key);
        if (!search)
            setSearch(target.value);
    }

    function handleFocus() {
        updateHintsPosition();
        openRef.current = true;
        setOpen(true);
    }

    function handleBlur() {
        openRef.current = false;
        window.setTimeout(() => {
            if (!openRef.current) {
                setOpen(false);
                setSearch(null);
            }
        }, 0);
    }

    function handleHintSetOpen(open) {
        openRef.current = open;
        window.setTimeout(() => {
            if (!openRef.current)
                setOpen(false);
        }, 0);
    }

    function handleClear() {
        setOpen(false);
        setSearch(null);
        if (value !== null)
            onChange(null);
    }

    const handleHintChange = useCallback(value => {
        setSearch(null);
        onChangeRef.current(value);
    }, []);

    const style = {
        ...userStyle,
        ...(selected ? selected.style : undefined),
    };

    const className = cn(css.input, userClassName, selected ? selected.className : undefined, {
        [css.inputLong]: (Boolean(selected) && open) || (!selected && !open),
    });

    function getValue() {
        if (search !== null)
            return search;
        if (value === null)
            return (emptyCaption && !open) ? emptyCaption : '';
        if (selected)
            return selected.caption;
        return '';
    }

    function renderHint() {
        if (!open)
            return null;
        return (
            <Hint
                pos={pos}
                hints={hintsFiltered}
                setOpen={handleHintSetOpen}
                onChange={handleHintChange}
            />
        );
    }

    return (
        <Block width={width} inline={inline} pure={pure}>
            <div className={css.select}>
                <input
                    {...userProps}
                    className={className}
                    type="text"
                    value={getValue()}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    ref={inputRef}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    style={style}
                />
                <Actions
                    showArrow={!open}
                    showCross={Boolean(selected)}
                    inputRef={inputRef}
                    onClear={handleClear}
                />
            </div>
            {renderHint()}
        </Block>
    );
}

SelectHinted.propTypes = {
    width: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]),
    inline: PropTypes.bool,
    pure: PropTypes.bool,
    focus: PropTypes.bool,
    hints: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]).isRequired,
        caption: PropTypes.string.isRequired,
        style: PropTypes.object,
        className: PropTypes.string,
    })).isRequired,
    sort: PropTypes.oneOf([ 1, -1 ]),
    emptyCaption: PropTypes.string,
    value: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]),
    onChange: PropTypes.func.isRequired,
};

export default SelectHinted;

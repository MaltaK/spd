import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Block from '../block';
import css from './styles.css';

function isCutable(caption) {
    if (typeof caption !== 'string')
        return false;
    return caption.length >= 100;
}

function Select({
    value,
    items,
    undefinedCaption = '',
    addUndefinedValue,
    width,
    onChange,
    inline = true,
    pure = false,
    className: userClassName,
    ...userProps
}) {

    function getItems() {
        let hasUndefined = items.find(item => item.value === undefined);
        if (!hasUndefined && addUndefinedValue)
            return [ { caption: undefinedCaption, value: undefined }, ...items ];
        return items;
    }

    function handleChange(event) {
        let value = event.target.value;
        let index = event.target.selectedIndex;
        let dataUndefined = index !== undefined && getItems()[index].value === undefined;
        if (onChange)
            onChange(dataUndefined ? undefined : value);
    }

    let renderedItems = getItems().map((item, index) => {
        const cutable = isCutable(item.caption);
        return (
            <option key={index} value={item.value} style={item.style} title={cutable ? item.caption : undefined}>
                {cutable ? item.caption.substr(0, 100) + '...' : item.caption}
            </option>
        );
    });
    return (
        <Block className={css.root} width={width} inline={inline} pure={pure}>
            <select className={cn(css.select, userClassName)} value={value} onChange={handleChange} {...userProps}>
                {renderedItems}
            </select>
        </Block>
    );
}

Select.propTypes = {
    value: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]),
    undefinedCaption: PropTypes.string,
    addUndefinedValue: PropTypes.bool,
    width: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]),
    onChange: PropTypes.func,
    inline: PropTypes.bool,
    pure: PropTypes.bool,
    className: PropTypes.string,
};

export default Select;

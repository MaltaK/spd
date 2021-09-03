import React from 'react';
import cn from 'classnames';
import Block from '../block';
import css from './styles.css';
import onImage from '../images/radio_on.png';
import offImage from '../images/radio_off.png';

export default function Radio({
    width,
    inline = true,
    onChange,
    horizontal = false,
    value,
    items,
    caption,
    className: userClassName,
    ...userProps
}) {

    function handleChange(value) {
        if (onChange)
            onChange(value);
    }

    function handleKeyPress(event) {
        if (event.keyCode != 9)
            handleChange();
    }

    let renderedItems = items.map((item, index) => (
        <Block key={index} className={css.item} inline={horizontal}>
            <img className={css.mark} src={value == item.value ? onImage : offImage} tabIndex={0} onClick={handleChange.bind(null, item.value)} onKeyPress={handleKeyPress} />
            <div className={css.label} onClick={handleChange.bind(null, item.value)}>
                {item.caption}
            </div>
        </Block>
    ));

    function render() {
        return (
            <React.Fragment>
                { caption ? <Block className={css.caption} inline={horizontal}>{ caption }</Block> : null }
                {renderedItems}
            </React.Fragment>
        );
    }

    return (
        <Block {...userProps} className={cn(css.root, userClassName)} container inline={inline} width={width}>
            {render()}
        </Block>
    );
}

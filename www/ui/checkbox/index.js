import React from 'react';
import Block from '../block';
import css from './styles.css';
import cn from 'classnames';
import checkedImage from '../images/checked.png';
import uncheckedImage from '../images/unchecked.png';
import unknownImage from '../images/unknown.png';
import disabledImage from '../images/disabled.png';
import blockImage from '../images/block.png';

function Checkbox({
    caption,
    disabled,
    block,
    unknown,
    value,
    pure,
    width,
    onChange,
    backgroundColor,
    className: userClassName,
    inline = true,
    ...userProps
}) {

    function handleChange(event) {
        // console.log(event.keyCode);
        if (event.keyCode != 9 && event.keyCode != 13 && event.keyCode != 27 && !disabled && onChange)
            onChange(!value);
    }

    function getSrc() {
        if (disabled)
            return disabledImage;
        if (block)
            return blockImage;
        if (unknown)
            return unknownImage;
        if (value)
            return checkedImage;
        if (!value)
            return uncheckedImage;
        return disabledImage;
    }

    function renderImg() {
        let className = cn(css.mark, { [css.disabledImg]: disabled });
        return (
            <img
                className={className}
                src={getSrc()}
                tabIndex={0}
                style={backgroundColor ? {backgroundColor} : null}
                onClick={handleChange}
                // onKeyPress={handleChange}
            />
        );
    }

    function handleKeyDown(event) {
        // console.log(event.keyCode);
        // if (event.keyCode == 13) {
        //     this.onEdit();
        // } else if (event.keyCode == 27) {
        //     this.cancelEdit();
        // }
    }

    if (pure)
        return (
            <div className={cn(css.pureRoot, userClassName)} {...userProps}>
                {/* onKeyDown={handleKeyDown} */}
                {renderImg()}
            </div>
        );
    let className = cn(css.label, { [css.disabled]: disabled });
    return (
        <Block width={width} inline={inline}>
            <div className={cn(css.root, userClassName)} {...userProps}>
                {renderImg()}
                <div className={className} onClick={handleChange}>
                    {caption}
                </div>
            </div>
        </Block>
    );
}

export default Checkbox;

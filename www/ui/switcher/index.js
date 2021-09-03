import React from 'react';
import cn from 'classnames';
import Block from '../block';
import css from './styles.css';
import PropTypes from 'prop-types';

export default class Switcher extends React.Component {

    static defaultProps = {
        tooltip: 'topright',
    }

    static propTypes = {
        tooltip: PropTypes.oneOf([ 'topright', 'topleft' ]),
        vertical: PropTypes.bool,
        disabled: PropTypes.bool,
        pure: PropTypes.bool,
        onChange: PropTypes.func,
        items: PropTypes.arrayOf(PropTypes.shape({
            value: PropTypes.any,
            caption: PropTypes.string,
            icon: PropTypes.string,
        })),
    }

    render() {
        let renderedItems = (this.props.items || []).map((item, index) => {
            let itemClassName = cn(css.item, {
                [css.itemSelected]: this.props.value == item.value,
                [css.itemTooltip]: true,
                [css.itemTopRightTooltip]: this.props.tooltip == 'topright',
                [css.itemTopLeftTooltip]: this.props.tooltip == 'topleft',
                [css.itemVertical]: this.props.vertical,
                [css.disabled]: this.props.disabled,
            });
            let onMouseDown = () => !this.props.disabled && this.props.onChange && this.props.onChange(item.value);
            return (
                <div
                    key={index}
                    className={itemClassName}
                    onMouseDown={onMouseDown}
                    { ...{'data-tooltip': item.caption }}>
                    <img src={item.icon} className={css.image} draggable={false} />
                </div>
            );
        });
        let renderedSwitcher = <div className={css.root}>{renderedItems}</div>;
        return this.props.pure ? renderedSwitcher : <Block>{renderedSwitcher}</Block>;
    }

}

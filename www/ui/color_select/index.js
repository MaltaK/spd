import React from 'react';
import css from './styles.css';
import PropTypes from 'prop-types';
import cn from 'classnames';
import {chunk} from 'utils';
import Block from '../block';
import Popup from '../popup';

export default class ColorSelect extends React.Component {

    static defaultProps = {
        colors: [
            '#ffffff',
            '#000000',
            '#ff00ff',
            '#00ffff',
            '#00ff00',
            '#ffff00',
        ],
    }

    static propTypes = {
        cols: PropTypes.number,
        colors: PropTypes.arrayOf(PropTypes.string),
        value: PropTypes.string,
        onChange: PropTypes.func,
    }

    state = {
        open: false,
        x: null,
        y: null,
    }

    handleOpen = event => {
        let rect = event.target.getClientRects()[0];
        let x = rect.left - 7;
        let y = rect.bottom + 5;
        this.setState({ open: true, x, y });
    }

    handleClose = () => {
        this.setState({ open: false });
    }

    handleSelect = (value, event) => {
        event.stopPropagation();
        if (this.props.value === value || !this.props.onChange)
            return;
        this.props.onChange(value);
    }

    countCols = () => Math.ceil(Math.sqrt(this.props.colors.length));

    renderItem = value => {
        const style = { backgroundColor: value };
        const className = cn(css.item, css.color, {
            [css.selected]: value === this.props.value,
        });
        return (
            <div
                key={value}
                className={className}
                style={style}
                onClick={this.handleSelect.bind(null, value)}
            />
        );
    }

    renderRows(cols) {
        const rows = chunk(this.props.colors, cols);
        return rows.map(row => (
            <div key={row.join()}>
                {row.map(this.renderItem)}
            </div>
        ));
    }

    renderPopup() {
        if (!this.state.open)
            return null;
        const cols = this.props.cols || this.countCols();
        return (
            <Popup
                open
                x={this.state.x}
                y={this.state.y}
                onRequestClose={this.handleClose}
                className={css.panel}
            >
                {this.renderRows(cols)}
            </Popup>
        );
    }

    render() {
        let style = { backgroundColor: this.props.value };
        return (
            <Block>
                {this.renderPopup()}
                <div
                    className={css.color}
                    style={style}
                    onClick={this.handleOpen}
                />
            </Block>
        );
    }
}

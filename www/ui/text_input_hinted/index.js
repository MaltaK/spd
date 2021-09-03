import React from 'react';
import PropTypes from 'prop-types';
import Block from '../block';
import {omit} from 'utils';
import cn from 'classnames';
import css from './styles.css';
import triangleDownImage from '../images/triangle_down.png';
import crestImage from '../images/cross.png';
import Portal from '../portal';

export default class TextInputHinted extends React.Component {

    static defaultProps = {
        width: 160,
        focus: false,
    }

    static propTypes = {
        focus: PropTypes.bool,
    }

    state = {
        hintOpen: false,
        inputFocused: false,
        hintsFocused: false,
        selected: null,
    }

    updateHintsPosition() {
        let node = this.inputNode;
        if (!node)
            return this.setState({ hintOpen: false });
        let rect = node.getClientRects()[0];
        this.setState({ hintsLeft: rect.left - 1, hintsTop: rect.bottom, width: rect.width + 2 });
    }

    refHints = node => {
        this.hintsNode = node;
    }

    refInput = node => {
        this.inputNode = node;
        this.updateHintsPosition();
        if (this.props.focus && node)
            setTimeout(() => {
                node.focus();
                this.setState({ hintOpen: false });
            }, 200);
    }

    hideHint = () => {
        this.setState({ hintOpen: false });
    }

    showHint = () => {
        this.setState({ hintOpen: true });
    }

    componentDidUpdate(prevProps) {
        if (this.props.value != prevProps.value) {
            let change = { selected: null };
            if (this.showOnNextValueChange) {
                this.showOnNextValueChange = false;
                change.hintOpen = true;
            }
            this.setState(change);
        }
        setTimeout(() => {
            if (!this.state.inputFocused && !this.state.hintsFocused && this.state.hintOpen)
                this.setState({ hintOpen: false, selected: null });
        }, 0);
    }

    getFilteredItems() {
        let items = (this.props.hints || []).filter(item => item.toLowerCase().indexOf((this.props.value || '').toLowerCase()) != -1);
        if (this.props.maxItems && items.length > this.props.maxItems)
            items = items.slice(0, this.props.maxItems);
        return items;
    }

    noop = event => {
        event.stopPropagation();
    }

    render() {
        let userProps = omit(this.props, [ 'maxItems', 'value', 'onChange', 'onFocus', 'onBlur', 'onKeyDown', 'hints', 'className', 'focus' ]);
        let renderedHint;
        if (this.state.hintOpen) {
            let hintsStyle = {
                left: this.state.hintsLeft,
                top: this.state.hintsTop,
                width: this.state.width - 1,
            };
            let renderedItems = this.getFilteredItems()
                .map((item, index) => {
                    let onMouseDown = () => {
                        if (this.props.onChange) this.props.onChange(item);
                        this.setState({ hintOpen: false, hintsFocused: false });
                    };
                    let onMouseEnter = () => {
                        this.setState({ selected: item });
                    };
                    let className = cn(css.hint, {
                        [css.hintSelected]: item == this.state.selected,
                    });
                    return (
                        <div key={index} className={className} onMouseDown={onMouseDown} onMouseEnter={onMouseEnter}>{item}</div>
                    );
                });
            if (renderedItems.length != 0) {
                renderedHint = (
                    <Portal target={document.body}>
                        <div style={hintsStyle} className={css.hints} tabIndex={0} onBlur={this.handleHintsBlur} onFocus={this.handleHintsFocus} onKeyDown={this.handleHintsKeyDown} ref={this.refHints} onMouseDown={this.noop} onMouseUp={this.noop} onClick={this.noop}>
                            <div className={css.hintsWrapper}>
                                {renderedItems}
                            </div>
                        </div>
                    </Portal>
                );
            }
        }
        let crestClassName = cn(css.crest, {
            [css.hidden]: !this.props.value,
        });
        return (
            <Block width={this.props.width}>
                <div className={css.root}>
                    <input
                        className={cn(css.input, this.props.className)}
                        type="text" value={this.props.value || ''}
                        onChange={this.handleChange} onFocus={this.handleInputFocus} onBlur={this.handleInputBlur} onKeyDown={this.handleInputKeyDown}
                        ref={this.refInput}
                        {...userProps}
                        autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
                    />
                    <img src={crestImage} className={crestClassName} onClick={this.handleCrestClick} />
                    <img src={triangleDownImage} className={css.arrow} onClick={this.handleArrowClick} />
                </div>
                {renderedHint}
            </Block>
        );
    }

    selectNext(down) {
        let filteredItems = this.getFilteredItems();
        let index = filteredItems.indexOf(this.state.selected);
        let nextIndex;
        if (down)
            nextIndex = (index == -1) ? 0 : (index + 1) % filteredItems.length;
        else
            nextIndex = (index == -1) ? filteredItems.length - 1 : (index - 1 + filteredItems.length) % filteredItems.length;
        this.setState({ selected: filteredItems[nextIndex] }, () => {
            if (!this.hintsNode)
                return;
            let h = Number(css.hintHeight);
            let top = nextIndex * h ;
            let min = this.hintsNode.scrollTop;
            let max = min + this.hintsNode.clientHeight;
            if (top + h > max) {
                this.hintsNode.scrollTop = top - this.hintsNode.clientHeight + h;
            } else if (top < min) {
                this.hintsNode.scrollTop = top;
            }
        });
    }

    changeValueToSelected = () => {
        if (this.state.selected == null)
            return;
        if (this.props.onChange)
            this.props.onChange(this.state.selected);
    }

    handleArrowClick = () => {
        if (this.inputNode)
            this.inputNode.focus();
    }

    handleCrestClick = () => {
        if (this.inputNode)
            this.inputNode.focus();
        if (this.props.onChange)
            this.props.onChange('');
    }

    handleHintsKeyDown = event => {
        event.preventDefault();
        if (event.keyCode == 40)
            this.selectNext(true);
        else if (event.keyCode == 38)
            this.selectNext(false);
        else if (event.keyCode == 13) {
            this.setState({ hintOpen: false });
            this.changeValueToSelected();
        }
    }

    handleInputKeyDown = event => {
        if (event.keyCode == 40) {
            event.preventDefault();
            this.setState({ hintOpen: true });
            this.selectNext(true);
        } else if (event.keyCode == 38) {
            event.preventDefault();
            if (this.state.hintOpen)
                this.selectNext(false);
        } else if (event.keyCode == 13) {
            this.setState({ hintOpen: false });
            this.changeValueToSelected();
        }
        if (this.props.onKeyDown)
            this.props.onKeyDown(event);
    }

    handleInputFocus = event => {
        this.updateHintsPosition();
        this.setState({ inputFocused: true, hintOpen: true });
        if (this.props.onFocus)
            this.props.onFocus(event);
    }

    handleInputBlur = event => {
        this.setState({ inputFocused: false });
    }

    handleHintsFocus = event => {
        this.setState({ hintsFocused: true });
    }

    handleHintsBlur = event => {
        let currentTarget = event.currentTarget;
        setTimeout(() => {
            if (currentTarget.contains(document.activeElement))
                return;
            this.setState({ hintsFocused: false });
        }, 0);
    }

    handleChange = event => {
        this.showOnNextValueChange = true;
        if (this.props.onChange)
            this.props.onChange(event.target.value);
    }

}

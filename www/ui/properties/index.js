import React from 'react';
import cn from 'classnames';
import css from './styles.css';
import { Grid, Row, Cell } from '../grid';
import TextInput from '../text_input';

export default class Properties extends React.Component {

    static defaultProps = {
        keyCaption: 'Свойство',
        valueCaption: 'Значение',
        items: [],
    }

    state = {}

    componentWillUnmount() {
        this.clearListeners();
    }

    editingRefInput = ref => {
        this.inputNode = ref;
        if (this.inputNode) {
            this.inputNode.focus();
            this.inputNode.select();
        }
    }

    clearListeners() {
        document.body.removeEventListener('click', this.clickListener);
    }

    finishEdit = commit => {
        this.clearListeners();
        if (commit) {
            let value = Object.assign({}, this.props.value, {
                [this.state.editingKey]: this.state.editingValue,
            });
            this.props.onChange && this.props.onChange(value);
        }
        this.setState({ editingKey: undefined, editingValue: undefined });
    }

    render() {
        let { value, keyCaption, valueCaption, items, onChange, ...userProps } = this.props;
        let renderedRows = this.props.items.map((item, index) => {
            let value = this.props.value[item.key];
            let editing = this.state.editingKey !== undefined && this.state.editingKey === item.key;
            let onValueClick = () => {
                if (this.state.editingKey === undefined && this.props.onChange) {
                    this.setState({ editingKey: item.key, editingValue: value || '' });
                    this.clickListener = event => {
                        let editingDOMNode = this.inputNode;
                        let currentDOMNode = event.target;
                        while (currentDOMNode != null) {
                            if (currentDOMNode == editingDOMNode)
                                return;
                            currentDOMNode = currentDOMNode.parentNode;
                        }
                        this.finishEdit(true);
                    };
                    document.body.addEventListener('click', this.clickListener);
                }
            };
            let renderedValue;
            if (editing) {
                let onChange = value => {
                    this.setState({ editingValue: value });
                };
                let onKeyDown = event => {
                    if (event.keyCode == 27)
                        this.finishEdit(false);
                    else if (event.keyCode == 13)
                        this.finishEdit(true);
                };
                renderedValue = (
                    <TextInput pure ref={this.editingRefInput} value={this.state.editingValue} onChange={onChange} onKeyDown={onKeyDown} width="100%" />
                );
            } else {
                renderedValue = value;
            }
            let valueCellClassName = cn(css.valueCell, {
                [css.editingCell]: editing,
            });
            return (
                <Row key={index}>
                    <Cell className={css.keyCell}>{item.caption}</Cell>
                    <Cell className={valueCellClassName} onClick={onValueClick}>{renderedValue}</Cell>
                </Row>
            );
        });
        return (
            <Grid fixedWidth {...userProps}>
                <Row>
                    <Cell header className={css.keyCell}>{this.props.keyCaption}</Cell>
                    <Cell header>{this.props.valueCaption}</Cell>
                </Row>
                {renderedRows}
            </Grid>
        );
    }
}

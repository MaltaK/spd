import React from 'react';
import PropTypes from 'prop-types';
import TextInput from '../text_input/index';

export default class TextList extends React.Component {

    state = {
        focused: false,
    }

    static defaultProps = {
        placeholder: '1000-1500;1600;2000',
        partitive: true,
    }

    static propTypes = {
        placeholder: PropTypes.string,
        partitive: PropTypes.bool,
        onChange: PropTypes.func,
        value: PropTypes.string,
    }

    isValueValid(value) {
        if (!value)
            return true;
        const digit = this.props.partitive ? '\\d{1,8}(\\.\\d{1,8})?' : '\\d{1,8}';
        const part = `${digit}(-${digit})?`;
        const regexp = new RegExp(`^${part}(;${part})*;?$`);
        return value.match(regexp) !== null;
    }

    handleFocus = event => {
        this.setState({ focused: true });
        this.props.onFocus && this.props.onFocus(event);
    }

    handleBlur = event => {
        this.setState({ focused: false });
        this.props.onBlur && this.props.onBlur(event);
    }

    render() {
        // eslint-disable-next-line no-unused-vars
        const { value, onFocus, onBlur, partitive, placeholder, ...userProps } = this.props;
        const invalid = !this.isValueValid(value);
        return (
            <TextInput
                invalid={invalid}
                value={value}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
                placeholder={this.state.focused ? this.props.placeholder : undefined}
                {...userProps}
            />
        );
    }

}

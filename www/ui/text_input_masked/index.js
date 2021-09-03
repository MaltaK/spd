import React from 'react';
import PropTypes from 'prop-types';
import TextInput from '../text_input';

let placeholder = '_';

let escape = text => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

let replaceAll = (text, c, r) => text.split(c).join(r || '');

let validate = (valid, text) => {
    if (typeof(valid) == 'string')
        valid = new RegExp(valid);
    if (valid instanceof RegExp) {
        let regExpMatch = valid.exec(text);
        return regExpMatch && regExpMatch.index == 0 && regExpMatch[0].length == text.length;
    } else if (typeof(valid) == 'function') {
        return valid(text);
    }
    return true;

};

export default class TextInputMasked extends React.Component {

    static propTypes = {
        value: PropTypes.string,
        nullable: PropTypes.bool,
        mask: PropTypes.arrayOf(PropTypes.oneOfType([
            PropTypes.shape({
                valid: PropTypes.instanceOf(RegExp),
                length: PropTypes.number,
                minLength: PropTypes.number,
                maxLength: PropTypes.number,
                next: PropTypes.instanceOf(RegExp),
            }),
            PropTypes.string,
        ])),
        complete: PropTypes.func,
        onChange: PropTypes.func,
        onKeyDown: PropTypes.func,
        onCursorChange: PropTypes.func,
    }

    static getMaskedValue(parts, mask) {
        let value = '';
        let p = 0;
        for (let i = 0; i < mask.length; ++i) {
            if (typeof(mask[i]) == 'string') {
                value += mask[i];
            } else {
                let part = String(parts[p]);
                let min = mask[i].length != null ? mask[i].length : mask[i].minLength;
                while (min != null && part.length < min)
                    part = placeholder + part;
                value += part;
                p++;
            }
        }
        return value;
    }

    componentDidMount() {
        this.init(this.props.value);
    }

    componentDidUpdate(prevProps) {
        if (this.nextInputPos != null) {
            this.setInputPos(this.nextInputPos);
            this.nextInputPos = null;
        } else if (prevProps.value !== this.props.value) {
            this.setInputPos(this.inputPos);
        }
    }

    setInputPos(pos) {
        if (!this.inputNode)
            return;
        this.inputNode.selectionStart = pos;
        this.inputNode.selectionEnd = pos;
        this.inputPos = pos;
        if (this.props.onCursorChange)
            this.props.onCursorChange(pos);
    }

    isMappingInvalid(mapping) {
        if (this.props.nullable && this.props.value == this.buildEmptyValue())
            return false;
        if (!mapping || !mapping.parts)
            return true;
        return false;
    }

    getInputPos() {
        return this.inputNode.selectionStart;
    }

    allSelected() {
        let node = this.inputNode;
        let min = Math.min(node.selectionStart, node.selectionEnd);
        let max = Math.max(node.selectionStart, node.selectionEnd);
        return min == 0 && max == node.value.length;
    }

    selectAll() {
        this.inputNode.select();
    }

    getMaskOpts(k) {
        let mask = this.props.mask[k];
        if (typeof(mask) == 'string') {
            return {
                type: 'static',
                text: mask,
                min: mask.length,
                max: mask.length,
                fixed: true,
            };
        }
        let min = mask.length != null ? mask.length : mask.minLength != null ? mask.minLength : 1;
        let max = mask.length || mask.maxLength;
        return Object.assign({}, mask, {
            type: 'data',
            min,
            max,
            fixed: min == max,
        });
    }

    getMatchIndex(mapping, pos) {
        if (!mapping)
            return;
        let match;
        //let opts;
        for (let i = 0; i < mapping.length; ++i) {
            match = mapping[i];
            //opts = this.getMaskOpts(i);
            if (
                pos >= match.pos && pos < match.pos + match.text.length
                || match.type == 'data' && pos == match.pos + match.text.length && i + 1 < mapping.length && mapping[i + 1].type != 'data'
            ) {
                return i;
            }
        }
        return mapping.length - 1;
    }

    getNextValidPos(mapping, pos, forward) {
        if (!mapping)
            return;
        pos = Math.max(0, pos);
        let k = this.getMatchIndex(mapping, pos);
        let p = k;
        if (mapping[k].type == 'data')
            return pos;
        let d = forward ? 1 : -1;
        k += d;
        while (k >= 0 && k < mapping.length) {
            if (mapping[k].type == 'data')
                return mapping[k].pos + (forward ? 0 : mapping[k].text.length);
            k += d;
        }
        d = -d;
        k = p;
        forward = !forward;
        while (k >= 0 && k < mapping.length) {
            if (mapping[k].type == 'data')
                return mapping[k].pos + (forward ? 0 : mapping[k].text.length);
            k += d;
        }
        return 0;
    }

    getMapping(value) {
        value = value || '';
        let masks = this.props.mask;
        let re = '^' + masks.map((mask, k) => {
            let opts = this.getMaskOpts(k);
            if (opts.type == 'static')
                return '(' + escape(mask) + ')';
            return '(.{' + opts.min + ',' + (opts.max != null ? opts.max : '') + '})';
        }).join('') + '$';
        let matches = value.match(re);
        if (matches == null)
            return;
        let pos = 0;
        let result = [];
        let parts = [];
        let valid = true;
        let complete = true;
        for (let i = 0; i < masks.length; ++i) {
            let opts = this.getMaskOpts(i);
            let text = matches[i + 1];
            let match = {
                type: opts.type,
                text,
                pos,
            };
            if (opts.type == 'data') {
                let partValid = validate(opts.valid, replaceAll(text, placeholder));
                let pureText = replaceAll(text, placeholder);
                if (!partValid) {
                    valid = false;
                    complete = false;
                } else if (pureText.length < opts.min || opts.max != null && pureText.length > opts.max) {
                    complete = false;
                } else {
                    parts.push(text);
                }
            }
            result.push(match);
            pos += text.length;
        }
        if (valid) {
            if (complete) {
                if (this.props.complete == null || this.props.complete(parts))
                    result.parts = parts;
            }
            return result;
        }
    }

    buildEmptyValue() {
        let masks = this.props.mask;
        let value = '';
        for (let i = 0; i < masks.length; ++i) {
            let opts = this.getMaskOpts(i);
            value += opts.type == 'static' ? opts.text : placeholder.repeat(opts.min);
        }
        return value;
    }

    buildValue(mapping, k, newText) {
        return mapping.map((match, i) => i == k ? newText : match.text).join('');
    }

    init(value) {
        let mapping = value != null && this.getMapping(value);
        if (!mapping) {
            value = this.buildEmptyValue();
            mapping = this.getMapping(value);
        }
        if (value != this.props.value) {
            this.props.onChange && this.props.onChange(value, mapping && mapping.parts);
            this.setState({}, () => {
                if (mapping)
                    this.setInputPos(this.getNextValidPos(mapping, 0, true));
            });
        }
    }

    handleKeyDown = event => {
        this.props.onKeyDown && this.props.onKeyDown(event);
        if (event.keyCode == 9) // tab
            return;
        let value = this.props.value || '';
        let pos = this.getInputPos();
        let mapping = this.getMapping(value);
        if (!mapping)
            return this.init();
        let k = this.getMatchIndex(mapping, pos);
        let match = mapping[k];
        let remove = 0;
        switch (event.keyCode) {
            case 8: // backspace
                event.preventDefault();
                remove = -1;
                break;
            case 46: // delete
                event.preventDefault();
                remove = 1;
                break;
            case 37: // left
                event.preventDefault();
                this.setInputPos(this.getNextValidPos(mapping, Math.max(pos - 1, 0), false));
                break;
            case 39: // right
                event.preventDefault();
                this.setInputPos(this.getNextValidPos(mapping, pos + 1, true));
                break;
            case 36: // home
                event.preventDefault();
                this.setInputPos(this.getNextValidPos(mapping, 0, true));
                break;
            case 35: // end
                event.preventDefault();
                this.setInputPos(this.getNextValidPos(mapping, value.length, false));
                break;
            case 32: // space
                event.preventDefault();
                if (match.text.match(new RegExp('[^' + escape(placeholder) + ']')))
                    this.setInputPos(this.getNextValidPos(mapping, match.pos + match.text.length + 1, true));
                break;
        }
        if (remove) {
            if (this.allSelected())
                return this.init();
            if (match.type != 'data') {
                this.nextInputPos = this.getNextValidPos(mapping, pos, false);
                this.forceUpdate();
                return;
            }
            let opts = this.getMaskOpts(k);
            let newText;
            if (remove == 1) {
                if (pos >= match.pos + match.text.length)
                    return;
            } else {
                if (pos == match.pos) {
                    this.nextInputPos = this.getNextValidPos(mapping, pos - 1, false);
                    this.forceUpdate();
                    return;
                }
            }
            let removeOffset = pos - match.pos + (remove == 1 ? 0 : -1);
            newText = match.text.slice(0, removeOffset) + match.text.slice(removeOffset + 1);
            if (newText.length < opts.min)
                newText += placeholder;
            let newValue = this.buildValue(mapping, k, newText);
            mapping = this.getMapping(newValue);
            let nextPos;
            if (remove == 1) {
                nextPos = pos;
            } else {
                nextPos = pos - 1;
            }
            nextPos = Math.max(0, nextPos);
            this.nextInputPos = this.getNextValidPos(mapping, nextPos, false);
            this.props.onChange && this.props.onChange(newValue, mapping.parts);
        }
    }

    handleKeyPress = event => {
        event.preventDefault();
        let value = this.props.value || '';
        let pos = this.getInputPos();
        let mapping = this.getMapping(value);
        if (!mapping)
            return this.init();
        if (!event.altKey && !event.ctrlKey && !event.metaKey && event.which >= 32 && event.charCode != 0) {
            if (this.allSelected()) {
                value = this.buildEmptyValue();
                mapping = this.getMapping(value);
                pos = this.getNextValidPos(mapping, 0, true);
            }
            let c = String.fromCharCode(event.which);
            if (c == placeholder)
                return;
            let k = this.getMatchIndex(mapping, pos);
            let match = mapping[k];
            if (match.type != 'data')
                return;
            let opts = this.getMaskOpts(k);
            let replace = value.charAt(pos) == placeholder;
            let skip = false;
            if (!replace && opts.max != null) {
                replace = match.text.length >= opts.max;
                if (replace && pos >= match.pos + opts.max)
                    return;
            }
            let newLength = match.text.length + !replace;
            let newText = match.text.slice(0, pos - match.pos) + c + match.text.slice(pos - match.pos + replace);
            if (pos + 1 >= match.pos + newLength && (newLength >= opts.max || opts.next != null && validate(opts.next, newText)))
                skip = true;
            if (match.text.charAt(pos - match.pos - 1) == placeholder && !replace) {
                newText = newText.slice(0, pos - match.pos - 1) + newText.slice(pos - match.pos);
            }
            if (!validate(opts.valid, replaceAll(newText, placeholder)))
                return;
            let newValue = this.buildValue(mapping, k, newText);
            mapping = this.getMapping(newValue);
            this.nextInputPos = this.getNextValidPos(mapping, pos + 1 + skip, true);
            this.props.onChange && this.props.onChange(newValue, mapping.parts);
        }
    }

    handlePaste = event => {
        event.preventDefault();
    }

    handleFocus = event => {
        this.setInputPos(this.getInputPos());
        this.props.onFocus && this.props.onFocus(event);
    }

    handleDoubleClick = event => {
        event.preventDefault();
        this.selectAll();
    }

    handleSelect = () => {
        if (this.allSelected())
            return;
        let value = this.props.value || '';
        let mapping = this.getMapping(this.props.value);
        if (!mapping)
            return;
        let pos = this.getInputPos();
        if (pos == value.length) {
            for (let i = 0; i < mapping.length; ++i) {
                let match = mapping[i];
                if (match.type != 'data')
                    continue;
                let placeholderPos = match.text.indexOf(placeholder);
                if (placeholderPos == -1)
                    continue;
                this.nextInputPos = placeholderPos + match.pos;
                break;
            }
        } else {
            this.nextInputPos = this.getNextValidPos(mapping, pos, true);
        }
        this.forceUpdate();
    }

    render() {
        let { value, onChange, complete, nullable, onCursorChange, ...userProps } = this.props; // eslint-disable-line no-unused-vars
        let mapping = this.getMapping(value);
        let invalid = this.isMappingInvalid(mapping);
        return (
            <TextInput
                ref={ref => this.inputNode = ref}
                {...userProps}
                value={value}
                onKeyDown={this.handleKeyDown}
                onKeyPress={this.handleKeyPress}
                onPaste={this.handlePaste}
                onDoubleClick={this.handleDoubleClick}
                onFocus={this.handleFocus}
                onSelect={this.handleSelect}
                invalid={invalid}
            />
        );
    }

}

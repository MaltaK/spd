import React from 'react';
import {omit} from 'utils';
import ResizeDetector from 'react-resize-detector';
import cn from 'classnames';
import css from './styles.css';

let parsePercents = value => {
    if (typeof(value) != 'string')
        return;
    let m = value.match(/^(\d+)%$/);
    return m && Number(m[1]);
};

let parseNumber = value => {
    if (typeof(value) == 'number')
        return value;
    if (typeof(value) != 'string')
        return;
    let r = Number(value);
    if (isNaN(r))
        return;
    return r;
};

export default class Layout extends React.Component {

    static defaultProps = {
        size: 'rest',
    }

    state = {
        width: 0,
        height: 0,
    }

    lay(getSpace, getProps, children) {
        let before = 0;
        let totalWeight = 0;
        let totalSpace = getSpace();
        let freeSpace = totalSpace;
        return children.map(child => {
            let size = child.props.size;
            let weight = Number(child.props.weight) || 1;
            let value;
            if (size == 'rest') {
                value = null;
                totalWeight += weight;
            } else if ((value = parsePercents(size)) != null) {
                value = totalSpace * value / 100;
            } else if ((value = parseNumber(size)) != null) {
                // empty
            } else {
                value = 0;
            }
            if (value != null) {
                value = Math.max(0, Math.min(freeSpace, value));
                freeSpace -= value;
            }
            return { child, value, weight };
        }).map(item => {
            if (item.value == null) {
                item.value = freeSpace * item.weight / totalWeight;
            }
            return item;
        }).map(item => {
            let props = getProps(item.value, before);
            if (item.child.props.style != null)
                props.style = { ...item.child.props.style, ...props.style };
            before += item.value;
            return React.cloneElement(item.child, props, item.child.props.children);
        });
    }

    modes = {
        up: this.lay.bind(this, () => this.state.height, (value, before) => ({
            style: {
                position: 'absolute',
                top: before,
                width: this.state.width,
                height: value,
                opacity: (!this.state.height || !this.state.width) ? 0 : undefined,
            },
        })),
        down: this.lay.bind(this, () => this.state.height, (value, before) => ({
            style: {
                position: 'absolute',
                bottom: before,
                width: this.state.width,
                height: value,
                opacity: (!this.state.height || !this.state.width) ? 0 : undefined,
            },
        })),
        left: this.lay.bind(this, () => this.state.width, (value, before) => ({
            style: {
                position: 'absolute',
                left: before,
                width: value,
                height: this.state.height,
                opacity: (!this.state.height || !this.state.width) ? 0 : undefined,
            },
        })),
        right: this.lay.bind(this, () => this.state.width, (value, before) => ({
            style: {
                position: 'absolute',
                right: before,
                width: value,
                height: this.state.height,
                opacity: (!this.state.height || !this.state.width) ? 0 : undefined,
            },
        })),
    }

    getMode() {
        let result;
        if (this.props.mode in this.modes)
            result = this.modes[this.props.mode];
        for (let mode of Object.keys(this.modes)) {
            if (this.props[mode]) {
                if (result != undefined)
                    throw new Error('Cannot determine layout mode. Use one of: ' + Object.keys(this.modes).join(',') + '.');
                result = this.modes[mode];
            }
        }
        return result;
    }

    isLayout = child => React.isValidElement(child) && child.type == Layout

    rootRef = ref => {
        this.rootRefCurrnet = ref;
        if (this.props.rootRef)
            this.props.rootRef(ref);
    }

    render() {
        let userProps = omit(this.props, [ 'onResize', 'width', 'height', 'mode', 'up', 'down', 'left', 'right', 'center', 'className', 'style', 'fill', 'size', 'children', 'rootRef' ]);
        let rootClassName = cn(css.root, this.props.className, {
            [css.fill]: this.props.fill,
        });
        let rootStyle = this.props.style;
        if (this.props.width != null)
            rootStyle = { width: this.props.width, ...rootStyle };
        if (this.props.height != null)
            rootStyle = { height: this.props.height, ...rootStyle };
        let mode = this.getMode();
        let renderedChildren;
        if (mode == undefined) {
            if (this.props.center) {
                rootClassName = cn(rootClassName, css.rootCenter);
                renderedChildren = (
                    <div className={css.centerOuter}>
                        <div className={css.centerInner}>
                            {this.props.children}
                        </div>
                    </div>
                );
            } else {
                renderedChildren = this.props.children;
            }
        } else {
            let layoutChildren = React.Children.toArray(this.props.children).filter(this.isLayout);
            let processedLayoutChildren = mode(layoutChildren);
            let index = 0;
            renderedChildren = React.Children.map(this.props.children, child => this.isLayout(child) ? processedLayoutChildren[index++] : child);
        }
        return (
            <div {...userProps} className={rootClassName} style={rootStyle} ref={this.rootRef}>
                <ResizeDetector handleWidth handleHeight onResize={this.handleResize} />
                {renderedChildren}
            </div>
        );
    }

    handleResize = (width, height) => {
        if (width != this.state.width || height != this.state.height) {
            this.setState({ width, height });
            if (this.props.onResize)
                this.props.onResize(width, height);
        }
    }

}

import React from 'react';
import Layout from '../layout';
import cn from 'classnames';
import {omit} from 'utils';
import css from './styles.css';

export default class SidePanel extends React.Component {

    static hiddenSize = Number(css.sliderThickness);

    listening = false;

    state = {
        start: null,
        startSize: null,
    }

    clearListeners() {
        if (this.listening) {
            this.listening = false;
            document.body.removeEventListener('mousemove', this.mouseMoveListener);
            document.body.removeEventListener('mouseup', this.mouseUpListener);
        }
    }

    getMinSize() {
        return Math.max(Number(css.sliderThickness), this.props.minSize || 0);
    }

    mouseMoveListener = event => {
        let end = this.getCoordinate(event);
        let diff = end - this.state.start;
        let newSize;
        if (this.props.show) {
            newSize = this.state.startSize + diff;
            newSize = Math.max(this.getMinSize(), newSize);
        } else {
            if (diff < 0)
                return;
            newSize = diff;
            newSize = Math.max(this.getMinSize(), newSize);
            this.setState({ startSize: newSize, start: this.state.start + newSize });
            this.props.onChangeShow && this.props.onChangeShow(true);
        }
        this.props.onChangeSize && this.props.onChangeSize(newSize);

    }

    mouseUpListener = event => {
        this.clearListeners();
        this.setState({});
    }

    componentWillUnmount() {
        this.clearListeners();
    }

    getCoordinate(event) {
        switch (this.props.position) {
            case 'bottom':
                return -event.clientY;
            case 'right':
                return -event.clientX;
        }
    }

    render() {
        let userProps = omit(this.props, [ 'children', 'className', 'style', 'length', 'size', 'position', 'onChangeSize', 'onChangeShow', 'show' ]);
        let className = cn(css.root, css[this.props.position], this.props.className);
        let sliderClassName = cn(css.slider, css['slider' + this.props.position]);
        let hideClassName = cn(css.hide, css['hide' + this.props.position]);
        let style = Object.assign({}, this.props.style);
        let size = this.props.show ? this.props.size : SidePanel.hiddenSize;
        let rootLayoutMode;
        switch (this.props.position) {
            case 'bottom':
                style.width = this.props.length;
                style.height = size;
                rootLayoutMode = 'up';
                break;
            case 'right':
                style.width = size;
                style.height = this.props.length;
                rootLayoutMode = 'left';
                break;
        }
        return (
            <div className={className} {...userProps} style={style}>
                <Layout mode={rootLayoutMode} fill>
                    <Layout size={css.sliderThickness}>
                        <Layout center className={sliderClassName} onMouseDown={this.handleSliderMouseDown}>
                            <div className={hideClassName} onMouseDown={this.handleHideMouseDown} />
                        </Layout>
                    </Layout>
                    <Layout className={css.container}>
                        {this.props.children}
                    </Layout>
                </Layout>
            </div>
        );
    }

    handleSliderMouseDown = event => {
        this.setState({ start: this.getCoordinate(event), startSize: this.props.size });
        if (!this.listening) {
            this.listening = true;
            document.body.addEventListener('mousemove', this.mouseMoveListener);
            document.body.addEventListener('mouseup', this.mouseUpListener);
        }
    }

    handleHideMouseDown = event => {
        event.stopPropagation();
        this.props.onChangeShow && this.props.onChangeShow(!this.props.show);
    }
}

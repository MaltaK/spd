import React from 'react';
import cn from 'classnames';
import css from './styles.css';
import Block from '../block';
import Layout from '../layout';

import triangleLeftImage from '../images/triangle_left.png';
import triangleRightImage from '../images/triangle_right.png';
import triangleUpImage from '../images/triangle_up.png';
import triangleDownImage from '../images/triangle_down.png';

export default class ScrollBar extends React.Component {

    static defaultProps = {
        thickness: 16,
        vertical: false,
        value: 0,
        minThumbSize: 16,
    }

    state = {
        width: 1,
        height: 1,
    }

    mouseMoveListener = null;

    componentWillUnmount() {
        this.clearListeners();
    }

    mouseUpListener = event => {
        this.clearListeners();
        this.setState({ start: null, buttonPressed: null });
    }

    clearListeners = () => {
        document.body.removeEventListener('mousemove', this.mouseMoveListener);
        document.body.removeEventListener('mouseup', this.mouseUpListener);
        this.mouseMoveListener = null;
        clearInterval(this.scrollIntervalId);
        this.scrollIntervalId = null;
    }

    clamp = value => {
        value = Math.min(value, this.props.max);
        value = Math.max(value, 0);
        return value;
    }

    renderScrollBar() {
        let vertical = this.props.vertical;
        let trackSize = (vertical ? this.state.height : this.state.width) - 2 * this.props.thickness;
        let pageSize = Math.min(this.props.page || this.props.max / 4, this.props.max);
        let thumbSize = pageSize / (this.props.max + pageSize) * trackSize;
        thumbSize = Math.max(thumbSize, this.props.minThumbSize);
        thumbSize = Math.min(thumbSize, trackSize);
        let thumbMaxPosition = trackSize - thumbSize;
        let thumbPosition = this.clamp(this.props.value) / this.props.max * thumbMaxPosition;
        let thumbStyle = {
            [vertical ? 'width' : 'height']: this.props.thickness,
            [vertical ? 'height' : 'width']: thumbSize,
            [vertical ? 'top' : 'left']: thumbPosition,
            [vertical ? 'left' : 'top']: -1,
        };
        let backThumbSpacerStyle = {
            [vertical ? 'width' : 'height']: this.props.thickness,
            [vertical ? 'height' : 'width']: thumbPosition,
            [vertical ? 'top' : 'left']: 0,
            [vertical ? 'left' : 'top']: -1,
        };
        let forwardThumbSpacerStyle = {
            [vertical ? 'width' : 'height']: this.props.thickness,
            [vertical ? 'height' : 'width']: trackSize - (thumbPosition + thumbSize),
            [vertical ? 'top' : 'left']: thumbPosition + thumbSize,
            [vertical ? 'left' : 'top']: -1,
        };
        let onThumbMouseDown = event => {
            this.setState({ start: event[vertical ? 'clientY' : 'clientX'], startValue: this.props.value });
            this.clearListeners();
            this.mouseMoveListener = event => {
                let d = event[vertical ? 'clientY' : 'clientX'] - this.state.start;
                let value = this.state.startValue + d / thumbMaxPosition * this.props.max || 0;
                this.props.onChange && this.props.onChange(this.clamp(value));
            };
            document.body.addEventListener('mousemove', this.mouseMoveListener);
            document.body.addEventListener('mouseup', this.mouseUpListener);
        };
        let onScrollButtomMouseDown = (direction, scale, event) => {
            let scroll = () => {
                let value = this.props.value + direction * pageSize * scale;
                this.props.onChange && this.props.onChange(this.clamp(value));
            };
            if (this.scrollIntervalId == null)
                this.scrollIntervalId = setInterval(scroll, 150);
            document.body.addEventListener('mouseup', this.mouseUpListener);
            this.setState({ buttonPressed: direction });
            scroll();
        };
        let onButtonMouseLeave = () => {
            if (this.state.buttonPressed != null) {
                this.clearListeners();
                this.setState({ buttonPressed: null });
            }
        };
        let hasThumb = this.props.value != null && this.props.max > 0 && this.props.value <= this.props.max;
        return (
            <div className={css.box}>
                <Layout fill {...{ [vertical ? 'up' : 'left']: true }}>
                    <Layout size={this.props.thickness}>
                        <div className={cn(css.button, { [css.buttonPressed]: this.state.buttonPressed == -1 })} onMouseDown={onScrollButtomMouseDown.bind(this, -1, 0.125)} onMouseLeave={onButtonMouseLeave}>
                            <Layout fill center>
                                <img src={vertical ? triangleUpImage : triangleLeftImage} className={css.buttonImage} />
                            </Layout>
                        </div>
                    </Layout>
                    <Layout>
                        <div className={vertical ? css.verticalTrack : css.horizontalTrack}>
                            {hasThumb &&
                                <React.Fragment>
                                    <div className={css.thumbSpacer} style={backThumbSpacerStyle} onMouseDown={onScrollButtomMouseDown.bind(this, -1, 1)} />
                                    <div className={cn(css.thumb, { [css.thumbScrolling]: this.state.start != null })} style={thumbStyle} onMouseDown={onThumbMouseDown} />
                                    <div className={css.thumbSpacer} style={forwardThumbSpacerStyle} onMouseDown={onScrollButtomMouseDown.bind(this, +1, 1)} />
                                </React.Fragment>
                            }
                        </div>
                    </Layout>
                    <Layout size={this.props.thickness}>
                        <div className={cn(css.button, { [css.buttonPressed]: this.state.buttonPressed == 1 })} onMouseDown={onScrollButtomMouseDown.bind(this, 1, 0.125)} onMouseLeave={onButtonMouseLeave}>
                            <Layout fill center>
                                <img src={vertical ? triangleDownImage : triangleRightImage} className={css.buttonImage} />
                            </Layout>
                        </div>
                    </Layout>
                </Layout>
            </div>
        );
    }

    render() {
        let vertical = this.props.vertical;
        let defaultSize = 2 * this.props.thickness + 120;
        if (this.props.pure) {
            if (this.props.vertical) {
                return (
                    <Layout width={this.props.width || this.props.thickness} height={this.props.height || defaultSize} onResize={this.handleResize}>
                        {this.renderScrollBar()}
                    </Layout>
                );
            }
            return (
                <Layout width={this.props.width || defaultSize} height={this.props.thickness} onResize={this.handleResize}>
                    {this.renderScrollBar()}
                </Layout>
            );

        }
        if (this.props.vertical) {
            return (
                <Block height={this.props.height || defaultSize}>
                    <Layout width={this.props.width || this.props.thickness} height="100%" onResize={this.handleResize}>
                        {this.renderScrollBar()}
                    </Layout>
                </Block>
            );
        }
        return (
            <Block width={this.props.width || defaultSize} height={this.props.height || Math.max(this.props.thickness, 20)}>
                <Layout fill onResize={this.handleResize} down>
                    <Layout size={this.props.thickness} width={this.state.width}>
                        {this.renderScrollBar()}
                    </Layout>
                    <Layout />
                </Layout>
            </Block>
        );


    }

    handleResize = (width, height) => {
        this.setState({ width, height });
    }
}

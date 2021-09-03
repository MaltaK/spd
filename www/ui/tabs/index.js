import React from 'react';
import Block from '../block';
import css from './styles.css';
import cn from 'classnames';
import Layout from '../layout';

import triangleLeftImage from '../images/triangle_left.png';
import triangleRightImage from '../images/triangle_right.png';

export class Tabs extends React.Component {

    static defaultProps = {
        width: '100%',
        height: 240,
        scrollSpeed: 50,
    }

    state = {}

    componentWillUnmount() {
        this.clearListeners();
    }

    isTab = child => React.isValidElement(child) && child.type == Tab

    refHeader = node => {
        this.headerNode = node;
    }

    componentDidMount() {
        setTimeout(() => this.checkHeaderScroll(), 1);
    }

    componentDidUpdate() {
        this.checkHeaderScroll();
    }

    checkHeaderScroll() {
        if (!this.headerNode)
            return;
        let hasHeaderScrollButtons = this.headerNode.scrollWidth > this.headerNode.clientWidth;
        //todo console.log(this.headerNode.scrollWidth, this.headerNode.clientWidth);
        if (hasHeaderScrollButtons != this.state.hasHeaderScrollButtons)
            this.setState({ hasHeaderScrollButtons });
    }

    render() {
        let renderedTab;
        let tabs = React.Children.toArray(this.props.children).filter(this.isTab);
        for (let tab of tabs) {
            let selected = tab.props.value === this.props.value && this.props.value !== undefined;
            if (!selected)
                continue;
            renderedTab = React.cloneElement(tab, {}, tab.props.children);
            break;
        }
        let renderedHeaderItems = tabs.map((tab, index) => {
            let selected = tab.props.value === this.props.value && this.props.value !== undefined;
            let onMouseDown = () => {
                this.props.onChange && this.props.onChange(tab.props.value);
            };
            return (
                <div key={index} className={cn(css.headerItem, { [css.headerItemSelected]: selected })} onMouseDown={onMouseDown}>
                    {tab.props.img ?
                        <React.Fragment>
                            <img style={{ height: '16px', width: '16px', position: 'absolute' }} src={tab.props.img} />
                            <span style={{ paddingLeft: '22px' }}>{tab.props.caption}</span>
                        </React.Fragment>
                        : tab.props.caption}

                </div>
            );
        });
        let headerHeight = Number(css.headerHeight);
        let headerScrollStyle = {
            height: css.headerHeight - 1,
        };
        let rootLayoutProps = {
            width: this.props.pure ? this.props.width : '100%',
            height: this.props.pure ? this.props.height : '100%',
        };
        let renderedTabs = (
            <Layout up {...rootLayoutProps}>
                <Layout left size={headerHeight} className={css.headerLayout}>
                    <Layout>
                        <div className={css.header} ref={this.refHeader} onWheel={this.handleHeaderWheel}>
                            {renderedHeaderItems}
                        </div>
                    </Layout>
                    {this.state.hasHeaderScrollButtons &&
                        <Layout size={headerHeight + (css.headerHeight + 1) % 2}>
                            <table className={css.headerScroll} style={headerScrollStyle}>
                                <tbody>
                                    <tr>
                                        <td className={css.headerScrollButton} onMouseDown={this.handleHeaderScrollLeft}>
                                            <img src={triangleLeftImage} className={css.headerScrollButtonImage} draggable={false} />
                                        </td>
                                        <td className={css.headerScrollButton} onMouseDown={this.handleHeaderScrollRight}>
                                            <img src={triangleRightImage} className={css.headerScrollButtonImage} draggable={false} />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </Layout>}
                </Layout>
                <Layout className={css.bodyLayout}>
                    <Block width="100%" height="100%" container pure>
                        {renderedTab}
                    </Block>
                </Layout>
            </Layout>
        );
        return this.props.pure ? (
            renderedTabs
        ) : (
            <Block className={css.root} width={this.props.width} height={this.props.height}>
                {renderedTabs}
            </Block>
        );
    }

    clearListeners() {
        document.body.removeEventListener('mouseup', this.mouseUpListener);
        clearInterval(this.scrollIntervalId);
        this.scrollIntervalId = null;
    }

    mouseUpListener = () => {
        this.clearListeners();
    }

    handleHeaderScrollLeft = event => {
        this.headerNode.scrollLeft -= this.props.scrollSpeed;
        this.clearListeners();
        document.body.addEventListener('mouseup', this.mouseUpListener);
        this.scrollIntervalId = setInterval(() => {
            this.headerNode.scrollLeft -= this.props.scrollSpeed;
        }, 175);
    }

    handleHeaderScrollRight = event => {
        this.headerNode.scrollLeft += this.props.scrollSpeed;
        this.clearListeners();
        document.body.addEventListener('mouseup', this.mouseUpListener);
        this.scrollIntervalId = setInterval(() => {
            this.headerNode.scrollLeft += this.props.scrollSpeed;
        }, 175);
    }

    handleHeaderWheel = event => {
        this.headerNode.scrollLeft += Math.sign(event.deltaY) * this.props.scrollSpeed;
    }

}

export function Tab(props) {
    return props.children || null;
}

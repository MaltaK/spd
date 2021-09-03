import React from 'react';
import Block from '../block';
import cn from 'classnames';
import css from './styles.css';
import Checkbox from '../checkbox';
import PropTypes from 'prop-types';
import triangleRightImage from '../images/triangle_right.png';
import triangleDownImage from '../images/triangle_down.png';
import {throttle} from 'utils';
import ResizeDetector from 'react-resize-detector';

const itemShape = {
    key: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]).isRequired,
    caption: PropTypes.string.isRequired,
    image: PropTypes.string,
    tooltip: PropTypes.string,
    offCheck: PropTypes.bool,
    disabledCheck: PropTypes.bool,
    style: PropTypes.object,
    className: PropTypes.string,
};
itemShape.children = PropTypes.arrayOf(PropTypes.shape(itemShape));

export default class Tree extends React.Component {

    static defaultProps = {
        width: 300,
        height: 100,
        checkSubtree: false,
        draggable: false,
        mixedCheck: true,
        offCheckSpace: true,
    }

    static propTypes = {
        mixedCheck: PropTypes.bool,
        checkSubtree: PropTypes.bool,
        draggable: PropTypes.oneOfType([ PropTypes.bool, PropTypes.func ]),
        width: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]),
        height: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]),
        items: PropTypes.arrayOf(PropTypes.shape(itemShape)).isRequired,
        opened: PropTypes.oneOfType([ PropTypes.object, PropTypes.func ]),
        checked: PropTypes.oneOfType([ PropTypes.object, PropTypes.func ]),
        selected: PropTypes.oneOfType([ PropTypes.func, PropTypes.number, PropTypes.string ]),
        onOpen: PropTypes.func,
        onCheck: PropTypes.func,
        onSelect: PropTypes.func,
        onContextMenu: PropTypes.func,
        onDoubleClick: PropTypes.func,
        onDrag: PropTypes.func,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        offCheckSpace: PropTypes.bool,
    }

    state = {
        dragStartItem: null,
        dragTargetItem: null,
        scroll: 0,
        treeWidth: 0,
    }

    boxHeight = 0;

    heights = React.createRef();

    treeBox = React.createRef();

    moutned = false;

    componentDidMount() {
        this.moutned = true;
    }

    componentDidUpdate(prevProps) {
        if (prevProps.items != this.props.items)
            this.handleScroll();
    }

    selected(item) {
        if (typeof this.props.selected == 'function')
            return this.props.selected(item);
        return this.props.selected != null && this.props.selected == item.key;
    }

    checked(item) {
        if (typeof this.props.checked == 'function')
            return this.props.checked(item);
        return this.props.checked != null && this.props.checked[item.key];
    }

    opened(item) {
        if (typeof this.props.opened == 'function')
            return this.props.opened(item);
        return this.props.opened != null && this.props.opened[item.key];
    }

    draggable(item) {
        if (typeof this.props.draggable == 'function')
            return this.props.draggable(item);
        return this.props.draggable;
    }

    handleContextMenu = (node, event) => {
        event.preventDefault();
        event.stopPropagation();
        let item = node ? node.item : undefined;
        if (this.props.onContextMenu)
            this.props.onContextMenu(item, event);
    }

    handleOpen = node => {
        if (node.children && node.children.length && this.props.onOpen)
            this.props.onOpen(node.item, !node.opened);
    }

    handleSelect = (node, event) => {
        if (event.button == 0 && event.detail == 1 && this.props.onSelect)
            this.props.onSelect(node.item, event);
    }

    handleDoubleClick = (node, event) => {
        if (event.button == 0 && this.props.onDoubleClick)
            this.props.onDoubleClick(event, node.item);
        else
            this.handleOpen(node);
    }

    handleDragStart = (node, event) => {
        event.preventDefault();
        event.stopPropagation();
        this.setState({ dragStartItem: node.item, dragTargetItem: null });
        document.body.addEventListener('mouseup', this.handleBodyMouseUp);
    }

    handleBodyMouseUp = () => {
        this.clearListeners();
        if (this.state.dragTargetItem && this.props.onDrag)
            this.props.onDrag(this.state.dragStartItem, this.state.dragTargetItem);
        this.setState({ dragStartItem: null, dragTargetItem: null });
    }

    handleMouseEnter = node => {
        this.setState(state => {
            if (state.dragStartItem)
                return { dragTargetItem: node.item };
        });
    }

    handleMouseLeave = node => {
        this.setState(state => {
            if (state.dragStartItem && state.dragTargetItem == node.item)
                return { dragTargetItem: null };
        });
    }

    handleDragStart = (node, event) => {
        event.preventDefault();
        event.stopPropagation();
        this.setState({ dragStartItem: node.item, dragTargetItem: null });
        document.body.addEventListener('mouseup', this.handleBodyMouseUp);
    }

    clearListeners() {
        document.body.removeEventListener('mouseup', this.handleBodyMouseUp);
    }

    scrollTo = key => {
        if (this.heights.current
            && this.heights.current[key] != null
            && this.treeBox.current
            && !this.isHeightInFullView(this.heights.current[key])
        ) {
            this.treeBox.current.scrollLeft = 0;
            let scrollTopNext = this.heights.current[key] + 4;
            let scrollTop = this.treeBox.current.scrollTop - 4;
            let clientHeight = this.treeBox.current.clientHeight;
            if (!clientHeight || clientHeight === 8)
                clientHeight = 19;
            if (scrollTop > scrollTopNext) {
                this.treeBox.current.scrollTop = scrollTopNext;
            } else {
                this.treeBox.current.scrollTop = scrollTopNext - clientHeight + 19;
            }
            return true;
        }
        return false;
    }

    handleCheckboxChange = (node, value) => {
        if (!this.props.onCheck)
            return;
        if (!this.props.checkSubtree)
            return this.props.onCheck(node.item, value);
        let nodes = [];
        let currentNode = node;
        while (currentNode.parent) {
            if (value) {
                if (currentNode.parent.singleNotCheckedChild != currentNode)
                    break;
            } else {
                if (!currentNode.parent.checked)
                    break;
            }
            nodes.push(currentNode.parent);
            currentNode = currentNode.parent;
        }
        this.enumTree(node, node => nodes.push(node));
        let items = nodes.filter(node => node.checkable).map(node => node.item);
        this.props.onCheck(items, value);
    }

    handleScroll = () => {
        if (!this.treeBox.current) {
            if (this.moutned)
                this.setState({ scroll: 0, treeWidth: 0 });
            return;
        }
        let height = this.boxHeight;
        let treeBoxHeight = this.treeBox.current.clientHeight;
        let scroll = this.treeBox.current.scrollTop - 4;
        let treeWidth = Math.max(this.state.treeWidth, this.treeBox.current.scrollWidth - 8);
        if (height - treeBoxHeight < scroll - 4) {
            if (this.moutned)
                this.setState({ scroll: 0, treeWidth: 0 });
            return;
        }
        let dtscroll = scroll % 19;
        scroll -= dtscroll;
        if (this.moutned)
            this.setState({ scroll, treeWidth });
    }

    handleResize = throttle(() => {
        this.forceUpdate();
    }, 100, { leading: false, trailing: true });

    handleFocus = event => {
        if (this.props.onFocus)
            this.props.onFocus(event);
    }

    handleBlur = event => {
        if (this.props.onBlur)
            this.props.onBlur(event);
    }

    enumTree = (node, callback) => {
        callback(node);
        for (let child of node.children)
            this.enumTree(child, callback);
    }

    isHeightInView(height) {
        if (height == null || !this.treeBox.current)
            return false;
        let scroll = this.treeBox.current.scrollTop - 4;
        let dtscroll = scroll % 19;
        let clientHeight = this.treeBox.current.clientHeight - 4;
        return scroll - dtscroll <= height && scroll + clientHeight > height;
    }

    isHeightInFullView(height) {
        if (height == null || !this.treeBox.current)
            return false;
        let scroll = this.treeBox.current.scrollTop - 4;
        let clientHeight = this.treeBox.current.clientHeight - 4;
        return scroll <= height && scroll + clientHeight - 19 > height;
    }

    isNodeVisible(parent) {
        if (!parent)
            return true;
        if (!parent.opened)
            return false;
        return this.isNodeVisible(parent.parent);
    }

    buildTree(item, parent) {
        let node = {
            item,
            parent,
            checkable: !(item.offCheck || item.disabledCheck),
            checked: false,
            selected: parent && this.selected(item),
            opened: !parent || this.opened(item),
            singleNotCheckedChild: null,
            mixedCheckedChildren: false,
        };
        if (parent && this.isNodeVisible(parent)) {
            this.heights.current[item.key] = this.boxHeight;
            node.inView = this.isHeightInView(this.boxHeight);
            this.boxHeight += 19;
        }
        let checkedChildrenCount = 0;
        // if (!parent && (!item.children || item.children.every(child => !child.children || !child.children.length)))
        //     node.rootWithoutGrandChildren = true;
        node.children = !item.children || !item.children.length ? [] : item.children.map(child => {
            let childNode = this.buildTree(child, node);
            if (parent) {
                if (!childNode.checked) {
                    if (childNode.mixedCheckedChildren)
                        node.mixedCheckedChildren = true;
                    if (node.singleNotCheckedChild != null)
                        node.singleNotCheckedChild = null;
                    else
                        node.singleNotCheckedChild = childNode;
                } else {
                    checkedChildrenCount++;
                }
            }
            return childNode;
        });
        if (parent) {
            let someChildrenChecked = checkedChildrenCount !== 0;
            let checkableChildrenLength = node.children.filter(child => child.checkable).length;
            let allChildrenChecked = checkedChildrenCount == checkableChildrenLength;
            if (!node.mixedCheckedChildren)
                node.mixedCheckedChildren = someChildrenChecked && !allChildrenChecked;
            if (this.props.checkSubtree && checkableChildrenLength != 0 && node.checkable) {
                node.checked = allChildrenChecked;
            } else {
                node.checked = this.checked(item);
            }
        }
        return node;
    }

    renderItemCheckbox(node) {
        if (this.props.checked && this.props.onCheck) {
            if (node.item.offCheck)
                return this.props.offCheckSpace ? <div className={cn(css.checkbox, css.checkboxSpace)}></div> : null;
            return (
                <div className={css.checkbox}>
                    <Checkbox
                        pure
                        onChange={this.handleCheckboxChange.bind(this, node)}
                        value={node.checked}
                        unknown={this.props.mixedCheck && node.mixedCheckedChildren}
                        disabled={node.item.disabledCheck}
                    />
                </div>
            );
        }
    }

    renderItemImage(node) {
        let image = node.item.image;
        if (!image && this.props.getImage)
            image = this.props.getImage(node.item);
        if (image)
            return (
                <img
                    className={css.itemImg}
                    src={image}
                    onClick={this.handleSelect.bind(this, node)}
                    onDoubleClick={this.handleDoubleClick.bind(this, node)}
                    onContextMenu={this.handleContextMenu.bind(this, node)}
                />
            );
        return null;
    }

    renderItem(node) {
        let renderedChildren = undefined;
        if (node.opened)
            renderedChildren = node.children.map(this.renderItem.bind(this));
        if (!node.inView && renderedChildren && renderedChildren.length) {
            return node.parent == null ? renderedChildren :
                <div className={css.item} key={node.item.key}>
                    <div className={css.children}>
                        {renderedChildren}
                    </div>
                </div>
            ;
        }
        if (!node.inView)
            return;
        let openerClassName = cn(css.opener, {
            [css.openerCanOpen]: node.children.length != 0,
        });
        let labelClassName = cn(css.label, node.item.className, {
            [css.labelSelected]: node.selected || this.state.dragStartItem == node.item,
            [css.labelDragTarget]: node.item == this.state.dragTargetItem,
            [css.dragCursor]: this.state.dragStartItem != null,
        });
        return node.parent == null ? renderedChildren :
            <div className={css.item} key={node.item.key}>
                <div className={openerClassName} onClick={this.handleOpen.bind(this, node)}>
                    {node.children.length != 0 && <img className={css.openerImg} src={node.opened ? triangleDownImage : triangleRightImage} />}
                </div>
                {this.renderItemCheckbox(node)}
                {this.renderItemImage(node)}
                <div
                    className={labelClassName}
                    onClick={this.handleSelect.bind(this, node)}
                    onDoubleClick={this.handleDoubleClick.bind(this, node)}
                    onContextMenu={this.handleContextMenu.bind(this, node)}
                    onMouseEnter={this.handleMouseEnter.bind(this, node)}
                    onMouseLeave={this.handleMouseLeave.bind(this, node)}
                    onDragStart={this.handleDragStart.bind(this, node)}
                    draggable={this.draggable(node.item)}
                    title={node.item.tooltip}
                    style={node.item.style}
                >{node.item.caption}</div>
                <div className={css.children}>
                    {renderedChildren}
                </div>
            </div>
        ;
    }

    render() {
        this.boxHeight = 0;
        this.heights.current = {};
        let tree = this.buildTree({ children: this.props.items }, null);
        let boxStyle = {
            height: this.boxHeight,
            minWidth: this.state.treeWidth,
        };
        let viewStyle = { paddingTop: this.state.scroll };
        let className = cn(css.tree, {
            [css.dragCursor]: this.state.dragStartItem != null,
        });
        return (
            <Block width={this.props.width} height={this.props.height} onFocus={this.handleFocus} onBlur={this.handleBlur} tabIndex={0} inline={this.props.inline}>
                <ResizeDetector handleHeight onResize={this.handleResize} />
                <div
                    className={className}
                    onContextMenu={this.handleContextMenu.bind(this, undefined)}
                    ref={this.treeBox}
                    onScroll={this.handleScroll}
                >
                    <div style={boxStyle}>
                        <div style={viewStyle}>{this.renderItem(tree)}</div>
                    </div>
                </div>
            </Block>
        );
    }

    componentWillUnmount() {
        this.moutned = false;
        this.clearListeners();
    }

}

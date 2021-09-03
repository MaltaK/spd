import React from 'react';
import cn from 'classnames';
import _ from 'lodash';
import css from './styles.css';
import Layout from '../layout';
import Block from '../block';
import ScrollBar from '../scroll_bar';
import PopupMenu from '../popup_menu';
import Modal from '../modal';
import Tree from '../tree';
import Button from '../button';

import triangleUpImage from '../images/triangle_up.png';
import triangleDownImage from '../images/triangle_down.png';

const hasPassive = (() => {
    let supportsPassiveOption = false;
    try {
        window.addEventListener('test', null, Object.defineProperty({}, 'passive', {
            get () {
                supportsPassiveOption = true;
                return true;
            },
        }));
    } catch (e) {
        supportsPassiveOption = false;
    }
    return supportsPassiveOption;
})();

export default class Table extends React.PureComponent {
    static defaultProps = {
        columns: [],
        rows: [],
        rowHeight: 20,
        scrollBarThickness: 16,
        defaultColumnWidth: 100,
        selectMode: 'cursor', // 'cursor','normal'
        selected: {}, // { "<rowKey>": true, ... }
        hiddenColumns: {},
        columnsOrder: null,
        sort: [],
        columnWidths: {},
        scrollSpeed: 50,
        width: 500,
        height: 400,
        rightScrollBuffer: 60,
        bottomScrollBarVisible: true,
    }

    constructor(props) {
        super(props);
        this.listening = false;
        this.state = {
            scrollTop: 0,
            scrollLeft: 0,
            width: 1,
            height: 1,
            rowCount: 0,
            totalWidth: 0,
            totalHeight: 0,
            selectStart: this.props.cursor,
            headerPopupShow: false,
            headerPopupX: null,
            headerPopupY: null,
        };
        this.headerPopupItems = [
            { key: 'setup', caption: 'Настроить столбцы...' },
            { key: 'hide', caption: 'Скрыть' },
            { key: 'resetSort', caption: 'Сбросить сортировку' },
        ];
    }

    componentDidMount() {
        this.reindex(this.props, () => this.measure(this.props));
    }

    componentWillUnmount() {
        this.clearListeners();
    }

    componentDidUpdate(prevProps, prevState) {
        let updateScrollTopByScrollToRow = prevProps.scrollToRow != this.props.scrollToRow && this.props.scrollToRow != null;
        let updateScrollTopByCursor = prevProps.cursor != this.props.cursor && this.props.cursor !== undefined;
        let updateScrollTop = () => {
            let scrollTop = this.state.scrollTop;
            if (updateScrollTopByScrollToRow)
                scrollTop = this.getScrollTopForRow(this.props.scrollToRow);
            else if (updateScrollTopByCursor)
                scrollTop = this.getScrollTopForRow(this.props.cursor);
            else if (scrollTop > this.getMaxScrollTop())
                scrollTop = this.getMaxScrollTop();
            if (scrollTop != this.state.scrollTop)
                this.setState({ scrollTop });
        };
        if (
            prevProps.rows != this.props.rows && !_.isEqual(prevProps.rows, this.props.rows)
            || prevProps.sort != this.props.sort && !_.isEqual(prevProps.sort, this.props.sort)
        ) {
            this.reindex(this.props, () => this.measure(this.props, updateScrollTop));
        } else {
            this.measure(this.props, updateScrollTop);
        }

        let updateView = this.state.scrollTop != prevState.scrollTop
            || this.state.scrollLeft != prevState.scrollLeft
            || this.state.width != prevState.width
            || this.state.height != prevState.height
            || this.state.totalWidth != prevState.totalWidth
            || this.state.totalHeight != prevState.totalHeight
            || this.props.defaultColumnWidth != prevProps.defaultColumnWidth
            || this.props.scrollBarThickness != prevProps.scrollBarThickness
            || this.props.columns != prevProps.columns
            || this.props.columnWidths != prevProps.columnWidths
            || this.props.hiddenColumns != prevProps.hiddenColumns
            || this.props.columnsOrder != prevProps.columnsOrder;
        if (updateView && this.props.onViewChange)
            this.props.onViewChange(this.getView());
    }

    getScrollTopForRow(key) {
        let i = this.state.rowIndex.findIndex(rowIndexItem => rowIndexItem.key == key);
        if (i == -1)
            return 0;
        let scrollTop = i * this.props.rowHeight;
        let view = this.getView();
        if (scrollTop + this.props.rowHeight > view.bottom - 1) {
            scrollTop = scrollTop - (view.bottom - 1) + view.top + this.props.rowHeight;
        } else if (scrollTop >= view.top) {
            scrollTop = view.top;
        }
        return this.clampScrollTop(scrollTop);
    }

    reindex(props, callback) {
        let rowKey;
        if (typeof(props.rowKey) == 'function') {
            rowKey = props.rowKey;
        } else if (props.rowKey != null) {
            rowKey = (row, originalIndex, newIndex) => row[props.rowKey]; // eslint-disable-line no-unused-vars
        } else {
            rowKey = (row, originalIndex, newIndex) => newIndex;
        }
        let rowIndex = this.props.rows.map((row, index) => ({
            row,
            originalIndex: index,
            key: null,
        }));
        if (this.props.sort && this.props.sort.length != 0) {
            let comparators = [];
            for (let sortItem of this.props.sort) {
                let column = _.find(this.props.columns, { key: sortItem.key });
                let comparator;
                if (column.compare) {
                    comparator = sortItem.descending ? ((a, b) => column.compare(b.row, a.row)) : ((a, b) => column.compare(a.row, b.row));
                } else {
                    let getData = column.getData ? column.getData : row => row[column.key];
                    if (sortItem.descending) {
                        comparator = (a, b) => {
                            let aData = getData(a.row);
                            let bData = getData(b.row);
                            if (aData == null && bData != null)
                                return 1;
                            if (aData != null && bData == null)
                                return -1;
                            return aData == bData ? 0 : aData < bData ? 1 : -1;
                        };
                    } else {
                        comparator = (a, b) => {
                            let aData = getData(a.row);
                            let bData = getData(b.row);
                            if (aData == null && bData != null)
                                return 1;
                            if (aData != null && bData == null)
                                return -1;
                            return aData == bData ? 0 : aData < bData ? -1 : 1;
                        };
                    }
                }
                comparators.push(comparator);
            }
            let combinedComparator = (a, b) => {
                for (let i = 0; i < comparators.length; ++i) {
                    let comparator = comparators[i];
                    let r = comparator(a, b);
                    if (r != 0)
                        return r;
                }
                return a.originalIndex - b.originalIndex;
            };
            rowIndex.sort(combinedComparator);
        }
        rowIndex.forEach((item, newIndex) => {
            item.key = rowKey(item.row, item.originalIndex, newIndex);
        });
        this.setState({ rowIndex, rowKey }, () => {
            if (this.props.onIndex)
                this.props.onIndex(this.state.rowIndex);
            callback();
        });
    }

    measure(props, callback) {
        let rowCount = this.state.rowIndex.length;
        let totalWidth = 0;
        let columnWidths = this.getColumnWidths(props);
        if (props.columns) {
            for (let column of props.columns)
                if (!props.hiddenColumns[column.key])
                    totalWidth += columnWidths[column.key];
        }
        let totalHeight = rowCount * props.rowHeight;
        if (rowCount != this.state.rowCount
            || totalWidth != this.state.totalWidth
            || totalHeight != this.state.totalHeight
        ) {
            this.setState({
                rowCount,
                totalWidth,
                totalHeight: rowCount * props.rowHeight,
            }, () => {
                this.setState({ scrollLeft: Math.min(this.state.scrollLeft, this.getMaxScrollLeft()) }, callback);
            });
        } else {
            if (callback)
                callback();
        }
    }

    getScrollLeftPage() {
        return this.state.width - this.props.scrollBarThickness + 1;
    }

    getScrollTopPage() {
        return this.state.height - this.props.rowHeight - this.props.scrollBarThickness + 1;
    }

    getMaxScrollLeft() {
        return this.props.rightScrollBuffer + Math.max(0, this.state.totalWidth - this.getScrollLeftPage() - 1);
    }

    getMaxScrollTop() {
        return Math.max(0, this.state.totalHeight - this.getScrollTopPage() + 1);
    }

    clampScrollLeft(value) {
        return Math.max(Math.min(value, this.getMaxScrollLeft()), 0);
    }

    clampScrollTop(value) {
        return Math.max(Math.min(value, this.getMaxScrollTop()), 0);
    }

    getColumnsOrder() {
        return this.props.columnsOrder && this.props.columnsOrder.length == this.props.columns.length ? this.props.columnsOrder : this.props.columns.map((column, index) => index);
    }

    getView() {
        let view = {
            left: this.state.scrollLeft,
            top: this.state.scrollTop,
            right: this.state.scrollLeft + this.getScrollLeftPage(),
            bottom: this.state.scrollTop + this.getScrollTopPage(),
            visibleColumns: [],
            minColumnLeft: 0,
            maxColumnRight: 0,
        };
        view.minRow = Math.floor(view.top / this.props.rowHeight);
        view.maxRow = Math.floor(view.bottom / this.props.rowHeight);
        view.page = Math.floor(this.getScrollTopPage() / this.props.rowHeight);
        let before = 0;
        let columnWidths = this.getColumnWidths();
        let allColumns = this.getColumnsOrder();
        for (let i = 0; i < allColumns.length; ++i) {
            let j = allColumns[i];
            let column = this.props.columns[j];
            if (this.props.hiddenColumns[column.key])
                continue;
            let width = columnWidths[column.key];
            if (before + width >= view.left) {
                if (view.visibleColumns.length == 0)
                    view.minColumnLeft = before;
                view.visibleColumns.push(j);
            }
            before += width;
            if (before >= view.right) {
                view.maxColumnRight = before;
                break;
            }
        }
        return view;
    }

    getSelectedForRange(k1, k2) {
        if (k1 == null || k1 < 0 || k1 >= this.state.rowIndex.length || k2 == null || k2 < 0 || k2 >= this.state.rowIndex.length)
            return {};
        let selected = { [this.state.rowIndex[k2].key]: true };
        let increment = Math.sign(k2 - k1);
        for (let k = k1; k != k2; k += increment) {
            selected[this.state.rowIndex[k].key] = true;
        }
        return selected;
    }

    mouseMoveListener = event => {
        let end = event.clientX;
        let diff = end - this.state.start;
        let newSize = Math.max(this.state.startSize + diff, 16);
        let newColumnWidths = this.getColumnWidths();
        newColumnWidths[this.props.columns[this.state.startIndex].key] = newSize;
        if (this.props.onColumnWidthsChange)
            this.props.onColumnWidthsChange(newColumnWidths);
    }

    mouseUpListener = () => {
        this.clearListeners();
    }

    clearListeners() {
        if (this.listening) {
            this.listening = false;
            document.body.removeEventListener('mousemove', this.mouseMoveListener);
            document.body.removeEventListener('mouseup', this.mouseUpListener);
        }
    }

    getColumnWidths(props = this.props) {
        let result = Object.assign({}, props.columnWidths);
        for (let i = 0; i < props.columns.length; ++i) {
            let key = props.columns[i].key;
            if (!(key in result))
                result[key] = props.columns[i].width || props.defaultColumnWidth;
        }
        return result;
    }

    renderHeader(view) {
        let columnWidths = this.getColumnWidths();
        let left = view.minColumnLeft;
        let renderedColumns = view.visibleColumns.map(index => {
            let column = this.props.columns[index];
            let columnWidth = columnWidths[column.key];
            let columnStyle = {
                position: 'absolute',
                left: left - this.state.scrollLeft,
                width: columnWidth,
                height: this.props.rowHeight,
                cursor: !this.props.onSortChange ? 'default' : undefined,
            };
            if (this.props.onColumnHeaderStyle) {
                let newColumnStyle = this.props.onColumnHeaderStyle(index, columnStyle);
                columnStyle = {...columnStyle, ...newColumnStyle};
            }
            left += columnWidth;
            let sortItem = _.find(this.props.sort || [], { key: column.key });
            let onHeaderClick = event => {
                let sort = (this.props.sort || []).slice();
                if (sortItem) {
                    let index = _.findIndex(sort, { key: column.key });
                    sort.splice(index, 1);
                    if (!sortItem.descending)
                        sort.push({ key: column.key, descending: true });
                } else {
                    sort.push({ key: column.key, descending: false });
                }
                let addMode = event.shiftKey;
                if (!addMode)
                    sort = sortItem && sortItem.descending ? [] : sort.slice(-1);
                if (this.props.onSortChange)
                    this.props.onSortChange(sort);
            };
            let onHeaderContextMenu = event => {
                event.preventDefault();
                event.stopPropagation();
                if (this.props.onHeaderPopup)
                    this.setState({ headerPopupShow: true, headerPopupX: event.clientX, headerPopupY: event.clientY, headerPopupColumnIndex: index });
            };
            let renderedSortDirection;
            if (sortItem != null) {
                let sortIndex;
                if (this.props.sort.length > 1)
                    sortIndex = <div className={css.headerSortIndex}>{_.findIndex(this.props.sort, { key: column.key }) + 1}</div>;
                renderedSortDirection = (
                    <div className={css.headerSortDiv}>
                        <img className={css.headerSortSign} src={sortItem.descending ? triangleUpImage : triangleDownImage} />
                        {sortIndex}
                    </div>
                );
            }
            let widthChangerStyle = {
                left: left - this.state.scrollLeft,
                height: this.props.rowHeight,
                cursor: !this.props.onColumnWidthsChange ? 'default' : undefined,
            };
            let onWidthChangerMouseDown = event => {
                this.setState({ start: event.clientX, startSize: columnWidth, startIndex: index });
                if (!this.listening) {
                    this.listening = true;
                    document.body.addEventListener('mousemove', this.mouseMoveListener);
                    document.body.addEventListener('mouseup', this.mouseUpListener);
                }
            };
            let onHeaderDoubleClick = this.props.onHeaderDoubleClick ? event => {
                this.props.onHeaderDoubleClick(event, column, index);
            } : undefined;
            return (
                <React.Fragment key={index}>
                    <div className={css.headerColumn} style={columnStyle} onClick={onHeaderClick} onDoubleClick={onHeaderDoubleClick} onContextMenu={onHeaderContextMenu}>
                        {column.caption}
                        {renderedSortDirection}
                    </div>
                    <div className={css.headerWidthChanger} style={widthChangerStyle} onMouseDown={onWidthChangerMouseDown} />
                </React.Fragment>
            );
        });
        return (
            <div className={css.header}>
                {renderedColumns}
            </div>
        );
    }

    renderRows(view) {
        let renderedRows = [];
        let columns = this.props.columns;
        let columnWidths = this.getColumnWidths();
        for (let i = view.minRow; i <= view.maxRow; ++i) {
            let rowIndexItem = this.state.rowIndex[i];
            if (rowIndexItem == null)
                break;
            let top = i * this.props.rowHeight;
            // let bottom = top + this.props.rowHeight;
            let left = view.minColumnLeft;
            let cursorRow = this.props.cursor === rowIndexItem.key;
            let selectedRow = Boolean(this.props.selected[rowIndexItem.key]);
            let renderedRowCells = [];
            for (let k = 0; k < view.visibleColumns.length; ++k) {
                let j = view.visibleColumns[k];
                let column = columns[j];
                if (column == null)
                    break;
                let columnWidth = columnWidths[column.key];
                let right = left + columnWidth;
                let style = {
                    left,
                    width: columnWidth,
                    height: this.props.rowHeight,
                };
                let className = cn(css.cell, {
                    [css.cursorCell]: cursorRow,
                });
                let data;
                if (column.render != null) {
                    data = column.render(rowIndexItem.row, i);
                } else {
                    data = rowIndexItem.row[column.key];
                }
                let onClick = this.props.onCellClick == null ? undefined : event => {
                    this.props.onCellClick(event, rowIndexItem.row, column, rowIndexItem.key, j);
                };
                let onDoubleClick = this.props.onCellDoubleClick == null ? undefined : event => {
                    if (event.detail == 2)
                        this.props.onCellDoubleClick(event, rowIndexItem.row, column, rowIndexItem.key, j);
                };
                let onContextMenu = this.props.onCellContextMenu == null ? undefined : event => {
                    this.props.onCellContextMenu(event, rowIndexItem.row, column, rowIndexItem.key, j);
                };
                let onMouseDown = event => {
                    let processed = false;
                    if (event.button == 0) {
                        if (this.props.selectMode == 'cursor' && this.props.cursor !== undefined) {
                            processed = true;
                        } else if (this.props.selectMode == 'normal') {
                            processed = true;
                            if (event.shiftKey) {
                                if (this.props.onSelectedChange)
                                    this.props.onSelectedChange(this.getSelectedForRange(this.state.selectStart, i));
                            } else if (event.ctrlKey) {
                                let selected = Object.assign({}, this.props.selected);
                                if (selectedRow)
                                    delete selected[rowIndexItem.key];
                                else
                                    selected[rowIndexItem.key] = true;
                                this.setState({ selectStart: i });
                                if (this.props.onSelectedChange)
                                    this.props.onSelectedChange(selected);
                            } else {
                                this.setState({ selectStart: i });
                                if (this.props.onSelectedChange)
                                    this.props.onSelectedChange({ [rowIndexItem.key]: true });
                            }
                        }
                    }
                    if (this.props.cursor !== undefined && this.props.cursor != rowIndexItem.key)
                        if (this.props.onCursorChange)
                            this.props.onCursorChange(rowIndexItem.key);
                    if (processed) {
                        event.stopPropagation();
                    } else {
                        if (this.props.onCellMouseDown)
                            this.props.onCellMouseDown(event, rowIndexItem.row, column, rowIndexItem.key, j);
                    }
                };
                let onMouseUp = this.props.onCellMouseUp == null ? undefined : event => {
                    this.props.onCellMouseUp(event, rowIndexItem.row, column, rowIndexItem.key, j);
                };
                let renderedCell = (
                    <div
                        key={j}
                        className={className}
                        style={style}
                        onClick={onClick}
                        onDoubleClick={onDoubleClick}
                        onContextMenu={onContextMenu}
                        onMouseDown={onMouseDown}
                        onMouseUp={onMouseUp}
                    >
                        {data}
                    </div>
                );
                renderedRowCells.push(renderedCell);
                left = right;
            }
            let style = {};
            if (this.props.rowStyle) {
                let rowStyle = typeof(this.props.rowStyle) == 'function' ? this.props.rowStyle(rowIndexItem.row, i) : this.props.rowStyle;
                if (rowStyle != null)
                    style = rowStyle;
            }
            style = {
                ...style,
                top: top - this.state.scrollTop,
                left: -this.state.scrollLeft,
                width: this.state.totalWidth,
                height: this.props.rowHeight + 1,
            };
            let className = cn(css.row, {
                [css.firstRow]: i == 0,
                [css.cursorRow]: cursorRow,
                [css.selectedRow]: selectedRow || cursorRow && this.props.selectMode == 'cursor',
            });
            if (this.props.rowClassName != null) {
                let rowClassName = typeof(this.props.rowClassName) == 'function' ? this.props.rowClassName(rowIndexItem.row, i) : this.props.rowClassName;
                if (rowClassName != null)
                    className = cn(className, String(rowClassName));
            }
            renderedRows.push(
                <div key={i} className={className} style={style}>
                    {renderedRowCells}
                </div>
            );
        }
        return renderedRows;
    }

    renderRightScrollBar() {
        let style = {
            position: 'relative',
            top: -1,
            height: this.state.height + (this.props.bottomScrollBarVisible ? 3 - this.props.scrollBarThickness : 2),
        };
        return (
            <div style={style}>
                <ScrollBar
                    vertical
                    pure
                    thickness={this.props.scrollBarThickness}
                    height="100%"
                    value={this.state.scrollTop}
                    max={this.getMaxScrollTop()}
                    page={this.getScrollTopPage()}
                    onChange={this.handleScrollTopChange}
                />
            </div>
        );
    }

    renderBottomScrollBar() {
        if (!this.props.bottomScrollBarVisible)
            return null;
        let style = {
            position: 'relative',
            left: -1,
            width: this.state.width + 2 - this.props.scrollBarThickness,
            zIndex: 10,
        };
        return (
            <Layout size={this.props.scrollBarThickness - 1}>
                <div style={style}>
                    <ScrollBar
                        pure
                        thickness={this.props.scrollBarThickness}
                        width="100%"
                        value={this.state.scrollLeft}
                        max={this.getMaxScrollLeft()}
                        page={this.getScrollLeftPage()}
                        onChange={this.handleScrollLeftChange}
                    />
                </div>
            </Layout>
        );
    }

    renderSetupModal() {
        if (!this.state.showSetupModal)
            return null;
        let onRequestClose = () => {
            this.setState({ showSetupModal: false });
        };
        let columnsOrder = this.getColumnsOrder();
        let items = columnsOrder.map((j, index) => {
            let column = this.props.columns[j];
            return { key: column.key, caption: column.caption, index };
        });
        let checked = {};
        for (let column of this.props.columns) {
            if (!this.props.hiddenColumns[column.key])
                checked[column.key] = true;
        }
        let onCheck = (item, value) => {
            this.showColumn(item.key, value);
        };
        let onDrag = (source, dest) => {
            let columnsOrder = this.getColumnsOrder().slice();
            let t = columnsOrder.splice(source.index, 1);
            let destIndex = source.index < dest.index + 2 ? dest.index : dest.index + 1;
            columnsOrder = columnsOrder.slice(0, destIndex).concat(t).concat(columnsOrder.slice(destIndex));
            if (this.props.onColumnsOrderChange)
                this.props.onColumnsOrderChange(columnsOrder);
        };
        return (
            <Modal show={true} onRequestClose={onRequestClose}>
                <div className={css.setupRoot}>
                    <Tree
                        width="100%"
                        height="100%"
                        items={items}
                        checked={checked}
                        onCheck={onCheck}
                        draggable
                        onDrag={onDrag}
                    />
                </div>
                <div className={css.setupButtonPanel}>
                    <Button caption="Применить" onClick={onRequestClose}/>
                </div>
            </Modal>
        );
    }

    render() {
        let style;
        if (this.props.pure) {
            style = {
                width: this.props.width,
                height: this.props.height,
            };
        }
        let view = this.getView();
        let headerPopupItems = this.headerPopupItems && this.headerPopupItems.map(x => ({...x}));
        if (this.state.headerPopupShow && this.props.onHeaderPopup)
            this.props.onHeaderPopup(headerPopupItems, this.state.headerPopupColumnIndex);
        let onAllContextMenu = this.props.onAllContextMenu == null ? undefined : event => {
            this.props.onAllContextMenu(event);
        };
        let renderedTable = (
            <React.Fragment>
                <div className={css.root} style={style} onWheel={this.handleWheel} tabIndex={0} onKeyDown={this.handleKeyDown} onKeyUp={this.props.onKeyUp} onKeyPress={this.props.onKeyPress}>
                    <Layout left fill onResize={this.handleResize}>
                        <Layout up>
                            {this.props.hideHeader ? null :
                                <Layout size={this.props.rowHeight}>
                                    {this.renderHeader(view)}
                                </Layout>}
                            <Layout className={css.rows} onContextMenu={onAllContextMenu}>
                                {this.renderRows(view)}
                            </Layout>
                            {this.renderBottomScrollBar()}
                        </Layout>
                        <Layout size={this.props.scrollBarThickness - 1} className={css.rightLayout}>
                            {this.renderRightScrollBar()}
                        </Layout>
                    </Layout>
                </div>
                <PopupMenu
                    items={headerPopupItems}
                    open={this.state.headerPopupShow}
                    x={this.state.headerPopupX}
                    y={this.state.headerPopupY}
                    onRequestClose={this.handleHeaderPopupRequestClose}
                    onSelect={this.handleHeaderPopupSelect}
                />
                {this.renderSetupModal()}
            </React.Fragment>
        );
        if (this.props.pure) {
            return renderedTable;
        }
        return (
            <Block width={this.props.width} height={this.props.height}>
                {renderedTable}
            </Block>
        );

    }

    showColumn(key, value) {
        let hiddenColumns = Object.assign({}, this.props.hiddenColumns);
        if (value)
            delete hiddenColumns[key];
        else
            hiddenColumns[key] = true;
        let keys = _.keyBy(this.props.columns, 'key');
        if (this.props.onHiddenColumnsChange && Object.keys(hiddenColumns).filter(key => key in keys).length < this.props.columns.length)
            this.props.onHiddenColumnsChange(hiddenColumns);
    }

    handleHeaderPopupSelect = item => {
        if (this.props.onHeaderPopupSelect)
            this.props.onHeaderPopupSelect(item, this.state.headerPopupColumnIndex);
        switch (item.key) {
            case 'setup':
                this.setState({ showSetupModal: true });
                break;
            case 'hide':
                this.showColumn(this.props.columns[this.state.headerPopupColumnIndex].key, false);
                break;
            case 'resetSort':
                if (this.props.onSortChange)
                    this.props.onSortChange([]);
                break;
        }
        this.setState({ headerPopupShow: false });
    }

    handleHeaderPopupRequestClose = () => {
        this.setState({ headerPopupShow: false });
    }

    handleWheel = event => {
        if (event.ctrlKey || event.altKey)
            return;
        if (!hasPassive)
            event.preventDefault();
        let deltaX = event.deltaX;
        let deltaY = event.deltaY;
        if (event.shiftKey) {
            deltaX = deltaY;
            deltaY = 0;
        }
        deltaX = Math.sign(deltaX) * this.props.scrollSpeed;
        deltaY = Math.sign(deltaY) * this.props.scrollSpeed;
        let scrollLeft = this.clampScrollLeft(this.state.scrollLeft + deltaX);
        let scrollTop = this.clampScrollTop(this.state.scrollTop + deltaY);
        this.setState({ scrollLeft, scrollTop });
    }

    handleResize = (width, height) => {
        this.setState({ width, height });
    }

    handleScrollLeftChange = value => {
        this.setState({ scrollLeft: value });
    }

    handleScrollTopChange = value => {
        this.setState({ scrollTop: value });
    }

    handleKeyDown = event => {
        let cursor = this.props.cursor;
        let rowCount = this.state.rowIndex.length;
        if (this.props.cursor === undefined || rowCount == 0)
            return;
        let i = this.state.rowIndex.findIndex(rowIndexItem => rowIndexItem.key == cursor);
        let view = this.getView();
        let processed = false;
        let changeCursor = false;
        if (event.keyCode == 40) {
            // down
            processed = true;
            changeCursor = true;
            i = Math.min(i + 1, rowCount - 1);
        } else if (event.keyCode == 38) {
            // up
            processed = true;
            changeCursor = true;
            i = Math.max(i - 1, 0);
        } else if (event.keyCode == 33) {
            // page up
            processed = true;
            changeCursor = true;
            i = Math.max(i - view.page, 0);
        } else if (event.keyCode == 34) {
            // page down
            processed = true;
            changeCursor = true;
            i = Math.min(i + view.page, rowCount - 1);
        } else if (event.keyCode == 36) {
            // home
            processed = true;
            changeCursor = true;
            i = 0;
        } else if (event.keyCode == 35) {
            // end
            processed = true;
            changeCursor = true;
            i = rowCount - 1;
        } else if (event.keyCode == 37) {
            // left
            processed = true;
            this.setState({ scrollLeft: this.clampScrollLeft(this.state.scrollLeft - this.props.scrollSpeed) });
        } else if (event.keyCode == 39) {
            // right
            processed = true;
            this.setState({ scrollLeft: this.clampScrollLeft(this.state.scrollLeft + this.props.scrollSpeed) });
        }
        if (processed) {
            event.stopPropagation();
            event.preventDefault();
            if (changeCursor && i >= 0 && i < this.state.rowIndex.length) {
                if (this.props.selectMode == 'normal') {
                    if (event.shiftKey) {
                        if (this.props.onSelectedChange)
                            this.props.onSelectedChange(this.getSelectedForRange(this.state.selectStart, i));
                    } else {
                        this.setState({ selectStart: i });
                        if (this.props.onSelectedChange)
                            this.props.onSelectedChange({ [this.state.rowIndex[i].key]: true });
                    }
                }
                cursor = this.state.rowIndex[i].key;
                if (cursor != this.props.cursor && this.props.onCursorChange)
                    this.props.onCursorChange(cursor);
            }
        } else {
            if (this.props.onKeyDown)
                this.props.onKeyDown(event);
        }
    }
}

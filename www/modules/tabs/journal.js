import React from 'react';
import css from './styles.css';
import Delete from '../../pictures/delete.png';
import {Button, Label, Layout, ETable, TextInput, Modal, TextInputHinted, Checkbox, NumberInput} from '../../ui';

export default class Application extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tableRows: props.journal, // строки таблицы, которые могут быть отфильтрованы
            allRows: props.journal, // полный список строк тадлицы
            tableSort: null, // сортировка в таблице
            intervalCount: 0, // время хранения информации в журнале (в днях)
        };
        this.tableColumns = [];
    }

    componentDidUpdate = prevProps => {
        if (prevProps.journal !== this.props.journal) {
            this.setState({ tableRows: this.props.journal, allRows: this.props.journal});
        }
    }

    handleEtableEdit = (key, col, value) => { // функция для изменений в таблице
        let tableRows = [...this.state.tableRows];
        tableRows[key - 1][col] = value || '';
        this.setState({tableRows});
    }

    renderEditor = ({ key, value, onChange, finishEdit, cancelEdit }) => { // формат ячейки при двойном клике по ней
        if (key === 'id') return;
        return (
            <TextInput
                pure
                width="100"
                value={value}
                onChange={onChange}
                onKeyUp={this.handleKeyUp.bind(null, finishEdit, cancelEdit)}/>
        );
    }

    handleKeyUp = (finishEdit, cancelEdit, event) => {
        if (event.key === 'Enter') finishEdit();
        if (event.key === 'Escape') cancelEdit();
    }

    renderSetupFilter = () => { // функция для фильтрации данных в таблице
        if (!this.state.setupFilter)
            return null;
        const onRequestClose = () => {
            this.setState({ setupFilter: null });
        };
        const handleFilterValueChange = value => {
            let { setupFilter } = this.state;
            this.setState({ setupFilter: {...setupFilter, value } });
        };
        const handleExactChange = exact => {
            let { setupFilter } = this.state;
            if (!exact)
                setupFilter.filterType = { list: true, range: true };
            else
                setupFilter.filterType = { exact: true };
            this.setState({ setupFilter: { ...setupFilter } });
        };
        const handleConfirm = () => {
            let { setupFilter } = this.state;
            if (setupFilter.value) {
                this.tableColumns[setupFilter.colIndex].filterValue = setupFilter.value;
                this.tableColumns[setupFilter.colIndex].filter = true;
                this.tableColumns[setupFilter.colIndex].filterType = setupFilter.filterType;
            }
            if (setupFilter.from && setupFilter.to) {
                this.tableColumns[setupFilter.colIndex].filterValue = [ setupFilter.from, setupFilter.to ];
                this.tableColumns[setupFilter.colIndex].filter = true;
                this.tableColumns[setupFilter.colIndex].filterType = setupFilter.filterType;
            }
            this.setState({ setupFilter: null, tableRows: this.personalListToTable(this.state.allRows)});
        };
        const handleKeyDown = event => {
            if (event.keyCode == 27)
                return onRequestClose();
            if (event.keyCode == 13)
                return handleConfirm();
        };
        const gatherFilterHints = () => {
            let { setupFilter } = this.state;
            if (this.tableColumns[setupFilter.colIndex].values)
                return null;
        };
        let filterHints = gatherFilterHints();
        return (
            <Modal show={true} onRequestClose={onRequestClose}>
                <Layout up width="200" height="100">
                    <div style={{ textAlign: 'center' }}>
                        <Label caption={this.tableColumns[this.state.setupFilter.colIndex].caption}/>
                    </div>
                    <div>
                        { filterHints ?
                            <TextInputHinted hints={filterHints} value={this.state.setupFilter.value} onChange={handleFilterValueChange} focus={true} onKeyDown={handleKeyDown}/> :
                            <TextInput width={175} value={this.state.setupFilter.value} onChange={handleFilterValueChange} focus={true} onKeyDown={handleKeyDown}/>
                        }
                    </div>
                    <Checkbox caption="Точное совпадение" value={'exact' in this.state.setupFilter.filterType} onChange={handleExactChange}/>
                    <div>
                        <Button width="50%" caption="Применить" onClick={handleConfirm}/>
                        <Button width="50%" caption="Отмена" onClick={onRequestClose}/>
                    </div>
                </Layout>
            </Modal>
        );
    }

    personalListToTable(list){
        let table = list;
        let filters = this.tableColumns.filter(x => x.filter);
        const checkFilter = (value, filter, filterType = {}, isDate) => {
            let conds = filterType['list'] && !isDate ? filter.split(',') : [filter];
            for (let cond of conds) {
                let range = (filterType['range'] ? cond.split('-') : [cond]).map(x => x.trim());
                if (range.length == 2) {
                    if (!isNaN(range[0]) && !isNaN(range[1]) && !isNaN(value)) {
                        if ((Number(range[0]) <= Number(value)) && (Number(value) <= Number(range[1]))) return true;
                    } else if ((range[0] <= value) && (value <= range[1])) return true;
                } else
                if (filterType['exact']) return value === cond;
                else {
                    if (!cond.match(/[*?]/))
                        cond = '*' + cond + '*';
                    let regExp = cond.trim().replace(/\./g, '\\.');
                    regExp = regExp.replace(/\+/g, '\\+');
                    regExp = regExp.replace(/\*/g, '.*');
                    regExp = regExp.replace(/\?/g, '.');
                    let r = new RegExp('^' + regExp + '$', 'i');
                    if (value && String(value).match(r) != null)
                        return true;
                }
            }
            return false;
        };
        let filteredRows = filters.length > 0 ? table.filter(row => {
            let f = filters.reduce((t, col) => {
                if (!t) return t;
                let c = false;
                if (col.values && row[col.key]) {
                    for (let v of col.values(row[col.key])) {
                        c = checkFilter(v, col.filterValue, col.filterType, col.isDate);
                        if (c) break;
                    }
                } else c = checkFilter(row[col.key], col.filterValue, col.filterType, col.isDate);
                return c;
            }, true);
            return f;
        }) : [...table];

        return filteredRows;
    }

    handleTableSelectedChange = tableSelected => this.setState({ tableSelected });

    handleTableSortChange = value => {
        this.setState({tableSort: value, tableScrollToRow: null }, () => this.setState({ tableScrollToRow: this.state.tableCursor}));
    }

    handleColumnHeaderStyle = index => {
        if (this.tableColumns[index]['filter'])
            return { background: 'linear-gradient(#f0f0f0,#a0a0a0)' };
        return {};
    }

    handleTableColumnChange = (key, value) => {
        this.setState({ [key]: value });
    }

    handleHeaderPopupSelect = (item, colIndex) => {
        switch (item.key) {
            case 'addFilter':
                let col = this.tableColumns[colIndex];
                this.setState({ setupFilter: { colIndex, value: col['filterValue'], filterType: col['filterType'] || { list: true } } });
                item.key = null;
                break;
            case 'removeFilter':
                this.tableColumns[colIndex]['filter'] = null;
                item.key = null;
                this.setState({tableRows: this.personalListToTable(this.state.allRows)});
                break;
        }
    }

    handleHeaderPopup = (items, colIndex) => {
        if (this.tableColumns[colIndex].filter)
            items.push({ key: 'removeFilter', caption: 'Отменить фильтр' });
        else
            items.push({ key: 'addFilter', caption: 'Фильтр...' });
    }

    handleInputIntervalCount = intervalCount => this.setState({intervalCount}) // функция для изменения времени хранения информации

    clearJournal = () => { // функция для очистки журнала
        console.log('clearJournal');
        //запрос к бэку
    }

    render() {
        return (
            <div style={{width: '100%', height: '100%'}}>
                <div className={css.calcHeight}>
                    <ETable
                        renderEditor={this.renderEditor}
                        onEdit={this.handleEtableEdit}
                        rows={this.state.tableRows}
                        columns={this.tableColumns}
                        rowHeight={20}
                        width="100%"
                        height="100%"
                        rightScrollBuffer= {0}
                        bottomScrollBuffer= {0}
                        bottomScrollBarVisible = {false}
                        rightScrollBarVisible = {false}
                        rowKey={row => row.id}
                        selectMode="normal"
                        selected={this.state.tableSelected}
                        onSelectedChange={this.handleTableSelectedChange}
                        sort={this.state.tableSort}
                        onSortChange={this.handleTableSortChange}
                        onColumnHeaderStyle={this.handleColumnHeaderStyle}
                        onHeaderPopup={this.handleHeaderPopup}
                        onHeaderPopupSelect={this.handleHeaderPopupSelect}
                        columnWidths={this.state.tableColumnWidths}
                        onColumnWidthsChange={this.handleTableColumnChange.bind(null, 'tableColumnWidths')}
                        columnsOrder={this.state.tableColumnsOrder}
                        onColumnsOrderChange={this.handleTableColumnChange.bind(null, 'tableColumnsOrder')}
                        hiddenColumns={this.state.tableHiddenColumns}
                        onHiddenColumnsChange={this.handleTableColumnChange.bind(null, 'tableHiddenColumns')}
                    />
                </div>
                {this.renderSetupFilter()}
                <div style={{marginTop: '5', height: '45px'}}>
                    <div style={{display: 'inline-block', float: 'left', width: '300px'}}>
                        <Button
                            onClick={this.clearJournal}
                            caption="Очистить журнал"
                            width="280" img={Delete}
                        />

                    </div>
                    <div style={{display: 'inline-block', float: 'right'}}>
                        <span style={{display: 'inline-block', paddingTop: '9px'}}>Время хранения информации в журнале (в днях): </span>
                        <NumberInput
                            width={140}
                            value={Number(this.state.intervalCount)}
                            onChange={this.handleInputIntervalCount}
                            min={0} max={360}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

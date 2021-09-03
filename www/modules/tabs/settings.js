// вкладка Нстройки
import React from 'react';
import css from './styles.css';
import {xml2json, json2xml} from './xml_functions'; //функции для перевода данных из xml в json и обратно
import UserAccounts from '../settings_tabs/user-accounts'; //выпадающее окно: Учетные записи пользователей
import Directories from '../settings_tabs/directories'; //выпадающее окно: Справочники
import MailSetting from '../settings_tabs/mail_setting'; //выпадающее окно: Настройка рассылок
import Add from '../../pictures/add.png'; // картинки для кнопок - добавление, удаление, сохранение
import Delete from '../../pictures/del.png';
import Save from '../../pictures/save.png';
import User from '../../pictures/users.png';
import Der from '../../pictures/directories.png';
import Mail from '../../pictures/mail.png';
import {Button, Modal } from '../../ui';

export default class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            settings: {},
            showModal: false,
            tableSelected: null, // выбранная строка таблицы
            isChanged: false, // флаг, были ли произведены изменения в данных
            activeBox: null,
            activeSettings: null,
            activeSettingsForUpdate: null,
            startActiveSettings: null,
        };
        this.boxNames = [ 'userAccounts', 'directories', 'mailSetting' ]; //выпадающие окна: Учетные записи пользователей, Справочники, Настройка рассылок
    }

    componentDidMount = () => {
        if (this.props.xmlDoc) this.getDataFromXML();
    }

    componentDidUpdate = prevProps => {
        if (prevProps.xmlDoc !== this.props.xmlDoc) {
            this.getDataFromXML();
        }
    }

    getDataFromXML = () => { // функция перевода настроек из xml в json и создание объекта Объектов
        console.log('настройки в формате xml', this.props.xmlDoc);
        let settings = xml2json(this.props.xmlDoc);
        console.log('настройки в формате json', settings);
        let objects = settings['OBJECT'].map(el => ({caption: el._objectID, value: el._objectID, name: el._name,
            active: el._type ? true : false })); // список Объектов
        objects.push({caption: '', value: '', name: '', active: false}); // добавление пустой строки
        let names = settings['OBJECT'].map(el => ({caption: el._name, value: el._name}));
        names.push({caption: '', value: ''});
        this.setState({settings, objects, names});
    }

    menuClick = key => { // функция переключения между выпадающими окнами
        let activeBox = key;
        if (this.state.isChanged) { // при наличии изменений в данных открывается модальное окно
            this.nextActive = key;
            this.setState({showModal: true});
        } else {
            let activeSettings = null;
            let count = 1;
            if (this.state.activeBox !== activeBox)
                switch (activeBox) { // вычленение данных для открытого выпадающего окна из всех настроек
                    case 'userAccounts':
                        activeSettings = this.state.settings['OBJECT'].map(obj => obj['USERS']['USER']
                            .reduce((acc, int) => [ ...acc, {id: count++, ...int, parent: obj._objectID} ], [])).flat();
                        break;
                    case 'directories':
                        activeSettings = this.state.settings['OBJECT'].map(obj => obj['INTERFACES']['INTERFACE']
                            .reduce((acc, int) => [ ...acc, {id: count++, ...int, _name: obj._name, _objectID: obj._objectID, _type: obj._type || ''} ], [])).flat(); //, _port: obj._port
                        break;
                    case 'mailSetting':
                        activeSettings = this.state.settings['OBJECT'][0]['LOGICAL_NAMES']['LOGICAL_NAME']
                            .reduce((acc, int) => [ ...acc, {id: count++, ...int, _priority: int._priority || ''} ], []).flat();//id: int._logicalName + '_' + count++
                        break;
                    default:
                        break;
                }
            else activeBox = null;
            this.setState({activeBox, tableSelected: null, activeSettings, startActiveSettings: activeSettings, activeSettingsForUpdate: activeSettings});
        }
    }

    addRow = () => { // функция добавления строки для всех таблиц настроек
        let newRow = {};
        switch (this.state.activeBox) {
            case 'userAccounts':
                newRow = {'_name': '', '_ip': ''};
                break;
            case 'directories':
                newRow = {'_type': '', '_objectID': '', '_name': '', '_ip': '', '_port': '', '_gateway_ip': '', '_priority': '', '_interface_id': ''};
                break;
            case 'mailSetting':
                newRow = {'_logicalName': '', '_destObject': '', '_destHost': '', '_destName': '', '_priority': ''};
                break;
            default:
                break;
        }
        newRow.id = (this.state.activeSettings.sort((a, b) => a.id - b.id)[this.state.activeSettings.length - 1]?.id || 0) + 1; // определение id для новой строки
        let activeSettings = JSON.parse(JSON.stringify(this.state.activeSettings));
        activeSettings.push(newRow);
        this.setState({activeSettings, activeSettingsForUpdate: activeSettings, tableSelected: null});
        this.setSettings(activeSettings);
    }

    deleteRow = () => { // функция удаления строки для всех таблиц настроек
        let activeSettings = JSON.parse(JSON.stringify(this.state.activeSettings));
        activeSettings.splice(activeSettings.findIndex(el => el.id == Object.keys(this.state.tableSelected)[0]), 1);
        this.setState({activeSettings, activeSettingsForUpdate: activeSettings, tableSelected: null});
        this.setSettings(activeSettings);
    }

    saveSettings = () => { // функция сохранения для всх таблиц настроек
        let settings = null;
        switch (this.state.activeBox) {
            case 'userAccounts':
                settings = this.state.settings['OBJECT'].map(obj => ({...obj, 'USERS': {'USER': this.state.activeSettings
                    .filter(el => el.parent == obj._objectID)
                    .reduce((acc, int) => [ ...acc, {'_name': int._name, '_ip': int._ip} ], [])}}));
                break;
            case 'directories':
                settings = this.state.settings['OBJECT'].map(obj => ({...obj, 'INTERFACES': {'INTERFACE': this.state.activeSettings
                    .filter(el => el._objectID == obj._objectID)
                    .reduce((acc, int) => [
                        ...acc, {'_port': int._port, '_ip': int._ip, '_gateway_ip': int._gateway_ip,
                            '_interface_id': int._interface_id, '_priority': int._priority},
                    ], [])}}));
                break;
            case 'mailSetting':
                settings = this.state.settings['OBJECT'].map(obj => ({...obj,
                    'LOGICAL_NAMES': {'LOGICAL_NAME': this.state.activeSettings
                        .reduce((acc, int) => {
                            let handler = {};
                            if (int.HANDLER) handler.HANDLER = int.HANDLER;
                            return [
                                ...acc, {'_destHost': int._destHost, '_destName': int._destName,
                                    '_destObject': int._destObject, '_logicalName': int._logicalName, ...handler },
                            ];
                        }, [])}}));
                break;
            default:
                break;
        }
        this.setState({isChanged: false}, this.closeModal); // сброс флага наличия изменений и закрытие модального окна
        if (settings) {
            settings = {'OBJECT': settings};
            let xml = json2xml(settings); // перевод настроек из json в xml для отправки на сервер
            this.props.setSettings(xml);
        }
    }

    closeModal = () => { // закрытие модального окна
        if (this.state.showModal) {
            this.setState({isChanged: false, showModal: false}, this.menuClick.bind(null, this.nextActive));
            this.nextActive = null;
        }
    }

    getTableSelected = tableSelected => this.setState({tableSelected}); // переключение выбранной строки таблицы

    setSettings = activeSettings => { // функция для обновления изменных данных
        let isChanged = JSON.stringify(activeSettings) !== JSON.stringify(this.state.startActiveSettings);
        if (isChanged != this.state.isChanged) this.setState({isChanged});
        this.setState({activeSettings});
    }

    checkAddDisabled = () => { // функция проверки разрешения добавления новой строки - если в таблице нет пустых строк
        let result = false;
        switch (this.state.activeBox) {
            case 'userAccounts':
                result = this.state.activeSettings.find(el => el._name == '' || el._ip == '') ? true : false;
                break;
            case 'directories':
                result = this.state.activeSettings.find(el => el._objectID == '' || el._name == '' || el._ip == '' || el._port == '') ? true : false;
                break;
            case 'mailSetting':
                result = this.state.activeSettings.find(el => el._logicalName == '') ? true : false;
                break;
            default:
                break;
        }
        return !this.state.activeBox || result;
    }

    render() {
        let addDisabled = this.checkAddDisabled();
        return (
            <div style={{width: '100%', height: '100%'}}> {/* кнопки для добавления, удаления и сохранения */}
                <div style={{display: 'inline-block', float: 'left', margin: '10px 0', height: '60px'}}>
                    <Button style={{height: '50px', width: '50px', padding: '0'}} tooltip={'Добавить'} tooltipPos = {'bootom'}
                        imgStyle = {{height: '44px', width: '44px', marginTop: '4px'}}
                        onClick={this.addRow} disabled={addDisabled}
                        width="60" img={Add}
                    />
                    <Button style={{height: '50px', width: '50px', padding: '0'}} tooltip={'Удалить'} tooltipPos = {'bootom'}
                        imgStyle = {{height: '44px', width: '44px', marginTop: '4px'}}
                        onClick={this.deleteRow} disabled={!this.state.tableSelected}
                        width="60" img={Delete}
                    />
                    <Button style={{height: '50px', width: '50px', padding: '0'}} tooltip={'Сохранить'} tooltipPos = {'bootom'}
                        imgStyle = {{height: '44px', width: '44px', marginTop: '4px'}}
                        onClick={this.saveSettings} disabled={!this.state.activeBox}
                        img={Save}
                    />
                </div>
                <div> {/* выпадающие окна */}
                    <Button
                        onClick={this.menuClick.bind(null, 'userAccounts')}
                        caption="Учетные записи пользователей" style={this.state.activeBox == 'userAccounts' ? {background: '#accac8'} : null}
                        width="100%" img={User} className={css.setting_but}
                    />
                    {this.state.activeBox == 'userAccounts' ? <UserAccounts
                        settings={this.state.activeSettingsForUpdate}
                        setSettings={this.setSettings} objects={this.state.objects}
                        getTableSelected={this.getTableSelected}
                    /> : null}
                    <Button
                        onClick={this.menuClick.bind(null, 'directories')}
                        caption="Справочники" style={this.state.activeBox == 'directories' ? {background: '#accac8'} : null}
                        width="100%" img={Der} className={css.setting_but}
                    />
                    {this.state.activeBox == 'directories' ? <Directories
                        settings={this.state.activeSettingsForUpdate}
                        setSettings={this.setSettings} objects={this.state.objects} names={this.state.names}
                        getTableSelected={this.getTableSelected}/> : null}
                    <Button
                        onClick={this.menuClick.bind(null, 'mailSetting')}
                        caption="Настройка рассылок" style={this.state.activeBox == 'mailSetting' ? {background: '#accac8'} : null}
                        width="100%" img={Mail} className={css.setting_but}
                    />
                    {this.state.activeBox == 'mailSetting' ? <MailSetting
                        settings={this.state.activeSettingsForUpdate} getTableSelected={this.getTableSelected}
                        objects={this.state.objects} setSettings={this.setSettings}/> : null}
                </div>
                <Modal show = {this.state.showModal} > {/* модальное окно - сохранять ли данные при переключении между выпадающими окнами */}
                    <div style={{width: '470', height: '110', padding: '5px 15px'}}>
                        <p style={{fontSize: '18px', padding: '5px 20px', textAlign: 'center'}}>Сохранить изменения? </p>
                        <div>
                            <Button
                                onClick={this.saveSettings}
                                caption="Да"
                                style={{width: '140px'}}
                            />
                            <Button
                                onClick={this.closeModal}
                                caption="Нет"
                                style={{width: '140px'}}
                            />
                            <Button
                                onClick={() => this.setState({showModal: false})}
                                caption="Отмена"
                                style={{width: '140px'}}
                            />
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

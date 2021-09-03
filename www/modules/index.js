
import React from 'react';
import ExchangeProgress from './tabs/exchange-progress';
import Session from './tabs/session';
import Journal from './tabs/journal';
import Repository from './tabs/repository';
import Settings from './tabs/settings';
import Exchange from '../pictures/exchange.png';
import Sess from '../pictures/sessions.png';
import Jour from '../pictures/journal.png';
import Repos from '../pictures/repository.png';
import Sett from '../pictures/settings.png';
import {Tabs, Tab} from '../ui';

export default class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            exchangeProgress: [],
            session: [],
            journal: [],
            repository: [],
            xmlDoc: null,
            tabsValue: 'exchange-progress',
        };
    }

    componentDidMount = () => {
        this.getSettings();
        //todo по аналогии получать данные с бека и для других вкладок
    }

    getSettings = () => { //получение с сервера файла settings.xml с настроеками
        let xhttp = new XMLHttpRequest();
        let _this = this;
        xhttp.onreadystatechange = function() {
            console.log('GET settings.xml status', this.status);
            //todo проверять на беке логин и пароль пользователя, если нет возвращать status 404
            if (this.readyState == 4 && this.status == 200) {
                let xmlDoc = this.responseXML;
                _this.setState({xmlDoc});
            } else if (this.status == 404) { //пользователь не найден, переход на страницу аутентификации
                _this.props.setVerification(false);
            }
        };
        xhttp.open('GET', 'settings.xml', true);
        xhttp.send();
    }

    setSettings = xml => { //отправка на бек изменнного файла с настройками
        console.log(xml);
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200)
                console.log(this.responseText);
        };
        xhttp.open('POST', 'settings.xml', true);
        xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhttp.send(xml);
    }

    handleTableColumnChange = (key, value) => this.setState({ [key]: value });

    render() {
        return (
            <div style={{width: '100%', height: '100%'}}>
                <Tabs value={this.state.tabsValue} onChange={this.handleTableColumnChange.bind(null, 'tabsValue')} width="100%" height="100%" >
                    <Tab value="exchange-progress" caption="Ход обмена" height="400" img={Exchange}>
                        <ExchangeProgress exchangeProgress={this.state.exchangeProgress} />
                    </Tab>
                    <Tab value="session" caption="Сессии" img={Sess}>
                        <Session session={this.state.session}/>
                    </Tab>
                    <Tab value="journal" caption="Журнал" img={Jour}>
                        <Journal journal={this.state.journal}/>
                    </Tab>
                    <Tab value="repository" caption="Хранилище" img={Repos}>
                        <Repository repository={this.state.repository}/>
                    </Tab>
                    <Tab value="settings" caption="Настройки" img={Sett}>
                        <Settings xmlDoc={this.state.xmlDoc} setSettings={this.setSettings}/>
                    </Tab>
                </Tabs>
            </div>
        );
    }
}

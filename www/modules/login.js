import React from 'react';
import css from './styles.css';
import Add from '../pictures/add.png';
import {Button, TextInput, Label, Layout} from '../ui';

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: '',
            showPassword: false, // скрыть/показать пароль
            password: '',
        };
    }

    // authenticateUser = (user, password) => { // шифрование логина и пароля
    //     let token = user + ':' + password;
    //     let hash = btoa(token);
    //     return 'Basic ' + hash;
    // }

    sendUserData = () => {
        console.log('{userName, password}', {userName: this.state.userName, password: this.state.password});
        // два метода отправки данных для проверки:

        // отправка на бек логина и пароля методом PUT
        fetch('settings.xml', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userName: this.state.userName, password: this.state.password }),
        });

        // отправка на бек логина и пароля методом POST
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200)
                console.log('this.responseText', this.responseText);
        };
        xhttp.open('POST', 'settings.xml', true);
        xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhttp.send({userName: this.state.userName, password: this.state.password});
    }

    setUserName = userName => { // ввод логина
        this.setState({userName});
    }

    setPassword = password => { // ввод пароля
        if (this.state.password.length < password.length) {
            let last = password.substr(-1); //берет только последний символ строки на случай, если пароль скрыт '*'
            this.setState(state => ({password: state.password + last}));
        }
    }

    setShowPassword = () => this.setState(state => ({showPassword: !state.showPassword}));

    checkDisabled = () => !(this.state.userName && this.state.password)

    render() {
        let disabled = this.checkDisabled(); //прорверка на заполненность полей
        let password = this.state.showPassword ? this.state.password : '*'.repeat(this.state.password?.length);
        return (
            <div style={{width: '100%', height: '100%'}}>
                <div style={{width: '320px', height: '220px'}} className={css.rootLogin}>
                    <h2 style={{paddingLeft: '90px'}}>Авторизация</h2>
                    <div className={css.inputRow}>
                        <Label caption="Логин: " width={70} style={{marginTop: '5px'}}/>
                        <TextInput value={this.state.userName} onChange={this.setUserName}/>
                    </div>
                    <div className={css.inputRow}>
                        <Label caption="Пароль: " width={70} style={{marginTop: '5px'}}/>
                        <TextInput value={password} onChange={this.setPassword} inline={true}/>
                        <Button style={{height: '28px', width: '28px', padding: '0'}} tooltipPos = {'bootom'} // скрыть/показать пароль
                            imgStyle = {{height: '25px', width: '25px', marginTop: '2px'}} //todo заменить на картинку глаза
                            onClick={this.setShowPassword} width="27" img={Add} inline={true}
                        />
                    </div>
                    <br />
                    <br />
                    <Layout width={195}></Layout>
                    <Button width="120" caption="Отправить" onClick={this.sendUserData} disabled={disabled}/>
                </div>
            </div>
        );
    }
}


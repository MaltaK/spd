import React from 'react';
import css from './styles.css';
import { HashRouter } from 'react-router-dom';
import Crash from './crash';
import Main from '../modules';
import Login from '../modules/login';

export default class Application extends React.Component {
    state = {
        isVerification: true, //зарегестрирован ли пользователь
    }

    componentDidCatch(error) {
        this.setState({ error });
    }

    setVerification = isVerification => this.setState({isVerification});

    render() {
        if (this.state.error)
            return <Crash error={this.state.error} />;
        return (
            <HashRouter>
                <div style={{width: '100%', height: '100vh'}} className={css.root}>
                    {this.state.isVerification ?
                        <Main setVerification={this.setVerification}/> : //главная страница
                        <Login /> //страница аутентификации
                    }
                </div>
            </HashRouter>
        );
    }
}

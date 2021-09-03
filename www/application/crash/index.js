import React from 'react';
import css from './styles.css';

export default function Crash(props) {

    let stack = props.error.stack.split('\n').map((line, index) => (
        <React.Fragment key={index}>
            <span>{line}</span>
            <br />
        </React.Fragment>
    ));
    return (
        <div className={css.root}>
            <u><b>{'Произошла ошибка:'}</b></u>
            <br />
            <i>{stack}</i>
        </div>
    );

}

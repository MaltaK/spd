import React from 'react';
import { Row, Cell } from '../../grid';
import css from './style.css';

function Weeks() {
    return (
        <Row>
            {[ 'пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс' ].map((day, i) => (
                <Cell key={i} className={css.weekday} colSpan={3}>{day}</Cell>
            ))}
        </Row>

    );
}

export default Weeks;

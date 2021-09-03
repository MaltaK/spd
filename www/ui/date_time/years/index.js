import React, { useMemo } from 'react';
import cn from 'classnames';
import { chunk } from 'utils';
import moment from 'moment';
import { Row, Cell } from '../../grid';
import css from './style.css';

export function getYears(date) {
    let from = 1900;
    let year = Number(date.format('YYYY'));
    let dtyear = year - from;
    let start = Math.floor(dtyear / 12) * 12 + from;
    let years = [];
    for (let i = 0; i < 12; i++)
        years.push(String(start + i));
    return chunk(years, 3);
}

function Years({ value, onChange, isOutOfBoundaries, revertMode }) {

    let now = useMemo(() => moment().set({
        month: 0,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
    }), []);

    let date = value || now;

    let years = useMemo(() => getYears(value || now), [ value, now ]);

    function handleClick(year) {
        onChange(date.clone().year(year));
        revertMode();
    }

    function renderYear(year, i) {
        let outOfBoundaries = isOutOfBoundaries(date.clone().year(year).startOf('year')) && isOutOfBoundaries(date.clone().year(year).endOf('year'));
        let className = cn(css.cell, css.item, {
            [css.selected]: value && value.format('YYYY') === year,
            [css.outOfBoundaries]: outOfBoundaries,
        });
        return (
            <Cell key={i} className={className} onClick={outOfBoundaries ? undefined : handleClick.bind(null, year)} colSpan={7}>
                {year}
            </Cell>
        );
    }

    function renderYears(row, i) {
        return (
            <Row key={i}>
                {row.map(renderYear)}
            </Row>
        );
    }

    return years.map(renderYears);
}

export default Years;

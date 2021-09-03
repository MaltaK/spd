import React, { useMemo } from 'react';
import cn from 'classnames';
import moment from 'moment';
import { chunk } from 'utils';
import { Row, Cell } from '../../grid';
import css from './style.css';

const zise = 3;

const list = chunk([
    'Янв.', 'Февр.', 'Март',
    'Апр.', 'Май', 'Июнь',
    'Июль', 'Авг.', 'Сент.',
    'Окт.', 'Нояб.', 'Дек.',
], zise);

function Months({ value, onChange, isOutOfBoundaries, revertMode }) {

    let now = useMemo(() => moment().set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
    }), []);

    let date = value || now;

    function handleChange(date) {
        onChange(date);
        revertMode();
    }

    function renderCell(index, caption, i) {
        let month = index * zise + i;
        let monthDate = date.clone().set({ month });
        let outOfBoundaries = isOutOfBoundaries(monthDate.clone().endOf('day')) && isOutOfBoundaries(monthDate.clone().startOf('day'));
        let className = cn(css.item, {
            [css.selected]: value && value.isSame(monthDate, 'month'),
            [css.outOfBoundaries]: outOfBoundaries,
        });
        return (
            <Cell key={i} className={css.cell} colSpan={7}>
                <div className={className} onClick={outOfBoundaries ? undefined : handleChange.bind(null, monthDate)}>
                    {caption}
                </div>
            </Cell>
        );
    }

    function renderRow(captions, i) {
        return (
            <Row key={i}>
                {captions.map(renderCell.bind(null, i))}
            </Row>
        );
    }

    return list.map(renderRow);
}

export default Months;

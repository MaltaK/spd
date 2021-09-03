import React, { useMemo } from 'react';
import moment from 'moment';
import cn from 'classnames';
import { Cell } from '../../../grid';
import css from './style.css';

function Dates({ dates, value, onChange, onDoubleClick: handleDoubleClick, isOutOfBoundaries }) {

    let now = useMemo(() => moment().set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
    }), []);

    function handleChange(date) {
        onChange((value || now).clone().set({
            date: date.date(),
            month: date.month(),
            year: date.year(),
        }));
    }

    return dates.map((date, i) => {
        let outOfBoundaries = isOutOfBoundaries(date.clone().startOf('day')) && isOutOfBoundaries(date.clone().endOf('day'));
        let className = cn(css.item, {
            [css.today]: date.isSame(now, 'day'),
            [css.otherMonth]: !date.isSame(value || now, 'month'),
            [css.selected]: value && date.isSame(value, 'day'),
            [css.outOfBoundaries]: outOfBoundaries,
        });
        return (
            <Cell className={css.cell} key={i} colSpan={3}>
                <div
                    className={className}
                    onClick={outOfBoundaries ? undefined : handleChange.bind(null, date)}
                    onDoubleClick={outOfBoundaries ? undefined : handleDoubleClick}
                >{date.date()}</div>
            </Cell>
        );
    });
}

export default Dates;

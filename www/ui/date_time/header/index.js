import React, { useMemo } from 'react';
import cn from 'classnames';
import moment from 'moment';
import { Row, Cell } from '../../grid';
import css from './style.css';
import TriangleLeft from '../../images/triangle_left.png';
import TriangleRight from '../../images/triangle_right.png';
import { MODES } from '../picker';
import { getYears } from '../years';

function modeToChanger(mode) {
    switch (mode) {
        case MODES.DATE: return { size: 1, value: 'month' };
        case MODES.MONTH: return { size: 1, value: 'year' };
        case MODES.YEAR: return { size: 12, value: 'year' };
    }
}

function formatDateWithMode(date, mode) {
    switch (mode) {
        case MODES.DATE: return date.format('MMM YYYY');
        case MODES.MONTH: return date.format('YYYY');
        case MODES.YEAR:
            let [ from, ...years ] = getYears(date).flat();
            let to = years[years.length - 1];
            return `${from} — ${to}`;
    }
}

function isLegalOutOfBoundaries(isOutOfBoundaries, changer, value) {
    if (changer.size === 1)
        return isOutOfBoundaries(value.clone().startOf(changer.value))
            && isOutOfBoundaries(value.clone().endOf(changer.value));
    let [ from, ...years ] = getYears(value).flat();
    let to = years[years.length - 1];
    return isOutOfBoundaries(moment(from, 'YYYY').startOf(changer.value))
        && isOutOfBoundaries(moment(to, 'YYYY').endOf(changer.value));
}

function Header({ value, isOutOfBoundaries, mode, onChange: handleChange, specifyMode }) {

    let now = useMemo(() => moment().set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
    }), []);

    let date = value || now;

    let changer = modeToChanger(mode);

    let left = date.clone().subtract(changer.size, changer.value);
    let right = date.clone().add(changer.size, changer.value);

    let leftOutOfBoundary = isLegalOutOfBoundaries(isOutOfBoundaries, changer, left);
    let rightOutOfBoundary = isLegalOutOfBoundaries(isOutOfBoundaries, changer, right);

    let leftClassName = cn(css.arrowImage, { [css.arrowImageOutOfBoundaries]: leftOutOfBoundary });
    let rightClassName = cn(css.arrowImage, { [css.arrowImageOutOfBoundaries]: rightOutOfBoundary });

    return (
        <Row>
            <Cell className={css.cell} colSpan={3}>
                <div className={css.arrow} onClick={leftOutOfBoundary ? undefined : handleChange.bind(null, left)}>
                    <img src={TriangleLeft} className={leftClassName} />
                </div>
            </Cell>
            {mode !== MODES.YEAR ? <Cell className={css.cell} colSpan={3} /> : null}
            <Cell className={css.cell} colSpan={mode !== MODES.YEAR ? 9 : 15}>
                <div className={css.monthYear} onClick={specifyMode}>
                    {formatDateWithMode(date, mode)}
                </div>
            </Cell>
            {mode !== MODES.YEAR ? <Cell className={css.cell} colSpan={3} /> : null}
            <Cell className={css.cell} colSpan={3}>
                <div className={cn(css.arrow, css.rightArrow)} onClick={rightOutOfBoundary ? undefined : handleChange.bind(null, right)}>
                    <img src={TriangleRight} className={rightClassName} />
                </div>
            </Cell>
        </Row>
    );
}

export default Header;

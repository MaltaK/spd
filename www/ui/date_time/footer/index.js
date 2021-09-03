import React, { useEffect, useRef } from 'react';
import { Row, Cell } from '../../grid';
import moment from 'moment';
import Button from '../../button';
import css from './style.css';
import Time from '../../time_input';
import crossImage from '../../images/cross.png';
import applyImage from '../../images/checked.png';

function Footer({ value, onChange, onSelect: handleSelect, canReset, canNowset, dateOnly }) {

    let select = useRef(false);

    useEffect(() => {
        if (select.current) {
            select.current = false;
            handleSelect();
        }
    });

    function handleCrossClick() {
        onChange(null);
        select.current = true;
    }

    function handleNowsetClick() {
        onChange(moment());
        select.current = true;
    }

    function handleTimeChange(str) {
        let [ hour, minute, second ] = str.split(':');
        let date = value || moment();
        onChange(date.clone().set({ hour, minute, second, millisecond: 0 }));
    }

    function renderNowset() {
        if (!canNowset || dateOnly)
            return null;
        return (
            <React.Fragment>
                <Row style={{ height: '2px' }} />
                <Row>
                    <Cell colSpan={21}>
                        <Button pure caption="Сегодня" onClick={handleNowsetClick} />
                    </Cell>
                </Row>
            </React.Fragment>
        );
    }

    function renderTime() {
        if (dateOnly)
            return canNowset ? <Button pure caption="Сегодня" onClick={handleNowsetClick} /> : null;
        let timeValue = value ? value.format('HH:mm:ss') : null;
        return (
            <div className={css.time}>
                <Time pure value={timeValue} onChange={handleTimeChange} />
            </div>
        );
    }

    return (
        <React.Fragment>
            <Row>
                <Cell colSpan={6}>
                    {canReset ? <Button pure img={crossImage} onClick={handleCrossClick} /> : null}
                </Cell>
                <Cell colSpan={9}>
                    {renderTime()}
                </Cell>
                <Cell colSpan={6}>
                    <Button pure img={applyImage} onClick={handleSelect} />
                </Cell>
            </Row>
            {renderNowset()}
        </React.Fragment>
    );
}

export default Footer;

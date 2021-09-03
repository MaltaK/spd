import React, { useState } from 'react';
import { Grid, Row } from '../grid';
import Header from './header';
import Weeks from './weeks';
import View from './view';
import Footer from './footer';
import Months from './months';
import Years from './years';

export const MODES = Object.freeze({
    DATE: 'DATE',
    MONTH: 'MONTH',
    YEAR: 'YEAR',
});

function Picker({
    onSelect: handleSelect,
    onChange: handleChange,
    value,
    isOutOfBoundaries,
    canReset,
    canNowset,
    dateOnly,
}) {

    let [ mode, setMode ] = useState(MODES.DATE);

    function specifyMode() {
        setMode(mode => {
            if (mode === MODES.DATE)
                return MODES.MONTH;
            if (mode === MODES.MONTH)
                return MODES.YEAR;
            return MODES.YEAR;
        });
    }

    function revertMode() {
        setMode(mode => {
            if (mode === MODES.YEAR)
                return MODES.MONTH;
            if (mode === MODES.MONTH)
                return MODES.DATE;
            return MODES.DATE;
        });
    }

    function renderDateMode() {
        return (
            <React.Fragment>
                <Weeks />
                <View
                    value={value}
                    onDoubleClick={handleSelect}
                    onChange={handleChange}
                    isOutOfBoundaries={isOutOfBoundaries}
                />
                <Footer
                    value={value}
                    onChange={handleChange}
                    onSelect={handleSelect}
                    canReset={canReset}
                    canNowset={canNowset}
                    dateOnly={dateOnly}
                />
            </React.Fragment>
        );
    }

    function renderMonthMode() {
        return (
            <React.Fragment>
                <Months
                    value={value}
                    onChange={handleChange}
                    isOutOfBoundaries={isOutOfBoundaries}
                    revertMode={revertMode}
                />
            </React.Fragment>
        );
    }

    function renderYearMode() {
        return (
            <React.Fragment>
                <Years
                    value={value}
                    onChange={handleChange}
                    isOutOfBoundaries={isOutOfBoundaries}
                    revertMode={revertMode}
                />
            </React.Fragment>
        );
    }

    function render() {
        switch (mode) {
            case MODES.DATE: return renderDateMode();
            case MODES.MONTH: return renderMonthMode();
            case MODES.YEAR: return renderYearMode();
        }
    }

    return (
        <Grid width="100%" height="100%" pure transparent fixedWidth={195} cols={21}>
            <Header
                value={value}
                onChange={handleChange}
                isOutOfBoundaries={isOutOfBoundaries}
                mode={mode}
                specifyMode={specifyMode}
            />
            <Row style={{ height: '2px' }} />
            {render()}
        </Grid>
    );
}

export default Picker;

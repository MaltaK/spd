import React, { useMemo } from 'react';
import moment from 'moment';
import { chunk } from 'utils';
import { Row } from '../../grid';
import Dates from './dates';

function getView(date) {
    let end = date.clone().endOf('month').endOf('week').startOf('day');
    let i = date.clone().startOf('month').startOf('week');
    let dates = [];
    while (i.isSameOrBefore(end)) {
        dates.push(i.clone());
        i.add(1, 'days');
    }
    return chunk(dates, 7);
}

function View({ value, ...props }) {

    let view = useMemo(() => getView(value || moment()), [value]);

    return view.map((dates, i) => (
        <Row key={i}>
            <Dates
                dates={dates}
                value={value}
                {...props}
            />
        </Row>
    ));
}

export default View;

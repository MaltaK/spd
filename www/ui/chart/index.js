import React, { useState } from 'react';
import LineChart from 'react-chartjs/lib/line';
import ChartJS from 'chart.js';
import Layout from '../layout';

ChartJS.defaults.global.responsive = true;
ChartJS.defaults.global.animation = false;
ChartJS.defaults.global.maintainAspectRatio = false;

function Chart({ data }) {

    let forceUpdate = useState(0)[1];

    function handleResize() {
        forceUpdate(i => i + 0.000000001);
    }

    return (
        <Layout fill onResize={handleResize}>
            <LineChart data={data} redraw/>
        </Layout>
    );

}

export default Chart;

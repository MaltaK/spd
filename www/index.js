import React from 'react';
import ReactDOM from 'react-dom';
import onload from './onload';
import Application from './application';
import Crash from './application/crash';

onload(() => {
    try {
        ReactDOM.render(<Application/>, document.getElementById('content'));
    } catch (error) {
        ReactDOM.render(<Crash error={error} />, document.getElementById('content'));
    }
});

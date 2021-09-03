import React from 'react';

const ProgressBar = props => {
    const {bgcolor, completed, fontColor, textAlign} = props;

    const containerStyles = {
        height: 20,
        width: '276px',
        backgroundColor: '#e0e0de',
        borderRadius: 50,
        margin: 18,
    };

    const fillerStyles = {
        height: '100%',
        width: `${completed ? (completed > 100 ? 100 : completed) : 0}%`,
        backgroundColor: `${bgcolor ? bgcolor : '#5e8ce1'}`,
        borderRadius: 'inherit',
        textAlign: `${textAlign ? textAlign : 'right'}`,
        transition: 'width 0.4s ease-in-out',
    };

    const labelStyles = {
        padding: 5,
        color: `${fontColor ? fontColor : 'white'}`,
        fontWeight: 'bold',
    };

    return (
        <div style={containerStyles}>
            <div style={fillerStyles}>
                <span style={labelStyles}>{`${completed}%`}</span>
            </div>
        </div>
    );
};

export default ProgressBar;

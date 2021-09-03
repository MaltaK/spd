import React from 'react';
import css from './styles.css';

export default function Hr(props) {
    return (
        <div className={css.root} { ...props }>
            <hr className={css.hr} />
        </div>
    );
}

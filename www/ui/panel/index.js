import React from 'react';
import cn from 'classnames';
import Block from '../block';
import css from './styles.css';

function Panel({ children, className, ...userProps }, ref) {
    return (
        <Block {...userProps} className={cn(css.root, className)} container ref={ref}>
            {children}
        </Block>
    );

}

export default React.memo(React.forwardRef(Panel));

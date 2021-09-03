import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import css from './styles.css';
import Block from '../block';

let Context = React.createContext();

function Row({ children, className, ...userProps }) {
    return (
        <tr className={cn(css.tr, className)} {...userProps}>
            {children}
        </tr>
    );
}

Row.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
};

function Cell({ children, header, width, height, className: userClassName, style: userStyle, ...userProps }) {
    let gridProps = useContext(Context);
    let style = {
        ...userStyle,
        width,
        height,
    };
    let className = cn(header ? css.th : css.td, userClassName, {
        [css.tdDefault]: !gridProps.transparent,
    });
    return (
        <td className={className} style={style} {...userProps}>
            {children}
        </td>
    );
}

Cell.propTypes = {
    header: PropTypes.bool,
    width: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
    height: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
    className: PropTypes.string,
};

function Grid(props) {
    let { children, width, height, style, fixedWidth, className, transparent, pure, cols, inline, ...userProps } = props;
    let tableStyle = { ...style };
    if (fixedWidth)
        tableStyle.width = fixedWidth === true ? '100%' : fixedWidth;
    let tableClassName = cn(css.table, className, {
        [css.tableDefault]: !transparent,
    });
    let renderedCols = cols ? (
        <Row className={css.hiddenRow}>
            {[...Array(cols)].map((e, i) => <Cell key={i} />)}
        </Row>
    ) : null;
    return (
        <Block className={css.root} width={width} height={height} pure={pure} inline={inline}>
            <table className={tableClassName} {...userProps} style={tableStyle}>
                <tbody>
                    <Context.Provider value={props}>
                        {children}
                        {renderedCols}
                    </Context.Provider>
                </tbody>
            </table>
        </Block>
    );
}

Grid.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    width: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
    height: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
    fixedWidth: PropTypes.oneOfType([ PropTypes.bool, PropTypes.number ]),
    pure: PropTypes.bool,
    transparent: PropTypes.bool,
    cols: PropTypes.number,
};

export { Row, Cell, Grid };

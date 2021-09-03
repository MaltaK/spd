import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import css from './styles.css';

function flexStyle(key, value) {
    let prop = key.charAt(0).toUpperCase() + key.slice(1);
    return {
        [`Moz${prop}`]: value,
        [`Webkit${prop}`]: value,
    };
}

function fixJustify(justify) {
    if (justify === 'space-between' || justify === 'space-around')
        return 'justify';
    return justify;
}

function Section({
    direction = 'row',
    align = 'stretch',
    justify = 'start',
    flex,
    width,
    height,
    children,
    style: userStyle,
    className: userClassName,
    ...userProps
}) {
    if (flex) {
        let style = {
            ...userStyle,
            ...flexStyle('boxFlex', flex),
            width,
            height,
        };
        return (
            <div {...userProps} className={userClassName} style={style}>
                {children}
            </div>
        );
    }
    let className = cn(css.section, userClassName, {
        [css.row]: direction === 'row',
        [css.column]: direction === 'column',
        [css.spaceAround]: justify === 'space-around',
    });
    let style = {
        ...userStyle,
        ...flexStyle('boxAlign', align),
        ...flexStyle('boxPack', fixJustify(justify)),
        width,
        height,
    };
    return (
        <div {...userProps} className={className} style={style}>
            {children}
        </div>
    );
}

Section.propTypes = {
    direction: PropTypes.oneOf([ 'row', 'column' ]),
    align: PropTypes.oneOf([ 'start', 'end', 'center', 'baseline', 'stretch' ]),
    justify: PropTypes.oneOf([ 'start', 'end', 'center', 'space-between', 'space-around' ]),
    flex: PropTypes.number,
    width: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]),
    height: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]),
    children: PropTypes.node,
    style: PropTypes.object,
    className: PropTypes.string,
};

export default React.memo(Section);

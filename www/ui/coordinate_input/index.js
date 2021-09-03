// import React, { useRef, useState, useLayoutEffect, useMemo } from 'react';
// import PropTypes from 'prop-types';
// import proj from 'ol/proj';
// import TextInputMasked from '../text_input_masked';
// import { getEning } from 'www/coordinate_utils';
// import { KEYCODES } from 'hooks/useHotkeys';

// const masks = {
//     'degrees': {
//         'l': [
//             { valid: /\d{0,3}/, minLength: 1, maxLength: 4, next: /\d{3}|-?[2-9]\d/ }, '\u00b0 ',
//             { valid: /\d*/, minLength: 1, maxLength: 2 }, '\' ',
//             { valid: /\d*/, minLength: 1, maxLength: 2 }, '\'\'',
//         ],
//         'b': [
//             { valid: /\d{0,2}/, minLength: 1, maxLength: 3, next: /\d{2}/ }, '\u00b0 ',
//             { valid: /\d*/, minLength: 1, maxLength: 2 }, '\' ',
//             { valid: /\d*/, minLength: 1, maxLength: 2 }, '\'\'',
//         ],
//     },
//     'degreesDecimal': {
//         'l': [
//             { valid: /\d{0,3}/, minLength: 1, maxLength: 4, next: /\d{3}|-?[2-9]\d/ }, '.',
//             { valid: /\d*/, minLength: 1, maxLength: 6 },
//         ],
//         'b': [
//             { valid: /\d{0,2}/, minLength: 1, maxLength: 3, next: /\d{2}/ }, '.',
//             { valid: /\d*/, minLength: 1, maxLength: 6 },
//         ],
//     },
//     'merkator': {
//         'l': [{ valid: /\d{0,8}/, minLength: 1, maxLength: 9 }],
//         'b': [{ valid: /\d{0,8}/, minLength: 1, maxLength: 9 }],
//     },
// };

// function getMask(sign, coordinate, coordinateDisplay) {
//     const ending = getEning(sign, coordinate);
//     return [ ...masks[coordinateDisplay][coordinate], ' ' + ending ];
// }

// function partsToValue(parts, sign, coordinate, coordinateDisplay) {
//     const strSign = sign === -1 ? '-' : '';
//     if (coordinateDisplay === 'degrees') {
//         const degs = parts[0] ? Number(parts[0]) : 0;
//         const mins = parts[1] ? Number(parts[1]) / 60 : 0;
//         const secs = parts[2] ? Number(parts[2]) / 60 / 60 : 0;
//         return strSign + String(degs + mins + secs);
//     } else if (coordinateDisplay === 'degreesDecimal') {
//         const int = parts[0] ? parts[0] : '';
//         const float = parts[1] ? parts[1] : '';
//         return `${strSign}${int}.${float}`;
//     } else if (coordinateDisplay === 'merkator') {
//         if (!parts[0])
//             return '';
//         const coord = Number(parts[0]);
//         const coords = proj.transform(coordinate == 'l' ? [ coord, 0 ] : [ 0, coord ], 'EPSG:3857', 'EPSG:4326');
//         return strSign + String(coordinate == 'l' ? coords[0] : coords[1]);
//     }
// }

// function getComplete(coordinate, coordinateDisplay) {
//     const max = coordinate === 'l' ? 180 : 90;
//     if (coordinateDisplay === 'degrees') {
//         return parts => (/\d{1,3}/).test(parts[0])
//                 && Number(parts[1]) < 60
//                 && Number(parts[2]) < 60
//                 && Number(partsToValue(parts, 1, coordinate, coordinateDisplay)) <= max;
//     } else if (coordinateDisplay === 'degreesDecimal') {
//         return parts => (/\d{1,2}/).test(parts[0])
//             && (/\d{1,6}/).test(parts[1])
//             && Number(partsToValue(parts, 1, coordinate, coordinateDisplay)) <= max;
//     } else if (coordinateDisplay === 'merkator') {
//         return parts => (/\d{0,8}/).test(parts[0])
//             && Number(partsToValue(parts, 1, coordinate, coordinateDisplay)) <= max;
//     }
// }

// function valueToParts(value, coordinate, coordinateDisplay) {
//     if (coordinateDisplay === 'degrees') {
//         if (!value)
//             return [ '', '', '' ];
//         let degs = Math.abs(Number(value));
//         degs = Math.round(degs * 60 * 60);
//         const secs = degs % 60;
//         degs = Math.floor(degs / 60);
//         const mins = degs % 60;
//         degs = Math.floor(degs / 60);
//         return [ degs, mins, secs ];
//     } else if (coordinateDisplay === 'degreesDecimal') {
//         if (!value)
//             return [ '', '' ];
//         const parts = value.split('.');
//         parts[0] = parts[0] || '0';
//         parts[0] = parts[0].charAt(0) === '-' ? parts[0].substr(1) : parts[0];
//         parts[1] = (parts[1] || '0').slice(0, 6);
//         return parts;
//     } else if (coordinateDisplay === 'merkator') {
//         if (!value)
//             return [''];
//         const coord = Math.abs(Number(value));
//         const coords = proj.transform(coordinate == 'l' ? [ coord, 0 ] : [ 0, coord ], 'EPSG:4326', 'EPSG:3857');
//         return [String(Math.round(coordinate == 'l' ? coords[0] : coords[1]))];
//     }
// }

// function valueToStr(value, mask, coordinate, coordinateDisplay) {
//     const parts = valueToParts(value, coordinate, coordinateDisplay);
//     return TextInputMasked.getMaskedValue(parts, mask);
// }

// function CoordinateInput({
//     coordinateDisplay = 'degrees',
//     nullable = false,
//     value,
//     coordinate,
//     onChange,
//     disabled,
//     ...userProps
// }) {

//     const skipRef = useRef(false);

//     const [ sign, setSign ] = useState(() => Math.sign(value) || 1);

//     useLayoutEffect(() => {
//         if (skipRef.current)
//             return;
//         setSign(Math.sign(value) || 1);
//     }, [value]);

//     const mask = useMemo(() => getMask(sign, coordinate, coordinateDisplay), [ coordinate, coordinateDisplay, sign ]);

//     const complete = useMemo(() => getComplete(coordinate, coordinateDisplay), [ coordinate, coordinateDisplay ]);

//     const [ str, setStr ] = useState(() => valueToStr(value, mask, coordinate, coordinateDisplay));

//     useLayoutEffect(() => {
//         if (skipRef.current)
//             return;
//         setStr(valueToStr(value, mask, coordinate, coordinateDisplay));
//     }, [ coordinate, coordinateDisplay, disabled, mask, value ]);

//     useLayoutEffect(() => {
//         skipRef.current = false;
//     });

//     function handleChange(newStr, newParts) {
//         setStr(newStr);
//         if (newParts) {
//             const newValue = partsToValue(newParts, sign, coordinate, coordinateDisplay);
//             if (value !== newValue) {
//                 skipRef.current = true;
//                 onChange(newValue);
//             }
//         } else if (value != null) {
//             skipRef.current = true;
//             onChange(null);
//         }
//     }

//     function handleBlur() {
//         setStr(valueToStr(value, mask, coordinate, coordinateDisplay));
//     }

//     function changeSign(newSign) {
//         skipRef.current = true;
//         setSign(newSign);
//         setStr(str => str.replace(getEning(sign, coordinate), getEning(newSign, coordinate)));
//         if (str.indexOf('_') === -1) {
//             const newParts = valueToParts(value, coordinate, coordinateDisplay);
//             const newValue = partsToValue(newParts, newSign, coordinate, coordinateDisplay);
//             onChange(newValue);
//         }
//     }

//     function handleKeyDown(event) {
//         const isPlus = KEYCODES.PLUS.includes(event.keyCode);
//         if (isPlus || KEYCODES.MINUS.includes(event.keyCode)) {
//             event.preventDefault();
//             changeSign(isPlus ? 1 : -1);
//         }
//     }

//     return (
//         <TextInputMasked
//             {...userProps}
//             disabled={disabled}
//             mask={mask}
//             complete={complete}
//             value={str}
//             nullable={nullable}
//             onChange={handleChange}
//             onBlur={handleBlur}
//             onKeyDown={handleKeyDown}
//         />
//     );
// }

// CoordinateInput.propTypes = {
//     coordinateDisplay: PropTypes.oneOf([ 'degrees', 'degreesDecimal', 'merkator' ]),
//     coordinate: PropTypes.oneOf([ 'l', 'b' ]).isRequired,
//     onChange: PropTypes.func.isRequired,
//     value: PropTypes.string,
//     nullable: PropTypes.bool,
// };

// export default CoordinateInput;

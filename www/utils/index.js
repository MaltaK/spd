/**
 * Group array with fn
 * @param {[{}]} arr target array
 * @param {Function | String | Number} fn group function or key name
 * @return {{}} grouped object
 */
export function groupBy(arr, fn) {
    return arr.map(typeof fn === 'function' ? fn : val => val[fn]).reduce((acc, val, i) => {
        if (!acc[val]) acc[val] = [];
        acc[val].push(arr[i]);
        return acc;
    }, {});
}

/**
 * Deep clone
 * @param {[]|{}} obj Target
 * @return {[]|{}} copy
 */
export function deepClone(obj) {
    let clone = Object.assign({}, obj);
    Object.keys(clone).forEach(
        key => (clone[key] = typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key]),
    );
    return Array.isArray(obj) && obj.length
        ? (clone.length = obj.length) && Array.from(clone)
        : Array.isArray(obj)
            ? Array.from(obj)
            : clone;
}

/**
 * Throttle funciton
 * @param {Function} fn target function
 * @param {Number} wait time in ms
 * @param {{leading: Boolean, trailing: Boolean}} [options = { leading: true }]
 * @return {Function} throttled funciton
 */
export function throttle(fn, wait, options = { leading: true }) {
    let context, args, result;
    let timeout = null;
    let previous = 0;
    let later = () => {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = fn.apply(context, args);
        if (!timeout)
            context = args = null;
    };
    return function() {
        let now = Date.now();
        if (!previous && options.leading === false)
            previous = now;
        let remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                window.clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = fn.apply(context, args);
            if (!timeout)
                context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = window.setTimeout(later, remaining);
        }
        return result;
    };
}

/**
 * Omit from object
 * @param {{}} obj target object
 * @param {[]} arr keys to omit
 * @return {{}} omitted object
 */
export function omit(obj, arr) {
    return Object.keys(obj)
        .filter(k => !arr.includes(k))
        .reduce((acc, key) => {
            acc[key] = obj[key];
            return acc;
        }, {});
}

/**
 * Split array on chunks
 * @param {[]} arr target array
 * @param {Number} size chunk size
 * @return {[[]]}
 */
export function chunk(arr, size) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
}

/**
 * Find diffing keys in arrays
 * @param {[]} arr1 target 1
 * @param {[]} arr2 target 2
 * @return {[]} arrays diff
 */
export function diff(arr1, arr2) {
    let copy1 = arr1.slice();
    let copy2 = arr2.slice();
    arr1.forEach(a1 => {
        let index = copy2.findIndex(c2 => c2 === a1);
        if (index !== -1)
            copy2.splice(index, 1);
    });
    arr2.forEach(a2 => {
        let index = copy1.findIndex(c1 => c1 === a2);
        if (index !== -1)
            copy1.splice(index, 1);
    });
    return copy1.concat(copy2);
}

/**
 * Generate uuid
 * @return {String} uuid
 */
export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

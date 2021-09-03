require('raf').polyfill();
require('lodash').noConflict();

let origObjectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
Object.getOwnPropertyDescriptor = function(o, k) {
    if (o == HTMLInputElement.prototype || o == HTMLTextAreaElement.prototype)
        return {};
    return origObjectGetOwnPropertyDescriptor.call(this, o, k);
};

require('./index');

export default
function onload(callback) {
    if (document.readyState === 'complete') {
        callback();
    } else {
        let wrapper = function() {
            document.removeEventListener('DOMContentLoaded', wrapper);
            callback();
        };
        document.addEventListener('DOMContentLoaded', wrapper);
    }
}

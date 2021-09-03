import { useEffect, useRef } from 'react';

export const KEYCODE = {
    SHIFT: 16,
    CTRL: 17,
    ESC: 27,
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    A: 65,
    ENTER: 13,
    ALT: 18,
};

export const KEYCODES = {
    PLUS: [ 61, 187, 107 ],
    MINUS: [ 173, 189, 109 ],
};

export function useHotkeys(keys, fn, target) {

    let isPressing = useRef(false);
    let activeKeys = useRef(new Set());
    let targetKeys = useRef(keys);
    let targetFn = useRef(fn);

    useEffect(() => {
        targetKeys.current = keys;
        targetFn.current = fn;
    });

    useEffect(() => {

        let item = target ? target.current : window;

        function hotkeysActive() {
            let activeKeysArr = [...activeKeys.current.keys()];
            return (
                targetKeys.current.every(key => activeKeysArr.includes(key))
                && activeKeysArr.every(key => targetKeys.current.includes(key))
            );
        }

        function handleKeyup(event) {
            isPressing.current = false;
            activeKeys.current.delete(event.keyCode);
        }

        function handleKeydown(event) {
            activeKeys.current.add(event.keyCode);
            if (hotkeysActive()) {
                event.stopPropagation();
                if (!isPressing.current) {
                    isPressing.current = true;
                    targetFn.current(event);
                }
            }
        }

        item.addEventListener('keydown', handleKeydown);
        item.addEventListener('keyup', handleKeyup);
        return () => {
            item.removeEventListener('keydown', handleKeydown);
            item.addEventListener('keyup', handleKeyup);
        };

    }, [target]);

}

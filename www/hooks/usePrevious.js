import { useEffect, useRef } from 'react';

export function usePrevious(value) {
    let ref = useRef();

    useEffect(() => {
        ref.current = value;
    });

    return ref.current;
}

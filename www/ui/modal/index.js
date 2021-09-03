import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Panel from '../panel';
import Layout from '../layout';
import css from './styles.css';
import Button from '../button';

export default function Modal({ show, closeButton, onRequestClose, children }) {

    const panelRef = useRef();
    const onRequestCloseRef = useRef(onRequestClose);

    useEffect(() => {
        onRequestCloseRef.current = onRequestClose;
    });

    useEffect(() => {
        if (!show)
            return;
        function handleBodyKeyDown({ keyCode }) {
            if (keyCode === 27 && onRequestCloseRef.current)
                onRequestCloseRef.current('escape');
        }
        document.body.addEventListener('keydown', handleBodyKeyDown);
        return () => document.body.removeEventListener('keydown', handleBodyKeyDown);
    }, [show]);

    if (!show)
        return null;

    function handleLayoutClick(event) {
        let target = event.target;
        while (target) {
            if (panelRef.current == target)
                return;
            target = target.parentNode;
        }
        if (onRequestClose)
            onRequestClose('click');
    }

    function renderCloseButton() {
        if (!closeButton || !onRequestClose)
            return null;
        return (
            <div className={css.close}>
                <Button pure caption="&times;" className={css.closeButton} onClick={onRequestClose.bind(null, 'button')} />
            </div>
        );
    }

    function render() {
        return (
            <Layout fill center className={css.root} onClick={handleLayoutClick}>
                <Panel ref={panelRef}>
                    {renderCloseButton()}
                    {children}
                </Panel>
            </Layout>
        );
    }

    return ReactDOM.createPortal(render(), document.body);
}

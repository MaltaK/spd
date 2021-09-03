import ReactDOM from 'react-dom';

export default function Portal({ children, target }) {
    if (target == null)
        return null;
    return ReactDOM.createPortal(children, target);
}

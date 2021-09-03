import { run, addListener, removeListener } from './long_poll';

let nextId = 1;
let path;

function setOptions(options) {
    const _path = options[options.path];
    if (!_path)
        throw new Error('Can\'t init client with current config!');
    path = _path
        .replace('$hostname$', window.location.hostname)
        .replace('$host$', window.location.host)
        .replace('$protocol$', window.location.protocol)
        .replace('$pathname$', window.location.pathname);
    run(path + options.longpoll).catch(console.error); // eslint-disable-line no-console
}

async function request(type, data) {
    let id = nextId++;
    let response = await fetch(path + '/' + type, {
        method: 'POST',
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: type,
            params: { data },
            id,
        }),
    });
    let result;
    try {
        if (!response.ok)
            throw new Error('Network error.');
        result = await response.json();
        if (
            !result
            || typeof(result) != 'object'
            || result.id !== id
            || result.jsonrpc != '2.0'
            || (result.result === undefined) == (result.error === undefined)
            || result.error != null && typeof(result.error) != 'object'
        ) {
            throw new Error('Bad response.');
        }
    } catch (error) {
        result = {
            error: {
                code: 2,
                message: error.message,
            },
        };
    }
    if (result.error != null) {
        try {
            throw new Error('Request "' + type + '" failed: ' + result.error.message + '\nData: ' + JSON.stringify(data));
        } catch (error) {
            switch (result.error.code) {
                case 1:
                    error.code = 'apiError';
                    break;
                case 2:
                    error.code = 'networkError';
                    break;
                case -32700:
                case -32600:
                    error.code = 'badRequest';
                    break;
                case -32601:
                    error.code = 'badRequestType';
                    break;
                case -32602:
                    error.code = 'unauthorizedRequest';
                    break;
                case -32603:
                default:
                    error.code = 'unknownError';
                    break;
            }
            error.data = result.error.data;
            throw error;
        }
    }
    return result.result;
}

export const client = { request, setOptions };

export const longpoll = { addListener, removeListener };

export function download(method, params) {
    const formElement = document.createElement('form');
    formElement.setAttribute('style', 'display: none;');
    formElement.setAttribute('method', 'post');
    formElement.setAttribute('action', path);
    const methodElement = document.createElement('input');
    methodElement.setAttribute('value', JSON.stringify({ method, params }));
    methodElement.setAttribute('name', 'download');
    formElement.appendChild(methodElement);
    document.body.appendChild(formElement);
    formElement.submit();
    document.body.removeChild(formElement);
}

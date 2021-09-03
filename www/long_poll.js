// import { uuidv4 } from './utils';

// let id = 1;
// const listeners = [];
// const uuid = uuidv4();

// function emit(event, data) {
//     listeners.filter(listener => listener.event === event).forEach(({ callback }) => callback(data));
// }

// async function subscribe(url) {
//     let response = await fetch(`${url}?r=${id++}&uuid=${uuid}`, {
//         method: 'GET',
//         headers: {
//             'Connection': 'Keep-Alive',
//         },
//         cache: 'no-cache',
//     });
//     if (response.status !== 200) {
//         throw new Error(`Long polling status: ${response.statusText}`);
//     } else {
//         return response.json();
//     }
// }

// export function addListener(event, callback) {
//     listeners.push({ event, callback });
// }

// export function removeListener(event, callback) {
//     const index = listeners.findIndex(listener => listener.event === event && listener.callback === callback);
//     if (index !== -1)
//         listeners.splice(index, 1);
// }

// export async function run(url) {
//     const { event, data } = await subscribe(url);
//     window.setTimeout(run.bind(null, url), 0);
//     if (event) {
//         emit(event, data);
//     }
// }

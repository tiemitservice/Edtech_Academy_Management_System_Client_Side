import { io } from 'socket.io-client';
import url from './api';
// Only ever import this file ONCE in your app!
const api = url;

const socket = io(api, {
    autoConnect: true, // (default)
    transports: ['websocket'] // optional: helps with firewalls
});

export default socket;

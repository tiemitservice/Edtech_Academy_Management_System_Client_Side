import { io } from 'socket.io-client';

// Only ever import this file ONCE in your app!
// const url = 'http://localhost:5000';
const url = 'http://188.166.242.109:5000';
const socket = io(url, {
    autoConnect: true, // (default)
    transports: ['websocket'] // optional: helps with firewalls
});

export default socket;

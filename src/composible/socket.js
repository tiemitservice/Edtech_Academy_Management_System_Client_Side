import { io } from 'socket.io-client';

// Only ever import this file ONCE in your app!
const url = 'http://localhost:5000';
// const url = 'https://edtech-academy-management-system-server.onrender.com';
const socket = io(url, {
    autoConnect: true, // (default)
    transports: ['websocket'] // optional: helps with firewalls
});

export default socket;

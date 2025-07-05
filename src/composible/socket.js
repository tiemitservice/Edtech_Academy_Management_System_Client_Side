import { io } from 'socket.io-client';

// Only ever import this file ONCE in your app!
const socket = io('http://localhost:5000', {
    autoConnect: true, // (default)
    transports: ['websocket'] // optional: helps with firewalls
});

export default socket;

// import { io } from 'socket.io-client';

// // Only ever import this file ONCE in your app!
// const url = 'http://188.166.242.109:5000';
// // const url = 'https://edtech-academy-management-system-server.onrender.com';
// const socket = io(url, {
//     autoConnect: true, // (default)
//     transports: ['websocket'] // optional: helps with firewalls
// });

// export default socket;
// client.js - CORRECTED

const { io } = require('socket.io-client');
const API_URL = 'http://188.166.242.109:5000';

const socket = io(API_URL, {
    autoConnect: false,
    transports: ['websocket'] // Using websocket is good practice
});

export default socket;

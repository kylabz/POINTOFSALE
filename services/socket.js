import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // backend WS URL

export default socket;

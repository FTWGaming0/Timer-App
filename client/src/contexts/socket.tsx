import * as socketio from "socket.io-client";
import React from "react";
export const socket = socketio.connect(window.location.hostname+":"+window.location.port);
//export const socket = socketio.connect(window.location.hostname+":3002");
export const socketContext = React.createContext(socket);
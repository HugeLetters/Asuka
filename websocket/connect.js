import { WebSocket } from 'ws';
import { WebSocketOpenHandler } from "./open.js";

export const webSocketConnectHandler = async (init) => {
    const websocket = new WebSocket(init.URL.ws + "/?v=10&encoding=json");
    WebSocketOpenHandler(websocket, init);
};
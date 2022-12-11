import { WebSocket } from 'ws';
import { WebSocketOpenHandler } from "./open.js";

export const webSocketConnectHandler = async (config) => {
    const websocket = new WebSocket(config.URL.ws + "/?v=10&encoding=json");
    WebSocketOpenHandler(websocket, config);
};
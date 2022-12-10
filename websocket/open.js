import { webSocketCloseHandler } from './close.js';
import { webSocketErrorHandler } from './error.js';
import { webSocketMessageHandler } from './message.js';

export const WebSocketOpenHandler = async (websocket, init) => {
    websocket.addEventListener("open", async (event) => {
        console.log(`[${event.type}] Connection established: ${event.data}`);

        webSocketCloseHandler(websocket);
        webSocketMessageHandler(websocket, init);

    });

    webSocketErrorHandler(websocket);
};
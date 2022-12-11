import { webSocketCloseHandler } from './close.js';
import { webSocketErrorHandler } from './error.js';
import { webSocketMessageHandler } from './message.js';

export const WebSocketOpenHandler = async (bot) => {
    const { websocket } = bot;
    websocket.addEventListener("open", async (event) => {
        console.log(`[${event.type}] Connection established!`);

        webSocketCloseHandler(bot);
        webSocketMessageHandler(bot);

    });

    webSocketErrorHandler(bot);
};
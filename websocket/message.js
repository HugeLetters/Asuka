import { dataOPCodeHandler } from '../message_handlers/data_handlers.js';

export const webSocketMessageHandler = async (websocket, config) => {

    websocket.addEventListener("message", async (event) => {
        console.log('----------------------------------------------------------------------------------------');
        console.log(`[${event.type}] Data received: ${event.data}`);
        const data = JSON.parse(event.data);
        state.sequence = data.s != null ? data.s : state.sequence;

        dataOPCodeHandler(websocket, data, state, config);

    });
};
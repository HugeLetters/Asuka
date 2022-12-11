import { dataOPHandler } from '../message_handlers/commands.js';

export const webSocketMessageHandler = async (websocket, config) => {

    const state = {
        lastSkylexmessage: 0,
        authenticated: false,
        lastS: null,
        heartbeatInterval: 0,
        ackReceived: true,
    };

    websocket.addEventListener("message", async (event) => {
        console.log('----------------------------------------------------------------------------------------');
        console.log(`[${event.type}] Data received: ${event.data}`);
        const data = JSON.parse(event.data);
        state.lastS = data.s != null ? data.s : state.lastS;

        dataOPHandler(websocket, data, state, config);

    });
};
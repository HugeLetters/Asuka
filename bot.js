import { WebSocket } from "ws";
import { getGatewayHandler } from "./websocket/gateway.js";

export class Bot {
    constructor(config) {
        const state = {
            authenticated: false,
            sequence: null,
            ackReceived: true,
            testProperty: 1,
        };
        Object.assign(this, config, state);
    }
    async getGateway() {
        this.WEBSOCKET_GATEWAY_URL = await getGatewayHandler(this.HTTP_REQUEST_URL, this.AUTHENTICATION_HEADER);
        if (this.WEBSOCKET_GATEWAY_URL) { return null };

        console.log("Couldn't get WebSocket URL");
        setTimeout(() => this.getGateway(), 5000);
    }
    async webSocketConnect() {
        if (!this.WEBSOCKET_GATEWAY_URL) {
            setTimeout(() => this.webSocketConnect(), 5000);
            return null;
        }
        this.websocket = new WebSocket(this.WEBSOCKET_GATEWAY_URL + "/?v=10&encoding=json");
        // WebSocketOpenHandler(websocket, config);
    }
};
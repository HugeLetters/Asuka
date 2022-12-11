import { getGateway } from "./gateway.js";
import { webSocketConnectHandler } from "./websocket/connect.js";
const config = await import("./config.js");

config.URL.ws = await getGateway(config.URL.http, config.AUTHENTICATION.header);
if (!config.URL.ws) { throw "Couldn't get WebSocket URL" };

webSocketConnectHandler(config);
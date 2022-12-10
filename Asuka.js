import * as init from "./init.js";
import { getGateway } from "./gateway.js";
import { webSocketConnectHandler } from "./websocket/connect.js";

init.URL.ws = await getGateway(init.URL.http, init.AUTH_HEADER);
if (!init.URL.ws) { throw "Couldn't get get WebSocket URL" };

webSocketConnectHandler(init);
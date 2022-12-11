import { heartbeat } from "./utils.js"

export const dataOPCodeHandler = async (websocket, data, state, config) => {
    const { op, s, d, t } = data;

    switch (op) {
        case 0:
            dataTypeHandler(websocket, data, state, config);
            break;

        case 1:
            // immediate heartbeat requested by Discord API
            console.log("Immediate heartbeat requested");
            heartbeat(websocket, state);
            break;

        case 7:
            // You should attempt to reconnect and resume immediately.
            break;

        case 9:
            // The session has been invalidated. You should reconnect and identify/resume accordingly.
            break;

        case 10:
            // Hello
            console.log("Received a Hello");
            state.heartbeatInterval = d.heartbeat_interval;
            setTimeout(() => (heartbeat(websocket, state)), (state.heartbeatInterval * Math.random()) / 10)
            break;

        case 11:
            //ACK reponse to heartbeat
            state.ackReceived = true;
            if (!state.authenticated) {
                console.log("Trying to authenticate");
                const msg = {
                    "op": 2,
                    "d": config.AUTHENTICATION.body
                };
                websocket.send(JSON.stringify(msg));
            }
            console.log(`New heartbeat queued in: ${state.heartbeatInterval}ms`);
            setTimeout(() => (heartbeat(websocket, state)), state.heartbeatInterval);
            break;

        default:
            console.log("Unexpected behaviour from Discord API",);
            console.log("OPcode received: ", op);
            break;
    }

    if (!state.ackReceived) websocket.close(4009, "ACK wasn't received")
}

const dataTypeHandler = async (websocket, data, state, config) => {
    const { t, d } = data;
    switch (t) {
        case "READY":
            console.log("Authenticated");
            state.authenticated = true
            break;
        case "MESSAGE_CREATE":
            console.log(`New message on server: "${d.content}"${d.attachments.length != 0 ? " with attachments" : ""} by ${d.author.username}`)
            if (!state.authenticated) { break };
            const match = d.content.match(config.PREFIX);
            if (!match) { break };
            commandHandler(websocket, d, state, config, match[2]);
            break;
        case "TYPING_START":
            if (!state.authenticated) { break };
            typingHandler(websocket, d, state, config);
            break;
        default:
            break;
    }
}

const commandHandler = async (websocket, data, state, config, alias) => {
    for (const extension of config.EXTENSIONS) {
        try {
            const commands = await import("../commands/" + extension + ".js");
            for (const command in commands) {
                console.log(commands[command]);
                if (commands[command].alias.includes(alias)) { commands[command](data, config) };
            }
        } catch (e) {
            console.log(`No such extension as: ${extension} in commands directory`)
        }
    }
}

const typingHandler = async (websocket, data, state, config) => {
    for (const extension of config.EXTENSIONS) {
        try {
            const commands = await import("../commands/" + extension + ".js");
            for (const command in commands) {
                console.log(commands[command]);
                if (commands[command].alias.includes(alias)) { commands[command](data, config) };
            }
        } catch (e) {
            console.log(`No such extension as: ${extension} in commands directory`)
        }
    }
}
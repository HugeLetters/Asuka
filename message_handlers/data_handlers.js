import { heartbeat } from "./utils.js"

export const dataOPCodeHandler = async (bot, data) => {
    const { op, s, d, t } = data;
    const { websocket } = bot;

    switch (op) {
        case 0:
            dataTypeHandler(bot, data);
            break;

        case 1:
            // immediate heartbeat requested by Discord API
            console.log("Immediate heartbeat requested");
            heartbeat(bot);
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
            bot.heartbeatInterval = d.heartbeat_interval;
            // Discord requests to send the first heartbeat after some random interval thus this
            setTimeout(() => (heartbeat(bot)), (bot.heartbeatInterval * Math.random()) / 10)
            break;

        case 11:
            //ACK reponse to heartbeat
            bot.ackReceived = true;
            if (!bot.authenticated) {
                console.log("Trying to authenticate");
                const msg = {
                    "op": 2,
                    "d": bot.AUTHENTICATION_BODY
                };
                websocket.send(JSON.stringify(msg));
            }
            console.log(`New heartbeat queued in: ${bot.heartbeatInterval}ms`);
            setTimeout(() => (heartbeat(bot)), bot.heartbeatInterval);
            break;

        default:
            console.log("Unexpected behaviour from Discord API",);
            console.log("OPcode received: ", op);
            break;
    }

    if (!bot.ackReceived) websocket.close(4009, "ACK wasn't received")
}

const dataTypeHandler = async (bot, data) => {
    const { t, d } = data;
    const { websocket } = bot;

    if (t == "READY") {
        console.log("Authenticated");
        bot.authenticated = true;
        return null;
    };
    if (!bot.authenticated) { return null };

    switch (t) {
        case "MESSAGE_CREATE":
            console.log(`New message on server: "${d.content}"${d.attachments.length != 0 ? " with attachments" : ""} by ${d.author.username}`)
            const match = d.content.match(bot.PREFIX);
            if (!match) { break };
            const response = await commandHandler(bot, d, match[2]);
            responseHandler(response);
            break;
        case "TYPING_START":
            // typingHandler(bot, d);
            break;
        default:
            break;
    }
}

const commandHandler = async (bot, data, currentCommand) => {
    for (const extension of bot.EXTENSIONS) {
        const commands = {};
        const alias = {};

        try {
            Object.assign(commands, await import("../extensions/" + extension + ".js"))
        } catch (e) {
            console.log(e);
            console.log(`No such extension as: ${extension} in extensions directory`);
            return null;
        };

        try {
            Object.assign(alias, commands["alias"]);
            delete (commands["alias"]);
        } catch (e) {
            console.log(`Your extension "${extension}" does not have an "alias" object exported which is needed to identify bot commands`);
            return null;
        }

        for (const command_name in commands) {
            const command = commands[command_name];
            if (alias[command_name].includes(currentCommand)) { return command(data, bot, currentCommand) };
        }
    }
}

const responseHandler = async (response) => {
    if (response == null) { console.log("Received null/undefined response"); return null };
    if (![200, 201, 204].includes(response.status)) { console.log(await response.json()) };
}

// TODO MAYBE FINISH THIS LATER?
const typingHandler = async (websocket, data, state, config) => {
    for (const extension of config.EXTENSIONS) {
        try {
            const commands = await import("../commands/" + extension + ".js");
            for (const command in commands) {
                console.log(commands[command]);
                if (commands.alias[commands].includes(alias)) { commands[command](data, config) };
            }
        } catch (e) {
            console.log(`No such extension as: ${extension} in commands directory`)
        }
    }
}
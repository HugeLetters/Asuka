import { heartbeat } from "./utils.js";
import colors from "colors/safe.js";

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
      clearTimeout(bot.nextHeartbeat);
      heartbeat(bot);
      break;

    case 7:
      // You should attempt to reconnect and resume immediately.
      websocket.close(4009);
      break;

    case 9:
      // The session has been invalidated. You should reconnect and identify/resume accordingly.
      console.warn("Session invalidated");
      websocket.close();
      break;

    case 10:
      // Hello
      console.log("Received a Hello");
      bot.heartbeatInterval = d.heartbeat_interval;
      // Discord requests to send the first heartbeat after some random interval thus this
      !bot.reconnecting &&
        setTimeout(() => heartbeat(bot), (bot.heartbeatInterval * Math.random()) / 10);
      break;

    case 11:
      //ACK reponse to heartbeat
      bot.ackReceived = true;
      clearTimeout(bot.noAckTimeout);
      if (!bot.authenticated) {
        console.log("Trying to authenticate");
        const msg = {
          op: 2,
          d: bot.AUTHENTICATION_BODY,
        };
        websocket.send(JSON.stringify(msg));
      }
      console.log(`New heartbeat queued in: ${bot.heartbeatInterval}ms`);
      bot.nextHeartbeat = setTimeout(() => heartbeat(bot), bot.heartbeatInterval);
      break;

    default:
      console.log("Unexpected behaviour from Discord API");
      console.log("OPcode received: ", op);
      break;
  }

  if (!bot.ackReceived) {
    bot.noAckTimeout = setTimeout(() => {
      console.warn("Didn't receive an ack response");
      websocket.close();
    }, 5000);
  }
};

const dataTypeHandler = async (bot, data) => {
  const { t, d } = data;
  const { websocket } = bot;

  switch (t) {
    case "READY":
      console.log(colors.bgGreen("Authenticated"));
      bot.authenticated = true;
      bot.resumeGatewayURL = d.resume_gateway_url;
      bot.sessionID = d.session_id;
      return;
    case "RESUMED":
      console.log(colors.bgGreen("Connection resumed"));
      bot.reconnecting = false;
      setTimeout(() => heartbeat(bot), (bot.heartbeatInterval * Math.random()) / 10);
      return;
    case "MESSAGE_CREATE":
      console.log(
        colors.bgYellow.black(
          `New message on server: "${d.content}"${
            d.attachments.length != 0 ? " with attachments" : ""
          } by ${d.author.username}`
        )
      );
      if (!bot.authenticated)
        return console.log(
          colors.bgRed("Message will not be parsed because bot is not authenticated")
        );
      // eslint-disable-next-line no-case-declarations
      const match = d.content.match(bot.PREFIX);
      if (!match) break;
      // eslint-disable-next-line no-case-declarations
      const response = await commandHandler(
        bot,
        d,
        match[2],
        match[3].split(/\s+/).filter(x => x != "")
      );
      responseHandler(response);
      break;
    case "MESSAGE_REACTION_ADD":
      d.emoji.name === "🛑" && bot.deleteMessage(d.channel_id, d.message_id);
      break;
    default:
      console.log(colors.bgRed.black("Unhandled event"));
      break;
  }
};

const commandHandler = async (bot, data, currentCommand, keywords) => {
  for (const extension of bot.EXTENSIONS) {
    import("../extensions/" + extension + ".js")
      .then(module => {
        const { alias, default: mDefault, ...commands } = module;
        if (!alias) {
          return console.error(
            `Your extension "${extension}" does not have an "alias" object exported which is needed to identify bot commands`
          );
        }

        for (const command_name in commands) {
          const command = commands[command_name];
          if (alias[command_name].includes(currentCommand)) {
            return command(data, bot, currentCommand, keywords);
          }
        }
      })
      .catch(e => {
        console.error(e);
        return console.error(`No such extension as: ${extension} in extensions directory`);
      });
  }
};

const responseHandler = async response => {
  if (response == null) {
    console.log("Received null/undefined response");
    return;
  }
  if (![200, 201, 204].includes(response.status)) {
    console.log(`Response: ${await response.json()}`);
  }
};

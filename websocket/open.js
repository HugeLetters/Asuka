import { webSocketCloseHandler } from "./close.js";
import { webSocketErrorHandler } from "./error.js";
import { webSocketMessageHandler } from "./message.js";

export const WebSocketOpenHandler = async bot => {
  const { websocket } = bot;

  webSocketErrorHandler(bot);
  webSocketCloseHandler(bot);

  websocket.addEventListener("open", async event => {
    console.log(`[${event.type}] Connection established!`);

    if (bot.reconnecting) {
      console.log("Sending a reconnect event");
      const resumeEvent = JSON.stringify({
        op: 6,
        d: {
          token: bot.BOT_TOKEN,
          session_id: bot.sessionID,
          seq: bot.sequence,
        },
      });
      await websocket.send(resumeEvent);
      bot.reconnecting = false;
    }

    webSocketMessageHandler(bot);
  });
};

import moment from "moment";
import colors from "colors/safe.js";
import { webSocketCloseHandler } from "./close.js";
import { webSocketErrorHandler } from "./error.js";
import { webSocketMessageHandler } from "./message.js";
import { WebSocketOpenHandler } from "./open.js";

export default function (bot) {
  ["open", "error", "close", "message"].forEach(eventType =>
    bot.websocket.addEventListener(eventType, event => {
      console.log(colors.bgCyan(`[${event.type}] ${moment().format("DD.MM.Y HH:mm:ss")}`));
      console.log(
        {
          open: colors.bgGreen.black("Connection opened"),
          error: colors.bgRed(`Error: ${JSON.stringify(event)}`),
          close: colors.bgMagenta.black(`Connection closed: ${event.code} - ${event.reason}`),
          message: colors.yellow(`Data received: ${event.data}`),
        }[event.type]
      );
    })
  );

  WebSocketOpenHandler(bot);
  webSocketErrorHandler(bot);
  webSocketCloseHandler(bot);
  webSocketMessageHandler(bot);

  bot.extensionInitializer();
}

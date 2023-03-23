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
        colors.yellow(
          {
            open: "Connection opened",
            error: `Error: ${event}`,
            close: `Connection closed: ${event.code} - ${event.reason}`,
            message: `Data received: ${event.data}`,
          }[event.type]
        )
      );
    })
  );

  WebSocketOpenHandler(bot);
  webSocketErrorHandler(bot);
  webSocketCloseHandler(bot);
  webSocketMessageHandler(bot);

  bot.extensionInitializer();
}

import moment from "moment";
import { webSocketCloseHandler } from "./close.js";
import { webSocketErrorHandler } from "./error.js";
import { webSocketMessageHandler } from "./message.js";
import { WebSocketOpenHandler } from "./open.js";

export default function (bot) {
  ["open", "error", "close", "message"].forEach(event =>
    bot.websocket.addEventListener(event, e => {
      console.log(`${moment().format("DD.MM.Y HH:mm:ss")} [${e.type}]`);
    })
  );

  WebSocketOpenHandler(bot);
  webSocketErrorHandler(bot);
  webSocketCloseHandler(bot);
  webSocketMessageHandler(bot);
}

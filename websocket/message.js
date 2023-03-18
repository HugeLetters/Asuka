import { dataOPCodeHandler } from "../message_handlers/data_handlers.js";

export const webSocketMessageHandler = async bot => {
  bot.websocket.addEventListener("message", async event => {
    console.log(`Data received: ${event.data}`);
    const data = JSON.parse(event.data);
    bot.sequence = data.s != null ? data.s : bot.sequence;
    dataOPCodeHandler(bot, data);
  });
};

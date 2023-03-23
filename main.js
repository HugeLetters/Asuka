import { Bot } from "./bot.js";

const config = await import("./config.js");

export const Asuka = new Bot(config);

await Asuka.getGateway();
await Asuka.webSocketConnect();

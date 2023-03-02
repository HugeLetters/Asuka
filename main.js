import { Bot } from "./bot.js";

const config = await import("./config.js");

const Asuka = new Bot(config);

for (const extension of config.EXTENSIONS) {
  await import("./extensions/" + extension + ".js")
    .then(async ({ default: mDefault }) => {
      if (mDefault) await mDefault(Asuka);
    })
    .catch(e => {
      console.log(e);
      console.log(`No such extension as: ${extension} in extensions directory`);
    });
}

console.log("Here");
await Asuka.getGateway();
await Asuka.webSocketConnect();

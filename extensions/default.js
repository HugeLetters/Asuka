import { randomFile } from "./utils.js";

// An object for all commands in the current extension - these aliases define which words trigger bot commands
export const alias = {
  hello: ["привет", "здарова", "hello", "hi", "здравствуй"],
  commands: ["помощь", "команды", "help"],
};

// INTRODUCTION
export const hello = async ({ author, channel_id, id: message_id }, bot, command, keywords) => {
  let prefix = "Ну";
  // JS doesn't recognise cyrillic as letters in regex so this works - something to do with how it handles UNICODE
  if (/[\w]/.test(command)) {
    prefix = "Well";
  }
  return bot.sendMessage(channel_id, `${prefix} ${command}${", " + author.username || ""}`, {
    files: [randomFile("./source")],
    message_id,
  });
};

export const commands = ({ channel_id, id: message_id }, bot) => {
  Promise.all(
    bot.EXTENSIONS.map(extension =>
      import("../extensions/" + extension + ".js")
        .then(({ alias }) => alias)
        .catch(console.error)
        .then(module => (module ? module : {}))
    )
  ).then(commands =>
    bot.sendMessage(
      channel_id,
      commands.reduce(
        (message, command) =>
          message +
          Object.entries(command).reduce(
            (commandString, [k, v]) => commandString + `${k} - ${v.join(", ")}\n`,
            ""
          ),
        ""
      ),
      { message_id }
    )
  );
};

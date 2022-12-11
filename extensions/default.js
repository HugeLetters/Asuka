import { randomFile, sendMessage } from './utils.js'

// An object for all commands in the current extension - these aliases define which words trigger bot commands
export const alias = {
    asukaHi: ["привет", "здарова", "hello", "hi", "здравствуй"]
};

// INTRODUCTION
export const asukaHi = async (data, bot, command) => {
    const { author, channel_id } = data;
    let prefix = "Ну";
    // JS doesn't recognise cyrillic as letters in regex so this works - something to do with how it handles UNICODE
    if (/[\w]/.test(command)) { prefix = "Well" };
    const r = await sendMessage(bot, channel_id,
        `${prefix} ${command}${", " + author.username || ""}`,
        { files: [randomFile("./source")], message_id: data.id });
    console.log(r);
};

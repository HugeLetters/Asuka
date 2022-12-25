import { randomFile } from './utils.js'

// An object for all commands in the current extension - these aliases define which words trigger bot commands
export const alias = {
    asukaHi: ["привет", "здарова", "hello", "hi", "здравствуй"],
    userQuote: ["цитата", "цитату", "quote"]
};

// INTRODUCTION
export const asukaHi = async (data, bot, command, keywords) => {
    const { author, channel_id } = data;
    let prefix = "Ну";
    // JS doesn't recognise cyrillic as letters in regex so this works - something to do with how it handles UNICODE
    if (/[\w]/.test(command)) { prefix = "Well" };
    return bot.sendMessage(channel_id,
        `${prefix} ${command}${", " + author.username || ""}`,
        { files: [randomFile("./source")], message_id: data.id });
};

// QUOTE
export const userQuote = async (data, bot, command, keywords) => {
    const { channel_id } = data;
    const [author, ...words] = keywords;
    const parameters = { keywords: words, randomWordChance: 0.05 };

    if (bot.TAG_REGEXP.test(author)) {
        const userID = author.match(bot.TAG_REGEXP)[1];
        Object.keys(bot.speechModel).forEach(x => {
            if (x.includes(userID)) parameters.user = x;
        })
    }

    const message = bot.generateSentence(parameters);

    return bot.sendMessage(channel_id, message, { message_id: data.id })
}
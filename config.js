import 'dotenv/config'

export const COMMANDS = [];

export const APP_ID = process.env.APP_ID;
export const BOT_TOKEN = process.env.BOT_TOKEN;
export const AUTHENTICATION = {
    header: { "Authorization": `Bot ${BOT_TOKEN}` },
    body: {
        "token": BOT_TOKEN,
        "properties": {
            "os": "windows",
            "browser": "chrome",
            "device": "laptop"
        },
        // see https://discord.com/developers/docs/topics/gateway#list-of-intents
        "intents": (1 << 9) | (1 << 15) | (1 << 11) | (1 << 12),
    }
};
// e.g. "https://discord.com/api/v10"
export const URL = { http: process.env.DISCORD_API_ENDPOINT, ws: "" };

// 8 MBytes(Discord limit) MINUS ~30000 symbols(just to make sure for headers, body, boundaries etc)
export const MAX_PAYLOAD_SIZE = 8357888; //bytes

// 1 HOUR = 3600000 , 1 DAY = 86400000
export const SOMEONE_IS_TYPING_DELAY = 3600000 * 6;
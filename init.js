import 'dotenv/config'

export const APP_ID = process.env.APP_ID;
export const BOT_TOKEN = process.env.BOT_TOKEN;
export const AUTH_HEADER = { "Authorization": `Bot ${BOT_TOKEN}` };
export const URL = { http: "https://discord.com/api/v10", ws: "" };
// 8 MBYTES - ~30000 symbols
export const MAX_PAYLOAD_SIZE = 8357888; //bytes

// 1 HOUR = 3600000 , 1 DAY = 86400000
export const SKYLEX_DELAY = 3600000 * 6;
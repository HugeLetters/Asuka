import "dotenv/config";
import { ENV } from "./env";

// default should be always included
export const EXTENSIONS = ["default", "birthday", "youtube", "talk", "meme", "quote"] as const;
if (!EXTENSIONS.includes("default")) throw new Error("Extension default must be included");

// e.g. "https://discord.com/api/v10"
export const API_VERSION = 10;
export const DISCORD_API_URL = `https://discord.com/api/v${API_VERSION}`;
export const DISCORD_CDN_URL = "https://cdn.discordapp.com";

export const AUTHORIZATION_HEADER = { Authorization: `Bot ${ENV.BOT_TOKEN}` } as const;
export const AUTHORIZATION_BODY = {
  token: ENV.BOT_TOKEN,
  properties: { os: "windows", browser: "chrome", device: "laptop" },
  // see https://discord.com/developers/docs/topics/gateway#list-of-intents
  intents: (1 << 9) | (1 << 15) | (1 << 10),
} as const;

// 8 MBytes(Discord limit) MINUS ~30000 symbols(just to make sure for headers, body, boundaries etc)
export const MAX_PAYLOAD_SIZE = 8_357_888; //bytes

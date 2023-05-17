import "dotenv/config";
import { ENV } from "./env";
import { GatewayIntentBits, type GatewayIdentify, GatewayOpcodes } from "discord-api-types/v10";
import type { DeepReadonly } from "./utils";

/**
 * An array of bot extensions to enable.
 *
 * `default` should be always provided.
 */
export const EXTENSIONS = ["default", "birthday", "youtube", "talk", "meme", "quote"] as const;
if (!EXTENSIONS.includes("default")) throw new Error("Extension default must be included");

export const DISCORD_API_VERSION = 10;
export const DISCORD_API_URL = `https://discord.com/api/v${DISCORD_API_VERSION}`;
export const DISCORD_CDN_URL = "https://cdn.discordapp.com";

/** Header required for authorization for almost all of Discord REST API endpoints. */
export const AUTHORIZATION_HEADER = { Authorization: `Bot ${ENV.BOT_TOKEN}` } as const;
/** Data required for Discord Gateway identification event */
export const GATEWAY_IDENTIFY: DeepReadonly<GatewayIdentify> = {
  op: GatewayOpcodes.Identify,
  d: {
    token: ENV.BOT_TOKEN,
    properties: { os: "windows", browser: "chrome", device: "laptop" },
    intents:
      GatewayIntentBits.GuildMessages |
      GatewayIntentBits.MessageContent |
      GatewayIntentBits.GuildMessageReactions,
  },
};

/** Discord individual file upload limit - 25 MB or 26214400 bytes. */
export const MAX_PAYLOAD_SIZE = 26_214_400;

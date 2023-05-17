import z from "zod";

/**
 * Validated environment variables.
 *
 * The one related to Discord can be viewed at {@link https://discord.com/developers/applications/ |Discord Developer Portal} and clicking on your application.
 */
export const ENV = z
  .object({
    /** Discord Application ID. */
    APP_ID: z.string(),
    /** Discord Application public key. */
    PUBLIC_KEY: z.string(),
    /** Bot secret token. */
    BOT_TOKEN: z.string(),
    /** Youtube API key. Follow this {@link https://developers.google.com/youtube/v3/getting-started |guide} for instructions. */
    YOUTUBE_API_KEY: z.string(),
  })
  .passthrough()
  .parse(process.env);

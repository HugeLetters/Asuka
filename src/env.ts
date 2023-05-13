import z from "zod";

export const ENV = z
  .object({
    APP_ID: z.string(),
    BOT_TOKEN: z.string(),
    PUBLIC_KEY: z.string(),
    YOUTUBE_API_KEY: z.string(),
  })
  .passthrough()
  .parse(process.env);

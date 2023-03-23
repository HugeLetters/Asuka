import { randomChoiceArray } from "./utils.js";
import { tagChannel } from "../message_handlers/utils.js";

export const alias = {
  requestWebm: ["скинь", "видео", "вебм", "ютюб"],
};

const permittedChannel = "284783098124828673";

export const requestWebm = async ({ id: message_id, channel_id }, bot, command, keywords) => {
  if (keywords.join(" ") === "видео про краба")
    return bot.sendMessage(channel_id, "https://youtu.be/o55ZaLGsEuM", { message_id });

  if (channel_id !== permittedChannel)
    return bot.sendMessage(channel_id, `Тебе сюда ${tagChannel(permittedChannel)} 👈`, {
      message_id,
    });

  const api_url = new URL(`https://youtube.googleapis.com/youtube/v3/search`);
  api_url.searchParams.set("key", bot.YOUTUBE_API_KEY);
  api_url.searchParams.set("part", "snippet");
  api_url.searchParams.set("maxResults", "20");
  api_url.searchParams.set("safeSearch", "none");
  api_url.searchParams.set("regionCode", "ru");
  api_url.searchParams.set("type", "video");
  api_url.searchParams.set("videoEmbeddable", "true");
  api_url.searchParams.set("videoSyndicated", "true");

  const isRandom = keywords[0] === "рандом";
  if (isRandom) [, ...keywords] = keywords;

  const query = `"${keywords.filter(x => !/(видео)|(вебм)/.test(x)).join(" ")}"`;
  api_url.searchParams.set("q", query);

  console.log(`Querying youtube for: ${query}`);
  return getVideos(api_url, query, bot.youtubeQueriesCache)
    .then(isRandom ? randomChoiceArray : ([video]) => video)
    .then(youtubeURL)
    .then(url => bot.sendMessage(channel_id, url, { message_id }))
    .catch(err => {
      console.error(err);
      bot.sendMessage(channel_id, "Что-то пошло не так 😞", { message_id });
    });
};

export default function (bot) {
  bot.youtubeQueriesCache = new Map();
}

async function youtubeQuery(url) {
  return fetch(url)
    .then(x => x.json())
    .then(({ items }) => items.map(({ id: { videoId } }) => videoId));
}

function youtubeURL(videoID) {
  const url = new URL("https://youtube.com/watch");
  url.searchParams.set("v", videoID);
  return url.href;
}

async function getVideos(url, query, cache) {
  return (
    (cache ?? new Map()).get(query) ??
    youtubeQuery(url).then(videos => {
      if (!videos.length) throw new Error("Didn't find youtube videos matching this query");
      cache.set(query, videos);
      console.log("Queried youtube API and cached the result");
      cache.size > 100 && cache.delete(cache.keys().next().value);
      return videos;
    })
  );
}

import { randomChoiceArray } from "./utils.js";

export const alias = {
  requestWebm: ["скинь", "видео", "вебм", "ютюб"],
};

export const requestWebm = async ({ id: message_id, channel_id }, bot, command, keywords) => {
  if (keywords.join(" ") === "видео про краба")
    return bot.sendMessage(channel_id, "https://youtu.be/o55ZaLGsEuM", { message_id });

  const api_url = new URL(`https://youtube.googleapis.com/youtube/v3/search`);
  api_url.searchParams.set("key", bot.YOUTUBE_API_KEY);
  api_url.searchParams.set("part", "snippet");
  api_url.searchParams.set("maxResults", 10);
  api_url.searchParams.set("safeSearch", "none");
  api_url.searchParams.set("regionCode", "ru");
  api_url.searchParams.set("type", "video");
  api_url.searchParams.set("videoEmbeddable", "true");
  api_url.searchParams.set("videoSyndicated", "true");

  api_url.searchParams.set(
    "q",
    '"' + keywords.filter(x => !/(видео)|(вебм)/.test(x)).join(" ") + '"'
  );

  return fetch(api_url)
    .then(x => x.json())
    .then(x => {
      console.log(x);
      return x;
    })
    .then(({ items }) => {
      const video = randomChoiceArray(items);
      const url = new URL("https://youtube.com/watch");
      url.searchParams.set("v", video.id.videoId);
      return url.href;
    })
    .then(url => bot.sendMessage(channel_id, url, { message_id }))
    .catch(err => {
      console.error(err);
      bot.sendMessage(channel_id, "Что-то пошло не так 😞", { message_id });
    });
};

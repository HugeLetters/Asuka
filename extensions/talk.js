import { randomChoiceArray } from "./utils.js";
import { convert } from "html-to-text";
import { tagUser } from "../message_handlers/utils.js";

export const alias = {
  talk: ["поговори", "поболтай"],
};

export const talk = async ({ id: message_id, channel_id }, bot, command, keywords) => {
  if (!/^с комфи/i.test(keywords.join(" "))) return;
  fetchThread()
    .then(thread => {
      bot.sendMessage(channel_id, `${tagUser(users.get("комфи"))}\n${thread[0]}`);
      bot.evseyDialogueLength = 1;
      bot.evseyCurrentThread = thread;
      bot.evseyLastTalkedToAt = new Date();
    })
    .catch(err => {
      console.error(err);
      bot.sendMessage(channel_id, `${tagUser(users.get("комфи"))}, ээ, как погода?) 😈`, {
        message_id,
      });
    });
};

const htmlParserOptions = {
  selectors: [
    { selector: "a.post-reply-link", format: "skip" },
    { selector: "a", format: "inlineSurround" },
  ],
};

function fetchThread() {
  const boards = ["b", "a", "mg", "mlp", "po", "re", "ja", "ma", "rm", "vn", "ussr", "jsf", "2d"];
  const baseURL = new URL(randomChoiceArray(boards), "https://2ch.hk/");
  console.log(`Fetching this board - ${baseURL}`);

  return fetch(`${baseURL}/index.json`)
    .then(x => x.json())
    .then(({ threads }) => threads.map(({ thread_num }) => thread_num))
    .then(thread_nums => fetch(`${baseURL}/res/${randomChoiceArray(thread_nums)}.json`))
    .then(x => x.json())
    .then(({ threads: [{ posts }], title }) =>
      isNSFW(posts[0].comment)
        ? fetchThread()
        : posts.map(
            ({ comment, files }) =>
              `${convert(comment, htmlParserOptions).replace(/(двач)|(2ch)/g, "комфи") || title}\n${
                files ? files.map(({ path }) => `https://2ch.hk${path}`).join("\n") : ""
              }`
          )
    );
}

function isNSFW(post) {
  return ["fap", "фап", "сво"].some(word => wordRegEx(word).test(post));
}

export default function (bot) {
  users.set("аска", "1048348518303137792");
  users.set("евсей", "250281615366815744");
  users.set("комфи", "221739589545492480");
  users.set("хьюго", "241333871747137548");
  users.set("я", "241333871747137548");

  bot.websocket.addEventListener("message", async event => {
    const data = JSON.parse(event.data);
    if (!isShouldTalk(bot, data)) return;

    const { channel_id, id: message_id } = data.d;
    bot.evseyLastTalkedToAt = new Date();
    bot.sendMessage(channel_id, bot.evseyCurrentThread[bot.evseyDialogueLength], { message_id });
    bot.evseyDialogueLength++;
  });
}

function isMessageEvent(data) {
  return data.op === 0 && data.t === "MESSAGE_CREATE";
}

function isUserWantsToTalk(bot, data) {
  return (
    (data.referenced_message && data.referenced_message.author.id === users.get("аска")) ||
    new Date() - bot.evseyLastTalkedToAt < 1000 * 60
  );
}

function isShouldTalk(bot, data) {
  return (
    isMessageEvent(data) &&
    data.d.author.id === users.get("комфи") &&
    isUserWantsToTalk(bot, data.d) &&
    bot.evseyCurrentThread &&
    bot.evseyCurrentThread[bot.evseyDialogueLength]
  );
}

function wordRegEx(word) {
  return new RegExp(`(?:^|\\W)${word}(?:$|\\W)`, "gi");
}
const users = new Map();

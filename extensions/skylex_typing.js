import { randomFile } from "./utils";

// SKYLEX печатает
if (data.d.member.user.id == "214013992052588545" &&
(new Date().getTime() - state.state.sequencekylexmessage) > config.SOMEONE_IS_TYPING_DELAY
) {
state.state.sequencekylexmessage = new Date().getTime();

const l = randomInteger(0, 1);
const skylex = randomChoiceArray([
    `${["С", "c"][l]}кайлекс`,
    `${["S", "s"][l]}kylex`,
    `${["Г", "г"][l]}ефт`,
    `${["Г", "г"][l]}уфт`
]);

let body = new FormData();
body.append("payload_json",
    JSON.stringify({
        content: `${"Смотрите! ".repeat(randomInteger(0, 1))}${skylex} печатает${"!".repeat(randomInteger(1, 5))}`
    }));
    
const file = randomFile("./source");
body.append("files[0]", file, filename);

fetch(`${config.URL.http}/channels/${data.d?.channel_id || "1048360803373432845"}/messages`, {
    method: 'POST',
    headers: config.AUTHENTICATION.header,
    body: body
});
}
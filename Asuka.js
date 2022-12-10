import 'dotenv/config';
import WebSocket from 'ws';
import { readdirSync, readFileSync } from 'fs';
import { dataURItoBlob, randomChoiceArray, randomInteger } from "./utils.js"





const response = await fetch(url.http + "/gateway/bot", {
    method: 'GET',
    headers: headers
}).then(x => x.json());

url.ws = response.url;
let hb_interval;
let lastSkylexmessage = process.env.SKYLEX_LAST_MSG_TIME;
console.log(url.ws);
let auth = false;
let last_seq = null;
const socket = new WebSocket(url.ws + "/?v=10&encoding=json");
const heartbeat = (s, d = null) => {
    s.send(JSON.stringify({
        "op": 1,
        "d": d,
    }));
}

socket.onmessage = async function (event) {
    console.log('----------------------------------------------------------------------------------------')
    console.log(`[${event.type}] Data received from server: ${event.data}`);
    const data = JSON.parse(event.data);
    last_seq = data.s != null ? data.s : last_seq;
    // handshake
    if (data.op == 10) {
        console.log("Responding to handshake");
        hb_interval = data.d.heartbeat_interval;
        setTimeout(() => (heartbeat(socket, last_seq)), hb_interval * Math.random() / 10)
    };
    // hearbeat immediate
    if (data.op == 1) heartbeat(socket, last_seq);
    //auth
    if (!auth & data.op == 11) {
        console.log("Trying to authenticate");
        const msg = {
            "op": 2,
            "d": {
                "token": token,
                "properties": {
                    "os": "windows",
                    "browser": "chrome",
                    "device": "laptop"
                },
                "intents": (1 << 9) | (1 << 8) | (1 << 1) | (1 << 15) | (1 << 11),
            }
        };
        socket.send(JSON.stringify(msg));
        console.log(`New heartbeat queued in: ${hb_interval}ms`);
        setTimeout(() => (heartbeat(socket, last_seq)), hb_interval);
    };
    if (data.op == 0 & data.t == "READY") {
        console.log("Authenticated");
        auth = true
    };
    // SKYLEX печатает
    if (auth &&
        data.t == "TYPING_START" &&
        data.d.member.user.id == "214013992052588545" &&
        (new Date().getTime() - lastSkylexmessage) > eval(process.env.SKYLEX_DELAY)
    ) {
        lastSkylexmessage = new Date().getTime();
        const files = readdirSync('source/');
        const filename = randomChoiceArray(files);
        const filepath = "./source/" + filename;
        let file = "data:image/png;base64," + readFileSync(filepath, "base64");
        file = dataURItoBlob(file);

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
        body.append("files[0]", file, filename);

        fetch(`${url.http}/channels/${data.d?.channel_id || "1048360803373432845"}/messages`, {
            method: 'POST',
            headers: headers,
            body: body
        });
    }
    // INTRODUCTION
    if (auth &&
        data.t == "MESSAGE_CREATE" &&
        data.d.content == "асука привет"
    ) {
        const files = readdirSync('source/');
        const filename = randomChoiceArray(files);
        const filepath = "./source/" + filename;
        let file = "data:image/png;base64," + readFileSync(filepath, "base64");
        file = dataURItoBlob(file);
        let body = new FormData();
        body.append("payload_json",
            JSON.stringify({
                content: `Ну привет${", " + data.d.author.username || ""}`,
                message_reference: { message_id: data.d.id }
            }));
        body.append("files[0]", file, filename);

        fetch(`${url.http}/channels/${data.d?.channel_id || "1048360803373432845"}/messages`, {
            method: 'POST',
            headers: headers,
            body: body
        });
    }
    // NEW MESSAGE
    if (data.t == "MESSAGE_CREATE") {
        console.log(`New message on server: ${data.d.content}`)
    }
    // heartbeat
    if (auth & data.op == 11) {
        console.log(`New heartbeat queued in: ${hb_interval}ms`);
        setTimeout(() => (heartbeat(socket, last_seq)), hb_interval);
    }
};

socket.addEventListener("open", (event) => (console.log(`[${event.type}] Connection established: ${event}`)));
socket.addEventListener("error", (event) => (console.log(`[${event.type}] Error: ${event}`)));
socket.addEventListener("close", (event) => (console.log(`[${event.type}] Connection closed: ${event.code}, ${event.reason}`)));
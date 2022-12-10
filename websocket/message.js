import { readdirSync, readFileSync } from 'fs';
import { dataURItoBlob, randomChoiceArray, randomInteger } from "../utils.js"
import { heartbeat } from "./utils.js"

export const webSocketMessageHandler = async (websocket, init) => {

    let lastSkylexmessage = 0;
    let auth = false;
    let last_seq = null;
    let heartbeatInterval;

    websocket.onmessage = async function (event) {
        console.log('----------------------------------------------------------------------------------------');
        console.log(`[${event.type}] Data received from server: ${event.data}`);
        const data = JSON.parse(event.data);
        last_seq = data.s != null ? data.s : last_seq;
        // handshake
        if (data.op == 10) {
            console.log("Responding to handshake");
            heartbeatInterval = data.d.heartbeat_interval;
            setTimeout(() => (heartbeat(websocket, last_seq)), heartbeatInterval * Math.random() / 10)
        };
        // hearbeat immediate
        if (data.op == 1) heartbeat(websocket, last_seq);
        //auth
        if (!auth & data.op == 11) {
            console.log("Trying to authenticate");
            const msg = {
                "op": 2,
                "d": {
                    "token": init.BOT_TOKEN,
                    "properties": {
                        "os": "windows",
                        "browser": "chrome",
                        "device": "laptop"
                    },
                    "intents": (1 << 9) | (1 << 8) | (1 << 1) | (1 << 15) | (1 << 11),
                }
            };
            websocket.send(JSON.stringify(msg));
            console.log(`New heartbeat queued in: ${heartbeatInterval}ms`);
            setTimeout(() => (heartbeat(websocket, last_seq)), heartbeatInterval);
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

            fetch(`${init.URL.http}/channels/${data.d?.channel_id || "1048360803373432845"}/messages`, {
                method: 'POST',
                headers: init.AUTH_HEADER,
                body: body
            });
        }
        // INTRODUCTION
        if (auth &&
            data.t == "MESSAGE_CREATE" &&
            data.d.content == "асука привет"
        ) {
            console.log("sending");
            const files = readdirSync('source/');
            // const filename = randomChoiceArray(files);
            const filename = "test.png";
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
            body = await new Response(body).blob()
            
            console.log(body.size);
            fetch(`${init.URL.http}/channels/${data.d?.channel_id || "1048360803373432845"}/messages`, {
                method: 'POST',
                headers: init.AUTH_HEADER,
                body: body
            });
        }
        // NEW MESSAGE
        if (data.t == "MESSAGE_CREATE") {
            console.log(`New message on server: ${data.d.content}`)
        }
        // heartbeat
        if (auth & data.op == 11) {
            console.log(`New heartbeat queued in: ${heartbeatInterval}ms`);
            setTimeout(() => (heartbeat(websocket, last_seq)), heartbeatInterval);
        }
    }
};
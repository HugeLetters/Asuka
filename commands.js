import { readdirSync, readFileSync } from 'fs';
import { heartbeat, dataURItoBlob, randomChoiceArray, randomInteger } from "./utils.js"

export const dataOPHandler = async (websocket, data, state, config) => {
    const { op, s, d, t } = data;

    switch (op) {
        case 0:
            if (t == "READY") {
                console.log("Authenticated");
                state.authenticated = true
            };
            // NEW MESSAGE
            if (data.t == "MESSAGE_CREATE") {
                console.log(`New message on server: "${d.content}"${d.attachments.length != 0 ? " with attachments" : ""} by ${d.author.username}`)
            }
            // INTRODUCTION
            if (state.authenticated &&
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
                // Converting FormData to Blob to easily measure payload size because of Discord 8MB limit
                body.append("files[0]", file, filename);
                body = await new Response(body).blob()
                
                // TODO: Prevent sending to large files
                if (body.size > config.MAX_PAYLOAD_SIZE) { console.log("Request is too large") };

                fetch(`${config.URL.http}/channels/${data.d?.channel_id || "1048360803373432845"}/messages`, {
                    method: 'POST',
                    headers: config.AUTHENTICATION.header,
                    body: body
                });
            }
            break;

        case 1:
            // immediate heartbeat requested by Discord API
            console.log("Immediate heartbeat requested");
            heartbeat(websocket, state);
            break;

        case 7:
            // You should attempt to reconnect and resume immediately.
            break;

        case 9:
            // The session has been invalidated. You should reconnect and identify/resume accordingly.
            break;

        case 10:
            // Hello
            console.log("Received a Hello");
            state.heartbeatInterval = d.heartbeat_interval;
            setTimeout(() => (heartbeat(websocket, state)), (state.heartbeatInterval * Math.random()) / 10)
            break;

        case 11:
            //ACK reponse to heartbeat
            state.ackReceived = true;
            if (!state.authenticated) {
                console.log("Trying to authenticate");
                const msg = {
                    "op": 2,
                    "d": config.AUTHENTICATION.body
                };
                websocket.send(JSON.stringify(msg));
            }
            console.log(`New heartbeat queued in: ${state.heartbeatInterval}ms`);
            setTimeout(() => (heartbeat(websocket, state)), state.heartbeatInterval);
            break;

        default:
            console.log("Unexpected behaviour from Discord API",);
            console.log("OPcode received: ", op);
            break;
    }

    if (!state.ackReceived) websocket.close(4009, "ACK wasn't received")

    return null;

    // SKYLEX печатает
    if (state.authenticated &&
        data.t == "TYPING_START" &&
        data.d.member.user.id == "214013992052588545" &&
        (new Date().getTime() - state.state.lastSkylexmessage) > eval(process.env.SOMEONE_IS_TYPING_DELAY)
    ) {
        state.state.lastSkylexmessage = new Date().getTime();
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

        fetch(`${config.URL.http}/channels/${data.d?.channel_id || "1048360803373432845"}/messages`, {
            method: 'POST',
            headers: config.AUTHENTICATION.header,
            body: body
        });
    }



}
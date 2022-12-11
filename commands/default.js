import { randomFile } from "./utils.js"

// INTRODUCTION
export const asukaHi = async (data, config) => {
    const { author, channel_id } = data;
    const file = randomFile("./source");
    let body = new FormData();
    body.append("payload_json",
        JSON.stringify({
            content: `Ну привет${", " + author.username || ""}`,
            message_reference: { message_id: data.id }
        }));
    // Converting FormData to Blob to easily measure payload size because of Discord 8MB limit
    body.append("files[0]", file.data, file.filename);
    body = await new Response(body).blob()

    // TODO: Prevent sending to large files
    if (body.size > config.MAX_PAYLOAD_SIZE) { console.log("Request is too large") };

    fetch(`${config.URL.http}/channels/${channel_id}/messages`, {
        method: 'POST',
        headers: config.AUTHENTICATION.header,
        body: body
    });
};

asukaHi.alias = ["привет", "здарова", "hello", "hi", "здравствуй"];
import { randomFile } from "./utils.js"

// An object for all commands in the current extension - these aliases define which words trigger bot commands
export const alias = {
    asukaHi: ["привет", "здарова", "hello", "hi", "здравствуй"]
};

// INTRODUCTION
export const asukaHi = async (data, bot) => {
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
    if (body.size > bot.MAX_PAYLOAD_SIZE) { console.log("Request is too large") };

    fetch(`${bot.HTTP_REQUEST_URL}/channels/${channel_id}/messages`, {
        method: 'POST',
        headers: bot.AUTHENTICATION_HEADER,
        body: body
    });
};

import { readdirSync, writeFileSync } from 'fs';
import { randomChoiceArray, randomFile } from './utils.js';
import sharp from 'sharp';

export const alias = {
    meme: ["мем", "meme"],
};

const memeData = {
    "ihatetheantichrist": {
        quotes: [
            // UN
            { left: 16, top: 260, width: 190, height: 120 },
            // trollface
            { left: 300, top: 30, width: 215, height: 100 },
        ],
        avatars: [
            // top UN
            { left: 163, top: 94, width: 63 },
            // bottom UN
            { left: 47, top: 179, width: 77 },
            // trollface
            { left: 330, top: 163, width: 130 },
        ]
    }
}

export const meme = async (data, bot, command, keywords) => {


    // GENERATE 3 USERPICS
    const { guild_id, channel_id } = data;
    const userList = (await fetch(`${bot.HTTP_REQUEST_URL}/guilds/${guild_id}/members?limit=100`, {
        method: 'GET',
        headers: bot.AUTHENTICATION_HEADER,
    }).then(x => x.json())).map(x => ({ id: x.user.id, avatarHash: x.user.avatar }));

    const selectedUsers = [
        randomChoiceArray(userList),
        randomChoiceArray(userList),
        randomChoiceArray(userList),
    ]

    const avatarList = await Promise.all(selectedUsers.map(async avatar => await fetch(
        `${bot.IMAGE_ENDPOINT}/avatars/${avatar.id}/${avatar.avatarHash}.png`, {
        method: 'GET',
        headers: bot.AUTHENTICATION_HEADER
    })
        .then(response => response.body)
        .then(body => new Response(body))
        .then(bodyResponse => bodyResponse.blob())
        .then(async bodyBlob => {
            const arrayBuffer = await bodyBlob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return buffer
        })
    ));


    const memeDir = "./source/meme";
    const memeTemplateName = randomChoiceArray(readdirSync(memeDir));
    const memeTemplateImage = `${memeDir}/${memeTemplateName}`;
    const memeTemplateData = memeData[memeTemplateName.split(".")[0]];

    const avatarImages = await Promise.all(memeTemplateData.avatars.map(
        async (x, i) => ({
            input: await sharp(avatarList[i]).resize({ width: x.width, height: null }).toBuffer(),
            left: x.left,
            top: x.top,
        })
    ));

    // GENERATE 2 QUOTES - FOR UN AND TROLLFACE
    const quotes = memeTemplateData.quotes.map((x, i) => ({
        input: {
            text: {
                text: bot.generateSentence({ maxLength: 10, randomWordChance: 0 }),
                width: x.width,
                height: x.height,
                font: "impact",
                rgba: true
            }
        },
        left: x.left,
        top: x.top,
    }))

    // GENERATE A NEW IMAGE BASED ON THIS
    const memeImage = await sharp(memeTemplateImage).composite([...avatarImages, ...quotes]).toBuffer();

    // SEND ITs
    return bot.sendMessage(channel_id, "", { files: [{ data: new Blob([memeImage]), filename: "meme.png" }], message_id: data.id });

}
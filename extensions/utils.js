import { readdirSync, readFileSync } from 'fs';

export const randomInteger = (min = 0, max = min + 100) => (Math.floor(Math.random() * (max - min + 1) + min));

export const randomChoiceArray = (arr) => (arr[randomInteger(0, arr.length - 1)]);

export const randomFile = (folder) => {
  const files = readdirSync(folder);
  const filename = randomChoiceArray(files);
  const filepath = folder + "/" + filename;
  let fileBuffer = new Blob([readFileSync(filepath)]);
  return { data: fileBuffer, filename };
}

// files and message_id are in a object because both are optional
// Please note files should be an array of objects in the form returned by randomFile function
export const sendMessage = async (bot, channel, message, { files = [], message_id = undefined }) => {
  let body = new FormData();
  body.append("payload_json", JSON.stringify({
    content: message,
    message_reference: { message_id }
  }));

  for (let i = 0; i < files.length; i++) {
    body.append(`files[${i}]`, files[i].data, files[i].filename);
  };
  // Converting FormData to Blob to easily measure payload size because of Discord 8MB limit
  body = await new Response(body).blob()

  if (body.size > bot.MAX_PAYLOAD_SIZE) {
    console.log("Request is too large");
    sendMessage(bot, channel, "Хотела кое-что тебе показать, но файл слишком большой 😳", { message_id })
    return null;
  };

  const response = fetch(`${bot.HTTP_REQUEST_URL}/channels/${channel}/messages`, {
    method: 'POST',
    headers: bot.AUTHENTICATION_HEADER,
    body: body,
  })
  return response;
};
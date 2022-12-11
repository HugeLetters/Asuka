import { readdirSync, readFileSync } from 'fs';

export function dataURItoBlob(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  // TODO FIX DEPRECATED CODE
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1]);
  else
    byteString = unescape(dataURI.split(',')[1]);
  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], { type: mimeString });
};

export const randomInteger = (min = 0, max = min + 100) => (Math.floor(Math.random() * (max - min + 1) + min));

export const randomChoiceArray = (arr) => (arr[randomInteger(0, arr.length - 1)]);

export const randomFile = (folder) => {
  const files = readdirSync(folder);
  const filename = randomChoiceArray(files);
  const filepath = folder + "/" + filename;
  let file = "data:image/png;base64," + readFileSync(filepath, "base64");
  return { data: dataURItoBlob(file), filename };
}

// files and message_id are in a object because both are optional
// Please note files should be an array of objects in the form returned by randomFile function
export const sendMessage = async (bot, channel, message, {files = [], message_id = undefined}) => {
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

  // TODO: Prevent sending to large files - test if this solution works
  if (body.size > bot.MAX_PAYLOAD_SIZE) { console.log("Request is too large"); return null };

  const response = await fetch(`${bot.HTTP_REQUEST_URL}/channels/${channel}/messages`, {
    method: 'POST',
    headers: bot.AUTHENTICATION_HEADER,
    body: body
  }).then(x => x.json());
  return response;
};
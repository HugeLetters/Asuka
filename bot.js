import moment from "moment";
import { WebSocket } from "ws";
import { databaseToSpeechObject, generateSentence } from "./speech/speech.js";
import { getGatewayHandler } from "./websocket/gateway.js";
import wsCreateHandler from "./websocket/createHandler.js";

export class Bot {
  constructor(config) {
    const state = {
      authenticated: false,
      sequence: null,
      ackReceived: true,
      testProperty: 1,
      reconnecting: false,
    };
    Object.assign(this, config, state);
  }

  async getGateway() {
    this.WEBSOCKET_GATEWAY_URL = await getGatewayHandler(
      this.HTTP_REQUEST_URL,
      this.AUTHENTICATION_HEADER
    );
    if (this.WEBSOCKET_GATEWAY_URL) return;

    console.log("Couldn't get WebSocket URL");
    setTimeout(() => this.getGateway(), 5000);
  }

  async webSocketConnect() {
    if (!this.WEBSOCKET_GATEWAY_URL) return setTimeout(() => this.webSocketConnect(), 5000);

    console.log(`${moment().format("DD.MM.Y HH:mm:ss")} Creating new socket`);
    console.log(this.WEBSOCKET_GATEWAY_URL + "/?v=10&encoding=json");

    clearTimeout(this.nextHeartbeat);
    this.authenticated = false;
    this.ackReceived = true;
    this.websocket = new WebSocket(this.WEBSOCKET_GATEWAY_URL + "/?v=10&encoding=json");
    wsCreateHandler(this);
  }

  async webSocketReconnect() {
    console.log(new Date());
    console.log("Reconnecting to WebSocket");
    console.log(this.resumeGatewayURL);

    clearTimeout(this.nextHeartbeat);
    this.ackReceived = true;
    this.reconnecting = true;
    this.websocket = new WebSocket(this.resumeGatewayURL);
    wsCreateHandler(this);
  }

  async loadSpeechGenerationModel(database) {
    if (!this.speechModel) this.speechModel = await databaseToSpeechObject(database);
  }

  // randomWordChance = [0,1]
  generateSentence({
    user = "EVERYONE",
    keywords = [],
    maxLength = 20,
    randomWordChance = 0,
  } = {}) {
    return generateSentence(this, user, keywords, maxLength, randomWordChance);
  }

  // files and message_id are in a object because both are optional
  // Please note files should be an array of objects in the form returned by randomFile function
  async sendMessage(channel, message, { files = [], message_id = undefined } = {}) {
    let body = new FormData();
    body.append(
      "payload_json",
      JSON.stringify({
        content: message,
        message_reference: { message_id },
      })
    );

    for (let i = 0; i < files.length; i++) {
      body.append(`files[${i}]`, files[i].data, files[i].filename);
    }
    // Converting FormData to Blob to easily measure payload size because of Discord 8MB limit
    body = await new Response(body).blob();

    if (body.size > this.MAX_PAYLOAD_SIZE) {
      console.log("Request is too large");
      this.sendMessage(channel, "Хотела кое-что тебе показать, но файл слишком большой 😳", {
        message_id,
      });
      return;
    }

    const response = fetch(`${this.HTTP_REQUEST_URL}/channels/${channel}/messages`, {
      method: "POST",
      headers: this.AUTHENTICATION_HEADER,
      body,
    });
    return response;
  }
}

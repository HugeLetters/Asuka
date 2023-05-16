import { JSONParseAsync, logEvent, promiseRetry, randomValue as randomNumber } from "./utils";
import { API_VERSION, AUTHORIZATION_BODY, AUTHORIZATION_HEADER, DISCORD_API_URL } from "./config";
import {
  type APIGatewayBotInfo,
  type GatewayHeartbeat,
  type GatewayIdentify,
  GatewayOpcodes,
  type GatewayReceivePayload,
  type RESTError,
} from "discord-api-types/v10";
import WebSocket from "ws";
import fetch from "node-fetch";
import chalk from "chalk";

getGatewayURL().then(websocketConnect);

function getGatewayURL() {
  return promiseRetry(() =>
    fetch(`${DISCORD_API_URL}/gateway/bot`, { headers: AUTHORIZATION_HEADER })
  )
    .then(async response => {
      const body = await response.json();
      if (!response.ok) {
        const discordError = body as RESTError;
        console.error(discordError);
        throw new Error("Discord API has rejected request");
      }
      return body as APIGatewayBotInfo;
    })
    .then(data => data.url);
}

function websocketConnect(url: string) {
  const ws = new WebSocket(`${url}/?v=${API_VERSION}&encoding=json`);
  const heartbeat = new Heartbeat(ws.send.bind(ws));

  ws.on("open", () => {
    logEvent.websocket("OPEN");
  });
  ws.on("close", (code, reason) => {
    logEvent.websocket("CLOSE");
    console.log(`${chalk.bgYellow("Code")}: ${code}\n${chalk.bgYellow("Reason")}: ${reason}`);
  });
  ws.on("error", error => {
    logEvent.websocket("ERROR");
    console.error(error);
  });
  ws.on("message", async rawData => {
    logEvent.websocket("MESSAGE");
    const data = await JSONParseAsync<GatewayReceivePayload>(rawData.toString()).catch(
      (error: Error) => {
        console.error(chalk.bgRedBright(`Error while parsing JSON\n${error.stack}`));
      }
    );
    if (!data) return;
    const { d: payload, op: opcode, s: sequence, t: eventName } = data;

    logEvent("OPCODE", `${opcode} - ${GatewayOpcodes[opcode]}`);
    switch (opcode) {
      case GatewayOpcodes.Dispatch: {
        if (sequence) heartbeat.sequence = sequence;
        console.log(payload);
        break;
      }
      case GatewayOpcodes.Heartbeat: {
        heartbeat.immediateBeat();
        break;
      }
      case GatewayOpcodes.Reconnect: {
        break;
      }
      case GatewayOpcodes.InvalidSession: {
        break;
      }
      case GatewayOpcodes.Hello: {
        heartbeat.interval = payload.heartbeat_interval;
        heartbeat.queueBeat(true);
        const identify: GatewayIdentify = {
          d: AUTHORIZATION_BODY,
          op: GatewayOpcodes.Identify,
        };
        ws.send(JSON.stringify(identify));
        break;
      }
      case GatewayOpcodes.HeartbeatAck: {
        // todo - handle no Ack
        heartbeat.queueBeat();
        break;
      }
      default: {
        logEvent.unhandled("OPCODE", payload);
        break;
      }
    }
  });
}

class Heartbeat {
  interval?: number;
  #beat;
  #timeout?: ReturnType<typeof setTimeout>;
  // eslint-disable-next-line unicorn/no-null
  #data: GatewayHeartbeat = { op: GatewayOpcodes.Heartbeat, d: null };
  constructor(send: WebSocket["send"]) {
    this.#beat = () => send(JSON.stringify(this.#data));
  }
  set sequence(sequence: Exclude<GatewayReceivePayload["s"], null>) {
    this.#data.d = sequence;
  }
  immediateBeat = () => {
    this.unqueueBeat();
    this.#beat();
  };
  queueBeat = (fast?: boolean) => {
    if (!this.interval)
      throw new Error("Trying to queue a hearbeat before providing heartbeat interval");
    const delay = randomNumber(0.9, 1) * this.interval * (fast ? 0.1 : 1);
    logEvent("HEARTBEAT", `scheduled in ${delay.toFixed(0)} ms`);
    this.unqueueBeat();
    this.#timeout = setTimeout(this.#beat, delay);
  };
  unqueueBeat = () => {
    clearTimeout(this.#timeout);
  };
}

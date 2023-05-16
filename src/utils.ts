import chalk from "chalk";
import dayjs from "dayjs";
import { type GatewayReceivePayload } from "discord-api-types/v10";

type Command = {
  command: string;
  parameters: string[];
};
export function parseMessage(message: string): Command | null {
  const match = message.match(/^(asu?ka|асу?ка|asss?uc?ka)[\s,.:;]+(.*)/i);
  if (!match) return match;
  const [command, ...parameters] = match[2].split(/[\s,.:;]+/).filter(Boolean);
  return { command, parameters };
}

export function getIdbyTag(tag: string) {
  const match = tag.match(/^<@!?(\d+)>$/);
  if (!match) return match;
  return match[1];
}

export function promiseRetry<T>(callback: () => Promise<T>) {
  return new Promise<T>(resolve => {
    function promiseTry() {
      callback()
        .then(resolve)
        .catch((error: Error) => {
          console.error(`${error.stack ?? error.message}\nRetrying in ${5} seconds`);
          setTimeout(promiseTry, 5000);
        });
    }
    promiseTry();
  });
}

export async function JSONParseAsync<T>(string: string) {
  return JSON.parse(string) as T;
}

export const logEvent = (function () {
  const DECORATION = {
    HEARTBEAT: chalk.bgYellowBright,
    OPCODE: chalk.bgGreenBright,
  } as const;

  type GenericEvent = keyof typeof DECORATION;
  type WebsocketEvent = "OPEN" | "CLOSE" | "ERROR" | "MESSAGE";
  type Log = {
    (eventName: GenericEvent, description: string): void;
    websocket(eventName: WebsocketEvent): void;
    unhandled(eventName: GenericEvent | WebsocketEvent, data: GatewayReceivePayload["d"]): void;
    unhandled(eventName: string, data: GatewayReceivePayload["d"]): void;
  };
  const log: Log = function (eventName, description) {
    console.log(`${DECORATION[eventName](`[${eventName}]`)} ${description}`);
  };
  log.websocket = function (eventName) {
    console.log(`${chalk.bgCyan(`[${eventName}]`)} ${dayjs().format("DD.MM.YYYY HH:mm:ss")}`);
  };
  log.unhandled = function (eventName, data) {
    console.warn(`${chalk.bgRed(`[UHANDLED ${eventName}]`)} Data:`);
    console.log(data);
  };
  return log;
})();

export function randomValue(start: number, end: number) {
  return start + (end - start) * Math.random();
}

import chalk from "chalk";
import dayjs from "dayjs";
import { type GatewayReceivePayload } from "discord-api-types/v10";

type Command = { command: string; parameters: string[] };
/**
 * Test if a message was addressed to bot and get specified command and parameters
 * @param message Discord message content
 * @returns `Command` object if message started with bot name, otherwise returns null
 */
export function parseMessage(message: string): Command | null {
  const match = message.match(/^(asu?ka|асу?ка|asss?uc?ka)[\s,.:;]+(.*)/i);
  if (!match) return match;
  const [command, ...parameters] = match[2].split(/[\s,.:;]+/).filter(Boolean);
  return { command, parameters };
}

/**
 * Extract user ID from raw Discord tag text
 * @param tag Raw tag text
 * @returns ID if found, otherwise returns null
 */
export function getIdbyTag(tag: string) {
  const match = tag.match(/^<@!?(\d+)>$/);
  if (!match) return match;
  return match[1];
}

/**
 * Retry calling async function until it succeeds
 * @param callback async function
 * @param interval retry interval in seconds
 */
export function promiseRetry<T>(callback: () => Promise<T>, interval = 5) {
  return new Promise<T>(resolve => {
    function promiseTry() {
      callback()
        .then(resolve)
        .catch((error: Error) => {
          console.error(`${error.stack ?? error.message}\nRetrying in ${interval} seconds`);
          setTimeout(promiseTry, interval * 1000);
        });
    }
    promiseTry();
  });
}

/**
 * Same as `JSON.parse` but async.
 * @template T specify return type
 */
export async function JSONParseAsync<T>(string: string) {
  return JSON.parse(string) as T;
}

/** Logs events in a consistent manner */
export const logEvent = (function () {
  const DECORATION = {
    HEARTBEAT: chalk.bgYellowBright,
    OPCODE: chalk.bgGreenBright,
  } as const;

  type GenericEvent = keyof typeof DECORATION;
  type WebsocketEvent = "OPEN" | "CLOSE" | "ERROR" | "MESSAGE";
  type Log = {
    /** Log a generic event */
    (eventName: GenericEvent, description: string): void;
    /** Log a websocket event */
    websocket(eventName: WebsocketEvent): void;
    /** Log an unhandled event */
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

/**
 *  @param start inclusive
 *  @param end exclusive
 */
export function randomNumber(start: number, end: number) {
  return start + (end - start) * Math.random();
}

/**
 * @see randomNumber for lols
 * @param start inclusive. If non-integer provided the value will be rounded down
 * @param end exclusive. If non-integer provided the value will be rounded up
 * @returns integer in the range `[start, end)`
 */
export function randomInteger(start: number, end: number) {
  return Math.floor(randomNumber(Math.floor(start), Math.ceil(end)));
}

/** Utlity type for making object literals immutable */
export type DeepReadonly<T> = {
  readonly [key in keyof T]: DeepReadonly<T[key]>;
};

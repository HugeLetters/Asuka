type Command = {
  command: string;
  args: string[];
};
export function parseMessage(message: string): Command | null {
  const match = message.match(/^(asu?ka|асу?ка|asss?uc?ka)(?:[^а-яё\w]+)(.*)/i);
  if (!match) return match;
  const [command, ...args] = match[2].split(/[\s.,_\-]+/).filter(Boolean);
  return { command, args };
}

export function getIdbyTag(tag: string) {
  const match = tag.match(/^<@!?(\d+)>$/);
  if (!match) return match;
  return match[1];
}

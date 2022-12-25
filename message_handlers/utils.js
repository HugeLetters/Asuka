export const heartbeat = (bot) => {
  const { websocket } = bot;
  if (websocket.readyState != 1) return null;
  websocket.send(JSON.stringify({ "op": 1, "d": bot.sequence, }));
  bot.ackReceived = false;
};
export const heartbeat = (bot) => {
  const { websocket } = bot;
  websocket.send(JSON.stringify({ "op": 1, "d": bot.sequence, }));
  bot.ackReceived = false;
};
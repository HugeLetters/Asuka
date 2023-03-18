export const WebSocketOpenHandler = async bot => {
  const { websocket } = bot;

  websocket.addEventListener("open", async () => {
    if (bot.reconnecting) {
      console.log("Sending a reconnect event");
      const resumeEvent = JSON.stringify({
        op: 6,
        d: {
          token: bot.BOT_TOKEN,
          session_id: bot.sessionID,
          seq: bot.sequence,
        },
      });
      await websocket.send(resumeEvent);
      bot.reconnecting = false;
    }
  });
};

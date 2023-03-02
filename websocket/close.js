// TODO ПОЧИНИ РЕКОННЕКТ!!
export const webSocketCloseHandler = async bot => {
  const { websocket } = bot;
  websocket.addEventListener("close", async event => {
    console.log(`[${event.type}] Connection closed: ${event.code}, ${event.reason}`);
    if (!bot.authenticated) return null;

    switch (event.code) {
      case 4009:
        // bot.authenticated = false;
        bot.webSocketReconnect();
        break;

      default:
        bot.authenticated = false;
        bot.webSocketConnect();
        break;
    }
  });
};

// TODO ПОЧИНИ РЕКОННЕКТ!!
export const webSocketCloseHandler = async bot => {
  const { websocket } = bot;
  websocket.addEventListener("close", async event => {
    console.log(`[${event.type}] Connection closed: ${event.code}, ${event.reason}`);

    switch (event.code) {
      case 4009:
        bot.authenticated ? bot.webSocketReconnect() : bot.webSocketConnect();
        break;
      case 1006:
        setTimeout(() => bot.webSocketConnect(), 10000);
        break;
      default:
        bot.webSocketConnect();
        break;
    }
  });
};

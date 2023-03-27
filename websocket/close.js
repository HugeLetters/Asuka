export const webSocketCloseHandler = async bot => {
  const { websocket } = bot;
  websocket.addEventListener("close", async event => {
    switch (event.code) {
      case 4009:
        bot.authenticated ? bot.webSocketReconnect() : bot.webSocketConnect();
        break;
      default:
        setTimeout(() => bot.webSocketConnect(), 10000);
        break;
    }
  });
};

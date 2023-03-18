export const webSocketErrorHandler = async bot => {
  const { websocket } = bot;
  websocket.addEventListener("error", async event => {
    websocket.close();
  });
};

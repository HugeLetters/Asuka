export const webSocketErrorHandler = async bot => {
  const { websocket } = bot;
  websocket.addEventListener("error", async event => {
    console.log(`Error: ${event}`);
    websocket.close();
  });
};

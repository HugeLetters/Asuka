export const webSocketCloseHandler = async (bot) => {
    const { websocket } = bot;
    websocket.addEventListener("close", async (event) => {
        console.log(`[${event.type}] Connection closed: ${event.code}, ${event.reason}`);
    });
}
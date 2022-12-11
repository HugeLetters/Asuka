export const webSocketErrorHandler = async (bot) => {
    const { websocket } = bot;
    websocket.addEventListener("error", async (event) => {
        console.log(`[${event.type}] Error: ${event.data}`);
    });
};
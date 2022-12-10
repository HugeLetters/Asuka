export const webSocketErrorHandler = async (websocket) => {
    websocket.addEventListener("error", async (event) => {
        console.log(`[${event.type}] Error: ${event.data}`);
    });
};
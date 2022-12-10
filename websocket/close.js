export const webSocketCloseHandler = async (websocket) => {
    websocket.addEventListener("close", async (event) => {
        console.log(`[${event.type}] Connection closed: ${event.code}, ${event.reason}`);
    });
}
export const heartbeat = (websocket, state) => {
  websocket.send(JSON.stringify({ "op": 1, "d": state.sequence, }));
  state.ackReceived = false;
};
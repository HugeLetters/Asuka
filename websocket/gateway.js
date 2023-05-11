export const getGatewayHandler = async (url, header) => {
  return fetch(url + "/gateway/bot", {
    method: "GET",
    headers: header,
  })
    .then(x => x.json())
    .then(x => x.url)
    .catch(e => {
      console.error(e);
      return;
    });
};

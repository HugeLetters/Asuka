export const getGateway = async (url, header) => {
    const response = await fetch(url + "/gateway/bot", {
        method: 'GET',
        headers: header
    }).then(
        x => x.json(),
        x => { throw x });
    
    return response.url;
}